# Database Design

## 1. Users

Quan ly tai khoan dang nhap va phan quyen.

- id: Khoa chinh
- username: Ten dang nhap
- password: Mat khau
- role: Vai tro
- is_active: Trang thai tai khoan

## 2. Departments

Quan ly phong ban.

- id: Khoa chinh
- name: Ten phong ban
- description: Mo ta

## 3. Positions

Quan ly chuc vu.

- id: Khoa chinh
- name: Ten chuc vu
- description: Mo ta

## 4. Employees

Quan ly thong tin nhan vien.

- id: Khoa chinh
- employee_code: Ma nhan vien
- full_name: Ho ten
- email: Email
- phone: So dien thoai
- gender: Gioi tinh
- date_of_birth: Ngay sinh
- address: Dia chi
- department_id: Khoa ngoai phong ban
- position_id: Khoa ngoai chuc vu
- status: Trang thai

## 5. Attendance

Quan ly cham cong.

- id: Khoa chinh
- employee_id: Khoa ngoai nhan vien
- work_date: Ngay lam viec
- status: Trang thai cham cong
- working_hours: So gio lam

## 6. Leave Requests

Quan ly nghi phep.

- id: Khoa chinh
- employee_id: Khoa ngoai nhan vien
- start_date: Ngay bat dau
- end_date: Ngay ket thuc
- reason: Ly do
- status: Trang thai

## 7. Payroll

Quan ly luong.

- id: Khoa chinh
- employee_id: Khoa ngoai nhan vien
- month: Thang
- year: Nam
- basic_salary: Luong co ban
- allowance: Phu cap
- deduction: Khau tru
- total_salary: Tong luong

## Quan he

Department 1 - N Employee

Position 1 - N Employee

Employee 1 - N Attendance

Employee 1 - N LeaveRequest

Employee 1 - N Payroll