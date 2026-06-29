import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { Filter, Download, Building2, Boxes, ClipboardCheck, CheckCircle2, AlertTriangle, ChevronRight, Check, MoreVertical, Settings, Trash2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Modal from "../components/Modal.jsx";
import { NAVY, ORANGE } from "../theme.js";

function BranchAdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Allow branch deletion</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{deleteEnabled ? "Deletion is currently enabled." : "Check to allow deleting branches."}</div>
        </div>
      </label>
    </div>
  );
}

function FilterPopover({ healthFilter, setHealthFilter, deptFilter, setDeptFilter, allDepts, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 10,
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
        width: 240,
        padding: 16,
        zIndex: 60,
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.3, marginBottom: 10 }}>HEALTH STATUS</div>
      {[
        { key: null, label: "All" },
        { key: "good", label: "Healthy" },
        { key: "warning", label: "Needs Attention" },
      ].map((opt) => (
        <button
          key={opt.label}
          onClick={() => setHealthFilter(opt.key)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            background: healthFilter === opt.key ? "#fef3e2" : "none",
            borderRadius: 7,
            padding: "8px 10px",
            fontSize: 13,
            fontWeight: 600,
            color: healthFilter === opt.key ? ORANGE : "#475569",
            cursor: "pointer",
            marginBottom: 2,
          }}
        >
          {opt.label}
          {healthFilter === opt.key && <Check size={14} />}
        </button>
      ))}

      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.3, margin: "14px 0 10px" }}>DEPARTMENT</div>
      <button
        onClick={() => setDeptFilter(null)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          background: deptFilter === null ? "#fef3e2" : "none",
          borderRadius: 7,
          padding: "8px 10px",
          fontSize: 13,
          fontWeight: 600,
          color: deptFilter === null ? ORANGE : "#475569",
          cursor: "pointer",
          marginBottom: 2,
        }}
      >
        All
        {deptFilter === null && <Check size={14} />}
      </button>
      {allDepts.map((d) => (
        <button
          key={d}
          onClick={() => setDeptFilter(d)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "none",
            background: deptFilter === d ? "#fef3e2" : "none",
            borderRadius: 7,
            padding: "8px 10px",
            fontSize: 13,
            fontWeight: 600,
            color: deptFilter === d ? ORANGE : "#475569",
            cursor: "pointer",
            marginBottom: 2,
          }}
        >
          {d}
          {deptFilter === d && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}

export default function Branches() {
  const { branches, navigateTo, goBack, setSelectedBranchId, deleteBranch, deleteBranchEnabled, setDeleteBranchEnabled } = useApp();
  const [healthFilter, setHealthFilter] = useState(null);
  const [deptFilter, setDeptFilter] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteError, setShowDeleteError] = useState(false);

  const allDepts = Array.from(new Set(branches.flatMap((b) => b.departments))).sort();

  const filteredBranches = branches.filter(
    (b) => (!healthFilter || b.health === healthFilter) && (!deptFilter || b.departments.includes(deptFilter))
  );

  const totalAssets = filteredBranches.reduce((s, b) => s + b.assets, 0);
  const totalDepts = new Set(filteredBranches.flatMap((b) => b.departments)).size;
  const activePct = filteredBranches.length ? Math.round((filteredBranches.filter((b) => b.health === "good").length / filteredBranches.length) * 100) : 0;

  function openBranch(id) {
    setSelectedBranchId(id);
    navigateTo("branchDetail");
  }

  const csvHeaders = ["BRANCH ID", "BRANCH NAME", "REGION", "DEPARTMENTS", "ASSETS", "HEALTH"];
  const csvRows = filteredBranches.map((b) => ({
    "BRANCH ID": b.id,
    "BRANCH NAME": b.name,
    REGION: b.region,
    DEPARTMENTS: b.departments.join("; "),
    ASSETS: b.assets,
    HEALTH: b.health === "good" ? "Healthy" : "Needs Attention",
  }));

  const activeFilterCount = (healthFilter ? 1 : 0) + (deptFilter ? 1 : 0);

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Branches & Departments</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Operational overview of all {branches.length} regional hubs and department allocation.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowFilter((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                border: `1px solid ${activeFilterCount ? ORANGE : "#eef0f3"}`,
                borderRadius: 8,
                padding: "9px 16px",
                fontWeight: 700,
                fontSize: 13,
                color: activeFilterCount ? ORANGE : "#475569",
                background: activeFilterCount ? "#fef3e2" : "#fff",
                cursor: "pointer",
              }}
            >
              <Filter size={14} /> Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {showFilter && (
              <FilterPopover
                healthFilter={healthFilter}
                setHealthFilter={setHealthFilter}
                deptFilter={deptFilter}
                setDeptFilter={setDeptFilter}
                allDepts={allDepts}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>
          <button
            onClick={() => setShowCsvPreview(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#fff", background: NAVY, cursor: "pointer" }}
          >
            <Download size={14} /> Export Data
          </button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{ border: `1px solid ${deleteBranchEnabled ? "#fecaca" : "#eef0f3"}`, borderRadius: 8, padding: 0, height: 38, width: 38, display: "flex", alignItems: "center", justifyContent: "center", background: showAdvanced ? "#f1f5f9" : deleteBranchEnabled ? "#fff5f5" : "#fff", cursor: "pointer", color: deleteBranchEnabled ? "#dc2626" : "#475569" }}
            >
              <MoreVertical size={14} />
            </button>
            {showAdvanced && (
              <BranchAdvancedSettingsPopover deleteEnabled={deleteBranchEnabled} setDeleteEnabled={setDeleteBranchEnabled} onClose={() => setShowAdvanced(false)} />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Building2 size={17} color={NAVY} />} iconBg="#e2e8f0" label="TOTAL BRANCHES" value={filteredBranches.length} />
        <StatCard icon={<Boxes size={17} color="#475569" />} iconBg="#e2e8f0" label="TOTAL DEPARTMENTS" value={totalDepts} />
        <StatCard icon={<ClipboardCheck size={17} color="#475569" />} iconBg="#e2e8f0" label="MANAGED ASSETS" value={totalAssets.toLocaleString()} />
        <StatCard icon={<CheckCircle2 size={17} color="#16a34a" />} iconBg="#dcfce7" label="ACTIVE STATUS" value={`${activePct}%`} />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <Card style={{ flex: 2, padding: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Branch Inventory Index</div>
            <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "4px 10px", borderRadius: 999 }}>
              Displaying {filteredBranches.length} region{filteredBranches.length === 1 ? "" : "s"}
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["BRANCH NAME", "DEPARTMENTS", "ASSETS", "HEALTH", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => openBranch(b.id)}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: NAVY,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {b.id}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.name}</div>
                      <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{b.region}</div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {b.departments.slice(0, 2).map((d) => (
                        <span key={d} style={{ background: "#fef3e2", color: ORANGE, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>
                          {d}
                        </span>
                      ))}
                      {b.departments.length > 2 && (
                        <span style={{ background: "#f1f5f9", color: "#94a3b8", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>
                          +{b.departments.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{b.assets.toLocaleString()}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 99,
                        display: "inline-block",
                        background: b.health === "good" ? "#16a34a" : "#f59e0b",
                      }}
                    />
                  </td>
                  <td style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <ChevronRight size={15} color="#cbd5e1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!deleteBranchEnabled) { setShowDeleteError(true); return; }
                        setPendingDeleteId(b.id);
                      }}
                      title="Delete branch"
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#fca5a5" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBranches.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    No branches match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>Asset Distribution</div>
            {[
              { label: "LOGISTICS", pct: 42, color: NAVY },
              { label: "OPERATIONS", pct: 31, color: NAVY },
              { label: "IT", pct: 18, color: NAVY },
              { label: "HR & ADMIN", pct: 9, color: NAVY },
            ].map((d) => (
              <div key={d.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>{d.label}</span>
                  <span style={{ color: "#94a3b8" }}>{d.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "#eef0f3", overflow: "hidden" }}>
                  <div style={{ width: `${d.pct}%`, height: "100%", background: d.color }} />
                </div>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>Recent Maintenance Alerts</div>
            <button
              onClick={() => {
                const wn = branches.find((b) => b.name.includes("Wadi"));
                if (wn) openBranch(wn.id);
              }}
              style={{ display: "flex", gap: 10, marginBottom: 12, border: "none", background: "none", cursor: "pointer", textAlign: "left", width: "100%", padding: 0 }}
            >
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Wadi El Natrun Hub</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>5 unassigned IT assets detected.</div>
              </div>
            </button>
            <button
              onClick={() => {
                const ap = branches.find((b) => b.name.includes("Alexandria"));
                if (ap) openBranch(ap.id);
              }}
              style={{ display: "flex", gap: 10, border: "none", background: "none", cursor: "pointer", textAlign: "left", width: "100%", padding: 0 }}
            >
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Alexandria Port</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>New shipment of 12 mobile units received.</div>
              </div>
            </button>
          </Card>
        </div>
      </div>

      {showCsvPreview && (
        <CsvPreviewModal onClose={() => setShowCsvPreview(false)} rows={csvRows} headers={csvHeaders} filename="branches_export.csv" />
      )}
      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete Branch"
          message={`Are you sure you want to permanently delete this branch? This cannot be undone.`}
          confirmLabel="Delete Branch"
          onConfirm={() => { deleteBranch(pendingDeleteId); setPendingDeleteId(null); }}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
      {showDeleteError && (
        <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Branch deletion is not enabled</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> (⋮ button in the toolbar) and enable branch deletion to proceed.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeleteError(false)} style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>Got it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
