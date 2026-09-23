from datetime import date
from pydantic import BaseModel, EmailStr


class EmployeeCreate(BaseModel):
    employee_code: str
    full_name: str
    email: EmailStr
    phone: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    address: str | None = None
    department_id: int | None = None
    position_id: int | None = None
    status: str = "ACTIVE"


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    gender: str | None = None
    date_of_birth: date | None = None
    address: str | None = None
    department_id: int | None = None
    position_id: int | None = None
    status: str | None = None