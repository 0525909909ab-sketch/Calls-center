from fastapi import APIRouter, UploadFile, File, HTTPException, Query
import pandas as pd
from typing import List
from datetime import datetime, timedelta
import math
from app.schemas.analytics import DashboardDataResponse
from app.DB.connection import get_db_connection
from psycopg2.extras import execute_values

# 🔥 שינוי: הורדת ה-prefix כדי לאפשר נתיבים מגוונים
router = APIRouter(tags=["Analytics & Import"])

# 1. התאמה מדויקת לנתיב המבוקש ע"י הפרונטנד
@router.post("/upload-predictions/")
async def upload_predictions(file: UploadFile = File(...)):
    try:
        df = pd.read_excel(file.file)
        df = df.where(pd.notnull(df), None)
                 
        data = [
            (row['timestamp'], row['hybrid_pred'], 180, row['actual'])
            for _, row in df.iterrows()
        ]
                 
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO hourly_call_forecast 
                    (timestamp, predicted_volume, average_call_duration, actual_volume)
                    VALUES %s
                    ON CONFLICT (timestamp) 
                    DO UPDATE SET 
                        predicted_volume = EXCLUDED.predicted_volume,
                        actual_volume = EXCLUDED.actual_volume;
                """
                execute_values(cursor, query, data)
            conn.commit()
        finally:
            conn.close()
                     
        return {"status": "success", "message": f"Successfully imported {len(data)} rows."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# 2. התאמה מדויקת לנתיב המבוקש ע"י הפרונטנד
@router.get("/api/dashboard", response_model=List[DashboardDataResponse])
async def get_admin_dashboard(
    timeframe: str = Query("daily", pattern="^(daily|weekly|monthly)$"),
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
):
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                base_date = datetime.strptime(date, "%Y-%m-%d").date()
                if timeframe == "daily":
                    end_date = base_date + timedelta(days=1)
                elif timeframe == "weekly":
                    end_date = base_date + timedelta(weeks=1)
                else: 
                    end_date = base_date + timedelta(days=30)
                                 
                query = """
                    SELECT 
                        f.timestamp, 
                        f.predicted_volume, 
                        f.average_call_duration, 
                        f.actual_volume,
                        COALESCE(COUNT(s.id), 0) as assigned_agents
                    FROM hourly_call_forecast f
                    LEFT JOIN employee_schedule s ON f.timestamp = s.timestamp
                    WHERE f.timestamp >= %s AND f.timestamp < %s
                    GROUP BY f.timestamp, f.predicted_volume, f.average_call_duration, f.actual_volume
                    ORDER BY f.timestamp ASC;
                """
                cursor.execute(query, (base_date, end_date))
                rows = cursor.fetchall()
                                 
                result = []
                for row in rows:
                    ts = row[0]
                    predicted = row[1]
                    avg_duration = row[2]
                    total_work_seconds = predicted * avg_duration
                    required_agents = max(1, math.ceil(total_work_seconds / 3600.0))
                                         
                    result.append(
                        DashboardDataResponse(
                            timestamp=ts,
                            predicted_volume=predicted,
                            average_call_duration=avg_duration,
                            actual_volume=row[3],
                            required_agents=required_agents,
                            assigned_agents=row[4],
                            label=ts.strftime("%H:%M")  
                        )
                    )
                return result
        finally:
            conn.close()
                 
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard fetch failed: {str(e)}")