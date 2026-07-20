# app/routers/employee.py
from fastapi import APIRouter, HTTPException, status, Depends
from app.DB.connection import get_db
# ייבוא המודלים מהמיקום החדש שלהם בסכמות
from app.schemas.employee import EmployeeCreateRequest, BulkDayOffRequest 

# הגדרת הראוטר - המשתנה ש-main.py מחפש ומצפה לו!
router = APIRouter(prefix="/api/employees", tags=["Employees Management"])

# 1. POST: יצירת עובד חדש
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_employee(request: EmployeeCreateRequest, db = Depends(get_db)):
    try:
        with db.cursor() as cursor:
            insert_query = """
                INSERT INTO employees 
                (name, role, available_from, available_to, max_hours_per_day, max_hours_per_week, max_hours_per_month)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
            """
            cursor.execute(insert_query, (
                request.name,
                request.role,
                request.available_from,
                request.available_to,
                request.max_hours_per_day,
                request.max_hours_per_week,
                request.max_hours_per_month
            ))
            db.commit()
            employee_id = cursor.fetchone()[0]
            
        return {"status": "success", "message": "Employee created successfully", "id": employee_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

# 2. POST: הגשת בקשת חופש מרוכזת (Bulk Days Off)
@router.post("/days-off", status_code=status.HTTP_201_CREATED)
async def add_bulk_days_off(request: BulkDayOffRequest, db = Depends(get_db)):
    try:
        with db.cursor() as cursor:
            # הכנת השאילתה להכנסת ימי חופש לטבלה המתאימה
            insert_query = """
                INSERT INTO employee_day_off (employee_id, blocked_date, reason)
                VALUES (%s, %s, %s)
                ON CONFLICT (employee_id, blocked_date) DO NOTHING;
            """
            # רצים על כל התאריכים שהתקבלו ברשימה מה-Frontend
            for date_str in request.blocked_dates:
                cursor.execute(insert_query, (
                    request.employee_id,
                    date_str,
                    request.reason
                ))
            db.commit()
            
        return {"status": "success", "message": f"Successfully registered {len(request.blocked_dates)} days off"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )