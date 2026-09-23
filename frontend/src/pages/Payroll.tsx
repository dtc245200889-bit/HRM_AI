import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
};

type Payroll = {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  allowance: number;
  deduction: number;
  total_salary: number;
};

function Payroll() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollList, setPayrollList] = useState<Payroll[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [year, setYear] = useState(
    String(new Date().getFullYear())
  );

  const [basicSalary, setBasicSalary] = useState("");
  const [allowance, setAllowance] = useState("");
  const [deduction, setDeduction] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  async function getPayroll() {
    try {
      setLoading(true);

      const token =
        localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/api/payroll/`,
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
            "Không thể tải bảng lương"
        );
      }

      setPayrollList(data);
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

  useEffect(() => {
    async function loadData() {
      await Promise.all([
        getEmployees(),
        getPayroll(),
      ]);
    }

    loadData();
  }, []);

  function resetForm() {
    setEmployeeId("");
    setMonth(
      String(new Date().getMonth() + 1)
    );
    setYear(
      String(new Date().getFullYear())
    );
    setBasicSalary("");
    setAllowance("");
    setDeduction("");
  }

  async function handleCreate(
    event: React.FormEvent
  ) {
    event.preventDefault();
    setMessage("");

    const monthValue = Number(month);
    const yearValue = Number(year);
    const basicSalaryValue =
      Number(basicSalary);
    const allowanceValue =
      Number(allowance || 0);
    const deductionValue =
      Number(deduction || 0);

    if (!employeeId) {
      setMessage("Vui lòng chọn nhân viên");
      return;
    }

    if (
      monthValue < 1 ||
      monthValue > 12
    ) {
      setMessage(
        "Tháng phải nằm trong khoảng từ 1 đến 12"
      );
      return;
    }

    if (
      yearValue < 2000 ||
      yearValue > 2100
    ) {
      setMessage("Năm không hợp lệ");
      return;
    }

    if (
      Number.isNaN(basicSalaryValue) ||
      basicSalaryValue < 0
    ) {
      setMessage(
        "Lương cơ bản không hợp lệ"
      );
      return;
    }

    if (
      allowanceValue < 0 ||
      deductionValue < 0
    ) {
      setMessage(
        "Phụ cấp và khấu trừ không được âm"
      );
      return;
    }

    try {
      setSaving(true);

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await fetch(
        `${API_URL}/api/payroll/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            employee_id:
              Number(employeeId),
            month: monthValue,
            year: yearValue,
            basic_salary:
              basicSalaryValue,
            allowance:
              allowanceValue,
            deduction:
              deductionValue,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Thêm bảng lương thất bại"
        );
      }

      setMessage(
        "Thêm bảng lương thành công"
      );

      resetForm();
      await getPayroll();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Thêm bảng lương thất bại"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    payrollId: number
  ) {
    const confirmDelete =
      window.confirm(
        "Bạn có chắc chắn muốn xóa bảng lương này không?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await fetch(
        `${API_URL}/api/payroll/${payrollId}`,
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
            "Xóa bảng lương thất bại"
        );
      }

      setMessage(
        "Xóa bảng lương thành công"
      );

      await getPayroll();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Xóa bảng lương thất bại"
        );
      }
    }
  }

  function getEmployeeName(id: number) {
    const employee =
      employees.find(
        (item) => item.id === id
      );

    if (!employee) {
      return "Không xác định";
    }

    return `${employee.employee_code} - ${employee.full_name}`;
  }

  function formatMoney(value: number) {
    return (
      new Intl.NumberFormat("vi-VN").format(
        value
      ) + " VNĐ"
    );
  }

  const totalPayroll =
    payrollList.reduce(
      (sum, item) =>
        sum + item.total_salary,
      0
    );

  const totalBasicSalary =
    payrollList.reduce(
      (sum, item) =>
        sum + item.basic_salary,
      0
    );

  const totalAllowance =
    payrollList.reduce(
      (sum, item) =>
        sum + item.allowance,
      0
    );

  function navigate(path: string) {
    window.location.href = path;
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    window.location.href = "/login";
  }

  const menuItems = [
    {
      icon: "👥",
      label: "Nhân viên",
      path: "/employees",
    },
    {
      icon: "🏢",
      label: "Phòng ban",
      path: "/departments",
    },
    {
      icon: "💼",
      label: "Chức vụ",
      path: "/positions",
    },
    {
      icon: "🕐",
      label: "Chấm công",
      path: "/attendance",
    },
    {
      icon: "📝",
      label: "Nghỉ phép",
      path: "/leave-requests",
    },
    {
      icon: "💰",
      label: "Bảng lương",
      path: "/payroll",
    },
    {
      icon: "📊",
      label: "Thống kê",
      path: "/reports",
    },
    {
      icon: "🤖",
      label: "AI Assistant",
      path: "/ai",
    },
  ];

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
      {/* SIDEBAR */}
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
            marginBottom: "30px",
            paddingLeft: "8px",
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
              boxShadow:
                "0 8px 20px rgba(37,99,235,0.3)",
            }}
          >
            👨‍💼
          </div>

          <div>
            <div
              style={{
                color: "#fff",
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              HRM AI
            </div>

            <div
              style={{
                color: "#a9bdd6",
                fontSize: "11px",
                marginTop: "2px",
              }}
            >
              Human Resource System
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
          {menuItems.map((item) => {
            const active =
              item.path === "/payroll";

            return (
              <button
                key={item.path}
                onClick={() =>
                  navigate(item.path)
                }
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  marginBottom: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: active
                    ? 700
                    : 500,
                  color: active
                    ? "#ffffff"
                    : "#c9d6e6",
                  background: active
                    ? "rgba(37,99,235,0.95)"
                    : "transparent",
                  boxShadow: active
                    ? "0 6px 16px rgba(0,0,0,0.18)"
                    : "none",
                  transition:
                    "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    width: "24px",
                    textAlign: "center",
                  }}
                >
                  {item.icon}
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* USER BOX */}
        <div
          style={{
            flexShrink: 0,
            borderTop:
              "1px solid rgba(255,255,255,0.12)",
            paddingTop: "15px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              background:
                "rgba(255,255,255,0.07)",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              👤{" "}
              {localStorage.getItem(
                "username"
              ) || "Người dùng"}
            </div>

            <div
              style={{
                color: "#a9bdd6",
                fontSize: "11px",
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
            onClick={handleLogout}
            style={{
              width: "100%",
              border: "1px solid rgba(255,255,255,0.15)",
              background:
                "rgba(255,255,255,0.05)",
              color: "#e7edf5",
              borderRadius: "10px",
              padding: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN */}
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
            background: "#ffffff",
            borderBottom:
              "1px solid #e6ebf2",
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
                fontSize: "23px",
                fontWeight: 800,
              }}
            >
              Quản lý bảng lương
            </h1>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              Quản lý lương, phụ cấp
              và các khoản khấu trừ
            </p>
          </div>

          <button
            onClick={() =>
              getPayroll()
            }
            style={{
              border: "1px solid #dce3ec",
              background: "#fff",
              color: "#334155",
              borderRadius: "9px",
              padding: "9px 15px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            🔄 Làm mới
          </button>
        </header>

        {/* CONTENT */}
        <div
          style={{
            padding:
              "30px 32px 40px",
          }}
        >
          {/* MESSAGE */}
          {message && (
            <div
              style={{
                padding: "13px 16px",
                marginBottom: "22px",
                background:
                  message.includes(
                    "thành công"
                  )
                    ? "#ecfdf5"
                    : "#fff7ed",
                border:
                  message.includes(
                    "thành công"
                  )
                    ? "1px solid #a7f3d0"
                    : "1px solid #fed7aa",
                color:
                  message.includes(
                    "thành công"
                  )
                    ? "#047857"
                    : "#c2410c",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}

          {/* STATISTICS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "18px",
              marginBottom: "28px",
            }}
          >
            <StatCard
              icon="💰"
              title="Tổng bảng lương"
              value={
                payrollList.length
              }
              description="Bảng lương hiện có"
            />

            <StatCard
              icon="💵"
              title="Tổng lương cơ bản"
              value={formatMoney(
                totalBasicSalary
              )}
              description="Tổng lương cơ bản"
            />

            <StatCard
              icon="🎁"
              title="Tổng phụ cấp"
              value={formatMoney(
                totalAllowance
              )}
              description="Tổng các khoản phụ cấp"
            />

            <StatCard
              icon="📈"
              title="Tổng thực nhận"
              value={formatMoney(
                totalPayroll
              )}
              description="Tổng lương phải trả"
            />
          </div>

          {/* FORM */}
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e5eaf0",
              borderRadius: "14px",
              padding: "25px",
              marginBottom: "28px",
              boxShadow:
                "0 4px 15px rgba(15,39,71,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "20px",
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
                  justifyContent:
                    "center",
                  fontSize: "19px",
                }}
              >
                ➕
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  Thêm bảng lương
                </h2>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    color: "#718096",
                    fontSize: "12px",
                  }}
                >
                  Nhập thông tin lương
                  cho nhân viên
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreate}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",
                  gap: "18px",
                }}
              >
                <FormField
                  label="Nhân viên"
                  required
                >
                  <select
                    value={
                      employeeId
                    }
                    onChange={(e) =>
                      setEmployeeId(
                        e.target.value
                      )
                    }
                    style={
                      inputStyle
                    }
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
                </FormField>

                <FormField
                  label="Tháng"
                  required
                >
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) =>
                      setMonth(
                        e.target.value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                <FormField
                  label="Năm"
                  required
                >
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={(e) =>
                      setYear(
                        e.target.value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                <FormField
                  label="Lương cơ bản"
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                      basicSalary
                    }
                    onChange={(e) =>
                      setBasicSalary(
                        e.target.value
                      )
                    }
                    placeholder="Ví dụ: 10000000"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                <FormField label="Phụ cấp">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                      allowance
                    }
                    onChange={(e) =>
                      setAllowance(
                        e.target.value
                      )
                    }
                    placeholder="Ví dụ: 1000000"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                <FormField label="Khấu trừ">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={
                      deduction
                    }
                    onChange={(e) =>
                      setDeduction(
                        e.target.value
                      )
                    }
                    placeholder="Ví dụ: 500000"
                    style={
                      inputStyle
                    }
                  />
                </FormField>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    background:
                      "#2563eb",
                    color: "#ffffff",
                    borderRadius: "9px",
                    padding:
                      "11px 20px",
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                    opacity: saving
                      ? 0.7
                      : 1,
                  }}
                >
                  {saving
                    ? "⏳ Đang lưu..."
                    : "💾 Thêm bảng lương"}
                </button>

                <button
                  type="button"
                  onClick={
                    resetForm
                  }
                  style={{
                    border:
                      "1px solid #d8dee8",
                    background:
                      "#ffffff",
                    color: "#475569",
                    borderRadius: "9px",
                    padding:
                      "11px 20px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ↻ Xóa biểu mẫu
                </button>
              </div>
            </form>
          </div>

          {/* TABLE */}
          <div
            style={{
              background: "#ffffff",
              border:
                "1px solid #e5eaf0",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow:
                "0 4px 15px rgba(15,39,71,0.05)",
            }}
          >
            <div
              style={{
                padding:
                  "20px 22px",
                borderBottom:
                  "1px solid #edf1f5",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  Danh sách bảng lương
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#718096",
                    fontSize: "12px",
                  }}
                >
                  Theo dõi thông tin
                  lương của nhân viên
                </p>
              </div>

              <div
                style={{
                  background:
                    "#eff6ff",
                  color: "#2563eb",
                  padding:
                    "7px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {payrollList.length}{" "}
                bảng lương
              </div>
            </div>

            {loading && (
              <div
                style={{
                  padding: "45px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                ⏳ Đang tải dữ liệu...
              </div>
            )}

            {!loading &&
              payrollList.length ===
                0 && (
                <div
                  style={{
                    padding: "50px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom:
                        "10px",
                    }}
                  >
                    💰
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom:
                        "5px",
                    }}
                  >
                    Chưa có dữ liệu
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                    }}
                  >
                    Hãy thêm bảng lương
                    đầu tiên.
                  </div>
                </div>
              )}

            {!loading &&
              payrollList.length >
                0 && (
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
                        "1150px",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          STT
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Nhân viên
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Kỳ lương
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Lương cơ bản
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Phụ cấp
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Khấu trừ
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Tổng lương
                        </th>

                        <th
                          style={
                            headerCellStyle
                          }
                        >
                          Thao tác
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {payrollList.map(
                        (
                          payroll,
                          index
                        ) => (
                          <tr
                            key={
                              payroll.id
                            }
                          >
                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <span
                                style={{
                                  display:
                                    "inline-flex",
                                  width:
                                    "30px",
                                  height:
                                    "30px",
                                  borderRadius:
                                    "8px",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  background:
                                    "#f1f5f9",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                {index +
                                  1}
                              </span>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <div
                                style={{
                                  fontWeight:
                                    700,
                                  color:
                                    "#1e293b",
                                }}
                              >
                                {getEmployeeName(
                                  payroll.employee_id
                                )}
                              </div>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <span
                                style={{
                                  display:
                                    "inline-block",
                                  padding:
                                    "6px 10px",
                                  borderRadius:
                                    "8px",
                                  background:
                                    "#eff6ff",
                                  color:
                                    "#2563eb",
                                  fontWeight:
                                    700,
                                  fontSize:
                                    "12px",
                                }}
                              >
                                Tháng{" "}
                                {
                                  payroll.month
                                }{" "}
                                /{" "}
                                {
                                  payroll.year
                                }
                              </span>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              {formatMoney(
                                payroll.basic_salary
                              )}
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <span
                                style={{
                                  color:
                                    "#059669",
                                  fontWeight:
                                    600,
                                }}
                              >
                                +{" "}
                                {formatMoney(
                                  payroll.allowance
                                )}
                              </span>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <span
                                style={{
                                  color:
                                    "#dc2626",
                                  fontWeight:
                                    600,
                                }}
                              >
                                -{" "}
                                {formatMoney(
                                  payroll.deduction
                                )}
                              </span>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <strong
                                style={{
                                  color:
                                    "#2563eb",
                                  fontSize:
                                    "14px",
                                }}
                              >
                                {formatMoney(
                                  payroll.total_salary
                                )}
                              </strong>
                            </td>

                            <td
                              style={
                                bodyCellStyle
                              }
                            >
                              <button
                                onClick={() =>
                                  handleDelete(
                                    payroll.id
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #fecaca",
                                  background:
                                    "#fef2f2",
                                  color:
                                    "#dc2626",
                                  borderRadius:
                                    "8px",
                                  padding:
                                    "7px 12px",
                                  cursor:
                                    "pointer",
                                  fontWeight:
                                    600,
                                }}
                              >
                                🗑️ Xóa
                              </button>
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
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "12px",
              marginTop: "28px",
            }}
          >
            HRM AI © 2026 — Hệ thống
            quản lý nhân sự thông minh
          </div>
        </div>
      </main>
    </div>
  );
}

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
        background: "#ffffff",
        border:
          "1px solid #e5eaf0",
        borderRadius: "14px",
        padding: "19px",
        boxShadow:
          "0 4px 15px rgba(15,39,71,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          marginBottom: "13px",
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
            justifyContent:
              "center",
            fontSize: "18px",
          }}
        >
          {icon}
        </div>

        <span
          style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {title}
        </span>
      </div>

      <div
        style={{
          fontSize:
            typeof value ===
            "number"
              ? "26px"
              : "16px",
          fontWeight: 800,
          color: "#172033",
          marginBottom: "5px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
        }}
      >
        {description}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 700,
          color: "#334155",
          marginBottom: "7px",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color: "#ef4444",
              marginLeft: "3px",
            }}
          >
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  border:
    "1px solid #d8e0ea",
  borderRadius: "9px",
  boxSizing:
    "border-box" as const,
  outline: "none",
  fontSize: "13px",
  color: "#334155",
  background: "#ffffff",
};

const headerCellStyle = {
  padding: "13px 14px",
  background: "#f8fafc",
  borderBottom:
    "1px solid #e5eaf0",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 800,
  textAlign: "left" as const,
  whiteSpace: "nowrap" as const,
};

const bodyCellStyle = {
  padding: "14px",
  borderBottom:
    "1px solid #edf1f5",
  fontSize: "13px",
  color: "#475569",
  whiteSpace: "nowrap" as const,
};

export default Payroll;