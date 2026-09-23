from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.employee import Employee

from app.auth.security import (
    verify_password,
    create_access_token,
    get_password_hash
)

from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Dang nhap"]
)


# =========================
# DANG NHAP
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Sai tai khoan hoac mat khau"
        )

    if not verify_password(
        form_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Sai tai khoan hoac mat khau"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Tai khoan da bi khoa"
        )

    access_token = create_access_token({
        "sub": user.username,
        "role": user.role
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role
    }


# =========================
# XEM THONG TIN TAI KHOAN
# =========================
@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "employee_id": current_user.employee_id
    }


# =========================
# ADMIN TAO TAI KHOAN
# =========================
@router.post("/register")
def register(
    username: str,
    password: str,
    role: str = "EMPLOYEE",
    employee_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("ADMIN")
    )
):
    # =========================
    # KIEM TRA USERNAME
    # =========================
    existing_user = db.query(User).filter(
        User.username == username
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Tai khoan da ton tai"
        )

    # =========================
    # KIEM TRA ROLE
    # =========================
    allowed_roles = [
        "ADMIN",
        "HR",
        "MANAGER",
        "EMPLOYEE"
    ]

    role = role.upper()

    if role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Role khong hop le"
        )

    # =========================
    # KIEM TRA EMPLOYEE
    # =========================
    if employee_id is not None:

        employee = db.query(Employee).filter(
            Employee.id == employee_id
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Khong tim thay nhan vien"
            )

        # Mot nhan vien chi nen co mot tai khoan
        existing_employee_user = db.query(User).filter(
            User.employee_id == employee_id
        ).first()

        if existing_employee_user:
            raise HTTPException(
                status_code=400,
                detail="Nhan vien nay da co tai khoan"
            )

    # =========================
    # TAO TAI KHOAN
    # =========================
    new_user = User(
        username=username,
        password=get_password_hash(password),
        role=role,
        is_active=True,
        employee_id=employee_id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Tao tai khoan thanh cong",
        "id": new_user.id,
        "username": new_user.username,
        "role": new_user.role,
        "employee_id": new_user.employee_id,
        "is_active": new_user.is_active
    }