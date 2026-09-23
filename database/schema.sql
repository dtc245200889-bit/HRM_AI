CREATE DATABASE hrm_ai;

-- =========================
-- TABLE USERS
-- =========================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- =========================
-- TABLE DEPARTMENTS
-- =========================

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- =========================
-- TABLE POSITIONS
-- =========================

CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- =========================
-- TABLE EMPLOYEES
-- =========================

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    date_of_birth DATE,
    address VARCHAR(255),
    department_id INTEGER,
    position_id INTEGER,
    status VARCHAR(30) DEFAULT 'ACTIVE',

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id)
        REFERENCES departments(id),

    CONSTRAINT fk_employee_position
        FOREIGN KEY (position_id)
        REFERENCES positions(id)
);

-- =========================
-- TABLE ATTENDANCE
-- =========================

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    work_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    working_hours FLOAT DEFAULT 0,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);

-- =========================
-- TABLE LEAVE REQUESTS
-- =========================

CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(30) DEFAULT 'PENDING',

    CONSTRAINT fk_leave_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);

-- =========================
-- TABLE PAYROLL
-- =========================

CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    basic_salary FLOAT DEFAULT 0,
    allowance FLOAT DEFAULT 0,
    deduction FLOAT DEFAULT 0,
    total_salary FLOAT DEFAULT 0,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id)
        REFERENCES employees(id)
);

-- =========================
-- SAMPLE DEPARTMENTS
-- =========================

INSERT INTO departments (name, description)
VALUES
('Nhan su', 'Phong quan ly nhan su'),
('Ke toan', 'Phong ke toan'),
('Kinh doanh', 'Phong kinh doanh'),
('Ky thuat', 'Phong ky thuat');

-- =========================
-- SAMPLE POSITIONS
-- =========================

INSERT INTO positions (name, description)
VALUES
('Nhan vien', 'Nhan vien thong thuong'),
('Truong phong', 'Quan ly phong ban'),
('Giam doc', 'Quan ly cap cao');

-- =========================
-- SAMPLE EMPLOYEES
-- =========================

INSERT INTO employees
(employee_code, full_name, email, phone, gender, department_id, position_id, status)
VALUES
('NV001', 'Nguyen Van An', 'an@gmail.com', '0900000001', 'Nam', 1, 1, 'ACTIVE'),
('NV002', 'Tran Thi Binh', 'binh@gmail.com', '0900000002', 'Nu', 2, 1, 'ACTIVE'),
('NV003', 'Le Van Cuong', 'cuong@gmail.com', '0900000003', 'Nam', 3, 2, 'ACTIVE');