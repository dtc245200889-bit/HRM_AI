
import { useState } from "react";
import { login } from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const data = await login(username, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);

      window.location.href = "/";
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundCircleOne}></div>
      <div style={styles.backgroundCircleTwo}></div>

      <div style={styles.loginCard}>

        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            HR
          </div>

          <div>
            <h1 style={styles.logoTitle}>
              HRM AI
            </h1>

            <p style={styles.logoSubtitle}>
              Human Resource Management
            </p>
          </div>
        </div>

        {/* Title */}
        <div style={styles.titleSection}>
          <h2 style={styles.title}>
            Chào mừng trở lại!
          </h2>

          <p style={styles.description}>
            Đăng nhập để quản lý hệ thống nhân sự
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>

          {/* Username */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Tài khoản
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                👤
              </span>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Nhập tài khoản"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Mật khẩu
            </label>

            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                🔒
              </span>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Nhập mật khẩu"
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Error */}
          {message && (
            <div style={styles.error}>
              ⚠️ {message}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Đang đăng nhập..."
              : "Đăng nhập"}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span>© 2026 HRM AI</span>
          <span>•</span>
          <span>Quản lý nhân sự thông minh</span>
        </div>
      </div>
    </div>
  );
}

const styles: {
  [key: string]: React.CSSProperties;
} = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  backgroundCircleOne: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    top: "-180px",
    left: "-150px",
  },

  backgroundCircleTwo: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    bottom: "-150px",
    right: "-120px",
  },

  loginCard: {
    position: "relative",
    zIndex: 1,
    width: "420px",
    maxWidth: "90%",
    padding: "42px",
    background: "rgba(255,255,255,0.98)",
    borderRadius: "20px",
    boxShadow:
      "0 25px 60px rgba(0,0,0,0.3)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "35px",
  },

  logoIcon: {
    width: "55px",
    height: "55px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.35)",
  },

  logoTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#172554",
  },

  logoSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },

  titleSection: {
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },

  description: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  inputGroup: {
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontWeight: "bold",
    fontSize: "14px",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    background: "#f8fafc",
    transition: "0.2s",
  },

  inputIcon: {
    paddingLeft: "14px",
    fontSize: "17px",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "13px 14px 13px 10px",
    fontSize: "14px",
    color: "#0f172a",
  },

  error: {
    padding: "11px 13px",
    marginBottom: "18px",
    borderRadius: "8px",
    background: "#fef2f2",
    color: "#dc2626",
    fontSize: "13px",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow:
      "0 8px 20px rgba(37,99,235,0.3)",
  },

  footer: {
    display: "flex",
    justifyContent: "center",
    gap: "7px",
    marginTop: "28px",
    color: "#94a3b8",
    fontSize: "11px",
    flexWrap: "wrap",
  },
};

export default Login;

