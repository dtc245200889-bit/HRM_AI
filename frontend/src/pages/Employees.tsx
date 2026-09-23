import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Department = {
  id: number;
  name: string;
  description: string | null;
};

type Position = {
  id: number;
  name: string;
  description: string | null;
};

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth: string | null;
  address: string | null;
  department_id: number | null;
  position_id: number | null;
  status: string;
};

function Employees() {
  // ============================================================
  // DATA
  // ============================================================

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [departments, setDepartments] =
    useState<Department[]>([]);

  const [positions, setPositions] =
    useState<Position[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [searchKeyword, setSearchKeyword] =
    useState("");

  const [searchStatus, setSearchStatus] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  // ============================================================
  // FORM
  // ============================================================

  const [employeeCode, setEmployeeCode] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [departmentId, setDepartmentId] =
    useState("");

  const [positionId, setPositionId] =
    useState("");

  const [status, setStatus] =
    useState("ACTIVE");

  // ============================================================
  // USER
  // ============================================================

  const username =
    localStorage.getItem("username") ||
    "Admin";

  const role =
    localStorage.getItem("role") ||
    "ADMIN";

  // ============================================================
  // LẤY DANH SÁCH NHÂN VIÊN
  // ============================================================

  async function getEmployees(
    keyword = searchKeyword,
    statusFilter = searchStatus
  ) {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      const params =
        new URLSearchParams();

      if (keyword.trim()) {
        params.append(
          "keyword",
          keyword.trim()
        );
      }

      if (statusFilter) {
        params.append(
          "status",
          statusFilter
        );
      }

      const url =
        params.toString()
          ? `${API_URL}/api/employees/search?${params.toString()}`
          : `${API_URL}/api/employees/`;

      const response =
        await fetch(url, {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tải danh sách nhân viên"
        );
      }

      setEmployees(data);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(
          error.message
        );
      } else {
        setMessage(
          "Có lỗi xảy ra khi tải danh sách nhân viên"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LẤY PHÒNG BAN
  // ============================================================

  async function getDepartments() {
    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await fetch(
          `${API_URL}/api/departments/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tải danh sách phòng ban"
        );
      }

      setDepartments(data);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(
          error.message
        );
      }
    }
  }

  // ============================================================
  // LẤY CHỨC VỤ
  // ============================================================

  async function getPositions() {
    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await fetch(
          `${API_URL}/api/positions/`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tải danh sách chức vụ"
        );
      }

      setPositions(data);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(
          error.message
        );
      }
    }
  }

  // ============================================================
  // TẢI DỮ LIỆU BAN ĐẦU
  // ============================================================

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        getEmployees("", ""),
        getDepartments(),
        getPositions(),
      ]);
    }

    loadData();
  }, []);

  // ============================================================
  // TÌM KIẾM
  // ============================================================

  function handleSearch() {
    getEmployees(
      searchKeyword,
      searchStatus
    );
  }

  // ============================================================
  // XÓA BỘ LỌC
  // ============================================================

  function handleResetSearch() {
    setSearchKeyword("");
    setSearchStatus("");

    getEmployees("", "");
  }

  // ============================================================
  // RESET FORM
  // ============================================================

  function resetForm() {
    setEmployeeCode("");
    setFullName("");
    setEmail("");
    setPhone("");
    setGender("");
    setDateOfBirth("");
    setAddress("");
    setDepartmentId("");
    setPositionId("");
    setStatus("ACTIVE");

    setEditingId(null);
    setShowForm(false);
  }

  // ============================================================
  // SỬA NHÂN VIÊN
  // ============================================================

  function handleEdit(
    employee: Employee
  ) {
    setEditingId(employee.id);

    setEmployeeCode(
      employee.employee_code
    );

    setFullName(
      employee.full_name
    );

    setEmail(
      employee.email
    );

    setPhone(
      employee.phone || ""
    );

    setGender(
      employee.gender || ""
    );

    setDateOfBirth(
      employee.date_of_birth || ""
    );

    setAddress(
      employee.address || ""
    );

    setDepartmentId(
      employee.department_id
        ? String(
            employee.department_id
          )
        : ""
    );

    setPositionId(
      employee.position_id
        ? String(
            employee.position_id
          )
        : ""
    );

    setStatus(
      employee.status
    );

    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // ============================================================
  // THÊM / CẬP NHẬT
  // ============================================================

  async function handleSaveEmployee(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setMessage("");

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      if (
        !employeeCode.trim() &&
        editingId === null
      ) {
        setMessage(
          "Vui lòng nhập mã nhân viên"
        );
        return;
      }

      if (!fullName.trim()) {
        setMessage(
          "Vui lòng nhập họ và tên"
        );
        return;
      }

      if (!email.trim()) {
        setMessage(
          "Vui lòng nhập email"
        );
        return;
      }

      const employeeData = {
        full_name:
          fullName.trim(),

        email:
          email.trim(),

        phone:
          phone.trim() || null,

        gender:
          gender || null,

        date_of_birth:
          dateOfBirth || null,

        address:
          address.trim() || null,

        department_id:
          departmentId
            ? Number(departmentId)
            : null,

        position_id:
          positionId
            ? Number(positionId)
            : null,

        status:
          status,
      };

      let response: Response;

      if (editingId === null) {
        response =
          await fetch(
            `${API_URL}/api/employees/`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                employee_code:
                  employeeCode.trim(),

                ...employeeData,
              }),
            }
          );
      } else {
        response =
          await fetch(
            `${API_URL}/api/employees/${editingId}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify(
                employeeData
              ),
            }
          );
      }

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Lưu thông tin nhân viên thất bại"
        );
      }

      setMessage(
        editingId === null
          ? "Thêm nhân viên thành công"
          : "Cập nhật nhân viên thành công"
      );

      resetForm();

      await getEmployees();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(
          error.message
        );
      } else {
        setMessage(
          "Lưu thông tin nhân viên thất bại"
        );
      }
    }
  }

  // ============================================================
  // XÓA NHÂN VIÊN
  // ============================================================

  async function handleDeleteEmployee(
    employeeId: number
  ) {
    const confirmDelete =
      window.confirm(
        "Bạn có chắc chắn muốn xóa nhân viên này không?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const response =
        await fetch(
          `${API_URL}/api/employees/${employeeId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Xóa nhân viên thất bại"
        );
      }

      setMessage(
        "Xóa nhân viên thành công"
      );

      await getEmployees();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(
          error.message
        );
      } else {
        setMessage(
          "Xóa nhân viên thất bại"
        );
      }
    }
  }

  // ============================================================
  // LẤY TÊN PHÒNG BAN
  // ============================================================

  function getDepartmentName(
    departmentId: number | null
  ) {
    if (!departmentId) {
      return "Chưa phân công";
    }

    const department =
      departments.find(
        (item) =>
          item.id === departmentId
      );

    return department
      ? department.name
      : "Chưa phân công";
  }

  // ============================================================
  // LẤY TÊN CHỨC VỤ
  // ============================================================

  function getPositionName(
    positionId: number | null
  ) {
    if (!positionId) {
      return "Chưa phân công";
    }

    const position =
      positions.find(
        (item) =>
          item.id === positionId
      );

    return position
      ? position.name
      : "Chưa phân công";
  }

  // ============================================================
  // TRẠNG THÁI
  // ============================================================

  function getStatusName(
    employeeStatus: string
  ) {
    if (
      employeeStatus ===
      "ACTIVE"
    ) {
      return "Đang làm việc";
    }

    if (
      employeeStatus ===
      "INACTIVE"
    ) {
      return "Đã nghỉ việc";
    }

    return employeeStatus;
  }

  // ============================================================
  // ĐẾM NHÂN VIÊN
  // ============================================================

  const activeCount =
    employees.filter(
      (item) =>
        item.status === "ACTIVE"
    ).length;

  const inactiveCount =
    employees.filter(
      (item) =>
        item.status === "INACTIVE"
    ).length;

  // ============================================================
  // ĐĂNG XUẤT
  // ============================================================

  function logout() {
    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "username"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "token"
    );

    window.location.href = "/";
  }

  // ============================================================
  // MENU
  // ============================================================

  const menuItems = [
    {
      icon: "👥",
      title: "Nhân viên",
      path: "/employees",
    },
    {
      icon: "🏢",
      title: "Phòng ban",
      path: "/departments",
    },
    {
      icon: "💼",
      title: "Chức vụ",
      path: "/positions",
    },
    {
      icon: "🕐",
      title: "Chấm công",
      path: "/attendance",
    },
    {
      icon: "📝",
      title: "Nghỉ phép",
      path: "/leave-requests",
    },
    {
      icon: "💰",
      title: "Bảng lương",
      path: "/payroll",
    },
    {
      icon: "📊",
      title: "Thống kê",
      path: "/reports",
    },
    {
      icon: "🤖",
      title: "Trợ lý AI",
      path: "/ai",
    },
  ];

  function goTo(path: string) {
    window.location.href = path;
  }

  // ============================================================
  // STYLE
  // ============================================================

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border:
      "1px solid #dce3ee",
    borderRadius: "9px",
    outline: "none",
    boxSizing:
      "border-box" as const,
    fontSize: "14px",
    background: "#fff",
  };

  const selectStyle = {
    ...inputStyle,
    cursor: "pointer",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 650,
    color: "#344054",
    marginBottom: "7px",
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        color: "#172033",
      }}
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        style={{
          width: "250px",
          height: "100vh",
          background:
            "linear-gradient(180deg, #0f2747 0%, #12345d 100%)",
          color: "white",
          padding: "24px 16px",
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 100,
        }}
      >

        {/* LOGO */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding:
              "0 10px 28px",
            borderBottom:
              "1px solid rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "23px",
              boxShadow:
                "0 8px 20px rgba(37,99,235,0.35)",
            }}
          >
            👥
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing:
                  "0.5px",
              }}
            >
              HRM AI
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#9fb3cc",
                marginTop: "2px",
                whiteSpace:
                  "nowrap",
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
              }}
            >
              Human Resource Management
            </div>
          </div>
        </div>

        {/* MENU */}

        <div
          style={{
            marginTop: "20px",
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "5px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "#7891ad",
              fontWeight: 700,
              margin:
                "0 10px 10px",
              textTransform:
                "uppercase",
            }}
          >
            Menu chính
          </div>

          {/* TỔNG QUAN */}

          <div
            onClick={() =>
              goTo("/dashboard")
            }
            style={{
              padding:
                "12px 14px",
              borderRadius: "10px",
              marginBottom: "5px",
              cursor: "pointer",
              display: "flex",
              alignItems:
                "center",
              gap: "12px",
              color: "#d4dfed",
              whiteSpace:
                "nowrap",
            }}
          >
            <span
              style={{
                width: "20px",
                textAlign:
                  "center",
              }}
            >
              🏠
            </span>

            <span>
              Tổng quan
            </span>
          </div>

          {menuItems.map(
            (item) => {
              const active =
                item.path ===
                "/employees";

              return (
                <div
                  key={
                    item.path
                  }
                  onClick={() =>
                    goTo(
                      item.path
                    )
                  }
                  style={{
                    padding:
                      "12px 14px",
                    borderRadius:
                      "10px",
                    marginBottom:
                      "5px",
                    cursor:
                      "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "12px",
                    background:
                      active
                        ? "#2563eb"
                        : "transparent",
                    color:
                      active
                        ? "white"
                        : "#d4dfed",
                    fontWeight:
                      active
                        ? 650
                        : 400,
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  <span
                    style={{
                      width:
                        "20px",
                      textAlign:
                        "center",
                      flexShrink: 0,
                      fontSize:
                        "17px",
                    }}
                  >
                    {
                      item.icon
                    }
                  </span>

                  <span>
                    {
                      item.title
                    }
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* USER */}

        <div
          style={{
            flexShrink: 0,
            marginTop: "12px",
            paddingTop: "12px",
            borderTop:
              "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div
            style={{
              background:
                "rgba(255,255,255,0.07)",
              borderRadius:
                "12px",
              padding:
                "14px",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "50%",
                  background:
                    "#2563eb",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontWeight: 700,
                }}
              >
                {username
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#8ea7c2",
                  }}
                >
                  Đăng nhập với
                </div>

                <div
                  style={{
                    fontWeight:
                      700,
                    marginTop:
                      "3px",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {
                    username
                  }
                </div>

                <div
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#8ea7c2",
                    marginTop:
                      "2px",
                  }}
                >
                  {role}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                logout
              }
              style={{
                width:
                  "100%",
                marginTop:
                  "12px",
                padding:
                  "8px",
                border:
                  "1px solid rgba(255,255,255,0.15)",
                borderRadius:
                  "8px",
                background:
                  "rgba(255,255,255,0.06)",
                color:
                  "#dbe7f4",
                cursor:
                  "pointer",
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main
        style={{
          marginLeft: "250px",
          minHeight: "100vh",
        }}
      >

        {/* HEADER */}

        <header
          style={{
            height: "72px",
            background:
              "#ffffff",
            borderBottom:
              "1px solid #e7ebf2",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            padding:
              "0 32px",
            boxSizing:
              "border-box",
          }}
        >
          <div>
            <div
              style={{
                fontSize:
                  "13px",
                color:
                  "#8290a3",
              }}
            >
              Hệ thống quản lý nhân sự
            </div>

            <div
              style={{
                fontSize:
                  "20px",
                fontWeight:
                  750,
                marginTop:
                  "3px",
              }}
            >
              Quản lý nhân viên
            </div>
          </div>

          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius:
                  "50%",
                background:
                  "#e8f0ff",
                color:
                  "#2563eb",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                fontWeight:
                  700,
              }}
            >
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize:
                    "14px",
                  fontWeight:
                    700,
                }}
              >
                {
                  username
                }
              </div>

              <div
                style={{
                  fontSize:
                    "11px",
                  color:
                    "#8b98a9",
                }}
              >
                {role}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}

        <section
          style={{
            padding:
              "30px 32px",
            boxSizing:
              "border-box",
          }}
        >

          {/* TIÊU ĐỀ */}

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginBottom:
                "22px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize:
                    "26px",
                  fontWeight:
                    800,
                }}
              >
                Danh sách nhân viên
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color:
                    "#8290a3",
                  fontSize:
                    "14px",
                }}
              >
                Quản lý hồ sơ, phòng ban,
                chức vụ và trạng thái nhân viên
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setEditingId(
                    null
                  );
                  setMessage(
                    ""
                  );
                  setShowForm(
                    true
                  );

                  window.scrollTo({
                    top: 0,
                    behavior:
                      "smooth",
                  });
                }
              }}
              style={{
                border:
                  "none",
                borderRadius:
                  "9px",
                padding:
                  "12px 18px",
                background:
                  "#2563eb",
                color:
                  "white",
                fontWeight:
                  700,
                cursor:
                  "pointer",
                boxShadow:
                  "0 7px 18px rgba(37,99,235,0.22)",
              }}
            >
              {showForm
                ? "✕ Đóng biểu mẫu"
                : "＋ Thêm nhân viên"}
            </button>
          </div>

          {/* THỐNG KÊ */}

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap:
                "16px",
              marginBottom:
                "20px",
            }}
          >
            <InfoCard
              title="Tổng nhân viên"
              value={
                employees.length
              }
              icon="👥"
              background="#e8f0ff"
            />

            <InfoCard
              title="Đang làm việc"
              value={
                activeCount
              }
              icon="✓"
              background="#e8f8ef"
            />

            <InfoCard
              title="Đã nghỉ việc"
              value={
                inactiveCount
              }
              icon="⏸"
              background="#fff1f2"
            />
          </div>

          {/* THÔNG BÁO */}

          {message && (
            <div
              style={{
                padding:
                  "13px 16px",
                marginBottom:
                  "18px",
                borderRadius:
                  "10px",
                background:
                  message.includes(
                    "thành công"
                  )
                    ? "#ecfdf3"
                    : "#fff7ed",
                border:
                  message.includes(
                    "thành công"
                  )
                    ? "1px solid #b7ebcc"
                    : "1px solid #fed7aa",
                color:
                  message.includes(
                    "thành công"
                  )
                    ? "#087443"
                    : "#9a3412",
                fontSize:
                  "14px",
                fontWeight:
                  600,
              }}
            >
              {message.includes(
                "thành công"
              )
                ? "✓ "
                : "⚠ "}
              {message}
            </div>
          )}

          {/* TÌM KIẾM */}

          <div
            style={{
              background:
                "white",
              border:
                "1px solid #e5eaf1",
              borderRadius:
                "14px",
              padding:
                "20px",
              marginBottom:
                "20px",
              boxShadow:
                "0 3px 12px rgba(15,23,42,0.03)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "10px",
                marginBottom:
                  "16px",
              }}
            >
              <div
                style={{
                  width:
                    "36px",
                  height:
                    "36px",
                  borderRadius:
                    "9px",
                  background:
                    "#eef4ff",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontSize:
                    "18px",
                }}
              >
                🔎
              </div>

              <div>
                <div
                  style={{
                    fontWeight:
                      750,
                    fontSize:
                      "16px",
                  }}
                >
                  Tìm kiếm và lọc
                </div>

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#8b98a9",
                    marginTop:
                      "2px",
                  }}
                >
                  Tìm theo mã, họ tên hoặc email
                </div>
              </div>
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 230px auto auto",
                gap:
                  "10px",
                alignItems:
                  "center",
              }}
            >
              <input
                type="text"
                value={
                  searchKeyword
                }
                onChange={(e) =>
                  setSearchKeyword(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    handleSearch();
                  }
                }}
                placeholder="Nhập mã nhân viên, họ tên hoặc email..."
                style={
                  inputStyle
                }
              />

              <select
                value={
                  searchStatus
                }
                onChange={(e) =>
                  setSearchStatus(
                    e.target.value
                  )
                }
                style={
                  selectStyle
                }
              >
                <option value="">
                  Tất cả trạng thái
                </option>

                <option value="ACTIVE">
                  Đang làm việc
                </option>

                <option value="INACTIVE">
                  Đã nghỉ việc
                </option>
              </select>

              <button
                type="button"
                onClick={
                  handleSearch
                }
                style={{
                  padding:
                    "12px 18px",
                  border:
                    "none",
                  borderRadius:
                    "9px",
                  background:
                    "#2563eb",
                  color:
                    "white",
                  fontWeight:
                    650,
                  cursor:
                    "pointer",
                  whiteSpace:
                    "nowrap",
                }}
              >
                🔍 Tìm kiếm
              </button>

              <button
                type="button"
                onClick={
                  handleResetSearch
                }
                style={{
                  padding:
                    "12px 18px",
                  border:
                    "1px solid #dce3ee",
                  borderRadius:
                    "9px",
                  background:
                    "white",
                  color:
                    "#475467",
                  fontWeight:
                    650,
                  cursor:
                    "pointer",
                  whiteSpace:
                    "nowrap",
                }}
              >
                ↻ Xóa lọc
              </button>
            </div>
          </div>

          {/* FORM */}

          {showForm && (
            <form
              onSubmit={
                handleSaveEmployee
              }
              style={{
                background:
                  "white",
                border:
                  "1px solid #e5eaf1",
                borderRadius:
                  "14px",
                padding:
                  "24px",
                marginBottom:
                  "20px",
                boxShadow:
                  "0 5px 18px rgba(15,23,42,0.05)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  marginBottom:
                    "22px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize:
                        "19px",
                      fontWeight:
                        800,
                    }}
                  >
                    {editingId ===
                    null
                      ? "Thêm nhân viên mới"
                      : "Cập nhật thông tin nhân viên"}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      color:
                        "#8b98a9",
                      marginTop:
                        "4px",
                    }}
                  >
                    Nhập đầy đủ thông tin nhân viên
                  </div>
                </div>

                <div
                  style={{
                    width:
                      "42px",
                    height:
                      "42px",
                    borderRadius:
                      "10px",
                    background:
                      "#eef4ff",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    fontSize:
                      "20px",
                  }}
                >
                  👤
                </div>
              </div>

              {/* GRID FORM */}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap:
                    "18px",
                }}
              >

                {/* MÃ */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Mã nhân viên *
                  </label>

                  <input
                    value={
                      employeeCode
                    }
                    onChange={(e) =>
                      setEmployeeCode(
                        e.target.value
                      )
                    }
                    disabled={
                      editingId !==
                      null
                    }
                    required
                    placeholder="Ví dụ: NV001"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* HỌ TÊN */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Họ và tên *
                  </label>

                  <input
                    value={
                      fullName
                    }
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    required
                    placeholder="Nhập họ và tên"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Email *
                  </label>

                  <input
                    type="email"
                    value={
                      email
                    }
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    required
                    placeholder="example@gmail.com"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Số điện thoại
                  </label>

                  <input
                    value={
                      phone
                    }
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Nhập số điện thoại"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* GENDER */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Giới tính
                  </label>

                  <select
                    value={
                      gender
                    }
                    onChange={(e) =>
                      setGender(
                        e.target.value
                      )
                    }
                    style={
                      selectStyle
                    }
                  >
                    <option value="">
                      Chọn giới tính
                    </option>

                    <option value="Nam">
                      Nam
                    </option>

                    <option value="Nữ">
                      Nữ
                    </option>
                  </select>
                </div>

                {/* DOB */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Ngày sinh
                  </label>

                  <input
                    type="date"
                    value={
                      dateOfBirth
                    }
                    onChange={(e) =>
                      setDateOfBirth(
                        e.target.value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* DEPARTMENT */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Phòng ban
                  </label>

                  <select
                    value={
                      departmentId
                    }
                    onChange={(e) =>
                      setDepartmentId(
                        e.target.value
                      )
                    }
                    style={
                      selectStyle
                    }
                  >
                    <option value="">
                      Chọn phòng ban
                    </option>

                    {departments.map(
                      (
                        department
                      ) => (
                        <option
                          key={
                            department.id
                          }
                          value={
                            department.id
                          }
                        >
                          {
                            department.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* POSITION */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Chức vụ
                  </label>

                  <select
                    value={
                      positionId
                    }
                    onChange={(e) =>
                      setPositionId(
                        e.target.value
                      )
                    }
                    style={
                      selectStyle
                    }
                  >
                    <option value="">
                      Chọn chức vụ
                    </option>

                    {positions.map(
                      (
                        position
                      ) => (
                        <option
                          key={
                            position.id
                          }
                          value={
                            position.id
                          }
                        >
                          {
                            position.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ADDRESS */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Địa chỉ
                  </label>

                  <input
                    value={
                      address
                    }
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                    placeholder="Nhập địa chỉ"
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Trạng thái
                  </label>

                  <select
                    value={
                      status
                    }
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    style={
                      selectStyle
                    }
                  >
                    <option value="ACTIVE">
                      Đang làm việc
                    </option>

                    <option value="INACTIVE">
                      Đã nghỉ việc
                    </option>
                  </select>
                </div>
              </div>

              {/* FORM BUTTONS */}

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    "10px",
                  marginTop:
                    "24px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid #edf0f5",
                }}
              >
                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  style={{
                    padding:
                      "11px 18px",
                    border:
                      "1px solid #dce3ee",
                    borderRadius:
                      "9px",
                    background:
                      "white",
                    color:
                      "#475467",
                    fontWeight:
                      650,
                    cursor:
                      "pointer",
                  }}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  style={{
                    padding:
                      "11px 20px",
                    border:
                      "none",
                    borderRadius:
                      "9px",
                    background:
                      "#2563eb",
                    color:
                      "white",
                    fontWeight:
                      700,
                    cursor:
                      "pointer",
                    boxShadow:
                      "0 6px 14px rgba(37,99,235,0.18)",
                  }}
                >
                  {editingId ===
                  null
                    ? "＋ Thêm nhân viên"
                    : "✓ Lưu thay đổi"}
                </button>
              </div>
            </form>
          )}

          {/* DANH SÁCH */}

          <div
            style={{
              background:
                "white",
              border:
                "1px solid #e5eaf1",
              borderRadius:
                "14px",
              overflow:
                "hidden",
              boxShadow:
                "0 3px 12px rgba(15,23,42,0.03)",
            }}
          >
            {/* TABLE HEADER */}

            <div
              style={{
                padding:
                  "20px 22px",
                borderBottom:
                  "1px solid #edf0f5",
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "17px",
                    fontWeight:
                      750,
                  }}
                >
                  Danh sách nhân viên
                </div>

                <div
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#8b98a9",
                    marginTop:
                      "4px",
                  }}
                >
                  {employees.length} nhân viên
                </div>
              </div>

              <div
                style={{
                  padding:
                    "7px 12px",
                  borderRadius:
                    "20px",
                  background:
                    "#eef4ff",
                  color:
                    "#2563eb",
                  fontSize:
                    "12px",
                  fontWeight:
                    700,
                }}
              >
                {loading
                  ? "Đang tải..."
                  : "Đã cập nhật"}
              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <div
                style={{
                  padding:
                    "50px",
                  textAlign:
                    "center",
                  color:
                    "#8290a3",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "30px",
                    marginBottom:
                      "10px",
                  }}
                >
                  ⏳
                </div>

                Đang tải dữ liệu nhân viên...
              </div>
            )}

            {/* EMPTY */}

            {!loading &&
              employees.length ===
                0 && (
                <div
                  style={{
                    padding:
                      "60px 20px",
                    textAlign:
                      "center",
                    color:
                      "#8290a3",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "40px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    👥
                  </div>

                  <div
                    style={{
                      fontSize:
                        "15px",
                      fontWeight:
                        650,
                      color:
                        "#475467",
                    }}
                  >
                    Không tìm thấy nhân viên
                  </div>

                  <div
                    style={{
                      fontSize:
                        "13px",
                      marginTop:
                        "5px",
                    }}
                  >
                    Hãy thử thay đổi từ khóa hoặc bộ lọc.
                  </div>
                </div>
              )}

            {/* TABLE */}

            {!loading &&
              employees.length >
                0 && (
                <div
                  style={{
                    overflowX:
                      "auto",
                  }}
                >
                  <table
                    style={{
                      width:
                        "100%",
                      minWidth:
                        "1200px",
                      borderCollapse:
                        "collapse",
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          "STT",
                          "Mã nhân viên",
                          "Họ và tên",
                          "Email",
                          "Số điện thoại",
                          "Giới tính",
                          "Phòng ban",
                          "Chức vụ",
                          "Trạng thái",
                          "Thao tác",
                        ].map(
                          (
                            title
                          ) => (
                            <th
                              key={
                                title
                              }
                              style={{
                                padding:
                                  "14px 14px",
                                textAlign:
                                  title ===
                                  "STT"
                                    ? "center"
                                    : "left",
                                background:
                                  "#f8fafc",
                                borderBottom:
                                  "1px solid #e5eaf1",
                                color:
                                  "#667085",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  750,
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                title
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {employees.map(
                        (
                          employee,
                          index
                        ) => (
                          <tr
                            key={
                              employee.id
                            }
                            style={{
                              borderBottom:
                                "1px solid #edf0f5",
                            }}
                          >

                            {/* STT */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                textAlign:
                                  "center",
                                color:
                                  "#98a2b3",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                index +
                                1
                              }
                            </td>

                            {/* CODE */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#f1f5f9",
                                  color:
                                    "#334155",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  employee.employee_code
                                }
                              </span>
                            </td>

                            {/* NAME */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "10px",
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      "34px",
                                    height:
                                      "34px",
                                    borderRadius:
                                      "50%",
                                    background:
                                      "#e8f0ff",
                                    color:
                                      "#2563eb",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    fontWeight:
                                      750,
                                    fontSize:
                                      "13px",
                                    flexShrink:
                                      0,
                                  }}
                                >
                                  {employee.full_name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div
                                  style={{
                                    fontWeight:
                                      700,
                                    fontSize:
                                      "13px",
                                  }}
                                >
                                  {
                                    employee.full_name
                                  }
                                </div>
                              </div>
                            </td>

                            {/* EMAIL */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                color:
                                  "#667085",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                employee.email
                              }
                            </td>

                            {/* PHONE */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                color:
                                  "#667085",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                employee.phone ||
                                "Chưa cập nhật"
                              }
                            </td>

                            {/* GENDER */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                color:
                                  "#667085",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {
                                employee.gender ||
                                "Chưa cập nhật"
                              }
                            </td>

                            {/* DEPARTMENT */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                fontSize:
                                  "13px",
                              }}
                            >
                              <span
                                style={{
                                  color:
                                    "#475467",
                                }}
                              >
                                {getDepartmentName(
                                  employee.department_id
                                )}
                              </span>
                            </td>

                            {/* POSITION */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {getPositionName(
                                employee.position_id
                              )}
                            </td>

                            {/* STATUS */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                              }}
                            >
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "6px",
                                  padding:
                                    "6px 10px",
                                  borderRadius:
                                    "20px",
                                  background:
                                    employee.status ===
                                    "ACTIVE"
                                      ? "#ecfdf3"
                                      : "#fff1f2",
                                  color:
                                    employee.status ===
                                    "ACTIVE"
                                      ? "#087443"
                                      : "#be123c",
                                  fontSize:
                                    "11px",
                                  fontWeight:
                                    700,
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                <span>
                                  {employee.status ===
                                  "ACTIVE"
                                    ? "●"
                                    : "●"}
                                </span>

                                {getStatusName(
                                  employee.status
                                )}
                              </span>
                            </td>

                            {/* ACTION */}

                            <td
                              style={{
                                padding:
                                  "15px 14px",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap:
                                    "7px",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      employee
                                    )
                                  }
                                  style={{
                                    padding:
                                      "7px 11px",
                                    border:
                                      "1px solid #dbe4f0",
                                    borderRadius:
                                      "7px",
                                    background:
                                      "#f8fafc",
                                    color:
                                      "#2563eb",
                                    cursor:
                                      "pointer",
                                    fontWeight:
                                      650,
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  ✏️ Sửa
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteEmployee(
                                      employee.id
                                    )
                                  }
                                  style={{
                                    padding:
                                      "7px 11px",
                                    border:
                                      "1px solid #fecdd3",
                                    borderRadius:
                                      "7px",
                                    background:
                                      "#fff1f2",
                                    color:
                                      "#be123c",
                                    cursor:
                                      "pointer",
                                    fontWeight:
                                      650,
                                    fontSize:
                                      "12px",
                                  }}
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </div>

          {/* FOOTER */}

          <div
            style={{
              textAlign:
                "center",
              color:
                "#9aa5b5",
              fontSize:
                "12px",
              marginTop:
                "28px",
              paddingBottom:
                "20px",
            }}
          >
            HRM AI © 2026 — Hệ thống quản lý nhân sự thông minh
          </div>
        </section>
      </main>
    </div>
  );
}

// ============================================================
// CARD THỐNG KÊ
// ============================================================

function InfoCard({
  title,
  value,
  icon,
  background,
}: {
  title: string;
  value: number;
  icon: string;
  background: string;
}) {
  return (
    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e5eaf1",
        borderRadius:
          "14px",
        padding:
          "18px 20px",
        display:
          "flex",
        alignItems:
          "center",
        gap:
          "14px",
        boxShadow:
          "0 3px 12px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          width:
            "46px",
          height:
            "46px",
          borderRadius:
            "11px",
          background:
            background,
          display:
            "flex",
          alignItems:
            "center",
          justifyContent:
            "center",
          fontSize:
            "20px",
          fontWeight:
            800,
          flexShrink:
            0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize:
              "12px",
            color:
              "#8a96a8",
            marginBottom:
              "5px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize:
              "24px",
            fontWeight:
              800,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default Employees;