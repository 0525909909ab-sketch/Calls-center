# app/schemas/customer_call.py
from pydantic import BaseModel, Field
from datetime import datetime

class CustomerCallCreateRequest(BaseModel):
    employee_id: int = Field(..., gt=0, description="Employee ID")
    customer_name: str = Field(..., min_length=2, max_length=100, description="Customer name")
    scheduled_time: datetime = Field(..., description="Scheduled call time in ISO format")
    estimated_duration_minutes: int = Field(..., ge=1, le=120, description="Estimated call duration in minutes (1 to 120 minutes)")

class CustomerCallResponse(BaseModel):
    id: int
    employee_id: int
    customer_name: str
    scheduled_time: datetime
    estimated_duration_minutes: int
    created_at: datetime
    status: str = "Scheduled"