import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { ArrowLeft, Boxes, Users, ClipboardCheck, MoreVertical, Settings, X, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import Modal from "../components/Modal.jsx";
import { NAVY, ORANGE } from "../theme.js";

function DeptAdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #eef0f3", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.12)", width: 270, padding: 18, zIndex: 60 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <Settings size={14} color="#475569" />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Advanced Settings</div>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #eef0f3" }}>
        <input type="checkbox" checked={deleteEnabled} onChange={(e) => setDeleteEnabled(e.target.checked)} style={{ marginTop: 2, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Allow department removal</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{deleteEnabled ? "Removal is currently enabled." : "Check to allow removing departments."}</div>
        </div>
      </label>
    </div>
  );
}

export default function BranchDetail() {
  const { branches, assets, employees, selectedBranchId, goBack, removeDepartment, deleteDeptEnabled, setDeleteDeptEnabled } = useApp();
  const branch = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeptError, setShowDeptError] = useState(false);

  // Our seed assets use full branch names like "London HQ"; match loosely against the branch name.
  const branchAssets = assets.filter((a) => a.branch && branch.name && a.branch.toLowerCase().includes(branch.name.split(" ")[0].toLowerCase()));

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={15} /> Back to Branches
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: NAVY,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {branch.id}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{branch.name}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{branch.region}</div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
            color: branch.health === "good" ? "#16a34a" : "#b45309",
            background: branch.health === "good" ? "#dcfce7" : "#fef3c7",
            padding: "6px 12px",
            borderRadius: 999,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 99, background: branch.health === "good" ? "#16a34a" : "#f59e0b" }} />
          {branch.health === "good" ? "Healthy" : "Needs Attention"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="MANAGED ASSETS" value={branch.assets.toLocaleString()} />
        <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="DEPARTMENTS" value={branch.departments.length} />
        <StatCard icon={<ClipboardCheck size={17} color="#475569" />} iconBg="#e2e8f0" label="LOCAL INVENTORY MATCHES" value={branchAssets.length} />
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Departments</div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{ border: `1px solid ${deleteDeptEnabled ? "#fecaca" : "#eef0f3"}`, borderRadius: 8, padding: 0, height: 32, width: 32, display: "flex", alignItems: "center", justifyContent: "center", background: showAdvanced ? "#f1f5f9" : deleteDeptEnabled ? "#fff5f5" : "#fff", cursor: "pointer", color: deleteDeptEnabled ? "#dc2626" : "#475569" }}
            >
              <MoreVertical size={13} />
            </button>
            {showAdvanced && (
              <DeptAdvancedSettingsPopover deleteEnabled={deleteDeptEnabled} setDeleteEnabled={setDeleteDeptEnabled} onClose={() => setShowAdvanced(false)} />
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22, marginTop: 12, flexWrap: "wrap" }}>
          {branch.departments.map((d) => (
            <span key={d} style={{ display: "flex", alignItems: "center", gap: 5, background: "#fef3e2", color: ORANGE, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}>
              {d}
              <button
                onClick={() => {
                  if (!deleteDeptEnabled) { setShowDeptError(true); return; }
                  removeDepartment(branch.id, d);
                }}
                style={{ border: "none", background: "none", cursor: "pointer", color: ORANGE, display: "flex", padding: 0, lineHeight: 1 }}
                title="Remove department"
              >
                <X size={11} />
              </button>
            </span>
          ))}
          {branch.departments.length === 0 && (
            <span style={{ fontSize: 13, color: "#94a3b8" }}>No departments.</span>
          )}
        </div>

        <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>Assets at this branch</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["ASSET", "MODEL", "STATUS", "ASSIGNED TO"].map((h) => (
                <th key={h} style={{ padding: "8px 0", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchAssets.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon category={a.category} size={14} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.id}</span>
                </td>
                <td style={{ fontSize: 13, color: "#475569" }}>{a.brand} {a.model}</td>
                <td><StatusPill status={a.status} /></td>
                <td style={{ fontSize: 13, color: "#475569" }}>{a.assignedTo ? empName(a.assignedTo) : "—"}</td>
              </tr>
            ))}
            {branchAssets.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                  No inventory records directly matched to this branch yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
      {showDeptError && (
        <Modal title="Removal Disabled" onClose={() => setShowDeptError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Department removal is not enabled</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> (⋮ button next to Departments) and enable removal to proceed.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeptError(false)} style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>Got it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
