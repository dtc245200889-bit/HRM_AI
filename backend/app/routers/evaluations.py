from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.evaluation import Evaluation
from app.models.employee import Employee
from app.models.user import User
from app.schemas.evaluation import (
    EvaluationCreate,
    EvaluationUpdate
)
from app.auth.dependencies import (
    get_current_user,
    require_roles
)


router = APIRouter(
    prefix="/api/evaluations",
    tags=["Danh gia"]
)


# =========================================================
# XEM TAT CA DANH GIA
# ADMIN / HR / MANAGER: xem tat ca
# EMPLOYEE: chi xem danh gia cua minh
# =========================================================
@router.get("/")
def get_evaluations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ADMIN va HR
    if current_user.role in ["ADMIN", "HR"]:
        return (
            db.query(Evaluation)
            .order_by(
                Evaluation.evaluation_year.desc(),
                Evaluation.evaluation_month.desc(),
                Evaluation.id.desc()
            )
            .all()
        )

    # MANAGER
    if current_user.role == "MANAGER":
        return (
            db.query(Evaluation)
            .order_by(
                Evaluation.evaluation_year.desc(),
                Evaluation.evaluation_month.desc(),
                Evaluation.id.desc()
            )
            .all()
        )

    # EMPLOYEE
    if current_user.role == "EMPLOYEE":
        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc gan voi nhan vien"
            )

        return (
            db.query(Evaluation)
            .filter(
                Evaluation.employee_id == current_user.employee_id
            )
            .order_by(
                Evaluation.evaluation_year.desc(),
                Evaluation.evaluation_month.desc(),
                Evaluation.id.desc()
            )
            .all()
        )

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================================================
# XEM DANH GIA THEO NHAN VIEN
# LUU Y: route nay phai dat truoc /{evaluation_id}
# =========================================================
@router.get("/employee/{employee_id}")
def get_employee_evaluations(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay nhan vien"
        )

    # EMPLOYEE chi duoc xem danh gia cua chinh minh
    if current_user.role == "EMPLOYEE":
        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc gan voi nhan vien"
            )

        if employee_id != current_user.employee_id:
            raise HTTPException(
                status_code=403,
                detail="Ban khong co quyen xem danh gia cua nhan vien khac"
            )

    # Chi cac role hop le moi duoc xem
    if current_user.role not in [
        "ADMIN",
        "HR",
        "MANAGER",
        "EMPLOYEE"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Ban khong co quyen truy cap"
        )

    return (
        db.query(Evaluation)
        .filter(
            Evaluation.employee_id == employee_id
        )
        .order_by(
            Evaluation.evaluation_year.desc(),
            Evaluation.evaluation_month.desc(),
            Evaluation.id.desc()
        )
        .all()
    )


# =========================================================
# XEM CHI TIET MOT DANH GIA
# =========================================================
@router.get("/{evaluation_id}")
def get_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    evaluation = (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id)
        .first()
    )

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay danh gia"
        )

    # EMPLOYEE chi duoc xem danh gia cua minh
    if current_user.role == "EMPLOYEE":
        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc gan voi nhan vien"
            )

        if evaluation.employee_id != current_user.employee_id:
            raise HTTPException(
                status_code=403,
                detail="Ban khong co quyen xem danh gia nay"
            )

    if current_user.role not in [
        "ADMIN",
        "HR",
        "MANAGER",
        "EMPLOYEE"
    ]:
        raise HTTPException(
            status_code=403,
            detail="Ban khong co quyen truy cap"
        )

    return evaluation


# =========================================================
# THEM DANH GIA
# ADMIN / HR / MANAGER
# EMPLOYEE KHONG DUOC THEM
# =========================================================
@router.post("/")
def create_evaluation(
    data: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):
    # Kiem tra nhan vien
    employee = (
        db.query(Employee)
        .filter(Employee.id == data.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay nhan vien"
        )

    # Kiem tra diem KPI
    if not 0 <= data.kpi_score <= 100:
        raise HTTPException(
            status_code=400,
            detail="Diem KPI phai tu 0 den 100"
        )

    # Kiem tra thang
    if not 1 <= data.evaluation_month <= 12:
        raise HTTPException(
            status_code=400,
            detail="Thang danh gia phai tu 1 den 12"
        )

    # Kiem tra nam
    if data.evaluation_year < 2000:
        raise HTTPException(
            status_code=400,
            detail="Nam danh gia khong hop le"
        )

    evaluation = Evaluation(
        **data.model_dump()
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation


# =========================================================
# SUA DANH GIA
# ADMIN / HR / MANAGER
# =========================================================
@router.put("/{evaluation_id}")
def update_evaluation(
    evaluation_id: int,
    data: EvaluationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):
    evaluation = (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id)
        .first()
    )

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay danh gia"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # Kiem tra KPI
    if "kpi_score" in update_data:
        if not 0 <= update_data["kpi_score"] <= 100:
            raise HTTPException(
                status_code=400,
                detail="Diem KPI phai tu 0 den 100"
            )

    # Kiem tra thang
    if "evaluation_month" in update_data:
        if not 1 <= update_data["evaluation_month"] <= 12:
            raise HTTPException(
                status_code=400,
                detail="Thang danh gia phai tu 1 den 12"
            )

    # Kiem tra nam
    if "evaluation_year" in update_data:
        if update_data["evaluation_year"] < 2000:
            raise HTTPException(
                status_code=400,
                detail="Nam danh gia khong hop le"
            )

    # Cap nhat du lieu
    for key, value in update_data.items():
        setattr(
            evaluation,
            key,
            value
        )

    db.commit()
    db.refresh(evaluation)

    return evaluation


# =========================================================
# XOA DANH GIA
# CHI ADMIN / HR
# =========================================================
@router.delete("/{evaluation_id}")
def delete_evaluation(
    evaluation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    evaluation = (
        db.query(Evaluation)
        .filter(Evaluation.id == evaluation_id)
        .first()
    )

    if not evaluation:
        raise HTTPException(
            status_code=404,
            detail="Khong tim thay danh gia"
        )

    db.delete(evaluation)
    db.commit()

    return {
        "message": "Xoa danh gia thanh cong"
    }