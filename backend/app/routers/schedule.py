# app/routers/schedule.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from app.DB.connection import get_db
from app.utils.auth import require_manager
from app.services.auto_scheduler import auto_schedule_workforce
# ייבוא פונקציית השיבוץ האוטומטי מתוך ה-services
from app.services.auto_scheduler import auto_schedule_workforce

router = APIRouter(prefix="/api", tags=["Shift Schedule & Operations"])

class ToggleAssignmentRequest(BaseModel):
    time_block: str  # בפורמט ISO או תאריך ושעה מלאים, למשל "2026-07-20T08:00:00"
    employee_id: int

class AutoScheduleRequest(BaseModel):
    date: str  

# 👁️ שליפת הלו"ז - פתוח לקריאה כדי למנוע חסימות 401 בטעינת הממשק
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
                    "max_consecutive_hours": r[4] if r[4] else 4  # ברירת מחדל של 4 שעות רצופות
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
                    "timestamp": r[0].isoformat(),         # נדרש עבור מנוע האזהרות ב-React
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

# ✏️ עריכת איוש - מורשה למנהלים בלבד!
# app/routers/schedule.py
@router.post("/toggle-assignment", dependencies=[Depends(require_manager)])
async def toggle_assignment(
    request: ToggleAssignmentRequest, 
    db = Depends(get_db)
):
    try:
        with db.cursor() as cursor:
            # 1. בדיקה אם העובד כבר משובץ בבלוק הזמן הזה
            check_query = """
                SELECT id FROM employee_schedule 
                WHERE timestamp = %s AND employee_id = %s;
            """
            cursor.execute(check_query, (request.time_block, request.employee_id))
            existing = cursor.fetchone()

            if existing:
                # הסרת איוש
                delete_query = "DELETE FROM employee_schedule WHERE id = %s;"
                cursor.execute(delete_query, (existing[0],))
                message = "Assignment removed"
            else:
                # הוספת איוש
                insert_query = """
                    INSERT INTO employee_schedule (employee_id, timestamp) 
                    VALUES (%s, %s);
                """
                cursor.execute(insert_query, (request.employee_id, request.time_block))
                message = "Assignment added"
                
            db.commit()
            print(f"✅ [Toggle Success]: {message} for employee {request.employee_id} at {request.time_block}")
            return {"status": "success", "message": message}

    except Exception as e:
        db.rollback()
        print(f"❌ [Toggle Error]: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Toggle assignment failed: {str(e)}")

@router.post("/auto-schedule", dependencies=[Depends(require_manager)])
async def run_auto_scheduler(request: AutoScheduleRequest):
    try:
        print(f"🚀 [Auto-Scheduler]: Starting scheduling process for date: {request.date}")
        result = auto_schedule_workforce(request.date)
        return result
    except Exception as e:
        print(f"❌ [Auto-Scheduler Error]: {str(e)}")
        # מחזירים שגיאה מפורטת כדי למנוע נפילה של ה-CORS
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Auto-scheduler processing failed: {str(e)}"
        )