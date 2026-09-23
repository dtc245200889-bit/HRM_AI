from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    username = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(30),
        nullable=False
    )

    is_active = Column(
        Boolean,
        default=True
    )

    # Liên kết tài khoản với nhân viên
    employee_id = Column(
        Integer,
        ForeignKey("employees.id"),
        nullable=True
    )