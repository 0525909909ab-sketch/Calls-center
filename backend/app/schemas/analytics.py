from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DashboardDataResponse(BaseModel):
    timestamp: datetime
    predicted_volume: int
    average_call_duration: int
    actual_volume: Optional[int] = None
    required_agents: int
    assigned_agents: int
    label :str