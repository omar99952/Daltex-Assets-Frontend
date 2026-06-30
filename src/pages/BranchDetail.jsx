import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { ArrowLeft, Boxes, Users, ClipboardCheck, MoreVertical, Settings, X, AlertCircle, Plus, Pencil } from "lucide-react";

import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";
import FormField, { inputStyle } from "../components/FormField.jsx";
import { NAVY, ORANGE } from "../theme.js";

function mapBranch(b) {
  return {
    id: String(b.branch_id || b.id),
    name: b.name_en || b.name || "",
    nameAr: b.name_ar || "",
    region: b.location || "",
    branchCode: b.branch_code || "",
    departments: b.departments || [],
    assets: b.assets || 0,
    health: b.health || "good",
  };
}

function SearchableSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()));
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => { setOpen((s) => !s); setQuery(""); }}
        style={{ border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, color: value ? ORANGE : "#64748b", background: value ? "#fef3e2" : "#fff", cursor: "pointer", outline: "none", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
      >
        {selected ? selected.label : placeholder}
        <span style={{ fontSize: 9, color: "#94a3b8" }}>▾</span>
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#fff", border: "1px solid #eef0f3", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,0.12)", zIndex: 50, minWidth: 190 }}>
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث…"
              style={{ width: "100%", border: "1px solid #eef0f3", borderRadius: 6, padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ maxHeight: 180, overflowY: "auto", padding: "4px 0" }}>
            <button
              onClick={() => { onChange(null); setOpen(false); setQuery(""); }}
              style={{ width: "100%", border: "none", background: value === null ? "#fef3e2" : "none", padding: "7px 12px", textAlign: "left", fontSize: 13, color: value === null ? ORANGE : "#475569", cursor: "pointer" }}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{ width: "100%", border: "none", background: value === o.value ? "#fef3e2" : "none", padding: "7px 12px", textAlign: "left", fontSize: 13, color: value === o.value ? ORANGE : "#475569", cursor: "pointer" }}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "7px 12px", fontSize: 12, color: "#94a3b8" }}>لا نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
  const { selectedBranchId, goBack, deleteDeptEnabled, setDeleteDeptEnabled } = useApp();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeptError, setShowDeptError] = useState(false);
  const [showAddDept, setShowAddDept] = useState(false);
  const [addDeptSectorId, setAddDeptSectorId] = useState("");
  const [addDeptName, setAddDeptName] = useState("");
  const [addDeptError, setAddDeptError] = useState("");
  const [showEditBranch, setShowEditBranch] = useState(false);
  const [editForm, setEditForm] = useState({ nameEn: "", nameAr: "", location: "" });

  const [deptSearch, setDeptSearch] = useState("");
  const [deptSort, setDeptSort] = useState("name-asc");
  const [deptSectorFilter, setDeptSectorFilter] = useState(null);
  const [deptPage, setDeptPage] = useState(1);

  // ── API state ───────────────────────────────────────────────────────────────
  const [apiBranch, setApiBranch] = useState(null);
  const [apiSectors, setApiSectors] = useState([]);
  const [apiDepts, setApiDepts] = useState(null);
  const [branchLoading, setBranchLoading] = useState(true);

  useEffect(() => {
    if (!selectedBranchId) return;
    setBranchLoading(true);
    setApiBranch(null);
    setApiSectors([]);
    setApiDepts(null);

    async function fetchAll() {
      try {
        const [branchData, sectorsData] = await Promise.all([
          apiGet(ENDPOINTS.get_branch_by_id(selectedBranchId)),
          apiGet(ENDPOINTS.get_all_sectors_inside_branch(selectedBranchId)),
        ]);
        const mappedBranch = mapBranch(branchData);
        setApiBranch(mappedBranch);

        const mappedSectors = sectorsData.map((s) => ({
          id: String(s.sector_id || s.id),
          name: s.sector_name || s.name || "",
        }));
        setApiSectors(mappedSectors);

        if (mappedSectors.length > 0) {
          setAddDeptSectorId(mappedSectors[0].id);
        }

        // Fetch departments for all sectors in parallel
        const deptArrays = await Promise.all(
          sectorsData.map((s) => {
            const sectorId = String(s.sector_id || s.id);
            const sectorName = s.sector_name || s.name || "";
            return apiGet(ENDPOINTS.get_all_departments_inside_sector(sectorId))
              .then((depts) => depts.map((d) => ({ id: String(d.id), name: d.name || "", sectorId, sectorName })))
              .catch(() => []);
          })
        );
        setApiDepts(deptArrays.flat());
      } catch {
        // Fall back to seed data
      } finally {
        setBranchLoading(false);
      }
    }
    fetchAll();
  }, [selectedBranchId]);

  const branch = apiBranch;
  const depts = apiDepts || [];

  const DEPT_PAGE_SIZE = 8;

  const filteredDepts = depts
    .filter(
      (d) =>
        (!deptSectorFilter || d.sectorId === deptSectorFilter) &&
        (!deptSearch || d.name.toLowerCase().includes(deptSearch.toLowerCase()))
    )
    .sort((a, b) => {
      if (deptSort === "name-asc") return a.name.localeCompare(b.name);
      if (deptSort === "name-desc") return b.name.localeCompare(a.name);
      if (deptSort === "sector-desc") return b.sectorName.localeCompare(a.sectorName);
      return a.sectorName.localeCompare(b.sectorName);
    });

  const deptTotalPages = Math.max(1, Math.ceil(filteredDepts.length / DEPT_PAGE_SIZE));
  const pagedDepts = filteredDepts.slice((deptPage - 1) * DEPT_PAGE_SIZE, deptPage * DEPT_PAGE_SIZE);

  async function handleRemoveDept(dept) {
    if (!deleteDeptEnabled) { setShowDeptError(true); return; }
    try {
      await apiDelete(ENDPOINTS.delete_dept(dept.id));
      setApiDepts((prev) => prev ? prev.filter((d) => d.id !== dept.id) : null);
    } catch { /* ignore */ }
  }

  async function handleAddDept() {
    if (!addDeptName.trim()) { setAddDeptError("Department name is required."); return; }
    if (!addDeptSectorId) { setAddDeptError("Please select a sector."); return; }
    setAddDeptError("");
    try {
      const body = { name: addDeptName.trim(), sector: addDeptSectorId };
      const created = await apiPost(ENDPOINTS.post_new_dept, body);
      const sector = apiSectors.find((s) => s.id === addDeptSectorId);
      setApiDepts((prev) => [
        ...(prev || []),
        { id: String(created.id), name: created.name || addDeptName.trim(), sectorId: addDeptSectorId, sectorName: sector?.name || "" },
      ]);
    } catch {
      setAddDeptError("Failed to add department.");
      return;
    }
    setAddDeptName("");
    setShowAddDept(false);
  }

  async function handleEditBranch() {
    if (!editForm.nameEn.trim()) return;
    try {
      const body = { name_en: editForm.nameEn, name_ar: editForm.nameAr || "", location: editForm.location || "" };
      const updated = await apiPatch(ENDPOINTS.update_branch(branch.id), body);
      setApiBranch(mapBranch(updated));
    } catch {
      // silent fail — UI already reflects attempted change
    }
    setShowEditBranch(false);
  }

  function openEditBranch() {
    setEditForm({ nameEn: branch.name || "", nameAr: branch.nameAr || "", location: branch.region || "" });
    setShowEditBranch(true);
  }

  if (branchLoading && !branch) {
    return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading branch details…</div>;
  }
  if (!branchLoading && !branch) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Branch not found.</div>
        <button onClick={() => goBack()} style={{ marginTop: 16, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <button onClick={() => goBack()} style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 18 }}>
        <ArrowLeft size={15} /> Back to Branches
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
          {branch.branchCode ? branch.branchCode.slice(0, 3).toUpperCase() : branch.name.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{branch.name}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{branch.region}</div>
          {branch.nameAr && <div style={{ fontSize: 12, color: "#94a3b8", direction: "rtl" }}>{branch.nameAr}</div>}
        </div>
        <button
          onClick={openEditBranch}
          title="Edit branch"
          style={{ marginLeft: 4, border: "1px solid #eef0f3", background: "#fff", color: "#475569", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Pencil size={13} /> Edit
        </button>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: branch.health === "good" ? "#16a34a" : "#b45309", background: branch.health === "good" ? "#dcfce7" : "#fef3c7", padding: "6px 12px", borderRadius: 999 }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: branch.health === "good" ? "#16a34a" : "#f59e0b" }} />
          {branch.health === "good" ? "Healthy" : "Needs Attention"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="DEPARTMENTS" value={depts.length} />
        <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="SECTORS" value={apiSectors.length || "—"} />
        <StatCard icon={<ClipboardCheck size={17} color="#475569" />} iconBg="#e2e8f0" label="BRANCH CODE" value={branch.branchCode || "—"} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Departments</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setAddDeptError(""); setShowAddDept(true); }}
              style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #eef0f3", background: "#fff", color: "#475569", borderRadius: 7, padding: "6px 10px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              <Plus size={12} /> Add
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowAdvanced((s) => !s)} title="Advanced Settings" style={{ border: `1px solid ${deleteDeptEnabled ? "#fecaca" : "#eef0f3"}`, borderRadius: 8, padding: 0, height: 32, width: 32, display: "flex", alignItems: "center", justifyContent: "center", background: showAdvanced ? "#f1f5f9" : deleteDeptEnabled ? "#fff5f5" : "#fff", cursor: "pointer", color: deleteDeptEnabled ? "#dc2626" : "#475569" }}>
                <MoreVertical size={13} />
              </button>
              {showAdvanced && <DeptAdvancedSettingsPopover deleteEnabled={deleteDeptEnabled} setDeleteEnabled={setDeleteDeptEnabled} onClose={() => setShowAdvanced(false)} />}
            </div>
          </div>
        </div>

        {branchLoading ? (
          <div style={{ fontSize: 13, color: "#94a3b8", padding: "12px 0" }}>Loading departments…</div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
              <input
                type="text"
                value={deptSearch}
                onChange={(e) => { setDeptSearch(e.target.value); setDeptPage(1); }}
                placeholder="Search departments…"
                style={{ flex: 1, border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, outline: "none", color: "#0f172a" }}
              />
              {apiSectors.length > 0 && (
                <SearchableSelect
                  options={apiSectors.map((s) => ({ value: s.id, label: s.name }))}
                  value={deptSectorFilter}
                  onChange={(val) => { setDeptSectorFilter(val); setDeptPage(1); }}
                  placeholder="كل القطاعات"
                />
              )}
              <select
                value={deptSort}
                onChange={(e) => { setDeptSort(e.target.value); setDeptPage(1); }}
                style={{ border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none" }}
              >
                <option value="name-asc">الاسم أ ← ي</option>
                <option value="name-desc">الاسم ي ← أ</option>
                <option value="sector-asc">القطاع أ ← ي</option>
                <option value="sector-desc">القطاع ي ← أ</option>
              </select>
            </div>

            {pagedDepts.length === 0 ? (
              <div style={{ fontSize: 13, color: "#94a3b8", padding: "16px 0" }}>No departments found.</div>
            ) : (
              pagedDepts.map((d) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{d.name}</div>
                    {d.sectorName && <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>{d.sectorName}</div>}
                  </div>
                  <button
                    onClick={() => handleRemoveDept(d)}
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#fca5a5", display: "flex", padding: 4 }}
                    title="Remove department"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}

            {deptTotalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  Page {deptPage} of {deptTotalPages} · {filteredDepts.length} total
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
                    disabled={deptPage === 1}
                    style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: deptPage === 1 ? "#cbd5e1" : "#475569", cursor: deptPage === 1 ? "default" : "pointer" }}
                  >
                    ‹ Prev
                  </button>
                  <button
                    onClick={() => setDeptPage((p) => Math.min(deptTotalPages, p + 1))}
                    disabled={deptPage === deptTotalPages}
                    style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: deptPage === deptTotalPages ? "#cbd5e1" : "#475569", cursor: deptPage === deptTotalPages ? "default" : "pointer" }}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </Card>

      {/* Add Department Modal */}
      {showAddDept && (
        <Modal title="Add Department" onClose={() => setShowAddDept(false)} width={440} footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowAddDept(false)} style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleAddDept} style={{ border: "none", background: NAVY, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>Add Department</button>
          </div>
        }>
          {addDeptError && <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>{addDeptError}</div>}
          <FormField label="Department Name">
            <input value={addDeptName} onChange={(e) => setAddDeptName(e.target.value)} placeholder="e.g. IT Support" style={inputStyle} />
          </FormField>
          {apiSectors.length > 0 && (
            <FormField label="Sector">
              <select value={addDeptSectorId} onChange={(e) => setAddDeptSectorId(e.target.value)} style={inputStyle}>
                {apiSectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
          )}
        </Modal>
      )}

      {/* Edit Branch Modal */}
      {showEditBranch && (
        <Modal title="Edit Branch" onClose={() => setShowEditBranch(false)} width={460} footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button onClick={() => setShowEditBranch(false)} style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleEditBranch} style={{ border: "none", background: NAVY, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>Save Changes</button>
          </div>
        }>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Name (English)">
              <input value={editForm.nameEn} onChange={(e) => setEditForm((f) => ({ ...f, nameEn: e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="Name (Arabic)">
              <input value={editForm.nameAr} onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))} style={{ ...inputStyle, direction: "rtl" }} />
            </FormField>
          </div>
          <FormField label="Location">
            <input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} />
          </FormField>
        </Modal>
      )}

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
