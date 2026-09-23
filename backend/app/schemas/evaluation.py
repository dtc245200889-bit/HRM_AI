from datetime import date
from pydantic import BaseModel


class EvaluationCreate(BaseModel):
    employee_id: int
    evaluation_month: int
    evaluation_year: int
    kpi_score: float = 0
    work_result: str | None = None
    manager_comment: str | None = None
    evaluation_date: date | None = None
    status: str = "DRAFT"


class EvaluationUpdate(BaseModel):
    evaluation_month: int | None = None
    evaluation_year: int | None = None
    kpi_score: float | None = None
    work_result: str | None = None
    manager_comment: str | None = None
    evaluation_date: date | None = None
    status: str | None = None