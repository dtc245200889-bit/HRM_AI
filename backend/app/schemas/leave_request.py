from datetime import date
from pydantic import BaseModel


class LeaveRequestCreate(BaseModel):
    employee_id: int
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveRequestUpdate(BaseModel):
    status: str