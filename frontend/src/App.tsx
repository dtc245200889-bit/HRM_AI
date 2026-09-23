import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import Positions from "./pages/Positions";
import Attendance from "./pages/Attendance";
import LeaveRequests from "./pages/LeaveRequests";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import Evaluations from "./pages/Evaluations";

function App() {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");

  // ============================================================
  // CHUA DANG NHAP
  // ============================================================
  if (!token) {
    return <Login />;
  }

  const path = window.location.pathname;

  // ============================================================
  // TRANG CHU
  // ============================================================
  if (
    path === "/" ||
    path === "/dashboard"
  ) {
    return <Dashboard />;
  }

  // ============================================================
  // NHAN VIEN
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/employees") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Employees />;
    }
  }

  // ============================================================
  // PHONG BAN
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/departments") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Departments />;
    }
  }

  // ============================================================
  // CHUC VU
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/positions") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Positions />;
    }
  }

  // ============================================================
  // CHAM CONG
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/attendance") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Attendance />;
    }
  }

  // ============================================================
  // NGHI PHEP
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/leave-requests") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <LeaveRequests />;
    }
  }

  // ============================================================
  // BANG LUONG
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/payroll") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Payroll />;
    }
  }

  // ============================================================
  // BAO CAO / THONG KE
  // CHI ADMIN / HR / MANAGER
  // ============================================================
  if (path === "/reports") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER"
    ) {
      return <Reports />;
    }
  }

  // ============================================================
  // AI ASSISTANT
  // ADMIN / HR / MANAGER / EMPLOYEE
  // ============================================================
  if (path === "/ai") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <AIAssistant />;
    }
  }

  // ============================================================
  // DANH GIA
  // ADMIN / HR / MANAGER / EMPLOYEE
  // EMPLOYEE CHI XEM DANH GIA CUA MINH
  // ============================================================
  if (path === "/evaluations") {
    if (
      role === "ADMIN" ||
      role === "HR" ||
      role === "MANAGER" ||
      role === "EMPLOYEE"
    ) {
      return <Evaluations />;
    }
  }

  // ============================================================
  // KHONG CO QUYEN
  // ============================================================
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f7fb",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow:
            "0 10px 30px rgba(15,23,42,0.08)",
          maxWidth: "450px",
        }}
      >
        <div
          style={{
            fontSize: "50px",
            marginBottom: "15px",
          }}
        >
          🔒
        </div>

        <h2
          style={{
            margin: "0 0 10px",
            color: "#172033",
          }}
        >
          Không có quyền truy cập
        </h2>

        <p
          style={{
            color: "#7b8798",
            fontSize: "14px",
            lineHeight: 1.6,
            marginBottom: "25px",
          }}
        >
          Tài khoản của bạn không được phép
          sử dụng chức năng này.
        </p>

        <button
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
          style={{
            border: "none",
            background: "#2563eb",
            color: "white",
            padding: "11px 20px",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Về trang chính
        </button>
      </div>
    </div>
  );
}

export default App;