import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

interface Position {
  id: number;
  name: string;
  description: string | null;
}

function Positions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  const username = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role") || "ADMIN";
  const token = localStorage.getItem("access_token");

  // =========================
  // LẤY DANH SÁCH CHỨC VỤ
  // =========================

  async function loadPositions() {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/positions/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể tải danh sách chức vụ."
        );
      }

      setPositions(data);
    } catch (error: any) {
      setMessage(
        error.message ||
          "Có lỗi xảy ra khi tải danh sách chức vụ."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPositions();
  }, []);

  // =========================
  // THÊM CHỨC VỤ
  // =========================

  async function addPosition() {
    if (!name.trim()) {
      setMessage("Vui lòng nhập tên chức vụ.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/positions/?name=${encodeURIComponent(
          name
        )}&description=${encodeURIComponent(description)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Không thể thêm chức vụ."
        );
      }

      setMessage("Thêm chức vụ thành công.");

      setName("");
      setDescription("");
      setShowForm(false);

      await loadPositions();
    } catch (error: any) {
      setMessage(
        error.message ||
          "Có lỗi xảy ra khi thêm chức vụ."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // XÓA CHỨC VỤ
  // =========================

  async function deletePosition(id: number) {
    const position = positions.find(
      (item) => item.id === id
    );

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa chức vụ "${
        position?.name || ""
      }" không?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/positions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Không thể xóa chức vụ."
        );
      }

      setMessage("Xóa chức vụ thành công.");

      await loadPositions();
    } catch (error: any) {
      setMessage(
        error.message ||
          "Có lỗi xảy ra khi xóa chức vụ."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ĐIỀU HƯỚNG
  // =========================

  function goTo(path: string) {
    window.location.href = path;
  }

  // =========================
  // ĐĂNG XUẤT
  // =========================

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("token");

    window.location.href = "/";
  }

  // =========================
  // MENU
  // =========================

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
      title: "AI Assistant",
      path: "/ai",
    },
  ];

  const inputStyle = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #dce3ec",
    borderRadius: "10px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    background: "#fff",
    color: "#172033",
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
      ====================================================== */}

      <aside
        style={{
          width: "250px",
          minHeight: "100vh",
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
            padding: "0 10px 24px",
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

          <div>
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
              }}
            >
              Human Resource Management
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
            paddingTop: "24px",
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

          {/* TỔNG QUAN */}

          <div
            onClick={() => goTo("/dashboard")}
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              marginBottom: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              color: "#d4dfed",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "transparent";
            }}
          >
            <span>🏠</span>
            <span>Tổng quan</span>
          </div>

          {/* MENU ITEMS */}

          {menuItems.map((item) => {
            const active =
              item.path === "/positions";

            return (
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
                  color: active
                    ? "#ffffff"
                    : "#d4dfed",
                  background: active
                    ? "#2563eb"
                    : "transparent",
                  fontWeight: active ? 600 : 400,
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background =
                      "transparent";
                  }
                }}
              >
                <span
                  style={{
                    fontSize: "17px",
                  }}
                >
                  {item.icon}
                </span>

                <span>{item.title}</span>
              </div>
            );
          })}
        </div>

        {/* USER */}

        <div
          style={{
            flexShrink: 0,
            borderTop:
              "1px solid rgba(255,255,255,0.12)",
            paddingTop: "14px",
            marginTop: "10px",
          }}
        >
          <div
            style={{
              background:
                "rgba(255,255,255,0.07)",
              borderRadius: "12px",
              padding: "13px",
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
                marginTop: "4px",
                fontSize: "14px",
              }}
            >
              {username}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#8ea7c2",
                marginTop: "3px",
              }}
            >
              {role}
            </div>

            <button
              onClick={logout}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "9px 10px",
                border: "none",
                borderRadius: "8px",
                background:
                  "rgba(239,68,68,0.15)",
                color: "#ffb4b4",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}

        <header
          style={{
            height: "72px",
            background: "#ffffff",
            borderBottom:
              "1px solid #e7ebf2",
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
                color: "#8a96a8",
                marginBottom: "3px",
              }}
            >
              Quản lý nhân sự
            </div>

            <div
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#172033",
              }}
            >
              Quản lý chức vụ
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#e8f0ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              👤
            </div>

            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {username}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#8a96a8",
                  marginTop: "2px",
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
            padding: "30px 32px 40px",
          }}
        >
          {/* TITLE */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "22px",
              gap: "20px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#172033",
                }}
              >
                💼 Chức vụ
              </div>

              <div
                style={{
                  color: "#8a96a8",
                  fontSize: "13px",
                  marginTop: "6px",
                }}
              >
                Quản lý danh sách và thông tin các chức vụ
                trong doanh nghiệp.
              </div>
            </div>

            <button
              onClick={() => {
                setShowForm(!showForm);
                setMessage("");
              }}
              style={{
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                background: "#2563eb",
                color: "white",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow:
                  "0 6px 15px rgba(37,99,235,0.2)",
              }}
            >
              {showForm
                ? "✕ Đóng biểu mẫu"
                : "＋ Thêm chức vụ"}
            </button>
          </div>

          {/* THỐNG KÊ */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            <StatCard
              title="Tổng chức vụ"
              value={positions.length}
              icon="💼"
              background="#e8f0ff"
            />

            <StatCard
              title="Chức vụ đang quản lý"
              value={positions.length}
              icon="📋"
              background="#e8f8ef"
            />

            <StatCard
              title="Trạng thái hệ thống"
              value="Hoạt động"
              icon="✓"
              background="#fff4df"
              small
            />
          </div>

          {/* THÔNG BÁO */}

          {message && (
            <div
              style={{
                marginBottom: "20px",
                padding: "13px 16px",
                borderRadius: "10px",
                background:
                  message
                    .toLowerCase()
                    .includes("thành công")
                    ? "#ecfdf3"
                    : "#fff1f2",
                border:
                  message
                    .toLowerCase()
                    .includes("thành công")
                    ? "1px solid #b7ebc9"
                    : "1px solid #fecdd3",
                color:
                  message
                    .toLowerCase()
                    .includes("thành công")
                    ? "#15803d"
                    : "#be123c",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {message
                .toLowerCase()
                .includes("thành công")
                ? "✓ "
                : "⚠ "}
              {message}
            </div>
          )}

          {/* FORM */}

          {showForm && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e7ebf2",
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "25px",
                boxShadow:
                  "0 4px 15px rgba(15,23,42,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  marginBottom: "5px",
                }}
              >
                Thêm chức vụ mới
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#8a96a8",
                  marginBottom: "20px",
                }}
              >
                Nhập thông tin chức vụ cần thêm vào hệ
                thống.
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1.5fr",
                  gap: "18px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "7px",
                    }}
                  >
                    Tên chức vụ
                    <span
                      style={{
                        color: "#ef4444",
                      }}
                    >
                      {" "}
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="Ví dụ: Trưởng phòng"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "7px",
                    }}
                  >
                    Mô tả
                  </label>

                  <input
                    type="text"
                    placeholder="Nhập mô tả chức vụ..."
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => {
                    setShowForm(false);
                    setName("");
                    setDescription("");
                    setMessage("");
                  }}
                  style={{
                    padding: "11px 18px",
                    borderRadius: "9px",
                    border:
                      "1px solid #dce3ec",
                    background: "#ffffff",
                    color: "#5b6678",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </button>

                <button
                  onClick={addPosition}
                  disabled={loading}
                  style={{
                    padding: "11px 20px",
                    borderRadius: "9px",
                    border: "none",
                    background: loading
                      ? "#93b4f5"
                      : "#2563eb",
                    color: "white",
                    cursor: loading
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                  }}
                >
                  {loading
                    ? "Đang xử lý..."
                    : "＋ Thêm chức vụ"}
                </button>
              </div>
            </div>
          )}

          {/* BẢNG */}

          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e7ebf2",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow:
                "0 4px 15px rgba(15,23,42,0.03)",
            }}
          >
            <div
              style={{
                padding: "20px 22px",
                borderBottom:
                  "1px solid #edf0f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                  }}
                >
                  Danh sách chức vụ
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#8a96a8",
                    marginTop: "4px",
                  }}
                >
                  Hiển thị {positions.length} chức vụ
                </div>
              </div>

              <button
                onClick={loadPositions}
                disabled={loading}
                style={{
                  padding: "9px 13px",
                  borderRadius: "8px",
                  border:
                    "1px solid #dce3ec",
                  background: "#ffffff",
                  color: "#4b5563",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                🔄 Làm mới
              </button>
            </div>

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
                  minWidth: "650px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >
                    <th style={thStyle}>
                      STT
                    </th>

                    <th style={thStyle}>
                      TÊN CHỨC VỤ
                    </th>

                    <th style={thStyle}>
                      MÔ TẢ
                    </th>

                    <th
                      style={{
                        ...thStyle,
                        textAlign: "center",
                        width: "150px",
                      }}
                    >
                      THAO TÁC
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "50px 20px",
                          textAlign: "center",
                          color: "#8a96a8",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "40px",
                            marginBottom: "10px",
                          }}
                        >
                          💼
                        </div>

                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#4b5563",
                          }}
                        >
                          Chưa có chức vụ
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            marginTop: "5px",
                          }}
                        >
                          Hãy thêm chức vụ đầu tiên.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    positions.map(
                      (position, index) => (
                        <tr
                          key={position.id}
                          style={{
                            borderBottom:
                              "1px solid #edf0f4",
                          }}
                        >
                          <td
                            style={{
                              ...tdStyle,
                              width: "70px",
                              color: "#8a96a8",
                            }}
                          >
                            {index + 1}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              fontWeight: 700,
                              color: "#172033",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
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
                                    "10px",
                                  background:
                                    "#e8f0ff",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize: "17px",
                                }}
                              >
                                💼
                              </div>

                              <div>
                                <div>
                                  {position.name}
                                </div>

                                <div
                                  style={{
                                    fontSize:
                                      "11px",
                                    color:
                                      "#9aa5b5",
                                    marginTop:
                                      "3px",
                                    fontWeight:
                                      400,
                                  }}
                                >
                                  ID:{" "}
                                  {position.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              color: "#6b7280",
                              maxWidth: "350px",
                            }}
                          >
                            {position.description ||
                              "Chưa có mô tả"}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              textAlign:
                                "center",
                            }}
                          >
                            <button
                              onClick={() =>
                                deletePosition(
                                  position.id
                                )
                              }
                              disabled={loading}
                              style={{
                                padding:
                                  "8px 13px",
                                borderRadius:
                                  "8px",
                                border:
                                  "1px solid #fecaca",
                                background:
                                  "#fff5f5",
                                color:
                                  "#dc2626",
                                cursor:
                                  loading
                                    ? "not-allowed"
                                    : "pointer",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  700,
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              color: "#9aa5b5",
              fontSize: "12px",
              marginTop: "30px",
              paddingBottom: "10px",
            }}
          >
            HRM AI © 2026 — Hệ thống quản lý nhân sự
            thông minh
          </div>
        </section>
      </main>
    </div>
  );
}

// =========================================================
// TABLE STYLE
// =========================================================

const thStyle = {
  padding: "14px 18px",
  textAlign: "left" as const,
  fontSize: "11px",
  color: "#7b8798",
  fontWeight: 800,
  letterSpacing: "0.3px",
};

const tdStyle = {
  padding: "15px 18px",
  fontSize: "13px",
  verticalAlign: "middle" as const,
};

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  icon,
  background,
  small = false,
}: {
  title: string;
  value: string | number;
  icon: string;
  background: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
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
          background,
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
            fontSize: small ? "16px" : "25px",
            fontWeight: 800,
            color: "#172033",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default Positions;