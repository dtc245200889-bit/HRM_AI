# API Documentation

## Authentication

POST /api/auth/login

Dang nhap he thong.

---

## Employees

GET /api/employees/

Lay danh sach nhan vien.

GET /api/employees/{employee_id}

Lay thong tin mot nhan vien.

POST /api/employees/

Them nhan vien.

PUT /api/employees/{employee_id}

Cap nhat nhan vien.

DELETE /api/employees/{employee_id}

Xoa nhan vien.

GET /api/employees/search/

Tim kiem nhan vien.

---

## Reports

GET /api/reports/dashboard

Lay thong ke tong quan he thong.

---

## Authorization

ADMIN va HR:
- Them nhan vien
- Sua nhan vien
- Xoa nhan vien

ADMIN, HR, MANAGER, EMPLOYEE:
- Xem du lieu duoc phep truy cap