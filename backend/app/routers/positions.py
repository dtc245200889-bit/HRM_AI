from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.position import Position
from app.models.employee import Employee
from app.models.user import User
from app.auth.dependencies import get_current_user, require_roles


router = APIRouter(
    prefix="/api/positions",
    tags=["Chuc vu"]
)


# =========================
# LẤY DANH SÁCH CHỨC VỤ
# =========================

@router.get("/")
def get_positions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================
    # ADMIN / HR / MANAGER
    # Xem toàn bộ chức vụ
    # =========================

    if current_user.role in [
        "ADMIN",
        "HR",
        "MANAGER"
    ]:
        return db.query(
            Position
        ).order_by(
            Position.id.desc()
        ).all()

    # =========================
    # EMPLOYEE
    # Chỉ xem chức vụ của mình
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

        if employee.position_id is None:
            return []

        position = db.query(
            Position
        ).filter(
            Position.id == employee.position_id
        ).first()

        if not position:
            return []

        return [position]

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# LẤY CHI TIẾT CHỨC VỤ
# =========================

@router.get("/{position_id}")
def get_position(
    position_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    position = db.query(
        Position
    ).filter(
        Position.id == position_id
    ).first()

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuc vu"
        )

    # =========================
    # EMPLOYEE
    # Chỉ được xem chức vụ của mình
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

        if employee.position_id != position_id:
            raise HTTPException(
                status_code=403,
                detail="Ban chi duoc xem chuc vu cua minh"
            )

    return position


# =========================
# THÊM CHỨC VỤ
# =========================

@router.post("/")
def create_position(
    name: str,
    description: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    # =========================
    # Kiểm tra tên chức vụ
    # =========================

    existing_position = db.query(
        Position
    ).filter(
        Position.name == name
    ).first()

    if existing_position:
        raise HTTPException(
            status_code=400,
            detail="Ten chuc vu da ton tai"
        )

    # =========================
    # Tạo chức vụ
    # =========================

    position = Position(
        name=name,
        description=description
    )

    db.add(position)
    db.commit()
    db.refresh(position)

    return position


# =========================
# CẬP NHẬT CHỨC VỤ
# =========================

@router.put("/{position_id}")
def update_position(
    position_id: int,
    name: str,
    description: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    position = db.query(
        Position
    ).filter(
        Position.id == position_id
    ).first()

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuc vu"
        )

    # =========================
    # Kiểm tra tên trùng
    # =========================

    existing_position = db.query(
        Position
    ).filter(
        Position.name == name,
        Position.id != position_id
    ).first()

    if existing_position:
        raise HTTPException(
            status_code=400,
            detail="Ten chuc vu da ton tai"
        )

    position.name = name
    position.description = description

    db.commit()
    db.refresh(position)

    return position


# =========================
# XÓA CHỨC VỤ
# =========================

@router.delete("/{position_id}")
def delete_position(
    position_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    position = db.query(
        Position
    ).filter(
        Position.id == position_id
    ).first()

    if not position:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay chuc vu"
        )

    # =========================
    # Kiểm tra nhân viên đang
    # sử dụng chức vụ này
    # =========================

    employees = db.query(
        Employee
    ).filter(
        Employee.position_id == position_id
    ).count()

    if employees > 0:
        raise HTTPException(
            status_code=400,
            detail="Khong the xoa chuc vu dang duoc su dung boi nhan vien"
        )

    db.delete(position)
    db.commit()

    return {
        "message": "Xoa chuc vu thanh cong"
    }