from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeCreate, EmployeeUpdate
from app.auth.dependencies import get_current_user, require_roles


router = APIRouter(
    prefix="/api/employees",
    tags=["Nhân viên"]
)


# =========================
# TÌM KIẾM NHÂN VIÊN
# =========================

@router.get("/search")
def search_employees(
    keyword: str | None = Query(default=None),
    department_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================
    # EMPLOYEE
    # Chỉ được tìm chính mình
    # =========================
    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        employee = db.query(Employee).filter(
            Employee.id == current_user.employee_id
        ).first()

        if not employee:
            raise HTTPException(
                status_code=404,
                detail="Không tìm thấy hồ sơ nhân viên"
            )

        # Nếu có từ khóa thì kiểm tra từ khóa với chính mình
        if keyword:
            keyword_value = keyword.strip().lower()

            if not (
                keyword_value in employee.employee_code.lower()
                or keyword_value in employee.full_name.lower()
                or keyword_value in employee.email.lower()
            ):
                return []

        # Nếu có department_id thì phải đúng phòng ban của mình
        if (
            department_id is not None
            and employee.department_id != department_id
        ):
            return []

        # Nếu có status thì phải đúng trạng thái của mình
        if (
            status is not None
            and employee.status != status
        ):
            return []

        return [employee]

    # =========================
    # ADMIN / HR / MANAGER
    # Được tìm kiếm nhân viên
    # =========================

    if current_user.role in [
        "ADMIN",
        "HR",
        "MANAGER"
    ]:

        query = db.query(Employee)

        if keyword:
            keyword_value = f"%{keyword.strip()}%"

            query = query.filter(
                or_(
                    Employee.employee_code.ilike(
                        keyword_value
                    ),
                    Employee.full_name.ilike(
                        keyword_value
                    ),
                    Employee.email.ilike(
                        keyword_value
                    )
                )
            )

        if department_id is not None:
            query = query.filter(
                Employee.department_id == department_id
            )

        if status:
            query = query.filter(
                Employee.status == status
            )

        return query.order_by(
            Employee.id.desc()
        ).all()

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# LẤY DANH SÁCH NHÂN VIÊN
# =========================

@router.get("/")
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================
    # ADMIN / HR / MANAGER
    # Xem toàn bộ nhân viên
    # =========================
    if current_user.role in [
        "ADMIN",
        "HR",
        "MANAGER"
    ]:
        return db.query(
            Employee
        ).order_by(
            Employee.id.desc()
        ).all()

    # =========================
    # EMPLOYEE
    # Chỉ xem chính mình
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
                detail="Không tìm thấy hồ sơ nhân viên"
            )

        return [employee]

    raise HTTPException(
        status_code=403,
        detail="Ban khong co quyen truy cap"
    )


# =========================
# LẤY CHI TIẾT NHÂN VIÊN
# =========================

@router.get("/{employee_id}")
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # =========================
    # EMPLOYEE
    # Chỉ được xem chính mình
    # =========================
    if current_user.role == "EMPLOYEE":

        if current_user.employee_id is None:
            raise HTTPException(
                status_code=400,
                detail="Tai khoan chua duoc lien ket voi nhan vien"
            )

        if employee_id != current_user.employee_id:
            raise HTTPException(
                status_code=403,
                detail="Ban chi duoc xem ho so cua chinh minh"
            )

    # =========================
    # Tìm nhân viên
    # =========================
    employee = db.query(
        Employee
    ).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên"
        )

    return employee


# =========================
# THÊM NHÂN VIÊN
# =========================

@router.post("/")
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    # =========================
    # Kiểm tra mã nhân viên
    # =========================
    existing_code = db.query(
        Employee
    ).filter(
        Employee.employee_code == data.employee_code
    ).first()

    if existing_code:
        raise HTTPException(
            status_code=400,
            detail="Mã nhân viên đã tồn tại"
        )

    # =========================
    # Kiểm tra email
    # =========================
    existing_email = db.query(
        Employee
    ).filter(
        Employee.email == data.email
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email nhân viên đã tồn tại"
        )

    # =========================
    # Tạo nhân viên
    # =========================
    employee = Employee(
        **data.model_dump()
    )

    db.add(employee)
    db.commit()
    db.refresh(employee)

    return employee


# =========================
# CẬP NHẬT NHÂN VIÊN
# =========================

@router.put("/{employee_id}")
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    employee = db.query(
        Employee
    ).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên"
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # =========================
    # Kiểm tra email trùng
    # =========================
    if "email" in update_data:

        existing_email = db.query(
            Employee
        ).filter(
            Employee.email == update_data["email"],
            Employee.id != employee_id
        ).first()

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email nhân viên đã tồn tại"
            )

    # =========================
    # Cập nhật dữ liệu
    # =========================
    for key, value in update_data.items():
        setattr(
            employee,
            key,
            value
        )

    db.commit()
    db.refresh(employee)

    return employee


# =========================
# XÓA NHÂN VIÊN
# =========================

@router.delete("/{employee_id}")
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            "ADMIN",
            "HR"
        )
    )
):
    employee = db.query(
        Employee
    ).filter(
        Employee.id == employee_id
    ).first()

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên"
        )

    db.delete(employee)
    db.commit()

    return {
        "message": "Xóa nhân viên thành công"
    }