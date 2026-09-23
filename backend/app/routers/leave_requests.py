from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave_request import LeaveRequest
from app.models.employee import Employee
from app.models.user import User

from app.schemas.leave_request import (
    LeaveRequestCreate,
    LeaveRequestUpdate
)

from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/leave-requests",
    tags=["Nghỉ phép"]
)


# =========================
# LẤY DANH SÁCH ĐƠN NGHỈ
# =========================

@router.get("/")
def get_leave_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =========================
    # ADMIN / HR
    # Xem tất cả đơn nghỉ
    # =========================

    if current_user.role in [
        "ADMIN",
        "HR"
    ]:
        return db.query(
            LeaveRequest
        ).order_by(
            LeaveRequest.id.desc()
        ).all()

    # =========================
    # MANAGER
    # Tạm thời xem tất cả đơn
    # Sau này có thể giới hạn
    # theo phòng ban
    # =========================

    if current_user.role == "MANAGER":
        return db.query(
            LeaveRequest
        ).order_by(
            LeaveRequest.id.desc()
        ).all()

    # =========================
    # EMPLOYEE
    # Chỉ xem đơn của mình
    # =========================

    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        return db.query(
            LeaveRequest
        ).filter(
            LeaveRequest.employee_id ==
            current_user.employee_id
        ).order_by(
            LeaveRequest.id.desc()
        ).all()

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# TẠO ĐƠN NGHỈ
# =========================

@router.post("/")
def create_leave_request(
    data: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # =========================
    # KIỂM TRA NGÀY
    # =========================

    if data.end_date < data.start_date:
        raise HTTPException(
            status_code=400,
            detail="Ngay ket thuc khong duoc truoc ngay bat dau"
        )

    # =========================
    # EMPLOYEE
    # Chỉ được tạo đơn cho mình
    # =========================

    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        if data.employee_id != current_user.employee_id:
            raise HTTPException(
                status_code=403,
                detail="Nhan vien chi duoc tao don cho chinh minh"
            )

    # =========================
    # KIỂM TRA QUYỀN
    # =========================

    if current_user.role not in [
        "ADMIN",
        "HR",
        "MANAGER",
        "EMPLOYEE"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Ban khong co quyen tao don nghi phep"
        )

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
            detail="Khong tim thay nhan vien"
        )

    # =========================
    # TẠO ĐƠN
    # =========================

    leave = LeaveRequest(
        employee_id=data.employee_id,
        start_date=data.start_date,
        end_date=data.end_date,
        reason=data.reason,
        status="PENDING"
    )

    db.add(leave)
    db.commit()
    db.refresh(leave)

    return leave


# =========================
# DUYỆT / TỪ CHỐI / CHỜ DUYỆT
# =========================

@router.put("/{leave_id}")
def update_leave_request(
    leave_id: int,
    data: LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):

    # =========================
    # TÌM ĐƠN
    # =========================

    leave = db.query(
        LeaveRequest
    ).filter(
        LeaveRequest.id == leave_id
    ).first()

    if not leave:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay don nghi phep"
        )

    # =========================
    # KIỂM TRA TRẠNG THÁI
    # =========================

    allowed_statuses = [
        "PENDING",
        "APPROVED",
        "REJECTED"
    ]

    if data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Trang thai khong hop le"
        )

    # =========================
    # CẬP NHẬT TRẠNG THÁI
    # Có thể đổi:
    #
    # PENDING -> APPROVED
    # PENDING -> REJECTED
    # APPROVED -> REJECTED
    # APPROVED -> PENDING
    # REJECTED -> APPROVED
    # REJECTED -> PENDING
    # =========================

    leave.status = data.status

    db.commit()
    db.refresh(leave)

    return leave