import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  department_id: number | null;
  position_id: number | null;
  status: string;
}

interface Position {
  id: number;
  name: string;
  description: string | null;
}

function AIAssistant() {
  const [activeTab, setActiveTab] = useState("ask");

  // =========================
  // HỎI ĐÁP
  // =========================
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // =========================
  // ĐÁNH GIÁ
  // =========================
  const [employeeName, setEmployeeName] = useState("");
  const [position, setPosition] = useState("");
  const [workingAttitude, setWorkingAttitude] = useState("");
  const [performance, setPerformance] = useState("");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [kpiScore, setKpiScore] = useState("");
  const [workingDays, setWorkingDays] = useState("");
  const [totalWorkingDays, setTotalWorkingDays] = useState("");
  const [performanceResult, setPerformanceResult] = useState("");

  // =========================
  // NHÂN VIÊN / CHỨC VỤ
  // =========================
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // =========================
  // TÓM TẮT
  // =========================
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [summaryResult, setSummaryResult] = useState("");

  // =========================
  // TRẠNG THÁI
  // =========================
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  // =========================
  // LOAD DỮ LIỆU
  // =========================
  useEffect(() => {
    loadEmployees();
    loadPositions();
  }, []);

  async function loadEmployees() {
    try {
      const response = await fetch(`${API_URL}/api/employees/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setEmployees(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function loadPositions() {
    try {
      const response = await fetch(`${API_URL}/api/positions/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPositions(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function getPositionName(positionId: number | null) {
    if (!positionId) {
      return "Chưa có chức vụ";
    }

    const foundPosition = positions.find(
      (item) => item.id === positionId
    );

    return foundPosition
      ? foundPosition.name
      : "Chưa có chức vụ";
  }

  // =========================
  // CHỌN NHÂN VIÊN ĐÁNH GIÁ
  // =========================
  function handleSelectEmployee(employeeId: string) {
    setEmployeeName("");
    setPosition("");
    setKpiScore("");
    setWorkingDays("");
    setTotalWorkingDays("");

    const selectedEmployee = employees.find(
      (employee) => employee.id === Number(employeeId)
    );

    if (!selectedEmployee) {
      return;
    }

    setEmployeeName(selectedEmployee.full_name);

    setPosition(
      getPositionName(selectedEmployee.position_id)
    );
  }

  // =========================
  // HỎI AI
  // =========================
  async function askAI() {
    if (!question.trim()) {
      setAnswer("Vui lòng nhập câu hỏi.");
      return;
    }

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch(`${API_URL}/api/ai/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể kết nối AI."
        );
      }

      setAnswer(data.answer);
    } catch (error: any) {
      setAnswer(
        error.message ||
          "Có lỗi xảy ra khi kết nối AI."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // TẠO NHẬN XÉT
  // =========================
  async function generatePerformance() {
    if (
      !employeeName.trim() ||
      !position.trim() ||
      !workingAttitude.trim() ||
      !performance.trim()
    ) {
      setPerformanceResult(
        "Vui lòng nhập đầy đủ các thông tin bắt buộc."
      );
      return;
    }

    if (kpiScore.trim()) {
      const kpi = Number(kpiScore);

      if (
        Number.isNaN(kpi) ||
        kpi < 0 ||
        kpi > 100
      ) {
        setPerformanceResult(
          "Điểm KPI phải nằm trong khoảng từ 0 đến 100."
        );
        return;
      }
    }

    if (
      workingDays.trim() &&
      totalWorkingDays.trim()
    ) {
      const working = Number(workingDays);
      const total = Number(totalWorkingDays);

      if (
        Number.isNaN(working) ||
        Number.isNaN(total) ||
        working < 0 ||
        total < 0 ||
        working > total
      ) {
        setPerformanceResult(
          "Số ngày làm việc không hợp lệ."
        );
        return;
      }
    }

    setLoading(true);
    setPerformanceResult("");

    try {
      const response = await fetch(
        `${API_URL}/api/ai/performance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_name: employeeName,
            position: position,
            working_attitude: workingAttitude,
            performance: performance,
            strengths: strengths,
            weaknesses: weaknesses,

            kpi_score: kpiScore.trim()
              ? Number(kpiScore)
              : null,

            working_days: workingDays.trim()
              ? Number(workingDays)
              : null,

            total_working_days:
              totalWorkingDays.trim()
                ? Number(totalWorkingDays)
                : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Không thể tạo nhận xét."
        );
      }

      setPerformanceResult(data.comment);
    } catch (error: any) {
      setPerformanceResult(
        error.message ||
          "Có lỗi xảy ra khi tạo nhận xét."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // TÓM TẮT HỒ SƠ
  // =========================
  async function summarizeEmployee() {
    if (!selectedEmployeeId) {
      setSummaryResult(
        "Vui lòng chọn nhân viên."
      );
      return;
    }

    setLoading(true);
    setSummaryResult("");

    try {
      const response = await fetch(
        `${API_URL}/api/ai/summary/${selectedEmployeeId}`,
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
            "Không thể tóm tắt hồ sơ."
        );
      }

      setSummaryResult(
        data.summary ||
          data.message ||
          "Không có dữ liệu tóm tắt."
      );
    } catch (error: any) {
      setSummaryResult(
        error.message ||
          "Có lỗi xảy ra khi tóm tắt hồ sơ."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ĐĂNG XUẤT
  // =========================
  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  // =========================
  // ĐIỀU HƯỚNG
  // =========================
  function navigate(path: string) {
    window.location.href = path;
  }

  // =========================
  // STYLE
  // =========================
  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    marginTop: "7px",
    marginBottom: "16px",
    boxSizing: "border-box" as const,
    border: "1px solid #d7dee8",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    background: "#ffffff",
  };

  const buttonStyle = {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
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
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside
        style={{
          width: "250px",
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #0f2747 0%, #12345d 100%)",
          color: "white",
          padding: "24px 16px",
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 8px 24px",
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
              fontSize: "22px",
              fontWeight: "bold",
            }}
          >
            AI
          </div>

          <div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              HRM AI
            </div>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.7,
                marginTop: "3px",
              }}
            >
              Quản lý nhân sự
            </div>
          </div>
        </div>

        {/* MENU */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "5px",
          }}
        >
          {[
            ["👥", "Nhân viên", "/employees"],
            ["🏢", "Phòng ban", "/departments"],
            ["💼", "Chức vụ", "/positions"],
            ["🕐", "Chấm công", "/attendance"],
            ["📝", "Nghỉ phép", "/leave-requests"],
            ["💰", "Bảng lương", "/payroll"],
            ["📊", "Thống kê", "/reports"],
            ["🤖", "AI Assistant", "/ai"],
          ].map(([icon, label, path]) => {
            const active = path === "/ai";

            return (
              <div
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  marginBottom: "6px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  background: active
                    ? "#2563eb"
                    : "transparent",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: active
                    ? 600
                    : 400,
                  transition: "0.2s",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    textAlign: "center",
                  }}
                >
                  {icon}
                </span>

                <span>{label}</span>
              </div>
            );
          })}
        </div>

        {/* USER */}
        <div
          style={{
            flexShrink: 0,
            borderTop:
              "1px solid rgba(255,255,255,0.15)",
            paddingTop: "16px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.08)",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              👤{" "}
              {localStorage.getItem(
                "username"
              ) || "Người dùng"}
            </div>

            <div
              style={{
                fontSize: "11px",
                opacity: 0.7,
                marginTop: "4px",
              }}
            >
              Quyền:{" "}
              {localStorage.getItem(
                "role"
              ) || "USER"}
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}
      <main
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            height: "72px",
            background: "white",
            borderBottom:
              "1px solid #e5eaf0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 700,
              }}
            >
              🤖 Trợ lý AI
            </h1>

            <div
              style={{
                color: "#718096",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Hỗ trợ quản lý và đánh giá nhân sự
            </div>
          </div>

          <div
            style={{
              padding: "8px 13px",
              borderRadius: "20px",
              background: "#eff6ff",
              color: "#2563eb",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            ✨ AI đang sẵn sàng
          </div>
        </header>

        {/* CONTENT */}
        <div
          style={{
            padding: "30px 32px 40px",
            maxWidth: "1250px",
            margin: "0 auto",
          }}
        >
          {/* GIỚI THIỆU */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #2563eb, #1d4ed8)",
              borderRadius: "14px",
              padding: "24px",
              color: "white",
              marginBottom: "24px",
              boxShadow:
                "0 8px 20px rgba(37,99,235,0.15)",
            }}
          >
            <div
              style={{
                fontSize: "23px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Trợ lý AI quản lý nhân sự
            </div>

            <div
              style={{
                fontSize: "14px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Hỗ trợ hỏi đáp quy định nội bộ,
              tạo nhận xét đánh giá và tóm tắt
              hồ sơ nhân viên.
            </div>
          </div>

          {/* =================================================
              TAB
          ================================================= */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "22px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() =>
                setActiveTab("ask")
              }
              style={{
                ...buttonStyle,
                background:
                  activeTab === "ask"
                    ? "#2563eb"
                    : "white",
                color:
                  activeTab === "ask"
                    ? "white"
                    : "#475569",
                border:
                  activeTab === "ask"
                    ? "1px solid #2563eb"
                    : "1px solid #d7dee8",
              }}
            >
              💬 Hỏi đáp quy định
            </button>

            <button
              onClick={() =>
                setActiveTab("performance")
              }
              style={{
                ...buttonStyle,
                background:
                  activeTab === "performance"
                    ? "#2563eb"
                    : "white",
                color:
                  activeTab === "performance"
                    ? "white"
                    : "#475569",
                border:
                  activeTab === "performance"
                    ? "1px solid #2563eb"
                    : "1px solid #d7dee8",
              }}
            >
              ⭐ Tạo nhận xét
            </button>

            <button
              onClick={() =>
                setActiveTab("summary")
              }
              style={{
                ...buttonStyle,
                background:
                  activeTab === "summary"
                    ? "#2563eb"
                    : "white",
                color:
                  activeTab === "summary"
                    ? "white"
                    : "#475569",
                border:
                  activeTab === "summary"
                    ? "1px solid #2563eb"
                    : "1px solid #d7dee8",
              }}
            >
              👤 Tóm tắt hồ sơ
            </button>
          </div>

          {/* =================================================
              CARD CHÍNH
          ================================================= */}
          <div
            style={{
              background: "white",
              borderRadius: "14px",
              border:
                "1px solid #e5eaf0",
              padding: "28px",
              boxShadow:
                "0 4px 14px rgba(15,39,71,0.05)",
            }}
          >
            {/* =================================================
                1. HỎI ĐÁP
            ================================================= */}
            {activeTab === "ask" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#eff6ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    💬
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: "19px",
                      }}
                    >
                      Hỏi đáp quy định nhân sự
                    </h2>
                  </div>
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginBottom: "24px",
                  }}
                >
                  Đặt câu hỏi về các quy định
                  nội bộ của doanh nghiệp.
                </p>

                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Câu hỏi
                </label>

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  placeholder="Ví dụ: Nhân viên muốn nghỉ phép thì làm như thế nào?"
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />

                <button
                  onClick={askAI}
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    background: loading
                      ? "#94a3b8"
                      : "#2563eb",
                    color: "white",
                  }}
                >
                  {loading
                    ? "⏳ Đang xử lý..."
                    : "🤖 Hỏi AI"}
                </button>

                {answer && (
                  <div
                    style={{
                      marginTop: "24px",
                      padding: "20px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border:
                        "1px solid #dbe4ee",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        marginBottom: "10px",
                        color: "#2563eb",
                      }}
                    >
                      🤖 Câu trả lời của AI
                    </div>

                    <div
                      style={{
                        lineHeight: 1.8,
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {answer}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                2. TẠO NHẬN XÉT
            ================================================= */}
            {activeTab === "performance" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#fff7ed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    ⭐
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "19px",
                    }}
                  >
                    AI tạo nhận xét đánh giá
                  </h2>
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginBottom: "24px",
                  }}
                >
                  Chọn nhân viên và nhập dữ liệu
                  đánh giá để AI tạo nhận xét.
                </p>

                {/* NHÂN VIÊN */}
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Chọn nhân viên *
                </label>

                <select
                  defaultValue=""
                  onChange={(e) =>
                    handleSelectEmployee(
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
                        value={employee.id}
                      >
                        {employee.employee_code} -{" "}
                        {employee.full_name}
                      </option>
                    )
                  )}
                </select>

                {/* HỌ TÊN + CHỨC VỤ */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "18px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Họ và tên
                    </label>

                    <input
                      value={employeeName}
                      readOnly
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Chức vụ
                    </label>

                    <input
                      value={position}
                      readOnly
                      style={inputStyle}
                      placeholder="Chức vụ"
                    />
                  </div>
                </div>

                {/* KPI + NGÀY CÔNG */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr 1fr",
                    gap: "18px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Điểm KPI
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={kpiScore}
                      onChange={(e) =>
                        setKpiScore(
                          e.target.value
                        )
                      }
                      style={inputStyle}
                      placeholder="Ví dụ: 92"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Ngày làm việc
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={workingDays}
                      onChange={(e) =>
                        setWorkingDays(
                          e.target.value
                        )
                      }
                      style={inputStyle}
                      placeholder="Ví dụ: 22"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Tổng ngày công
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        totalWorkingDays
                      }
                      onChange={(e) =>
                        setTotalWorkingDays(
                          e.target.value
                        )
                      }
                      style={inputStyle}
                      placeholder="Ví dụ: 23"
                    />
                  </div>
                </div>

                {/* THÁI ĐỘ */}
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Thái độ làm việc *
                </label>

                <input
                  value={workingAttitude}
                  onChange={(e) =>
                    setWorkingAttitude(
                      e.target.value
                    )
                  }
                  style={inputStyle}
                  placeholder="Ví dụ: Tích cực, có trách nhiệm"
                />

                {/* KẾT QUẢ */}
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Kết quả công việc *
                </label>

                <textarea
                  value={performance}
                  onChange={(e) =>
                    setPerformance(
                      e.target.value
                    )
                  }
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                  placeholder="Mô tả kết quả công việc"
                />

                {/* ĐIỂM MẠNH */}
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Điểm mạnh
                </label>

                <textarea
                  value={strengths}
                  onChange={(e) =>
                    setStrengths(
                      e.target.value
                    )
                  }
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                  placeholder="Nhập điểm mạnh của nhân viên"
                />

                {/* ĐIỂM CẢI THIỆN */}
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Điểm cần cải thiện
                </label>

                <textarea
                  value={weaknesses}
                  onChange={(e) =>
                    setWeaknesses(
                      e.target.value
                    )
                  }
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                  placeholder="Nhập điểm cần cải thiện"
                />

                <button
                  onClick={
                    generatePerformance
                  }
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    background: loading
                      ? "#94a3b8"
                      : "#2563eb",
                    color: "white",
                  }}
                >
                  {loading
                    ? "⏳ Đang tạo nhận xét..."
                    : "✨ Tạo nhận xét bằng AI"}
                </button>

                {performanceResult && (
                  <div
                    style={{
                      marginTop: "24px",
                      padding: "20px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border:
                        "1px solid #dbe4ee",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        marginBottom: "10px",
                        color: "#2563eb",
                      }}
                    >
                      🤖 Nhận xét của AI
                    </div>

                    <div
                      style={{
                        lineHeight: 1.8,
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {performanceResult}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                3. TÓM TẮT HỒ SƠ
            ================================================= */}
            {activeTab === "summary" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                    }}
                  >
                    👤
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: "19px",
                    }}
                  >
                    AI tóm tắt hồ sơ nhân viên
                  </h2>
                </div>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: "14px",
                    marginBottom: "24px",
                  }}
                >
                  AI sẽ lấy dữ liệu nhân viên,
                  chấm công và đánh giá gần nhất
                  để tạo bản tóm tắt.
                </p>

                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Chọn nhân viên
                </label>

                <select
                  value={selectedEmployeeId}
                  onChange={(e) =>
                    setSelectedEmployeeId(
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
                        value={employee.id}
                      >
                        {employee.employee_code} -{" "}
                        {employee.full_name}
                      </option>
                    )
                  )}
                </select>

                <button
                  onClick={
                    summarizeEmployee
                  }
                  disabled={loading}
                  style={{
                    ...buttonStyle,
                    background: loading
                      ? "#94a3b8"
                      : "#2563eb",
                    color: "white",
                  }}
                >
                  {loading
                    ? "⏳ Đang tóm tắt..."
                    : "✨ Tóm tắt hồ sơ bằng AI"}
                </button>

                {summaryResult && (
                  <div
                    style={{
                      marginTop: "24px",
                      padding: "20px",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border:
                        "1px solid #dbe4ee",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "15px",
                        marginBottom: "10px",
                        color: "#2563eb",
                      }}
                    >
                      🤖 Tóm tắt của AI
                    </div>

                    <div
                      style={{
                        lineHeight: 1.8,
                        fontSize: "14px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {summaryResult}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "12px",
              marginTop: "28px",
            }}
          >
            HRM AI © 2026 — Hệ thống quản lý
            nhân sự thông minh
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIAssistant;