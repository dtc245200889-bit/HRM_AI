import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type DashboardData = {
  total_employees: number;
  active_employees: number;
  pending_leave: number;
  total_salary: number;
};

function Reports() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  async function getReports() {
    try {
      setLoading(true);
      setMessage("");

      const token =
        localStorage.getItem(
          "access_token"
        );

      const response = await fetch(
        `${API_URL}/api/reports/dashboard`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "Không thể tải dữ liệu thống kê"
        );
      }

      setData(result);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Có lỗi xảy ra"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getReports();
  }, []);

  function formatMoney(
    value: number
  ) {
    return (
      new Intl.NumberFormat(
        "vi-VN"
      ).format(value) + " VNĐ"
    );
  }

  function navigate(path: string) {
    window.location.href = path;
  }

  function handleLogout() {
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

    window.location.href =
      "/login";
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
              item.path === "/reports";

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

        {/* USER */}
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
              border:
                "1px solid rgba(255,255,255,0.15)",
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
              Thống kê và báo cáo
            </h1>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#718096",
                fontSize: "13px",
              }}
            >
              Tổng quan tình hình
              nhân sự của doanh nghiệp
            </p>
          </div>

          <button
            onClick={getReports}
            disabled={loading}
            style={{
              border:
                "1px solid #dce3ec",
              background: "#fff",
              color: "#334155",
              borderRadius: "9px",
              padding:
                "9px 15px",
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
                padding:
                  "13px 16px",
                marginBottom:
                  "22px",
                background:
                  "#fff7ed",
                border:
                  "1px solid #fed7aa",
                color: "#c2410c",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              ⚠️ {message}
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e5eaf0",
                borderRadius: "14px",
                padding: "50px",
                textAlign: "center",
                color: "#64748b",
                boxShadow:
                  "0 4px 15px rgba(15,39,71,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                  marginBottom: "12px",
                }}
              >
                📊
              </div>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                Đang tải dữ liệu
                thống kê...
              </div>
            </div>
          )}

          {/* DASHBOARD */}
          {!loading &&
            data && (
              <>
                {/* TITLE */}
                <div
                  style={{
                    marginBottom:
                      "18px",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    Tổng quan
                  </h2>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color: "#718096",
                      fontSize: "12px",
                    }}
                  >
                    Các chỉ số chính
                    của hệ thống nhân sự
                  </p>
                </div>

                {/* STAT CARDS */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap: "18px",
                    marginBottom:
                      "28px",
                  }}
                >
                  <StatCard
                    icon="👥"
                    title="Tổng nhân viên"
                    value={
                      data.total_employees
                    }
                    unit="nhân viên"
                    description="Tổng số hồ sơ trong hệ thống"
                  />

                  <StatCard
                    icon="✅"
                    title="Đang làm việc"
                    value={
                      data.active_employees
                    }
                    unit="nhân viên"
                    description="Nhân viên đang hoạt động"
                  />

                  <StatCard
                    icon="📝"
                    title="Đơn nghỉ chờ duyệt"
                    value={
                      data.pending_leave
                    }
                    unit="đơn"
                    description="Đơn cần HR hoặc quản lý xử lý"
                  />

                  <StatCard
                    icon="💰"
                    title="Tổng tiền lương"
                    value={formatMoney(
                      data.total_salary
                    )}
                    unit=""
                    description="Tổng từ dữ liệu bảng lương"
                    money
                  />
                </div>

                {/* REPORT TABLE */}
                <div
                  style={{
                    background:
                      "#ffffff",
                    border:
                      "1px solid #e5eaf0",
                    borderRadius:
                      "14px",
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
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "18px",
                        fontWeight: 800,
                      }}
                    >
                      Báo cáo nhanh
                    </h2>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#718096",
                        fontSize:
                          "12px",
                      }}
                    >
                      Tổng hợp các chỉ
                      tiêu quan trọng
                    </p>
                  </div>

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
                          "750px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={
                              headerCellStyle
                            }
                          >
                            Chỉ tiêu
                          </th>

                          <th
                            style={
                              headerCellStyle
                            }
                          >
                            Giá trị
                          </th>

                          <th
                            style={
                              headerCellStyle
                            }
                          >
                            Ý nghĩa
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <ReportRow
                          icon="👥"
                          label="Tổng số nhân viên"
                          value={
                            data.total_employees
                          }
                          unit="nhân viên"
                          description="Tổng số hồ sơ nhân viên trong hệ thống"
                        />

                        <ReportRow
                          icon="✅"
                          label="Nhân viên đang làm việc"
                          value={
                            data.active_employees
                          }
                          unit="nhân viên"
                          description="Số nhân viên có trạng thái đang hoạt động"
                        />

                        <ReportRow
                          icon="📝"
                          label="Đơn nghỉ phép chờ duyệt"
                          value={
                            data.pending_leave
                          }
                          unit="đơn"
                          description="Số đơn cần HR hoặc quản lý xử lý"
                        />

                        <tr>
                          <td
                            style={
                              bodyCellStyle
                            }
                          >
                            <div
                              style={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: "10px",
                                fontWeight:
                                  700,
                              }}
                            >
                              <span
                                style={{
                                  width:
                                    "34px",
                                  height:
                                    "34px",
                                  borderRadius:
                                    "9px",
                                  background:
                                    "#eff6ff",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize:
                                    "17px",
                                }}
                              >
                                💰
                              </span>

                              Tổng tiền lương
                            </div>
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
                                data.total_salary
                              )}
                            </strong>
                          </td>

                          <td
                            style={
                              bodyCellStyle
                            }
                          >
                            Tổng tiền lương
                            từ các bảng
                            lương
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FOOTER */}
                <div
                  style={{
                    textAlign:
                      "center",
                    color: "#94a3b8",
                    fontSize: "12px",
                    marginTop:
                      "28px",
                  }}
                >
                  HRM AI © 2026 —
                  Hệ thống quản lý
                  nhân sự thông minh
                </div>
              </>
            )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  unit,
  description,
  money,
}: {
  icon: string;
  title: string;
  value: string | number;
  unit: string;
  description: string;
  money?: boolean;
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
          marginBottom:
            "13px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "10px",
            background: "#eff6ff",
            display: "flex",
            alignItems:
              "center",
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
          fontSize: money
            ? "17px"
            : "28px",
          fontWeight: 800,
          color: "#172033",
          marginBottom: "4px",
        }}
      >
        {value}
      </div>

      {unit && (
        <div
          style={{
            color: "#64748b",
            fontSize: "11px",
            marginBottom:
              "7px",
          }}
        >
          {unit}
        </div>
      )}

      <div
        style={{
          color: "#94a3b8",
          fontSize: "11px",
          lineHeight: 1.4,
        }}
      >
        {description}
      </div>
    </div>
  );
}

function ReportRow({
  icon,
  label,
  value,
  unit,
  description,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  description: string;
}) {
  return (
    <tr>
      <td
        style={
          bodyCellStyle
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background:
                "#eff6ff",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              fontSize: "17px",
            }}
          >
            {icon}
          </span>

          {label}
        </div>
      </td>

      <td
        style={
          bodyCellStyle
        }
      >
        <strong
          style={{
            color: "#2563eb",
            fontSize: "16px",
          }}
        >
          {value}
        </strong>

        <span
          style={{
            marginLeft: "6px",
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          {unit}
        </span>
      </td>

      <td
        style={
          bodyCellStyle
        }
      >
        {description}
      </td>
    </tr>
  );
}

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
  padding: "15px 14px",
  borderBottom:
    "1px solid #edf1f5",
  fontSize: "13px",
  color: "#475569",
};

export default Reports;