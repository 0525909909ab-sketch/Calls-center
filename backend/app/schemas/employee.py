# app/schemas/employee.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import re

# 1. Model for submitting weekly/future days off (Bulk)
class BulkDayOffRequest(BaseModel):
    employee_id: int = Field(..., gt=0, description="Unique identifier of the employee in the database")
    blocked_dates: List[str] = Field(..., description="List of dates in YYYY-MM-DD format")
    reason: Optional[str] = Field(None, max_length=255, description="Reason for the day off")

    @field_validator('blocked_dates')
    @classmethod
    def validate_date_format(cls, v: List[str]) -> List[str]:
        date_regex = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        for date_str in v:
            if not date_regex.match(date_str):
                raise ValueError(f"The date '{date_str}' must be in a strict YYYY-MM-DD format")
        return v

# 2. Model for creating a new employee in the system
class EmployeeCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the employee")
    role: str = Field(..., description="Role: e.g., 'Manager' or 'Agent'")
    available_from: str = Field(..., description="Availability start time in HH:MM:SS format")
    available_to: str = Field(..., description="Availability end time in HH:MM:SS format")
    max_hours_per_day: int = Field(8, ge=1, le=24)
    max_hours_per_week: int = Field(40, ge=1, le=168)
    max_hours_per_month: int = Field(180, ge=1, le=744)

    @field_validator('available_from', 'available_to')
    @classmethod
    def validate_time_format(cls, v: str) -> str:
        time_regex = re.compile(r'^\d{2}:\d{2}:\d{2}$')
        if not time_regex.match(v):
            raise ValueError("The time must be in an HH:MM:SS format")
        return v