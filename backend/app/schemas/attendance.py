from datetime import date
from pydantic import BaseModel


class AttendanceCreate(BaseModel):
    employee_id: int
    work_date: date
    status: str
    working_hours: float = 0