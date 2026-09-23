from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import AttendanceCreate
from app.auth.dependencies import get_current_user, require_roles


router = APIRouter(
    prefix="/api/attendance",
    tags=["Chấm công"]
)


# =========================
# LẤY DANH SÁCH CHẤM CÔNG
# =========================
@router.get("/")
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ADMIN và HR xem toàn bộ
    if current_user.role in ["ADMIN", "HR"]:
        return db.query(
            Attendance
        ).order_by(
            Attendance.work_date.desc(),
            Attendance.id.desc()
        ).all()

    # MANAGER hiện tại xem toàn bộ
    # Sau này có thể giới hạn theo phòng ban
    if current_user.role == "MANAGER":
        return db.query(
            Attendance
        ).order_by(
            Attendance.work_date.desc(),
            Attendance.id.desc()
        ).all()

    # EMPLOYEE chỉ xem chấm công của chính mình
    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        return db.query(
            Attendance
        ).filter(
            Attendance.employee_id == current_user.employee_id
        ).order_by(
            Attendance.work_date.desc(),
            Attendance.id.desc()
        ).all()

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# THÊM CHẤM CÔNG
# =========================
@router.post("/")
def create_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):
    attendance = Attendance(
        employee_id=data.employee_id,
        work_date=data.work_date,
        status=data.status,
        working_hours=data.working_hours
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return attendance


# =========================
# XÓA CHẤM CÔNG
# =========================
@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    attendance = db.query(
        Attendance
    ).filter(
        Attendance.id == attendance_id
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy dữ liệu chấm công"
        )

    db.delete(attendance)
    db.commit()

    return {
        "message": "Xóa dữ liệu chấm công thành công"
    }