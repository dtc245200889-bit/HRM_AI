from pydantic import BaseModel


class PayrollCreate(BaseModel):
    employee_id: int
    month: int
    year: int
    basic_salary: float = 0
    allowance: float = 0
    deduction: float = 0