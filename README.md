# HỆ THỐNG QUẢN LÝ NHÂN SỰ CÓ TÍCH HỢP AI

## 1. Giới thiệu

**Hệ thống quản lý nhân sự có tích hợp AI (HRM AI)** là hệ thống hỗ trợ doanh nghiệp quản lý tập trung các nghiệp vụ nhân sự như:

* Quản lý hồ sơ nhân viên
* Quản lý phòng ban và chức vụ
* Quản lý chấm công
* Quản lý nghỉ phép
* Quản lý lương
* Đánh giá hiệu suất nhân viên
* Thống kê và báo cáo nhân sự

Hệ thống tích hợp **AI Assistant** nhằm hỗ trợ nhân sự và quản lý trong việc sinh nhận xét đánh giá, hỏi đáp quy định nội bộ và tóm tắt hồ sơ nhân viên.

Mục tiêu của hệ thống là giảm thao tác thủ công, hỗ trợ quản lý dữ liệu nhân sự tập trung và nâng cao hiệu quả xử lý nghiệp vụ HR.

---

## 2. Mục tiêu dự án

* Xây dựng hệ thống quản lý nhân sự tập trung.
* Quản lý nhân viên, phòng ban, chức vụ, chấm công, nghỉ phép và lương.
* Hỗ trợ đánh giá hiệu suất nhân viên.
* Tích hợp AI vào các nghiệp vụ nhân sự.
* Phân quyền người dùng theo vai trò.
* Bảo vệ dữ liệu cá nhân và dữ liệu nhạy cảm của nhân viên.
* Ứng dụng AI trong các giai đoạn của SDLC như phân tích, thiết kế, lập trình, kiểm thử và báo cáo.

---

## 3. Chức năng chính

### 3.1. Quản lý tài khoản

* Đăng nhập hệ thống.
* Xác thực người dùng bằng JWT.
* Phân quyền theo vai trò.
* Đăng xuất tài khoản.

Các vai trò chính:

| Vai trò  | Quyền                                       |
| -------- | ------------------------------------------- |
| Admin    | Quản lý toàn bộ hệ thống                    |
| HR       | Quản lý nghiệp vụ nhân sự                   |
| Manager  | Quản lý nhân viên thuộc phòng ban           |
| Employee | Xem và sử dụng các chức năng được cấp quyền |

---

### 3.2. Quản lý nhân viên

* Thêm nhân viên.
* Cập nhật thông tin nhân viên.
* Xóa nhân viên.
* Xem hồ sơ nhân viên.
* Tìm kiếm nhân viên.
* Lọc nhân viên theo phòng ban và trạng thái.

Thông tin có thể quản lý:

* Mã nhân viên
* Họ tên
* Email
* Số điện thoại
* Phòng ban
* Chức vụ
* Ngày vào làm
* Trạng thái làm việc
* Thông tin hợp đồng

---

### 3.3. Quản lý phòng ban và chức vụ

* Thêm phòng ban.
* Sửa phòng ban.
* Xóa phòng ban.
* Xem danh sách phòng ban.
* Quản lý chức vụ.
* Gắn nhân viên với phòng ban và chức vụ.

---

### 3.4. Quản lý chấm công

* Ghi nhận ngày công.
* Theo dõi tình trạng đi làm.
* Xem bảng công theo tháng.
* Tổng hợp số ngày làm việc.
* Hỗ trợ dữ liệu cho nghiệp vụ tính lương.

---

### 3.5. Quản lý nghỉ phép

* Nhân viên gửi đơn nghỉ phép.
* Theo dõi trạng thái đơn.
* HR/Manager xem đơn nghỉ.
* Duyệt hoặc từ chối đơn.
* Theo dõi số ngày nghỉ.

Các trạng thái:

* Chờ duyệt
* Đã duyệt
* Từ chối

---

### 3.6. Quản lý tiền lương

Hệ thống hỗ trợ quản lý:

* Lương cơ bản
* Phụ cấp
* Thưởng
* Khấu trừ
* Số ngày công
* Tổng lương

Công thức tổng quát:

```text
Tổng lương = Lương cơ bản + Phụ cấp + Thưởng - Khấu trừ
```

Dữ liệu lương được giới hạn quyền truy cập theo vai trò.

---

### 3.7. Đánh giá hiệu suất

Quản lý có thể đánh giá nhân viên dựa trên:

* KPI
* Kết quả công việc
* Ngày công
* Ghi chú của trưởng phòng
* Các tiêu chí đánh giá định kỳ

Kết quả đánh giá được sử dụng làm dữ liệu đầu vào cho chức năng AI.

---

# 4. Chức năng AI

## 4.1. AI sinh nhận xét đánh giá

AI hỗ trợ sinh nhận xét dựa trên dữ liệu đã được cung cấp như:

* KPI
* Chấm công
* Kết quả công việc
* Ghi chú của quản lý

Ví dụ:

```text
Nhân viên: NV012
Phòng ban: Kinh doanh
Ngày công: 22/23
KPI: 92%
Ghi chú: Hỗ trợ tốt khách hàng mới
```

AI có thể tạo nhận xét gồm:

* Điểm mạnh
* Điểm cần cải thiện
* Gợi ý phát triển

AI được yêu cầu không suy diễn ngoài dữ liệu đầu vào.

---

## 4.2. Chatbot hỏi đáp quy định nội bộ

AI Assistant hỗ trợ người dùng hỏi các vấn đề liên quan đến:

* Quy định nghỉ phép
* Quy trình xin nghỉ
* Chính sách nhân sự
* Quy định hợp đồng
* Các quy định nội bộ khác

Ví dụ:

```text
Nhân viên: Tôi còn bao nhiêu ngày phép?
AI: Dựa trên dữ liệu được cung cấp, bạn còn ...
```

Nếu triển khai RAG, hệ thống sử dụng tài liệu quy định nội bộ làm nguồn dữ liệu để hỗ trợ trả lời.

---

## 4.3. AI tóm tắt hồ sơ nhân viên

AI hỗ trợ quản lý xem nhanh thông tin nhân viên trước khi đánh giá.

Thông tin có thể được tóm tắt:

* Thông tin cơ bản
* Phòng ban và chức vụ
* Kết quả công việc
* KPI
* Chấm công
* Đánh giá trước đó

Chỉ những dữ liệu cần thiết mới được gửi đến AI.

---

# 5. Công nghệ sử dụng

### Backend

* Python
* FastAPI
* SQLAlchemy
* JWT Authentication
* REST API

### Frontend

* React
* TypeScript
* HTML
* CSS

### Database

* SQLite

Có thể mở rộng sang:

* MySQL
* PostgreSQL

### AI

Hệ thống có thể tích hợp:

* Gemini
* OpenAI
* Claude
* Hugging Face
* Ollama

### Công cụ hỗ trợ

* Visual Studio Code
* Git
* GitHub
* Postman
* Swagger / OpenAPI

---

# 6. Kiến trúc hệ thống

```text
+----------------------+
|      Người dùng       |
+----------+-----------+
           |
           v
+----------------------+
|       Frontend       |
|        React         |
+----------+-----------+
           |
           | REST API
           v
+----------------------+
|       Backend        |
|       FastAPI        |
+----------+-----------+
           |
     +-----+-----+
     |           |
     v           v
+---------+   +---------+
| Database|   | AI API  |
| SQLite  |   | Gemini/ |
|         |   | OpenAI  |
+---------+   +---------+
```

Luồng xử lý cơ bản:

```text
Người dùng
    ↓
Frontend
    ↓
FastAPI Backend
    ↓
Kiểm tra xác thực + phân quyền
    ↓
Database / AI Service
    ↓
Xử lý dữ liệu
    ↓
Trả kết quả về Frontend
```

---

# 7. Cấu trúc thư mục

Ví dụ cấu trúc dự án:

```text
HRM_AI/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── auth/
│   │   ├── services/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── .env
│   ├── requirements.txt
│   └── hrm_ai.db
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docs/
│   ├── ERD
│   ├── UseCase
│   ├── SequenceDiagram
│   └── Report
│
└── README.md
```

---

# 8. Cài đặt và chạy dự án

## 8.1. Clone project

```bash
git clone <LINK_GITHUB>
cd HRM_AI
```

---

## 8.2. Cài đặt Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Tạo môi trường ảo:

```bash
python -m venv venv
```

Kích hoạt môi trường:

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

Cài đặt thư viện:

```bash
pip install -r requirements.txt
```

---

## 8.3. Cấu hình biến môi trường

Tạo file:

```text
.env
```

Ví dụ:

```env
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./hrm_ai.db
AI_API_KEY=your_api_key
```

> Không đưa API key thật lên GitHub.

---

## 8.4. Chạy Backend

```bash
uvicorn app.main:app --reload
```

Backend mặc định chạy tại:

```text
http://127.0.0.1:8000
```

Swagger API:

```text
http://127.0.0.1:8000/docs
```

---

## 8.5. Chạy Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Sau đó mở địa chỉ được Vite cung cấp trên terminal, thường là:

```text
http://localhost:5173
```

---

# 9. API chính

Một số API tiêu biểu:

| API                     | Phương thức | Chức năng            |
| ----------------------- | ----------- | -------------------- |
| `/api/auth/login`       | POST        | Đăng nhập            |
| `/api/employees/`       | GET         | Danh sách nhân viên  |
| `/api/employees/`       | POST        | Thêm nhân viên       |
| `/api/employees/search` | GET         | Tìm kiếm nhân viên   |
| `/api/departments/`     | GET         | Danh sách phòng ban  |
| `/api/positions/`       | GET         | Danh sách chức vụ    |
| `/api/attendance/`      | GET         | Chấm công            |
| `/api/leave_requests/`  | GET         | Danh sách nghỉ phép  |
| `/api/payroll/`         | GET         | Danh sách bảng lương |
| `/api/reports/`         | GET         | Báo cáo              |
| `/api/ai/ask`           | POST        | Gửi câu hỏi đến AI   |

---
