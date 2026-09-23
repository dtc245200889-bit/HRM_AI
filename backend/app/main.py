from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# =========================
# MODELS
# =========================

from app.models.user import User
from app.models.employee import Employee
from app.models.department import Department
from app.models.position import Position
from app.models.attendance import Attendance
from app.models.leave_request import LeaveRequest
from app.models.payroll import Payroll
from app.models.evaluation import Evaluation


# =========================
# ROUTERS
# =========================

from app.routers.auth import router as auth_router
from app.routers.employees import router as employee_router
from app.routers.departments import router as department_router
from app.routers.positions import router as position_router
from app.routers.attendance import router as attendance_router
from app.routers.leave_requests import router as leave_router
from app.routers.payroll import router as payroll_router
from app.routers.reports import router as report_router
from app.routers.ai import router as ai_router
from app.routers.evaluations import router as evaluation_router


# =========================
# CREATE DATABASE TABLES
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# FASTAPI APP
# =========================

app = FastAPI(
    title="He thong quan ly nhan su AI",
    description="He thong quan ly nhan su co tich hop AI",
    version="1.0.0"
)


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# REGISTER ROUTERS
# =========================

app.include_router(auth_router)
app.include_router(employee_router)
app.include_router(department_router)
app.include_router(position_router)
app.include_router(attendance_router)
app.include_router(leave_router)
app.include_router(payroll_router)
app.include_router(report_router)
app.include_router(ai_router)
app.include_router(evaluation_router)


# =========================
# ROOT API
# =========================

@app.get("/", tags=["He thong"])
def root():
    return {
        "message": "He thong quan ly nhan su AI dang hoat dong"
    }