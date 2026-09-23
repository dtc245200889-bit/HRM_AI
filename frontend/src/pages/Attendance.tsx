import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
};

type Attendance = {
  id: number;
  employee_id: number;
  work_date: string;
  status: string;
  working_hours: number;
};

function Attendance() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("PRESENT");
  const [workingHours, setWorkingHours] = useState("8");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // ĐIỀU HƯỚNG
  // =========================

  function navigate(path: string) {
    window.location.href = path;
  }

  // =========================
  // ĐĂNG XUẤT
  // =========================

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  // =========================
  // LẤY DANH SÁCH NHÂN VIÊN
  // =========================

  async function getEmployees() {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/employees/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tải danh sách nhân viên"
        );
      }

      setEmployees(data);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      }
    }
  }

  // =========================
  // LẤY DANH SÁCH CHẤM CÔNG
  // =========================

  async function getAttendance() {
    try {
      setLoading(true);

      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/attendance/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tải dữ liệu chấm công"
        );
      }

      setAttendanceList(data);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // TẢI DỮ LIỆU BAN ĐẦU
  // =========================

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        getEmployees(),
        getAttendance(),
      ]);
    }

    loadData();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setEmployeeId("");
    setWorkDate("");
    setAttendanceStatus("PRESENT");
    setWorkingHours("8");
  }

  // =========================
  // THÊM CHẤM CÔNG
  // =========================

  async function handleCreate(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setMessage("");

    if (!employeeId) {
      setMessage("Vui lòng chọn nhân viên");
      return;
    }

    if (!workDate) {
      setMessage("Vui lòng chọn ngày chấm công");
      return;
    }

    const hours = Number(workingHours);

    if (
      Number.isNaN(hours) ||
      hours < 0 ||
      hours > 24
    ) {
      setMessage(
        "Số giờ làm phải từ 0 đến 24 giờ"
      );
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem(
        "access_token"
      );

      const response = await fetch(
        `${API_URL}/api/attendance/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            employee_id: Number(employeeId),
            work_date: workDate,
            status: attendanceStatus,
            working_hours: hours,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Thêm dữ liệu chấm công thất bại"
        );
      }

      setMessage(
        "Thêm dữ liệu chấm công thành công"
      );

      resetForm();

      await getAttendance();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Thêm dữ liệu chấm công thất bại"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // XÓA CHẤM CÔNG
  // =========================

  async function handleDelete(
    attendanceId: number
  ) {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bản ghi chấm công này không?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem(
        "access_token"
      );

      const response = await fetch(
        `${API_URL}/api/attendance/${attendanceId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Xóa dữ liệu chấm công thất bại"
        );
      }

      setMessage(
        "Xóa dữ liệu chấm công thành công"
      );

      await getAttendance();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Xóa dữ liệu chấm công thất bại"
        );
      }
    }
  }

  // =========================
  // LẤY TÊN NHÂN VIÊN
  // =========================

  function getEmployeeName(id: number) {
    const employee = employees.find(
      (item) => item.id === id
    );

    if (!employee) {
      return "Không xác định";
    }

    return `${employee.employee_code} - ${employee.full_name}`;
  }

  // =========================
  // HIỂN THỊ TRẠNG THÁI
  // =========================

  function getStatusName(status: string) {
    switch (status) {
      case "PRESENT":
        return "Đi làm";

      case "ABSENT":
        return "Nghỉ";

      case "LATE":
        return "Đi muộn";

      case "EARLY_LEAVE":
        return "Về sớm";

      default:
        return status;
    }
  }

  // =========================
  // MÀU TRẠNG THÁI
  // =========================

  function getStatusStyle(status: string) {
    if (status === "PRESENT") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "ABSENT") {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (status === "LATE") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "EARLY_LEAVE") {
      return {
        background: "#dbeafe",
        color: "#1e40af",
      };
    }

    return {
      background: "#f1f5f9",
      color: "#475569",
    };
  }

  // =========================
  // THỐNG KÊ
  // =========================

  const totalRecords =
    attendanceList.length;

  const presentCount =
    attendanceList.filter(
      (item) => item.status === "PRESENT"
    ).length;

  const absentCount =
    attendanceList.filter(
      (item) => item.status === "ABSENT"
    ).length;

  const totalHours =
    attendanceList.reduce(
      (total, item) =>
        total + Number(item.working_hours || 0),
      0
    );

  // =========================
  // STYLE
  // =========================

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "7px",
  };

  const thStyle: React.CSSProperties = {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "12px",
    fontWeight: 700,
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
    borderBottom: "1px solid #eef2f7",
  };

  // =========================
  // GIAO DIỆN
  // =========================

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f4f7fb",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        color: "#172033",
      }}
    >
      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        style={{
          width: "250px",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #0f2747 0%, #12345d 100%)",
          padding: "24px 16px",
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          color: "#fff",
        }}
      >
        {/* Logo */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 8px",
            marginBottom: "28px",
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
              fontSize: "21px",
              fontWeight: 800,
            }}
          >
            AI
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 800,
                lineHeight: "22px",
              }}
            >
              HRM AI
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "#a9bdd7",
                marginTop: "2px",
              }}
            >
              Human Resource Management
            </div>
          </div>
        </div>

        {/* Menu */}

        <div
          style={{
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
              color: "#8fa8c5",
              fontWeight: 700,
              margin: "0 10px 10px",
              textTransform: "uppercase",
            }}
          >
            QUẢN LÝ
          </div>

          <SidebarItem
            icon="👥"
            text="Nhân viên"
            path="/employees"
            onClick={navigate}
          />

          <SidebarItem
            icon="🏢"
            text="Phòng ban"
            path="/departments"
            onClick={navigate}
          />

          <SidebarItem
            icon="💼"
            text="Chức vụ"
            path="/positions"
            onClick={navigate}
          />

          <SidebarItem
            icon="🕐"
            text="Chấm công"
            path="/attendance"
            active
            onClick={navigate}
          />

          <SidebarItem
            icon="📝"
            text="Nghỉ phép"
            path="/leave-requests"
            onClick={navigate}
          />

          <SidebarItem
            icon="💰"
            text="Bảng lương"
            path="/payroll"
            onClick={navigate}
          />

          <SidebarItem
            icon="📊"
            text="Thống kê"
            path="/reports"
            onClick={navigate}
          />

          <div
            style={{
              fontSize: "11px",
              color: "#8fa8c5",
              fontWeight: 700,
              margin: "24px 10px 10px",
              textTransform: "uppercase",
            }}
          >
            TRÍ TUỆ NHÂN TẠO
          </div>

          <SidebarItem
            icon="🤖"
            text="AI Assistant"
            path="/ai"
            onClick={navigate}
          />
        </div>

        {/* User */}

        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "14px",
            marginTop: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {(
                localStorage.getItem("username") ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div
              style={{
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {localStorage.getItem(
                  "username"
                ) || "Admin"}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#9fb4cd",
                }}
              >
                {localStorage.getItem("role") ||
                  "ADMIN"}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border:
                "1px solid rgba(255,255,255,0.12)",
              background:
                "rgba(255,255,255,0.06)",
              color: "#dce8f5",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* =====================================
          MAIN
      ===================================== */}

      <main
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}

        <header
          style={{
            height: "72px",
            background: "#fff",
            borderBottom:
              "1px solid #e8edf3",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginBottom: "3px",
              }}
            >
              Quản lý nhân sự
            </div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#172033",
              }}
            >
              Chấm công
            </div>
          </div>

          <button
            onClick={() => {
              setMessage("");
              getAttendance();
              getEmployees();
            }}
            style={{
              border: "1px solid #dbe3ed",
              background: "#fff",
              color: "#334155",
              padding: "9px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            🔄 Làm mới
          </button>
        </header>

        {/* Content */}

        <section
          style={{
            padding: "30px 32px 40px",
          }}
        >
          {/* Title */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "24px",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 800,
                  color: "#172033",
                }}
              >
                🕐 Quản lý chấm công
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Theo dõi thời gian làm việc
                của nhân viên
              </p>
            </div>
          </div>

          {/* Message */}

          {message && (
            <div
              style={{
                padding: "13px 16px",
                marginBottom: "22px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: "10px",
                color: "#1e40af",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              ℹ️ {message}
            </div>
          )}

          {/* Stats */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <StatCard
              icon="📋"
              title="Tổng bản ghi"
              value={totalRecords}
              description="Dữ liệu chấm công"
            />

            <StatCard
              icon="✅"
              title="Đi làm"
              value={presentCount}
              description="Bản ghi đi làm"
            />

            <StatCard
              icon="❌"
              title="Nghỉ"
              value={absentCount}
              description="Bản ghi nghỉ"
            />

            <StatCard
              icon="⏱️"
              title="Tổng giờ"
              value={`${totalHours} giờ`}
              description="Tổng thời gian làm việc"
            />
          </div>

          {/* =====================================
              FORM
          ===================================== */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e5eaf0",
              borderRadius: "14px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow:
                "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 750,
                    color: "#172033",
                  }}
                >
                  ➕ Thêm dữ liệu chấm công
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  Nhập thông tin ngày làm việc
                  của nhân viên
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "18px",
                }}
              >
                {/* Nhân viên */}

                <div>
                  <label style={labelStyle}>
                    Nhân viên
                  </label>

                  <select
                    value={employeeId}
                    onChange={(e) =>
                      setEmployeeId(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      -- Chọn nhân viên --
                    </option>

                    {employees.map(
                      (employee) => (
                        <option
                          key={employee.id}
                          value={
                            employee.id
                          }
                        >
                          {
                            employee.employee_code
                          }{" "}
                          -{" "}
                          {
                            employee.full_name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Ngày */}

                <div>
                  <label style={labelStyle}>
                    Ngày chấm công
                  </label>

                  <input
                    type="date"
                    value={workDate}
                    onChange={(e) =>
                      setWorkDate(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Trạng thái */}

                <div>
                  <label style={labelStyle}>
                    Trạng thái
                  </label>

                  <select
                    value={
                      attendanceStatus
                    }
                    onChange={(e) =>
                      setAttendanceStatus(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="PRESENT">
                      Đi làm
                    </option>

                    <option value="ABSENT">
                      Nghỉ
                    </option>

                    <option value="LATE">
                      Đi muộn
                    </option>

                    <option value="EARLY_LEAVE">
                      Về sớm
                    </option>
                  </select>
                </div>

                {/* Số giờ */}

                <div>
                  <label style={labelStyle}>
                    Số giờ làm
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={
                      workingHours
                    }
                    onChange={(e) =>
                      setWorkingHours(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    background:
                      saving
                        ? "#94a3b8"
                        : "#2563eb",
                    color: "#fff",
                    padding:
                      "11px 18px",
                    borderRadius: "9px",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {saving
                    ? "⏳ Đang lưu..."
                    : "➕ Thêm chấm công"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    border:
                      "1px solid #dbe3ed",
                    background: "#fff",
                    color: "#475569",
                    padding:
                      "11px 18px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  ↩ Xóa biểu mẫu
                </button>
              </div>
            </form>
          </div>

          {/* =====================================
              TABLE
          ===================================== */}

          <div
            style={{
              background: "#fff",
              border:
                "1px solid #e5eaf0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 2px 8px rgba(15, 23, 42, 0.03)",
            }}
          >
            <div
              style={{
                padding:
                  "22px 24px",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                borderBottom:
                  "1px solid #eef2f7",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 750,
                  }}
                >
                  📋 Danh sách chấm công
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {totalRecords} bản ghi
                </p>
              </div>
            </div>

            {loading ? (
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    marginBottom: "8px",
                  }}
                >
                  ⏳
                </div>

                Đang tải dữ liệu...
              </div>
            ) : attendanceList.length ===
              0 ? (
              <div
                style={{
                  padding: "50px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    marginBottom: "10px",
                  }}
                >
                  📭
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: "5px",
                  }}
                >
                  Chưa có dữ liệu chấm công
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Hãy thêm bản ghi chấm công
                  đầu tiên.
                </div>
              </div>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth: "850px",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={thStyle}>
                        STT
                      </th>

                      <th style={thStyle}>
                        NHÂN VIÊN
                      </th>

                      <th style={thStyle}>
                        NGÀY
                      </th>

                      <th style={thStyle}>
                        TRẠNG THÁI
                      </th>

                      <th style={thStyle}>
                        SỐ GIỜ LÀM
                      </th>

                      <th style={thStyle}>
                        THAO TÁC
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceList.map(
                      (
                        attendance,
                        index
                      ) => {
                        const statusStyle =
                          getStatusStyle(
                            attendance.status
                          );

                        return (
                          <tr
                            key={
                              attendance.id
                            }
                            style={{
                              transition:
                                "background 0.15s",
                            }}
                          >
                            <td
                              style={{
                                ...tdStyle,
                                color:
                                  "#64748b",
                                width:
                                  "60px",
                              }}
                            >
                              {index + 1}
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <div
                                style={{
                                  fontWeight:
                                    600,
                                  color:
                                    "#1e293b",
                                }}
                              >
                                {getEmployeeName(
                                  attendance.employee_id
                                )}
                              </div>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <span
                                style={{
                                  fontWeight:
                                    500,
                                }}
                              >
                                {attendance.work_date}
                              </span>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  alignItems:
                                    "center",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "20px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                  ...statusStyle,
                                }}
                              >
                                {attendance.status ===
                                  "PRESENT" &&
                                  "✓ "}

                                {attendance.status ===
                                  "ABSENT" &&
                                  "✕ "}

                                {attendance.status ===
                                  "LATE" &&
                                  "⏰ "}

                                {attendance.status ===
                                  "EARLY_LEAVE" &&
                                  "↩ "}

                                {getStatusName(
                                  attendance.status
                                )}
                              </span>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <span
                                style={{
                                  fontWeight:
                                    700,
                                  color:
                                    "#2563eb",
                                }}
                              >
                                {
                                  attendance.working_hours
                                }
                              </span>{" "}
                              giờ
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <button
                                onClick={() =>
                                  handleDelete(
                                    attendance.id
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #fecaca",
                                  background:
                                    "#fff5f5",
                                  color:
                                    "#dc2626",
                                  padding:
                                    "7px 12px",
                                  borderRadius:
                                    "7px",
                                  cursor:
                                    "pointer",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                🗑 Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}

          <div
            style={{
              textAlign: "center",
              padding: "24px 0 5px",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            HRM AI © 2026 — Hệ thống quản lý
            nhân sự thông minh
          </div>
        </section>
      </main>
    </div>
  );
}

// =====================================
// SIDEBAR ITEM
// =====================================

function SidebarItem({
  icon,
  text,
  path,
  active = false,
  onClick,
}: {
  icon: string;
  text: string;
  path: string;
  active?: boolean;
  onClick: (path: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(path)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "11px 12px",
        marginBottom: "5px",
        border: "none",
        borderRadius: "9px",
        background: active
          ? "rgba(37, 99, 235, 0.95)"
          : "transparent",
        color: active
          ? "#fff"
          : "#c8d6e6",
        cursor: "pointer",
        textAlign: "left",
        fontSize: "14px",
        fontWeight: active
          ? 700
          : 500,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: "22px",
          textAlign: "center",
          fontSize: "16px",
        }}
      >
        {icon}
      </span>

      <span>{text}</span>
    </button>
  );
}

// =====================================
// STAT CARD
// =====================================

function StatCard({
  icon,
  title,
  value,
  description,
}: {
  icon: string;
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5eaf0",
        borderRadius: "12px",
        padding: "19px",
        boxShadow:
          "0 2px 8px rgba(15, 23, 42, 0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          fontSize: "25px",
          fontWeight: 800,
          color: "#172033",
          marginBottom: "4px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#334155",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: "#94a3b8",
          marginTop: "3px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

export default Attendance;