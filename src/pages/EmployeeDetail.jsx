import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import {
  ArrowLeft,
  Pencil,
  History,
  Trash2,
  AlertCircle,
  Laptop,
  RotateCcw,
  Wrench,
  ClipboardCheck,
  Plus,
  ChevronDown,
} from "lucide-react";
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
    dept:
      typeof e.last_known_department === "object"
        ? e.last_known_department?.name || ""
        : String(e.last_known_department || ""),
    branchId:
      typeof e.last_known_branch === "object"
        ? String(e.last_known_branch?.branch_id || e.last_known_branch?.id || "")
        : String(e.last_known_branch || ""),
    branchName:
      typeof e.last_known_branch === "object"
        ? e.last_known_branch?.name_en || e.last_known_branch?.name || ""
        : String(e.last_known_branch || ""),
    email: e.email || "",
    status: e.status || "Active",
    tenure: e.tenure || "",
    avatarColor: "#0f172a",
  };
}

function getHistoryType(h) {
  return String(h.action || h.type || "").toLowerCase();
}

function getHistoryIcon(type) {
  if (type.includes("assign")) {
    return {
      icon: <Laptop size={14} color="#d97706" />,
      bg: "#fef3e2",
    };
  }

  if (type.includes("return")) {
    return {
      icon: <RotateCcw size={14} color="#16a34a" />,
      bg: "#dcfce7",
    };
  }

  if (type.includes("repair")) {
    return {
      icon: <Wrench size={14} color="#dc2626" />,
      bg: "#fee2e2",
    };
  }

  return {
    icon: <ClipboardCheck size={14} color="#475569" />,
    bg: "#e2e8f0",
  };
}

function HistoryRow({ h }) {
  const type = getHistoryType(h);
  const { icon, bg } = getHistoryIcon(type);

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          flexShrink: 0,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
            {h.asset_serial || h.serial_number || h.serial || "Asset"}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginLeft: 10 }}>
            {h.date || h.created_at || h.timestamp || ""}
          </div>
        </div>

        <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
          {h.action || h.type || "Event"}
          {h.branch ? ` · ${h.branch}` : ""}
        </div>

        {(h.employee_name || h.employee_code) && (
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {h.employee_name || h.employee_code}
          </div>
        )}

        {h.notes && (
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {h.notes}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EmployeeDetail() {
  const { selectedEmployeeId, goBack, deleteEmployeeEnabled } = useApp();

  const [apiEmp, setApiEmp] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [historyLog, setHistoryLog] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showNewAssignment, setShowNewAssignment] = useState(false);
  const [assignAssets, setAssignAssets] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [assignBrandFilter, setAssignBrandFilter] = useState(null);
  const [assignCategoryFilter, setAssignCategoryFilter] = useState(null);
  const [assignPage, setAssignPage] = useState(1);
  const [brandOpen, setBrandOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  async function fetchEmployeeAndHistory() {
    if (!selectedEmployeeId) return;

    setLoading(true);
    setHistoryLoading(true);

    try {
      const emp = await apiGet(ENDPOINTS.get_employee_by_id(selectedEmployeeId));
      const mapped = mapApiEmployee(emp);
      setApiEmp(mapped);

      try {
        const data = await apiGet(ENDPOINTS.global_history_to_track_assets);
        const all = Array.isArray(data) ? data : data?.results || [];

        const empCode = String(mapped.id || "").toLowerCase();
        const empName = String(mapped.name || "").toLowerCase();

        const mine = all.filter((h) => {
          const hEmpCode = String(
            h.employee_code ||
              h.employee?.employee_code ||
              h.employee ||
              ""
          ).toLowerCase();

          const hEmpName = String(
            h.employee_name ||
              h.employee?.name_en ||
              h.employee?.employee_name_en ||
              ""
          ).toLowerCase();

          return hEmpCode === empCode || hEmpName === empName;
        });

        setHistoryLog(mine);
      } catch {
        setHistoryLog([]);
      }
    } catch {
      setApiEmp(null);
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployeeAndHistory();
  }, [selectedEmployeeId]);

  async function openNewAssignment() {
    setShowNewAssignment(true);
    setAssignLoading(true);
    setAssignError("");
    setAssignSearch("");
    setAssignBrandFilter(null);
    setAssignCategoryFilter(null);
    setAssignPage(1);
    setBrandOpen(false);
    setCategoryOpen(false);
    try {
      const data = await apiGet(ENDPOINTS.get_all_hardware_assets);
      const arr = Array.isArray(data) ? data : data?.results || [];
      setAssignAssets(
        arr.map((a) => ({
          id: String(a.id || a.serial_number || ""),
          brand: a.brand || a.brand_name || "",
          model: a.model || a.model_name || "",
          serial: a.serial_number || a.serial || "",
          category: a.category || a.asset_type || a.type || "",
          status: a.status || "In Stock",
        }))
      );
    } catch {
      setAssignAssets([]);
    } finally {
      setAssignLoading(false);
    }
  }

  async function handleAssign(asset) {
    setAssignError("");
    try {
      await apiPost(ENDPOINTS.assign_asset_to_employee, {
        serial_number: asset.serial,
        employee_code: emp.id,
      });
      setShowNewAssignment(false);
      await fetchEmployeeAndHistory();
    } catch {
      setAssignError("Failed to assign asset. Please try again.");
    }
  }

  async function handleEditSubmit(form) {
    try {
      const body = {
        employee_name_en: form.employee_name_en,
        employee_name_ar: form.employee_name_ar || "",
        last_known_branch: form.last_known_branch || "",
        last_known_department: form.last_known_department || "",
      };

      await apiPatch(ENDPOINTS.update_employee(apiEmp.id), body);
      await fetchEmployeeAndHistory();
    } catch {
      // keep current view
    }

    setShowEdit(false);
  }

  async function handleDeleteConfirm() {
    try {
      await apiDelete(ENDPOINTS.delete_employee(apiEmp.id));
    } catch {
      // proceed anyway
    }

    setShowDeleteConfirm(false);
    goBack();
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        Loading employee details…
      </div>
    );
  }

  if (!apiEmp) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Employee not found.</div>
        <button
          onClick={() => goBack()}
          style={{
            marginTop: 16,
            background: ORANGE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const emp = apiEmp;
  const branchDisplay = emp.branchName || emp.branchId || "—";

  const ASSIGN_PAGE_SIZE = 8;
  const allBrands = [...new Set(assignAssets.map((a) => a.brand).filter(Boolean))].sort();
  const allCategories = [...new Set(assignAssets.map((a) => a.category).filter(Boolean))].sort();
  const filteredAssignAssets = assignAssets.filter(
    (a) =>
      (!assignBrandFilter || a.brand === assignBrandFilter) &&
      (!assignCategoryFilter || a.category === assignCategoryFilter) &&
      (!assignSearch ||
        [a.brand, a.model, a.serial]
          .filter(Boolean)
          .some((f) => f.toLowerCase().includes(assignSearch.toLowerCase())))
  );
  const assignTotalPages = Math.max(1, Math.ceil(filteredAssignAssets.length / ASSIGN_PAGE_SIZE));
  const pagedAssets = filteredAssignAssets.slice(
    (assignPage - 1) * ASSIGN_PAGE_SIZE,
    assignPage * ASSIGN_PAGE_SIZE
  );

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "none",
          background: "none",
          color: ORANGE,
          fontWeight: 700,
          fontSize: 13.5,
          cursor: "pointer",
          marginBottom: 18,
        }}
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
            {emp.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div style={{ marginTop: 14, fontWeight: 800, fontSize: 17, color: "#0f172a" }}>
            {emp.name}
          </div>

          <div style={{ fontSize: 13, color: ORANGE, fontWeight: 600, marginTop: 2 }}>
            {emp.role || "—"}
          </div>

          <div style={{ marginTop: 10 }}>
            <StatusPill status={emp.status} />
          </div>

          <div
            style={{
              borderTop: "1px solid #eef0f3",
              marginTop: 18,
              paddingTop: 16,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <Row label="Employee Code" value={emp.id} />
            <Row label="Department" value={emp.dept || "—"} />
            <Row label="Branch" value={branchDisplay} />
            <Row label="Tenure" value={emp.tenure || "—"} />
          </div>
        </Card>

        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 2 }}>
            Personal Information
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            <Field label="Name (English)" value={emp.name} />
            <Field
              label="Name (Arabic)"
              value={<span style={{ direction: "rtl", fontFamily: "serif" }}>{emp.nameAr || "—"}</span>}
            />
            <Field label="Employee Code" value={emp.id} />
            <Field label="Email Address" value={emp.email || "—"} />
            <Field label="Department" value={emp.dept || "—"} />
            <Field label="Branch" value={branchDisplay} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
              Assignment History
            </div>

            {historyLog.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  border: "none",
                  background: "none",
                  color: ORANGE,
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                View all ({historyLog.length})
              </button>
            )}
          </div>

          {historyLoading ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading history…</div>
          ) : historyLog.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              No assignment history found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {historyLog.slice(0, 5).map((h, i) => (
                <HistoryRow key={h.id || i} h={h} />
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card style={{ marginTop: 16, display: "flex", gap: 12, padding: "14px 22px" }}>
        <button
          onClick={openNewAssignment}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "none",
            borderRadius: 8,
            padding: "11px 14px",
            background: ORANGE,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> New Assignment
        </button>

        <button
          onClick={() => setShowEdit(true)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #eef0f3",
            borderRadius: 8,
            padding: "11px 14px",
            background: "#fff",
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          <Pencil size={14} /> Edit Profile
        </button>

        <button
          onClick={() => setShowHistory(true)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #eef0f3",
            borderRadius: 8,
            padding: "11px 14px",
            background: "#fff",
            fontSize: 13,
            fontWeight: 700,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          <History size={14} /> Assignment History
        </button>

        <button
          onClick={() => {
            if (!deleteEmployeeEnabled) {
              setShowDeleteError(true);
              return;
            }
            setShowDeleteConfirm(true);
          }}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "11px 14px",
            background: "#fff",
            fontSize: 13,
            fontWeight: 700,
            color: "#dc2626",
            cursor: "pointer",
          }}
        >
          <Trash2 size={14} /> Delete Employee
        </button>
      </Card>

      {showEdit && (
        <EmployeeFormModal
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
          initialEmployee={emp}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to remove ${emp.name} from the directory? This cannot be undone.`}
          confirmLabel="Delete Employee"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showDeleteError && (
        <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={18} color="#dc2626" />
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>
                Employee deletion is not enabled
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Go to <strong>Employee Directory</strong>, open <strong>Advanced Settings</strong> and enable deletion.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDeleteError(false)}
              style={{
                border: "none",
                background: "#0f172a",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 22px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}

      {showNewAssignment && (
        <Modal
          title="New Assignment"
          subtitle={`Assign an asset to ${emp.name}`}
          onClose={() => setShowNewAssignment(false)}
          width={600}
        >
          <input
            type="text"
            value={assignSearch}
            onChange={(e) => { setAssignSearch(e.target.value); setAssignPage(1); }}
            placeholder="Search by brand, model, or serial…"
            style={{ width: "100%", border: "1px solid #eef0f3", borderRadius: 8, padding: "8px 12px", fontSize: 13, outline: "none", marginBottom: 10, boxSizing: "border-box" }}
          />

          {/* Brand filter accordion */}
          <div style={{ border: "1px solid #eef0f3", borderRadius: 8, marginBottom: 8, overflow: "hidden" }}>
            <button
              onClick={() => setBrandOpen((s) => !s)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "none", background: brandOpen ? "#f8fafc" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#0f172a" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Brand
                {assignBrandFilter && <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE, background: "#fef3e2", padding: "2px 7px", borderRadius: 99 }}>{assignBrandFilter}</span>}
              </span>
              <ChevronDown size={14} color="#94a3b8" style={{ transform: brandOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
            </button>
            {brandOpen && (
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 14px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[null, ...allBrands].map((b) => (
                  <button
                    key={b || "__all__"}
                    onClick={() => { setAssignBrandFilter(b); setAssignPage(1); }}
                    style={{ border: "1px solid", borderColor: assignBrandFilter === b ? ORANGE : "#eef0f3", background: assignBrandFilter === b ? "#fef3e2" : "#fff", color: assignBrandFilter === b ? ORANGE : "#64748b", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    {b || "All"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category filter accordion */}
          <div style={{ border: "1px solid #eef0f3", borderRadius: 8, marginBottom: 14, overflow: "hidden" }}>
            <button
              onClick={() => setCategoryOpen((s) => !s)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "none", background: categoryOpen ? "#f8fafc" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#0f172a" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Category
                {assignCategoryFilter && <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE, background: "#fef3e2", padding: "2px 7px", borderRadius: 99 }}>{assignCategoryFilter}</span>}
              </span>
              <ChevronDown size={14} color="#94a3b8" style={{ transform: categoryOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
            </button>
            {categoryOpen && (
              <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px 14px 12px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[null, ...allCategories].map((c) => (
                  <button
                    key={c || "__all__"}
                    onClick={() => { setAssignCategoryFilter(c); setAssignPage(1); }}
                    style={{ border: "1px solid", borderColor: assignCategoryFilter === c ? ORANGE : "#eef0f3", background: assignCategoryFilter === c ? "#fef3e2" : "#fff", color: assignCategoryFilter === c ? ORANGE : "#64748b", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    {c || "All"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>
            {assignLoading ? "Loading…" : `${filteredAssignAssets.length} asset${filteredAssignAssets.length !== 1 ? "s" : ""} available`}
          </div>

          {assignLoading ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading assets…</div>
          ) : pagedAssets.length === 0 ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No assets found.</div>
          ) : (
            <div style={{ border: "1px solid #eef0f3", borderRadius: 8, overflow: "hidden" }}>
              {pagedAssets.map((a, i) => (
                <button
                  key={a.id || i}
                  onClick={() => handleAssign(a)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: "none", background: "#fff", borderBottom: i < pagedAssets.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Laptop size={15} color="#475569" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{[a.brand, a.model].filter(Boolean).join(" ") || "—"}</div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{a.serial}{a.category ? ` · ${a.category}` : ""}</div>
                  </div>
                  <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, background: "#f1f5f9", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>
                    {a.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {assignTotalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Page {assignPage} of {assignTotalPages}</span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setAssignPage((p) => Math.max(1, p - 1))}
                  disabled={assignPage === 1}
                  style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: assignPage === 1 ? "#cbd5e1" : "#475569", cursor: assignPage === 1 ? "default" : "pointer" }}
                >
                  ‹ Prev
                </button>
                <button
                  onClick={() => setAssignPage((p) => Math.min(assignTotalPages, p + 1))}
                  disabled={assignPage === assignTotalPages}
                  style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: assignPage === assignTotalPages ? "#cbd5e1" : "#475569", cursor: assignPage === assignTotalPages ? "default" : "pointer" }}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}

          {assignError && (
            <div style={{ marginTop: 12, background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8 }}>
              {assignError}
            </div>
          )}
        </Modal>
      )}

      {showHistory && (
        <Modal
          title="Assignment History"
          subtitle={`Asset activity log for ${emp.name}`}
          onClose={() => setShowHistory(false)}
          width={560}
        >
          {historyLoading ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Loading history…
            </div>
          ) : historyLog.length === 0 ? (
            <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              No assignment history found for this employee.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", maxHeight: 400, overflowY: "auto" }}>
              {historyLog.map((h, i) => (
                <HistoryRow key={h.id || i} h={h} />
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}