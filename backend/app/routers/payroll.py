from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.payroll import Payroll
from app.models.employee import Employee
from app.models.user import User
from app.schemas.payroll import PayrollCreate
from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/payroll",
    tags=["Bảng lương"]
)


# =========================
# LẤY DANH SÁCH BẢNG LƯƠNG
# =========================

@router.get("/")
def get_payroll(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =========================
    # ADMIN / HR
    # Xem toàn bộ bảng lương
    # =========================

    if current_user.role in [
        "ADMIN",
        "HR"
    ]:
        return db.query(
            Payroll
        ).order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc()
        ).all()

    # =========================
    # MANAGER
    # Tạm thời xem toàn bộ
    # Sau này có thể giới hạn
    # theo phòng ban
    # =========================

    if current_user.role == "MANAGER":
        return db.query(
            Payroll
        ).order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc()
        ).all()

    # =========================
    # EMPLOYEE
    # Chỉ xem bảng lương của mình
    # =========================

    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        employee = db.query(
            Employee
        ).filter(
            Employee.id == current_user.employee_id
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Khong tim thay ho so nhan vien"
            )

        return db.query(
            Payroll
        ).filter(
            Payroll.employee_id ==
            current_user.employee_id
        ).order_by(
            Payroll.year.desc(),
            Payroll.month.desc(),
            Payroll.id.desc()
        ).all()

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# LẤY CHI TIẾT BẢNG LƯƠNG
# =========================

@router.get("/{payroll_id}")
def get_payroll_detail(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    payroll = db.query(
        Payroll
    ).filter(
        Payroll.id == payroll_id
    ).first()

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay bang luong"
        )

    # =========================
    # EMPLOYEE
    # Chỉ xem bảng lương của mình
    # =========================

    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        if payroll.employee_id != current_user.employee_id:
            raise HTTPException(
                status_code=403,
                detail="Ban chi duoc xem bang luong cua chinh minh"
            )

    return payroll


# =========================
# THÊM BẢNG LƯƠNG
# =========================

@router.post("/")
def create_payroll(
    data: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):

    # =========================
    # KIỂM TRA NHÂN VIÊN
    # =========================

    employee = db.query(
        Employee
    ).filter(
        Employee.id == data.employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên"
        )

    # =========================
    # KIỂM TRA THÁNG
    # =========================

    if data.month < 1 or data.month > 12:
        raise HTTPException(
            status_code=400,
            detail="Tháng phải từ 1 đến 12"
        )

    # =========================
    # KIỂM TRA LƯƠNG CƠ BẢN
    # =========================

    if data.basic_salary < 0:
        raise HTTPException(
            status_code=400,
            detail="Lương cơ bản không được âm"
        )

    # =========================
    # KIỂM TRA PHỤ CẤP
    # =========================

    if data.allowance < 0:
        raise HTTPException(
            status_code=400,
            detail="Phụ cấp không được âm"
        )

    # =========================
    # KIỂM TRA KHẤU TRỪ
    # =========================

    if data.deduction < 0:
        raise HTTPException(
            status_code=400,
            detail="Khấu trừ không được âm"
        )

    # =========================
    # KIỂM TRA BẢNG LƯƠNG TRÙNG
    # =========================

    existing = db.query(
        Payroll
    ).filter(
        Payroll.employee_id == data.employee_id,
        Payroll.month == data.month,
        Payroll.year == data.year
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Nhân viên đã có bảng lương trong tháng này"
        )

    # =========================
    # TÍNH TỔNG LƯƠNG
    # =========================

    total_salary = (
        data.basic_salary
        + data.allowance
        - data.deduction
    )

    # =========================
    # TẠO BẢNG LƯƠNG
    # =========================

    payroll = Payroll(
        employee_id=data.employee_id,
        month=data.month,
        year=data.year,
        basic_salary=data.basic_salary,
        allowance=data.allowance,
        deduction=data.deduction,
        total_salary=total_salary
    )

    db.add(payroll)
    db.commit()
    db.refresh(payroll)

    return payroll


# =========================
# XÓA BẢNG LƯƠNG
# =========================

@router.delete("/{payroll_id}")
def delete_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):

    payroll = db.query(
        Payroll
    ).filter(
        Payroll.id == payroll_id
    ).first()

    if not payroll:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy bảng lương"
        )

    db.delete(payroll)
    db.commit()

    return {
        "message": "Xóa bảng lương thành công"
    }