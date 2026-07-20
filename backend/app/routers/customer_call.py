# app/routers/customer_call.py
from fastapi import APIRouter, HTTPException, status, Query
from typing import List
from app.schemas.customer_call import CustomerCallCreateRequest, CustomerCallResponse
from app.DB.connection import get_db_connection

router = APIRouter(prefix="/api/employee/calls", tags=["Employee Future Calls"])

# 1. POST: שמירת שיחה עתידית חדשה מהטופס של העובד
@router.post("", status_code=status.HTTP_201_CREATED)
async def create_future_call(request: CustomerCallCreateRequest):
    try:
       with get_db_connection() as conn:
            # ניהול הסמן - נסגר אוטומטית בסיום הבלוק
            with conn.cursor() as cursor:
        
        # ודא קודם שהטבלה קיימת ב-Neon עם העמודה duration_minutes
                insert_query = """
                    INSERT INTO customer_scheduled_calls 
                    (employee_id, customer_name, scheduled_time, duration_minutes)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """
                cursor.execute(insert_query, (
                    request.employee_id,
                    request.customer_name,
                    request.scheduled_time,
                    request.estimated_duration_minutes
                ))
            return {"status": "success", "message": "Call successfully scheduled"}
    except Exception as e:
        # כל שגיאה שתקפוץ תגרום ל-rollback אוטומטי ותיסגר בבטחה
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database error: {str(e)}"
        )

# 2. GET: שליפת רשימת השיחות של עובד ספציפי עבור הטבלה שלו
@router.get("", response_model=List[CustomerCallResponse])
async def get_employee_future_calls(employee_id: int = Query(..., gt=0)):
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                query = """
                    SELECT id, employee_id, customer_name, scheduled_time, duration_minutes, created_at
                    FROM customer_scheduled_calls
                    WHERE employee_id = %s
                     ORDER BY scheduled_time ASC;
                      """
                cursor.execute(query, (employee_id,))
                rows = cursor.fetchall()
                
                result = [
                    CustomerCallResponse(
                        id=row[0],
                        employee_id=row[1],
                        customer_name=row[2],
                        scheduled_time=row[3],
                        estimated_duration_minutes=row[4],
                        created_at=row[5]
                    ) for row in rows
                ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database error: {str(e)}"
        )