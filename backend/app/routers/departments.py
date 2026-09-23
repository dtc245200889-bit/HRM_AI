from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.department import Department
from app.models.employee import Employee
from app.models.user import User
from app.auth.dependencies import get_current_user, require_roles


router = APIRouter(
    prefix="/api/departments",
    tags=["Phong ban"]
)


# =========================
# LẤY DANH SÁCH PHÒNG BAN
# =========================

@router.get("/")
def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================
    # ADMIN / HR / MANAGER
    # Xem toàn bộ phòng ban
    # =========================

    if current_user.role in [
        "ADMIN",
        "HR",
        "MANAGER"
    ]:
        return db.query(
            Department
        ).order_by(
            Department.id.desc()
        ).all()

    # =========================
    # EMPLOYEE
    # Chỉ xem phòng ban của mình
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

        if employee.department_id is None:
            return []

        department = db.query(
            Department
        ).filter(
            Department.id == employee.department_id
        ).first()

        if not department:
            return []

        return [department]

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# LẤY CHI TIẾT PHÒNG BAN
# =========================

@router.get("/{department_id}")
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    department = db.query(
        Department
    ).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay phong ban"
        )

    # =========================
    # EMPLOYEE
    # Chỉ được xem phòng ban của mình
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

        if employee.department_id != department_id:
            raise HTTPException(
                status_code=403,
                detail="Ban chi duoc xem phong ban cua minh"
            )

    return department


# =========================
# THÊM PHÒNG BAN
# =========================

@router.post("/")
def create_department(
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
    # Kiểm tra tên trùng
    # =========================

    existing_department = db.query(
        Department
    ).filter(
        Department.name == name
    ).first()

    if existing_department:
        raise HTTPException(
            status_code=400,
            detail="Ten phong ban da ton tai"
        )

    # =========================
    # Tạo phòng ban
    # =========================

    department = Department(
        name=name,
        description=description
    )

    db.add(department)
    db.commit()
    db.refresh(department)

    return department


# =========================
# CẬP NHẬT PHÒNG BAN
# =========================

@router.put("/{department_id}")
def update_department(
    department_id: int,
    name: str | None = None,
    description: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    department = db.query(
        Department
    ).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay phong ban"
        )

    # =========================
    # Kiểm tra tên phòng ban
    # =========================

    if name is not None:

        existing_department = db.query(
            Department
        ).filter(
            Department.name == name,
            Department.id != department_id
        ).first()

        if existing_department:
            raise HTTPException(
                status_code=400,
                detail="Ten phong ban da ton tai"
            )

        department.name = name

    # =========================
    # Cập nhật mô tả
    # =========================

    if description is not None:
        department.description = description

    db.commit()
    db.refresh(department)

    return department


# =========================
# XÓA PHÒNG BAN
# =========================

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    department = db.query(
        Department
    ).filter(
        Department.id == department_id
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay phong ban"
        )

    # =========================
    # Kiểm tra nhân viên đang
    # thuộc phòng ban này
    # =========================

    employees = db.query(
        Employee
    ).filter(
        Employee.department_id == department_id
    ).count()

    if employees > 0:
        raise HTTPException(
            status_code=400,
            detail="Khong the xoa phong ban dang co nhan vien"
        )

    db.delete(department)
    db.commit()

    return {
        "message": "Xoa phong ban thanh cong"
    }