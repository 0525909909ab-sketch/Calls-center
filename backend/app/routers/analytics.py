# app/routers/analytics.py
from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime, timedelta
import math
from app.schemas.analytics import DashboardDataResponse
from app.database.connection import get_db_connection

router = APIRouter(prefix="/api/dashboard", tags=["Admin Dashboard"])

@router.get("", response_model=List[DashboardDataResponse])
async def get_admin_dashboard(
    timeframe: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    date: str = Query(..., regex=r"^\d{4}-\d{2}-\d{2}$")
):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # המרה של תאריך הבסיס וחישוב טווח הזמן לשאילתה
        base_date = datetime.strptime(date, "%Y-%m-%d").date()
        if timeframe == "daily":
            end_date = base_date + timedelta(days=1)
        elif timeframe == "weekly":
            end_date = base_date + timedelta(weeks=1)
        else: # monthly
            end_date = base_date + timedelta(days=30) # הערכה מהירה להאקתון

        # שאילתת SQL מתקדמת שמביאה את התחזית ובודקת במקביל כמה משובצים בפועל (LEFT JOIN)
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
            predicted = row[1]
            avg_duration = row[2]
            total_work_seconds = predicted * avg_duration
            required_agents = max(1, math.ceil(total_work_seconds / 3600.0))
            
            result.append(
                DashboardDataResponse(
                    timestamp=row[0],
                    predicted_volume=predicted,
                    average_call_duration=avg_duration,
                    actual_volume=row[3],
                    required_agents=required_agents,
                    assigned_agents=row[4]
                )
            )
            
        cursor.close()
        conn.close()
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard fetch failed: {str(e)}")