import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { ArrowLeft, Pencil, Key, History, Trash2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { Row, Field } from "../components/Misc.jsx";
import EmployeeFormModal from "../components/EmployeeFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Modal from "../components/Modal.jsx";
import { ORANGE } from "../theme.js";

function mapApiEmployee(e) {
  return {
    id: String(e.employee_code),
    name: e.employee_name_en || "",
    nameAr: e.employee_name_ar || "",
    role: e.role || e.job_title || "",
    dept: typeof e.last_known_department === "object"
      ? (e.last_known_department?.name || "")
      : String(e.last_known_department || ""),
    branchId: typeof e.last_known_branch === "object"
      ? String(e.last_known_branch?.branch_id || e.last_known_branch?.id || "")
      : String(e.last_known_branch || ""),
    branchName: typeof e.last_known_branch === "object"
      ? (e.last_known_branch?.name_en || e.last_known_branch?.name || "")
      : "",
    email: e.email || "",
    status: e.status || "Active",
    tenure: e.tenure || "",
    avatarColor: "#0f172a",
  };
}

export default function EmployeeDetail() {
  const { selectedEmployeeId, navigateTo, goBack, deleteEmployeeEnabled } = useApp();

  const [apiEmp, setApiEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);

  useEffect(() => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    apiGet(ENDPOINTS.get_employee_by_id(selectedEmployeeId))
      .then((data) => setApiEmp(mapApiEmployee(data)))
      .catch(() => setApiEmp(null))
      .finally(() => setLoading(false));
  }, [selectedEmployeeId]);

  async function handleEditSubmit(form) {
    try {
      const body = {
        employee_name_en: form.name,
        employee_name_ar: form.nameAr || "",
        last_known_branch: form.branchId || null,
        last_known_department: form.dept || null,
      };
      const updated = await apiPatch(ENDPOINTS.update_employee(apiEmp.id), body);
      setApiEmp(mapApiEmployee(updated));
    } catch { /* silent */ }
    setShowEdit(false);
  }

  async function handleDeleteConfirm() {
    try {
      await apiDelete(ENDPOINTS.delete_employee(apiEmp.id));
    } catch { /* proceed even on API error */ }
    setShowDeleteConfirm(false);
    goBack();
  }

  if (loading) {
    return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading employee details…</div>;
  }
  if (!apiEmp) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Employee not found.</div>
        <button onClick={() => goBack()} style={{ marginTop: 16, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  const emp = apiEmp;
  const branchDisplay = emp.branchName || emp.branchId || "—";

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={15} /> Back to Directory
      </button>

      <div style={{ display: "flex", gap: 20 }}>
        <Card style={{ width: 280, flexShrink: 0, textAlign: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: emp.avatarColor, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 24 }}>
            {emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 17, color: "#0f172a" }}>{emp.name}</div>
          <div style={{ fontSize: 13, color: ORANGE, fontWeight: 600, marginTop: 2 }}>{emp.role}</div>
          <div style={{ marginTop: 10 }}>
            <StatusPill status={emp.status} />
          </div>
          <div style={{ borderTop: "1px solid #eef0f3", marginTop: 18, paddingTop: 16, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
            <Row label="Employee Code" value={emp.id} />
            <Row label="Department" value={emp.dept} />
            <Row label="Branch" value={branchDisplay} />
            <Row label="Tenure" value={emp.tenure} />
          </div>
        </Card>

        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 2 }}>Personal Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, marginBottom: 24 }}>
            <Field label="Name (English)" value={emp.name} />
            <Field label="Name (Arabic)" value={<span style={{ direction: "rtl", fontFamily: "serif" }}>{emp.nameAr || "—"}</span>} />
            <Field label="Employee Code" value={emp.id} />
            <Field label="Email Address" value={emp.email || "—"} />
            <Field label="Department" value={emp.dept} />
            <Field label="Branch" value={branchDisplay} />
          </div>

          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 14 }}>Currently Assigned Assets</div>
          <div style={{ fontSize: 13, color: "#94a3b8", padding: "12px 0" }}>
            Asset assignment history is tracked via the Assignments log.
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 16, display: "flex", gap: 12, padding: "14px 22px" }}>
        <button onClick={() => setShowEdit(true)} style={{ flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px", background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
          <Pencil size={14} /> Edit Profile
        </button>
        <button style={{ flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px", background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
          <Key size={14} /> Reset Password
        </button>
        <button style={{ flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px", background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer" }}>
          <History size={14} /> Access Logs
        </button>
        <button
          onClick={() => { if (!deleteEmployeeEnabled) { setShowDeleteError(true); return; } setShowDeleteConfirm(true); }}
          style={{ flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #fecaca", borderRadius: 8, padding: "11px 14px", background: "#fff", fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: "pointer" }}
        >
          <Trash2 size={14} /> Delete Employee
        </button>
      </Card>

      {showDeleteError && (
        <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Employee deletion is not enabled</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Go to <strong>Employee Directory</strong>, open <strong>Advanced Settings</strong> (⋮ button), and enable deletion.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeleteError(false)} style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>Got it</button>
          </div>
        </Modal>
      )}
      {showEdit && <EmployeeFormModal onClose={() => setShowEdit(false)} onSubmit={handleEditSubmit} initialEmployee={emp} />}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to remove ${emp.name} from the directory? This cannot be undone.`}
          confirmLabel="Delete Employee"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
