import { useEffect, useState } from "react";

interface DashboardData {
  total_employees: number;
  active_employees: number;
  pending_leave: number;
  total_salary: number;
}

function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    total_employees: 0,
    active_employees: 0,
    pending_leave: 0,
    total_salary: 0,
  });

  const username =
    localStorage.getItem("username") || "Admin";

  const role =
    localStorage.getItem("role") || "ADMIN";

  const token =
    localStorage.getItem("access_token");

  // ============================================================
  // TAI DU LIEU DASHBOARD
  // ============================================================
  useEffect(() => {
    if (!token) {
      console.warn("Khong tim thay access_token");
      return;
    }

    fetch(
      "http://127.0.0.1:8000/api/reports/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.detail ||
              "Khong the tai du lieu dashboard"
          );
        }

        return result;
      })
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error(
          "Loi tai dashboard:",
          error
        );
      });
  }, [token]);

  // ============================================================
  // DINH DANG TIEN
  // ============================================================
  const formatMoney = (money: number) => {
    return (
      new Intl.NumberFormat("vi-VN").format(
        money
      ) + " ₫"
    );
  };

  // ============================================================
  // CAC MENU THEO QUYEN
  // ============================================================

  const allMenuItems = [
    {
      icon: "👥",
      title: "Nhân viên",
      description: "Quản lý hồ sơ nhân viên",
      path: "/employees",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "🏢",
      title: "Phòng ban",
      description: "Quản lý các phòng ban",
      path: "/departments",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "💼",
      title: "Chức vụ",
      description: "Quản lý chức vụ",
      path: "/positions",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "🕐",
      title: "Chấm công",
      description: "Theo dõi ngày công",
      path: "/attendance",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "📝",
      title: "Nghỉ phép",
      description: "Quản lý đơn nghỉ phép",
      path: "/leave-requests",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "💰",
      title: "Bảng lương",
      description: "Quản lý và tính lương",
      path: "/payroll",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "📊",
      title: "Thống kê",
      description: "Xem báo cáo nhân sự",
      path: "/reports",
      roles: ["ADMIN", "HR", "MANAGER"],
    },
    {
      icon: "🤖",
      title: "Trợ lý AI",
      description: "Trợ lý AI nhân sự",
      path: "/ai",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
    {
      icon: "⭐",
      title: "Đánh giá",
      description: "Đánh giá hiệu suất nhân viên",
      path: "/evaluations",
      roles: ["ADMIN", "HR", "MANAGER", "EMPLOYEE"],
    },
  ];

  // Chỉ lấy menu mà role hiện tại được phép thấy
  const menuItems = allMenuItems.filter(
    (item) => item.roles.includes(role)
  );

  // ============================================================
  // CHUYEN TRANG
  // ============================================================
  const goTo = (path: string) => {
    window.location.href = path;
  };

  // ============================================================
  // DANG XUAT
  // ============================================================
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    window.location.href = "/";
  };

  // ============================================================
  // TEN HIEN THIEN THEO ROLE
  // ============================================================
  const getRoleName = () => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";

      case "HR":
        return "Nhân sự";

      case "MANAGER":
        return "Quản lý";

      case "EMPLOYEE":
        return "Nhân viên";

      default:
        return role;
    }
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
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
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
        {/* =================================================
            LOGO
        ================================================= */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "0 10px 28px",
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
              flexShrink: 0,
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
                letterSpacing: "0.5px",
              }}
            >
              HRM AI
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#9fb3cc",
                marginTop: "2px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Human Resource Management
            </div>
          </div>
        </div>

        {/* =================================================
            MENU
        ================================================= */}
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
              margin: "0 10px 10px",
              textTransform: "uppercase",
            }}
          >
            Menu chính
          </div>

          {/* TONG QUAN */}
          <div
            onClick={() => goTo("/dashboard")}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#2563eb",
              marginBottom: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span
              style={{
                width: "20px",
                textAlign: "center",
              }}
            >
              🏠
            </span>

            <span>Tổng quan</span>
          </div>

          {/* CAC CHUC NANG THEO QUYEN */}
          {menuItems.map((item) => (
            <div
              key={item.path}
              onClick={() => goTo(item.path)}
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                marginBottom: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                color: "#d4dfed",
                transition: "0.2s",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  fontSize: "17px",
                  width: "20px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </span>

              <span>{item.title}</span>
            </div>
          ))}
        </div>

        {/* =================================================
            THONG TIN NGUOI DUNG
        ================================================= */}
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
              borderRadius: "12px",
              padding: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
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
                    fontSize: "11px",
                    color: "#8ea7c2",
                  }}
                >
                  Đăng nhập với
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    marginTop: "3px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {username}
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#8ea7c2",
                    marginTop: "2px",
                  }}
                >
                  {getRoleName()}
                </div>
              </div>
            </div>
          </div>
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
        {/* =================================================
            HEADER
        ================================================= */}
        <header
          style={{
            height: "72px",
            background: "white",
            borderBottom:
              "1px solid #e7ebf2",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
            boxSizing: "border-box",
          }}
        >
          {/* TIEU DE */}
          <div>
            <div
              style={{
                fontSize: "14px",
                color: "#8290a3",
              }}
            >
              Hệ thống quản lý nhân sự
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 750,
                marginTop: "2px",
              }}
            >
              Tổng quan
            </div>
          </div>

          {/* USER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#e8f0ff",
                color: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {username
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {username}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#8b98a9",
                }}
              >
                {getRoleName()}
              </div>
            </div>

            <button
              onClick={logout}
              type="button"
              style={{
                marginLeft: "12px",
                border:
                  "1px solid #e2e7ef",
                background: "white",
                borderRadius: "8px",
                padding: "8px 13px",
                cursor: "pointer",
                color: "#64748b",
              }}
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* =================================================
            CONTENT
        ================================================= */}
        <section
          style={{
            padding: "30px 32px",
            boxSizing: "border-box",
          }}
        >
          {/* WELCOME */}
          <div
            style={{
              background:
                "linear-gradient(110deg, #1d4ed8, #2563eb 55%, #3b82f6)",
              borderRadius: "16px",
              padding: "28px 30px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow:
                "0 10px 25px rgba(37,99,235,0.18)",
              marginBottom: "25px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.85,
                  marginBottom: "7px",
                }}
              >
                Chào mừng trở lại 👋
              </div>

              <div
                style={{
                  fontSize: "27px",
                  fontWeight: 800,
                }}
              >
                Xin chào, {username}!
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  opacity: 0.9,
                }}
              >
                Theo dõi và quản lý hoạt động
                nhân sự của doanh nghiệp.
              </div>
            </div>

            <div
              style={{
                fontSize: "70px",
                opacity: 0.25,
              }}
            >
              👥
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}
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
              title="Tổng nhân viên"
              value={data.total_employees}
              icon="👥"
              iconBackground="#e8f0ff"
            />

            <StatCard
              title="Đang làm việc"
              value={data.active_employees}
              icon="✓"
              iconBackground="#e8f8ef"
            />

            <StatCard
              title="Đơn nghỉ chờ duyệt"
              value={data.pending_leave}
              icon="📝"
              iconBackground="#fff4df"
            />

            <StatCard
              title="Tổng quỹ lương"
              value={formatMoney(
                data.total_salary
              )}
              icon="₫"
              iconBackground="#f1eaff"
              smallValue
            />
          </div>

          {/* =================================================
              FUNCTION TITLE
          ================================================= */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "19px",
                  fontWeight: 750,
                }}
              >
                Chức năng quản lý
              </div>

              <div
                style={{
                  color: "#8a96a8",
                  fontSize: "13px",
                  marginTop: "4px",
                }}
              >
                Các chức năng phù hợp với quyền
                của bạn
              </div>
            </div>
          </div>

          {/* =================================================
              FUNCTION CARDS
          ================================================= */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => goTo(item.path)}
                style={{
                  background: "white",
                  border:
                    "1px solid #e7ebf2",
                  borderRadius: "14px",
                  padding: "20px",
                  cursor: "pointer",
                  transition: "0.2s",
                  boxShadow:
                    "0 3px 12px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "11px",
                    background: "#f0f5ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    marginBottom: "15px",
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 750,
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#8995a6",
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>

                <div
                  style={{
                    marginTop: "15px",
                    fontSize: "12px",
                    color: "#2563eb",
                    fontWeight: 650,
                  }}
                >
                  Truy cập →
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div
            style={{
              textAlign: "center",
              color: "#9aa5b5",
              fontSize: "12px",
              marginTop: "35px",
              paddingBottom: "15px",
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

function StatCard({
  title,
  value,
  icon,
  iconBackground,
  smallValue = false,
}: {
  title: string;
  value: string | number;
  icon: string;
  iconBackground: string;
  smallValue?: boolean;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e7ebf2",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        boxShadow:
          "0 3px 12px rgba(15,23,42,0.03)",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          flexShrink: 0,
          borderRadius: "12px",
          background: iconBackground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "21px",
          fontWeight: 800,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#8a96a8",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: smallValue
              ? "16px"
              : "25px",
            fontWeight: 800,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;