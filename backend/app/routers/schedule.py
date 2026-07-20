from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.DB.connection import get_db

router = APIRouter(prefix="/api", tags=["Shift Schedule & Operations"])

class ToggleAssignmentRequest(BaseModel):
    time_block: str  # בפורמט ISO או תאריך ושעה מלאים, למשל "2026-07-20T08:00:00"
    employee_id: int

@router.get("/workforce-data")
async def get_workforce_data(db = Depends(get_db)):
    try:
        with db.cursor() as cursor:
            # 1. שליפת כל העובדים כולל מגבלת רצף השעות להפסקות
            cursor.execute("SELECT id, name, role, max_hours_per_day, max_consecutive_hours FROM employees;")
            emp_rows = cursor.fetchall()
            employees = [
                {
                    "id": r[0], 
                    "name": r[1], 
                    "role": r[2], 
                    "max_hours_per_day": r[3],
                    "max_consecutive_hours": r[4] if r[4] else 4  # ברירת מחדל של 4 שעות רצופות אם חסר
                }
                for r in emp_rows
            ]

            # 2. שליפת נפח השיחות יחד עם רשימת המאוישים (employee_ids) לכל בלוק
            query = """
                SELECT 
                    f.timestamp, 
                    f.predicted_volume, 
                    f.average_call_duration,
                    COALESCE(ARRAY_AGG(s.employee_id) FILTER (WHERE s.employee_id IS NOT NULL), '{}') as assigned
                FROM hourly_call_forecast f
                LEFT JOIN employee_schedule s ON f.timestamp = s.timestamp
                GROUP BY f.timestamp, f.predicted_volume, f.average_call_duration
                ORDER BY f.timestamp ASC;
            """
            cursor.execute(query)
            sched_rows = cursor.fetchall()
            
            schedule = [
                {
                    "timestamp": r[0].isoformat(),         # הוסף כדי שמנוע האזהרות יעבוד מושלם
                    "time_block": r[0].strftime("%H:%M"),
                    "predicted_volume": r[1],
                    "avg_duration_sec": r[2],
                    "assigned": r[3]
                }
                for r in sched_rows
            ]

        return {"employees": employees, "schedule": schedule}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch workforce data: {str(e)}")

@router.post("/toggle-assignment")
async def toggle_assignment(request: ToggleAssignmentRequest, db = Depends(get_db)):
    try:
        with db.cursor() as cursor:
            # בדיקה האם האיוש כבר קיים
            check_query = """
                SELECT id FROM employee_schedule 
                WHERE timestamp = %s AND employee_id = %s;
            """
            cursor.execute(check_query, (request.time_block, request.employee_id))
            existing = cursor.fetchone()

            if existing:
                # Toggle Off: אם קיים, נמחק
                delete_query = "DELETE FROM employee_schedule WHERE id = %s;"
                cursor.execute(delete_query, (existing[0],))
                message = "Assignment removed"
            else:
                # Toggle On: אם לא קיים, נוסיף
                insert_query = """
                    INSERT INTO employee_schedule (employee_id, timestamp) 
                    VALUES (%s, %s);
                """
                cursor.execute(insert_query, (request.employee_id, request.time_block))
                message = "Assignment added"
                
            db.commit()
        return {"status": "success", "message": message}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Toggle assignment failed: {str(e)}")