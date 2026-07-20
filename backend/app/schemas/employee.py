from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
import re

class BulkDayOffRequest(BaseModel):
    employee_id: int = Field(..., gt=0, description="Must be a valid employee database ID")
    blocked_dates: List[str] = Field(..., description="List of dates in YYYY-MM-DD format")
    reason: Optional[str] = Field(None, max_length=255)

    # אימות אוטומטי לווידוא שכל התאריכים שהפרונטאנד שולח הם בפורמט הנכון
    @field_validator('blocked_dates')
    @classmethod
    def validate_date_format(cls, v: List[str]) -> List[str]:
        date_regex = re.compile(r'^\d{4}-\d{2}-\d{2}$')
        for date_str in v:
            if not date_regex.match(date_str):
                raise ValueError(f"Date '{date_str}' must be in strict YYYY-MM-DD format")
        return v