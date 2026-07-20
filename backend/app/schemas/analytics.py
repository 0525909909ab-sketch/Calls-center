
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DashboardDataResponse(BaseModel):
    timestamp: datetime
    predicted_volume: int
    average_call_duration: int
    actual_volume: Optional[int] = None
    required_agents: int  # כמות עובדים נדרשת (לפי חישוב האלגוריתם)
    assigned_agents: int  # כמות עובדים משובצת בפועל (מטבלת employee_schedule)