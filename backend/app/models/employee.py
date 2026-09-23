from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_code = Column(String(20), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    gender = Column(String(20))
    date_of_birth = Column(Date)
    address = Column(String(255))
    department_id = Column(Integer, ForeignKey("departments.id"))
    position_id = Column(Integer, ForeignKey("positions.id"))
    status = Column(String(30), default="ACTIVE")