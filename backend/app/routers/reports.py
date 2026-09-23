from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.auth.dependencies import get_current_user

from app.models.employee import Employee
from app.models.leave_request import LeaveRequest
from app.models.payroll import Payroll


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"]
)


@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # ========================================================
    # PHÂN QUYỀN
    # ========================================================

    if current_user.role not in [
        "ADMIN",
        "HR",
        "MANAGER"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Bạn không có quyền xem thống kê"
        )

    # ========================================================
    # TỔNG SỐ NHÂN VIÊN
    # ========================================================

    total_employees = (
        db.query(Employee)
        .count()
    )

    # ========================================================
    # NHÂN VIÊN ĐANG LÀM VIỆC
    # ========================================================

    active_employees = (
        db.query(Employee)
        .filter(
            Employee.status == "ACTIVE"
        )
        .count()
    )

    # ========================================================
    # ĐƠN NGHỈ PHÉP ĐANG CHỜ
    # ========================================================

    pending_leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.status == "PENDING"
        )
        .count()
    )

    # ========================================================
    # TỔNG TIỀN LƯƠNG
    # ========================================================

    total_salary = (
        db.query(
            func.coalesce(
                func.sum(Payroll.total_salary),
                0
            )
        )
        .scalar()
    )

    # ========================================================
    # KẾT QUẢ
    # ========================================================

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "pending_leave": pending_leave,
        "total_salary": total_salary
    }