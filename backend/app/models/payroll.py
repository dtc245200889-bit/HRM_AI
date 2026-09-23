from sqlalchemy import Column, Integer, Float, ForeignKey
from app.database import Base


class Payroll(Base):
    __tablename__ = "payroll"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    basic_salary = Column(Float, default=0)
    allowance = Column(Float, default=0)
    deduction = Column(Float, default=0)
    total_salary = Column(Float, default=0)