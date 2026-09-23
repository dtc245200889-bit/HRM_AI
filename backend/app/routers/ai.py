from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import os

from google import genai

from app.auth.dependencies import (
    get_current_user,
    require_roles
)

from app.database import get_db

from app.models.employee import Employee
from app.models.department import Department
from app.models.position import Position
from app.models.evaluation import Evaluation
from app.models.attendance import Attendance


# ============================================================
# CẤU HÌNH
# ============================================================

load_dotenv()

router = APIRouter(
    prefix="/api/ai",
    tags=["AI"]
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# ============================================================
# KẾT NỐI GEMINI
# ============================================================

def get_ai_client():
    """
    Tạo kết nối tới Gemini.
    """

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail=(
                "Chưa cấu hình GEMINI_API_KEY. "
                "Vui lòng kiểm tra file .env."
            )
        )

    try:
        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        return client

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Không thể kết nối Gemini: {str(e)}"
        )


# ============================================================
# GỌI GEMINI AI
# ============================================================

def call_ai(prompt: str) -> str:
    """
    Gửi yêu cầu tới Gemini và nhận câu trả lời.
    """

    client = get_ai_client()

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        if not response.text:
            raise HTTPException(
                status_code=500,
                detail="Gemini không trả về nội dung."
            )

        return response.text.strip()

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi gọi Gemini AI: {str(e)}"
        )


# ============================================================
# SCHEMA
# ============================================================

class AIQuestion(BaseModel):
    question: str


class PerformanceRequest(BaseModel):
    employee_name: str
    position: str

    working_attitude: str
    performance: str

    strengths: str = ""
    weaknesses: str = ""

    kpi_score: float | None = None

    working_days: int | None = None
    total_working_days: int | None = None


# ============================================================
# 1. HỎI ĐÁP QUY ĐỊNH NỘI BỘ
# ============================================================

@router.post("/ask")
def ask_ai(
    data: AIQuestion,
    current_user=Depends(get_current_user)
):

    question = data.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Vui lòng nhập câu hỏi."
        )

    prompt = f"""
Bạn là trợ lý AI của hệ thống quản lý nhân sự.

Nhiệm vụ:
Trả lời câu hỏi của người dùng dựa CHỈ trên các quy định nội bộ
được cung cấp bên dưới.

==============================
QUY ĐỊNH NỘI BỘ
==============================

1. NGHỈ PHÉP

- Nhân viên có thể tạo đơn nghỉ phép.
- Đơn nghỉ phép có các trạng thái:
  PENDING, APPROVED, REJECTED.
- Cấp quản lý xem xét đơn nghỉ phép.
- Bộ phận nhân sự theo dõi và cập nhật kết quả.

2. CHẤM CÔNG

- Hệ thống quản lý ngày làm việc của nhân viên.
- Theo dõi trạng thái chấm công.
- Theo dõi số giờ làm việc.
- Các trạng thái có thể gồm:
  PRESENT, ABSENT, LATE, LEAVE.

3. TIỀN LƯƠNG

Tổng lương được tính theo công thức:

Tổng lương = Lương cơ bản + Phụ cấp - Khấu trừ

4. QUẢN LÝ NHÂN VIÊN

Hệ thống quản lý:

- Hồ sơ nhân viên
- Phòng ban
- Chức vụ
- Chấm công
- Nghỉ phép
- Tiền lương
- Đánh giá hiệu suất

==============================
CÂU HỎI NGƯỜI DÙNG
==============================

{question}

==============================
YÊU CẦU TRẢ LỜI
==============================

- Trả lời bằng tiếng Việt.
- Trả lời ngắn gọn, dễ hiểu.
- Chỉ sử dụng thông tin trong quy định được cung cấp.
- Không tự bịa thêm quy định.
- Không suy đoán thông tin không có.
- Nếu câu hỏi nằm ngoài quy định, hãy trả lời:

"Tôi không tìm thấy thông tin này trong quy định nội bộ được cung cấp."

- Không đưa ra thông tin cá nhân không cần thiết.
"""

    answer = call_ai(prompt)

    return {
        "question": question,
        "answer": answer
    }


# ============================================================
# 2. SINH NHẬN XÉT ĐÁNH GIÁ NHÂN VIÊN
# ============================================================

@router.post("/performance")
def generate_performance(
    data: PerformanceRequest,
    current_user=Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):

    if not data.employee_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Vui lòng nhập tên nhân viên."
        )

    # ========================================================
    # KIỂM TRA KPI
    # ========================================================

    if data.kpi_score is not None:

        if not 0 <= data.kpi_score <= 100:
            raise HTTPException(
                status_code=400,
                detail="Điểm KPI phải nằm trong khoảng từ 0 đến 100."
            )

    # ========================================================
    # XỬ LÝ NGÀY CÔNG
    # ========================================================

    if (
        data.working_days is not None
        and data.total_working_days is not None
    ):

        if data.working_days < 0:
            raise HTTPException(
                status_code=400,
                detail="Số ngày làm việc không được âm."
            )

        if data.total_working_days <= 0:
            raise HTTPException(
                status_code=400,
                detail="Tổng số ngày làm việc phải lớn hơn 0."
            )

        if data.working_days > data.total_working_days:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Số ngày làm việc không được lớn hơn "
                    "tổng số ngày làm việc."
                )
            )

        working_days_text = (
            f"{data.working_days}/"
            f"{data.total_working_days} ngày"
        )

    else:

        working_days_text = "Chưa có dữ liệu"

    # ========================================================
    # PROMPT AI
    # ========================================================

    prompt = f"""
Bạn là trợ lý AI hỗ trợ đánh giá hiệu suất nhân viên.

Hãy tạo nhận xét đánh giá công bằng, trung lập và chuyên nghiệp.

==============================
THÔNG TIN NHÂN VIÊN
==============================

Họ và tên:
{data.employee_name}

Chức vụ:
{data.position}

Điểm KPI:
{
    data.kpi_score
    if data.kpi_score is not None
    else "Chưa có dữ liệu"
}

Số ngày làm việc:
{working_days_text}

Thái độ làm việc:
{data.working_attitude}

Kết quả công việc:
{data.performance}

Điểm mạnh:
{data.strengths or "Chưa có dữ liệu"}

Điểm cần cải thiện:
{data.weaknesses or "Chưa có dữ liệu"}

==============================
YÊU CẦU
==============================

Viết nhận xét khoảng 120-150 từ.

Nội dung gồm 3 phần:

1. Điểm mạnh
2. Điểm cần cải thiện
3. Gợi ý phát triển

Yêu cầu quan trọng:

- Viết bằng tiếng Việt.
- Văn phong lịch sự và chuyên nghiệp.
- Công bằng và trung lập.
- Không bịa thông tin.
- Không suy diễn ngoài dữ liệu được cung cấp.
- Không đánh giá dựa trên giới tính, tuổi, địa chỉ
  hoặc thông tin cá nhân không liên quan.
- Tập trung vào kết quả công việc, KPI, ngày công,
  thái độ và năng lực làm việc.
"""

    comment = call_ai(prompt)

    return {
        "employee_name": data.employee_name,
        "comment": comment
    }


# ============================================================
# 3. TÓM TẮT HỒ SƠ NHÂN VIÊN
# ============================================================

@router.get("/summary/{employee_id}")
def summarize_employee_from_database(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles(
            "ADMIN",
            "HR",
            "MANAGER"
        )
    )
):

    # ========================================================
    # TÌM NHÂN VIÊN
    # ========================================================

    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:

        raise HTTPException(
            status_code=404,
            detail="Không tìm thấy nhân viên."
        )

    # ========================================================
    # PHÒNG BAN
    # ========================================================

    department_name = "Chưa có phòng ban"

    if employee.department_id:

        department = (
            db.query(Department)
            .filter(
                Department.id == employee.department_id
            )
            .first()
        )

        if department:
            department_name = department.name

    # ========================================================
    # CHỨC VỤ
    # ========================================================

    position_name = "Chưa có chức vụ"

    if employee.position_id:

        position = (
            db.query(Position)
            .filter(
                Position.id == employee.position_id
            )
            .first()
        )

        if position:
            position_name = position.name

    # ========================================================
    # ĐÁNH GIÁ GẦN NHẤT
    # ========================================================

    latest_evaluation = (
        db.query(Evaluation)
        .filter(
            Evaluation.employee_id == employee.id
        )
        .order_by(
            Evaluation.evaluation_year.desc(),
            Evaluation.evaluation_month.desc()
        )
        .first()
    )

    evaluation_text = "Chưa có đánh giá."

    if latest_evaluation:

        evaluation_text = (
            f"KPI: {latest_evaluation.kpi_score}. "
            f"Kết quả công việc: "
            f"{latest_evaluation.work_result or 'Không có'}. "
            f"Nhận xét quản lý: "
            f"{latest_evaluation.manager_comment or 'Không có'}."
        )

    # ========================================================
    # CHẤM CÔNG
    # ========================================================

    attendance_records = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == employee.id
        )
        .all()
    )

    total_attendance = len(
        attendance_records
    )

    present_days = sum(
        1
        for item in attendance_records
        if str(item.status).upper() == "PRESENT"
    )

    attendance_text = (
        f"Tổng số bản ghi chấm công: "
        f"{total_attendance}. "
        f"Số ngày có trạng thái PRESENT: "
        f"{present_days}."
    )

    # ========================================================
    # PROMPT AI
    # ========================================================

    prompt = f"""
Bạn là trợ lý AI của hệ thống quản lý nhân sự.

Hãy tóm tắt hồ sơ nhân viên để quản lý có thể
xem nhanh trước buổi đánh giá.

==============================
THÔNG TIN NHÂN VIÊN
==============================

Mã nhân viên:
{employee.employee_code}

Họ và tên:
{employee.full_name}

Phòng ban:
{department_name}

Chức vụ:
{position_name}

Trạng thái:
{employee.status}

Dữ liệu chấm công:
{attendance_text}

Đánh giá gần nhất:
{evaluation_text}

==============================
YÊU CẦU
==============================

- Trả lời bằng tiếng Việt.
- Tóm tắt ngắn gọn và rõ ràng.
- Tập trung vào công việc.
- Tập trung vào chấm công.
- Tập trung vào kết quả đánh giá.
- Nếu thiếu dữ liệu thì ghi "Chưa có dữ liệu".
- Không tự bịa thông tin.
- Không suy diễn ngoài dữ liệu.
- Không đưa email, số điện thoại, địa chỉ,
  giới tính hoặc thông tin cá nhân không cần thiết.
"""

    summary = call_ai(prompt)

    return {
        "employee_id": employee.id,
        "employee_code": employee.employee_code,
        "full_name": employee.full_name,
        "department": department_name,
        "position": position_name,
        "status": employee.status,
        "summary": summary
    }