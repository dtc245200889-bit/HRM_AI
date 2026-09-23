import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
};

type LeaveRequest = {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
};

function LeaveRequests() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<
    LeaveRequest[]
  >([]);

  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

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
  // LẤY NHÂN VIÊN
  // =========================

  async function getEmployees() {
    try {
      const token =
        localStorage.getItem("access_token");

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
  // LẤY DANH SÁCH NGHỈ PHÉP
  // =========================

  async function getLeaveRequests() {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/leave-requests/`,
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
            "Không thể tải danh sách nghỉ phép"
        );
      }

      setLeaveRequests(data);
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
  // TẢI DỮ LIỆU
  // =========================

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        getEmployees(),
        getLeaveRequests(),
      ]);
    }

    loadData();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setEmployeeId("");
    setStartDate("");
    setEndDate("");
    setReason("");
  }

  // =========================
  // THÊM ĐƠN NGHỈ PHÉP
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

    if (!startDate) {
      setMessage(
        "Vui lòng chọn ngày bắt đầu"
      );
      return;
    }

    if (!endDate) {
      setMessage(
        "Vui lòng chọn ngày kết thúc"
      );
      return;
    }

    if (endDate < startDate) {
      setMessage(
        "Ngày kết thúc không được trước ngày bắt đầu"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/leave-requests/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            employee_id: Number(employeeId),
            start_date: startDate,
            end_date: endDate,
            reason:
              reason.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Tạo đơn nghỉ phép thất bại"
        );
      }

      setMessage(
        "Tạo đơn nghỉ phép thành công"
      );

      resetForm();

      await getLeaveRequests();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Tạo đơn nghỉ phép thất bại"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // CẬP NHẬT TRẠNG THÁI
  // =========================

  async function updateStatus(
    leaveId: number,
    status: string
  ) {
    try {
      setMessage("");

      const token =
        localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/leave-requests/${leaveId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Cập nhật trạng thái thất bại"
        );
      }

      if (status === "APPROVED") {
        setMessage(
          "Đã chuyển đơn sang trạng thái Đã duyệt"
        );
      } else if (status === "REJECTED") {
        setMessage(
          "Đã chuyển đơn sang trạng thái Từ chối"
        );
      } else {
        setMessage(
          "Đã chuyển đơn về trạng thái Chờ duyệt"
        );
      }

      await getLeaveRequests();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Cập nhật trạng thái thất bại"
        );
      }
    }
  }

  // =========================
  // TÊN NHÂN VIÊN
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
  // TRẠNG THÁI TIẾNG VIỆT
  // =========================

  function getStatusName(status: string) {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";

      case "APPROVED":
        return "Đã duyệt";

      case "REJECTED":
        return "Từ chối";

      default:
        return status;
    }
  }

  // =========================
  // MÀU TRẠNG THÁI
  // =========================

  function getStatusStyle(status: string) {
    switch (status) {
      case "PENDING":
        return {
          background: "#fef3c7",
          color: "#92400e",
        };

      case "APPROVED":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "REJECTED":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      default:
        return {
          background: "#f1f5f9",
          color: "#475569",
        };
    }
  }

  // =========================
  // THỐNG KÊ
  // =========================

  const totalRequests =
    leaveRequests.length;

  const pendingCount =
    leaveRequests.filter(
      (item) => item.status === "PENDING"
    ).length;

  const approvedCount =
    leaveRequests.filter(
      (item) => item.status === "APPROVED"
    ).length;

  const rejectedCount =
    leaveRequests.filter(
      (item) => item.status === "REJECTED"
    ).length;

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
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
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
    borderBottom:
      "1px solid #e2e8f0",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
    borderBottom:
      "1px solid #eef2f7",
    verticalAlign: "middle",
  };

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
              margin:
                "0 10px 10px",
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
            onClick={navigate}
          />

          <SidebarItem
            icon="📝"
            text="Nghỉ phép"
            path="/leave-requests"
            active
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
              margin:
                "24px 10px 10px",
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
            borderTop:
              "1px solid rgba(255,255,255,0.12)",
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
                localStorage.getItem(
                  "username"
                ) || "A"
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
                {localStorage.getItem(
                  "role"
                ) || "ADMIN"}
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
            justifyContent:
              "space-between",
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
              Nghỉ phép
            </div>
          </div>

          <button
            onClick={() => {
              setMessage("");
              getLeaveRequests();
              getEmployees();
            }}
            style={{
              border:
                "1px solid #dbe3ed",
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
            padding:
              "30px 32px 40px",
          }}
        >
          {/* Title */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
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
                📝 Quản lý nghỉ phép
              </h1>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Quản lý và xét duyệt đơn
                xin nghỉ phép của nhân viên
              </p>
            </div>
          </div>

          {/* Message */}

          {message && (
            <div
              style={{
                padding:
                  "13px 16px",
                marginBottom:
                  "22px",
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
              title="Tổng số đơn"
              value={totalRequests}
              description="Tất cả đơn nghỉ phép"
            />

            <StatCard
              icon="⏳"
              title="Chờ duyệt"
              value={pendingCount}
              description="Đơn đang chờ xử lý"
            />

            <StatCard
              icon="✅"
              title="Đã duyệt"
              value={approvedCount}
              description="Đơn đã được duyệt"
            />

            <StatCard
              icon="❌"
              title="Từ chối"
              value={rejectedCount}
              description="Đơn không được duyệt"
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
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 750,
                  color: "#172033",
                }}
              >
                ➕ Tạo đơn nghỉ phép
              </h2>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                Nhập thông tin xin nghỉ
                của nhân viên
              </p>
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

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={labelStyle}
                  >
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
                          key={
                            employee.id
                          }
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

                {/* Ngày bắt đầu */}

                <div>
                  <label
                    style={labelStyle}
                  >
                    Ngày bắt đầu
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Ngày kết thúc */}

                <div>
                  <label
                    style={labelStyle}
                  >
                    Ngày kết thúc
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>

                {/* Lý do */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={labelStyle}
                  >
                    Lý do nghỉ
                  </label>

                  <textarea
                    value={reason}
                    onChange={(e) =>
                      setReason(
                        e.target.value
                      )
                    }
                    placeholder="Nhập lý do xin nghỉ..."
                    rows={4}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight:
                        "100px",
                    }}
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
                    borderRadius:
                      "9px",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {saving
                    ? "⏳ Đang gửi..."
                    : "📤 Gửi đơn nghỉ phép"}
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
                    borderRadius:
                      "9px",
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
                  📋 Danh sách đơn nghỉ phép
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#64748b",
                    fontSize: "13px",
                  }}
                >
                  {totalRequests} đơn
                  nghỉ phép
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
                    marginBottom:
                      "8px",
                  }}
                >
                  ⏳
                </div>

                Đang tải dữ liệu...
              </div>
            ) : leaveRequests.length ===
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
                    marginBottom:
                      "10px",
                  }}
                >
                  📭
                </div>

                <div
                  style={{
                    fontWeight: 600,
                    marginBottom:
                      "5px",
                  }}
                >
                  Chưa có đơn nghỉ phép
                </div>

                <div
                  style={{
                    fontSize: "13px",
                  }}
                >
                  Hãy tạo đơn nghỉ phép
                  đầu tiên.
                </div>
              </div>
            ) : (
              <div
                style={{
                  overflowX:
                    "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                    minWidth:
                      "1050px",
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
                        TỪ NGÀY
                      </th>

                      <th style={thStyle}>
                        ĐẾN NGÀY
                      </th>

                      <th style={thStyle}>
                        LÝ DO
                      </th>

                      <th style={thStyle}>
                        TRẠNG THÁI
                      </th>

                      <th style={thStyle}>
                        THAO TÁC
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaveRequests.map(
                      (
                        leave,
                        index
                      ) => {
                        const statusStyle =
                          getStatusStyle(
                            leave.status
                          );

                        return (
                          <tr
                            key={
                              leave.id
                            }
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
                                  leave.employee_id
                                )}
                              </div>
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                leave.start_date
                              }
                            </td>

                            <td
                              style={
                                tdStyle
                              }
                            >
                              {
                                leave.end_date
                              }
                            </td>

                            <td
                              style={{
                                ...tdStyle,
                                maxWidth:
                                  "250px",
                              }}
                            >
                              <div
                                style={{
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                                title={
                                  leave.reason ||
                                  "Không có lý do"
                                }
                              >
                                {leave.reason ||
                                  "Không có lý do"}
                              </div>
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
                                {leave.status ===
                                  "PENDING" &&
                                  "⏳ "}

                                {leave.status ===
                                  "APPROVED" &&
                                  "✓ "}

                                {leave.status ===
                                  "REJECTED" &&
                                  "✕ "}

                                {getStatusName(
                                  leave.status
                                )}
                              </span>
                            </td>

                            {/* =================================
                                THAO TÁC - CÓ THỂ ĐỔI TRẠNG THÁI
                            ================================= */}

                            <td
                              style={
                                tdStyle
                              }
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap: "7px",
                                  flexWrap:
                                    "wrap",
                                }}
                              >
                                {/* NÚT DUYỆT */}

                                <button
                                  onClick={() =>
                                    updateStatus(
                                      leave.id,
                                      "APPROVED"
                                    )
                                  }
                                  style={{
                                    border:
                                      leave.status ===
                                      "APPROVED"
                                        ? "1px solid #15803d"
                                        : "1px solid #bbf7d0",

                                    background:
                                      leave.status ===
                                      "APPROVED"
                                        ? "#dcfce7"
                                        : "#f0fdf4",

                                    color:
                                      "#15803d",

                                    padding:
                                      "7px 11px",

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
                                  ✓ Duyệt
                                </button>

                                {/* NÚT TỪ CHỐI */}

                                <button
                                  onClick={() =>
                                    updateStatus(
                                      leave.id,
                                      "REJECTED"
                                    )
                                  }
                                  style={{
                                    border:
                                      leave.status ===
                                      "REJECTED"
                                        ? "1px solid #dc2626"
                                        : "1px solid #fecaca",

                                    background:
                                      leave.status ===
                                      "REJECTED"
                                        ? "#fee2e2"
                                        : "#fff5f5",

                                    color:
                                      "#dc2626",

                                    padding:
                                      "7px 11px",

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
                                  ✕ Từ chối
                                </button>

                                {/* NÚT CHỜ DUYỆT */}

                                {leave.status !==
                                  "PENDING" && (
                                  <button
                                    onClick={() =>
                                      updateStatus(
                                        leave.id,
                                        "PENDING"
                                      )
                                    }
                                    style={{
                                      border:
                                        "1px solid #fde68a",

                                      background:
                                        "#fffbeb",

                                      color:
                                        "#92400e",

                                      padding:
                                        "7px 11px",

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
                                    ↩ Chờ duyệt
                                  </button>
                                )}
                              </div>
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
              padding:
                "24px 0 5px",
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
        border:
          "1px solid #e5eaf0",
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

export default LeaveRequests;