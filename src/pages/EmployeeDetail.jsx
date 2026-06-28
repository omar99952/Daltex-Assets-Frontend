import { useState } from "react";
import { ArrowLeft, Pencil, Key, History, Trash2, Plus, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { Row, Field } from "../components/Misc.jsx";
import EmployeeFormModal from "../components/EmployeeFormModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Modal from "../components/Modal.jsx";
import { ORANGE } from "../theme.js";

export default function EmployeeDetail() {
  const { employees, assets, selectedEmployeeId, navigateTo, goBack, returnAsset, updateEmployee, deleteEmployee, deleteEmployeeEnabled } = useApp();
  const emp = employees.find((e) => e.id === selectedEmployeeId) || employees[0];
  const myAssets = assets.filter((a) => a.assignedTo === emp.id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [pendingReturnId, setPendingReturnId] = useState(null);

  function handleEditSubmit(form) {
    updateEmployee(emp.id, form);
    setShowEdit(false);
  }

  function handleDeleteConfirm() {
    deleteEmployee(emp.id);
    setShowDeleteConfirm(false);
    goBack();
  }

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
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: emp.avatarColor,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 24,
            }}
          >
            {emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 17, color: "#0f172a" }}>{emp.name}</div>
          <div style={{ fontSize: 13, color: ORANGE, fontWeight: 600, marginTop: 2 }}>{emp.role}</div>
          <div style={{ marginTop: 10 }}>
            <StatusPill status={emp.status} />
          </div>

          <div style={{ borderTop: "1px solid #eef0f3", marginTop: 18, paddingTop: 16, textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
            <Row label="Tenure" value={emp.tenure} />
            <Row label="Department" value={emp.dept} />
            <Row label="Location" value={emp.location} />
            <Row label="Employee ID" value={`EMP-${emp.id}`} />
          </div>

        </Card>

        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 2 }}>Personal Information</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16, marginBottom: 24 }}>
            <Field label="Full Name" value={emp.name} />
            <Field label="Email Address" value={emp.email} />
            <Field label="Department" value={emp.dept} />
            <Field label="Office Location" value={emp.location} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Currently Assigned Assets</div>
            <button
              onClick={() => navigateTo("newAssignment")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid #fde6c2",
                background: "#fef3e2",
                color: ORANGE,
                fontWeight: 700,
                fontSize: 12.5,
                padding: "8px 14px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <Plus size={13} /> Assign New
            </button>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["ASSET ITEM", "SERIAL NUMBER", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} style={{ padding: "8px 0", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myAssets.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <CategoryIcon category={a.category} size={14} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</span>
                  </td>
                  <td style={{ fontSize: 12.5, color: "#94a3b8" }}>{a.serial}</td>
                  <td>
                    <StatusPill status={a.status} />
                  </td>
                  <td>
                    <button onClick={() => setPendingReturnId(a.id)} style={{ border: "none", background: "none", color: "#dc2626", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                      Deassign
                    </button>
                  </td>
                </tr>
              ))}
              {myAssets.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                    No assets currently assigned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      <Card style={{ marginTop: 16, display: "flex", gap: 12, padding: "14px 22px" }}>
        <button
          onClick={() => setShowEdit(true)}
          style={{
            flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px",
            background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer",
          }}
        >
          <Pencil size={14} /> Edit Profile
        </button>
        <button
          style={{
            flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px",
            background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer",
          }}
        >
          <Key size={14} /> Reset Password
        </button>
        <button
          style={{
            flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px",
            background: "#fff", fontSize: 13, fontWeight: 700, color: "#475569", cursor: "pointer",
          }}
        >
          <History size={14} /> Access Logs
        </button>
        <button
          onClick={() => {
            if (!deleteEmployeeEnabled) { setShowDeleteError(true); return; }
            setShowDeleteConfirm(true);
          }}
          style={{
            flex: 1, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, border: "1px solid #fecaca", borderRadius: 8, padding: "11px 14px",
            background: "#fff", fontSize: 13, fontWeight: 700, color: "#dc2626", cursor: "pointer",
          }}
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
                To delete an employee, go to the <strong>Employee Directory</strong> page, open <strong>Advanced Settings</strong> (⋮ button next to Add Employee), and enable the deletion permission.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDeleteError(false)}
              style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
      {showEdit && <EmployeeFormModal onClose={() => setShowEdit(false)} onSubmit={handleEditSubmit} initialEmployee={emp} />}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to remove ${emp.name} from the directory? Any assets currently assigned to them will be returned to stock. This cannot be undone.`}
          confirmLabel="Delete Employee"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
      {pendingReturnId && (
        <ConfirmDialog
          title="Deassign Asset"
          message="Are you sure you want to deassign this asset? It will be returned to stock."
          confirmLabel="Deassign"
          danger={false}
          onConfirm={() => { returnAsset(pendingReturnId); setPendingReturnId(null); }}
          onCancel={() => setPendingReturnId(null)}
        />
      )}
    </div>
  );
}
