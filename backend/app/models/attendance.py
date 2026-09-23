from sqlalchemy import Column, Integer, Date, String, ForeignKey, Float
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    work_date = Column(Date, nullable=False)
    status = Column(String(30), nullable=False)
    working_hours = Column(Float, default=0)