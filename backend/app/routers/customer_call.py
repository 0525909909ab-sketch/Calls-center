from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import traceback
from app.DB.connection import get_db_connection

router = APIRouter(prefix="/api/employee/calls", tags=["Employee Future Calls"])

class FlexibleCallRequest(BaseModel):
    employee_id: Optional[int] = 1
    customer_name: str
    scheduled_time: str
    estimated_duration_minutes: Optional[int] = 15

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_future_call(request: FlexibleCallRequest):
    conn = None
    try:
        print("📥 Received Payload:", request.model_dump())
        
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # 1. חילוץ employee_id תקין
            cursor.execute("SELECT id FROM employees ORDER BY id ASC LIMIT 1;")
            emp = cursor.fetchone()
            emp_id = emp[0] if emp else (request.employee_id or 1)

            # 2. ניקוי והמרת התאריך
            try:
                clean_time = datetime.fromisoformat(request.scheduled_time.replace("Z", "+00:00"))
            except Exception as dt_err:
                print(f"⚠️ Date parsing warning: {dt_err}")
                clean_time = datetime.now()

            duration = request.estimated_duration_minutes or 15

            # 3. ניסיון הכנסה ראשון (לפי שם עמודה scheduled_at)
            try:
                insert_query = """
                    INSERT INTO customer_scheduled_calls 
                    (employee_id, customer_name, scheduled_at, duration_minutes)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """
                cursor.execute(insert_query, (emp_id, request.customer_name, clean_time, duration))
            except Exception as err1:
                conn.rollback() # איפוס הטרנזקציה שכשלה
                print(f"⚠️ Primary column insert failed ({err1}), trying fallback column 'scheduled_time'...")
                
                # ניסיון הכנסה שני (לפי שם עמודה scheduled_time)
                insert_query = """
                    INSERT INTO customer_scheduled_calls 
                    (employee_id, customer_name, scheduled_time, duration_minutes)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                """
                cursor.execute(insert_query, (emp_id, request.customer_name, clean_time, duration))
            
            inserted_id = cursor.fetchone()[0]
            conn.commit()
            print(f"✅ Successfully inserted call with ID: {inserted_id}")
            return {"status": "success", "message": "Call successfully scheduled", "id": inserted_id}

    except Exception as e:
        if conn:
            conn.rollback()
        
        print("\n❌ CRITICAL ERROR IN POST /api/employee/calls:")
        traceback.print_exc()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database execution error: {type(e).__name__} - {str(e)}"
        )
    finally:
        if conn:
            conn.close()


@router.get("")
@router.get("/")
async def get_employee_future_calls(employee_id: int = Query(1, gt=0)):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            # ניסיון שליפה עם scheduled_at או scheduled_time
            try:
                query = """
                    SELECT id, employee_id, customer_name, scheduled_at, duration_minutes, created_at
                    FROM customer_scheduled_calls
                    ORDER BY id DESC;
                """
                cursor.execute(query)
            except Exception:
                conn.rollback()
                query = """
                    SELECT id, employee_id, customer_name, scheduled_time, duration_minutes, created_at
                    FROM customer_scheduled_calls
                    ORDER BY id DESC;
                """
                cursor.execute(query)

            rows = cursor.fetchall()

            return [
                {
                    "id": r[0],
                    "employee_id": r[1],
                    "customer_name": r[2],
                    "scheduled_time": r[3].isoformat() if hasattr(r[3], 'isoformat') else str(r[3]),
                    "estimated_duration_minutes": r[4],
                    "created_at": r[5].isoformat() if hasattr(r[5], 'isoformat') else str(r[5]),
                    "status": "Scheduled"
                } for r in rows
            ]
    except Exception as e:
        print(f"❌ Error reading calls: {e}")
        return []
    finally:
        if conn:
            conn.close()