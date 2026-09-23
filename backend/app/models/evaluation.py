from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey
from app.database import Base


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=False
    )

    evaluation_month = Column(
        Integer,
        nullable=False
    )

    evaluation_year = Column(
        Integer,
        nullable=False
    )

    kpi_score = Column(
        Float,
        default=0
    )

    work_result = Column(
        String(500),
        nullable=True
    )

    manager_comment = Column(
        String(1000),
        nullable=True
    )

    ai_comment = Column(
        String(2000),
        nullable=True
    )

    evaluation_date = Column(
        Date,
        nullable=True
    )

    status = Column(
        String(30),
        default="DRAFT"
    )