import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
}

interface Evaluation {
  id: number;
  employee_id: number;
  evaluation_month: number;
  evaluation_year: number;
  kpi_score: number;
  work_result: string;
  manager_comment: string | null;
  ai_comment: string | null;
  evaluation_date: string | null;
  status: string;
}

function Evaluations() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [kpiScore, setKpiScore] = useState("");
  const [workResult, setWorkResult] = useState("");
  const [managerComment, setManagerComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");

  // =========================
  // LAY DANH SACH NHAN VIEN
  // =========================

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${API_URL}/api/employees/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Khong the lay danh sach nhan vien");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error(error);
      setMessage("Khong the tai danh sach nhan vien");
    }
  };

  // =========================
  // LAY DANH SACH DANH GIA
  // =========================

  const loadEvaluations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/evaluations/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Khong the lay danh sach danh gia");
      }

      const data = await response.json();
      setEvaluations(data);
    } catch (error) {
      console.error(error);
      setMessage("Khong the tai danh sach danh gia");
    }
  };

  useEffect(() => {
    loadEmployees();
    loadEvaluations();
  }, []);

  // =========================
  // THEM DANH GIA
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      setMessage("Vui long chon nhan vien");
      return;
    }

    if (!kpiScore) {
      setMessage("Vui long nhap diem KPI");
      return;
    }

    if (!workResult.trim()) {
      setMessage("Vui long nhap ket qua cong viec");
      return;
    }

    const score = Number(kpiScore);

    if (score < 0 || score > 100) {
      setMessage("Diem KPI phai tu 0 den 100");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/api/evaluations/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          employee_id: Number(employeeId),
          evaluation_month: Number(month),
          evaluation_year: Number(year),
          kpi_score: score,
          work_result: workResult,
          manager_comment: managerComment,
          status: "COMPLETED",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "Them danh gia that bai");
        return;
      }

      setMessage("Them danh gia thanh cong");

      setEmployeeId("");
      setKpiScore("");
      setWorkResult("");
      setManagerComment("");

      loadEvaluations();
    } catch (error) {
      console.error(error);
      setMessage("Khong the ket noi den server");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TIM TEN NHAN VIEN
  // =========================

  const getEmployeeName = (id: number) => {
    const employee = employees.find((item) => item.id === id);

    if (!employee) {
      return `Nhan vien #${id}`;
    }

    return `${employee.employee_code} - ${employee.full_name}`;
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1>Danh gia nhan vien</h1>

      <p>
        Quan ly ket qua danh gia KPI va ket qua cong viec cua nhan vien.
      </p>

      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "20px",
            borderRadius: "6px",
            backgroundColor: "#f1f1f1",
          }}
        >
          {message}
        </div>
      )}

      {/* =========================
          FORM THEM DANH GIA
      ========================= */}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <h2>Them danh gia</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label>Nhan vien</label>

            <br />

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            >
              <option value="">-- Chon nhan vien --</option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employee_code} - {employee.full_name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div style={{ flex: 1 }}>
              <label>Thang</label>

              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>Nam</label>

              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "5px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Diem KPI (0 - 100)</label>

            <input
              type="number"
              min="0"
              max="100"
              value={kpiScore}
              onChange={(e) => setKpiScore(e.target.value)}
              placeholder="Vi du: 85"
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Ket qua cong viec</label>

            <textarea
              value={workResult}
              onChange={(e) => setWorkResult(e.target.value)}
              placeholder="Nhap ket qua cong viec cua nhan vien..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Nhan xet cua quan ly</label>

            <textarea
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Nhap nhan xet cua quan ly..."
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            {loading ? "Dang luu..." : "Them danh gia"}
          </button>
        </form>
      </div>

      {/* =========================
          DANH SACH DANH GIA
      ========================= */}

      <div>
        <h2>Danh sach danh gia</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Nhan vien
              </th>

              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Ky danh gia
              </th>

              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                KPI
              </th>

              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Ket qua cong viec
              </th>

              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                Nhan xet quan ly
              </th>

              <th style={{ border: "1px solid #ddd", padding: "10px" }}>
                AI
              </th>
            </tr>
          </thead>

          <tbody>
            {evaluations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #ddd",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  Chua co du lieu danh gia
                </td>
              </tr>
            ) : (
              evaluations.map((evaluation) => (
                <tr key={evaluation.id}>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {getEmployeeName(evaluation.employee_id)}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {evaluation.evaluation_month}/
                    {evaluation.evaluation_year}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {evaluation.kpi_score}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {evaluation.work_result}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {evaluation.manager_comment || "Chua co"}
                  </td>

                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                    }}
                  >
                    {evaluation.ai_comment || "Chua sinh nhan xet AI"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Evaluations;