import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import {
  Filter,
  Download,
  Building2,
  Boxes,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Check,
  MoreVertical,
  Settings,
  Trash2,
  AlertCircle,
  Plus,
  Pencil,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
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
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#fff", border: "1px solid #eef0f3", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,0.12)", zIndex: 50, minWidth: 200 }}>
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{ width: "100%", border: "1px solid #eef0f3", borderRadius: 6, padding: "5px 8px", fontSize: 12, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
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
              <div style={{ padding: "7px 12px", fontSize: 12, color: "#94a3b8" }}>No results.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
        width: 270,
        padding: 18,
        zIndex: 60,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <Settings size={14} color="#475569" />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Advanced Settings</div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          padding: "10px 12px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #eef0f3",
        }}
      >
        <input
          type="checkbox"
          checked={deleteEnabled}
          onChange={(e) => setDeleteEnabled(e.target.checked)}
          style={{
            marginTop: 2,
            accentColor: "#dc2626",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Allow branch deletion
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {deleteEnabled ? "Deletion is currently enabled." : "Check to allow deleting branches."}
          </div>
        </div>
      </label>
    </div>
  );
}

function FilterPopover({ deptFilter, setDeptFilter, allDepts, onClose }) {
  const ref = useRef(null);
  const [deptSearch, setDeptSearch] = useState("");

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const visibleDepts = allDepts.filter(
    (d) => !deptSearch || d.toLowerCase().includes(deptSearch.toLowerCase())
  );

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
      {allDepts.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: 0.3,
              marginBottom: 8,
            }}
          >
            DEPARTMENT
          </div>

          <input
            type="text"
            value={deptSearch}
            onChange={(e) => setDeptSearch(e.target.value)}
            placeholder="Search departments…"
            style={{ width: "100%", border: "1px solid #eef0f3", borderRadius: 7, padding: "6px 9px", fontSize: 12.5, outline: "none", marginBottom: 6, boxSizing: "border-box" }}
          />

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
            All {deptFilter === null && <Check size={14} />}
          </button>

          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {visibleDepts.map((d) => (
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
                {d} {deptFilter === d && <Check size={14} />}
              </button>
            ))}
            {visibleDepts.length === 0 && (
              <div style={{ fontSize: 12.5, color: "#94a3b8", padding: "6px 10px" }}>No results.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AddBranchModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    location: "",
    branchCode: "",
  });
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!form.nameEn.trim()) {
      setError("Branch name (English) is required.");
      return;
    }

    onSubmit(form);
  }

  return (
    <Modal
      title="Add New Branch"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #eef0f3",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            style={{
              border: "none",
              background: NAVY,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Add Branch
          </button>
        </div>
      }
    >
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: 12.5,
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Name (English)">
          <input
            value={form.nameEn}
            onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
            placeholder="e.g. Cairo Branch"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Name (Arabic)">
          <input
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            placeholder="مثال: فرع القاهرة"
            style={{ ...inputStyle, direction: "rtl" }}
          />
        </FormField>
      </div>

      <FormField label="Location">
        <input
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          placeholder="e.g. Cairo, Egypt"
          style={inputStyle}
        />
      </FormField>

      <FormField label="Branch Code">
        <input
          value={form.branchCode}
          onChange={(e) => setForm((f) => ({ ...f, branchCode: e.target.value }))}
          placeholder="e.g. CAI-01"
          style={inputStyle}
        />
      </FormField>
    </Modal>
  );
}

function EditBranchModal({ branch, onClose, onSubmit }) {
  const [form, setForm] = useState({
    nameEn: branch.name || "",
    nameAr: branch.nameAr || "",
    location: branch.region || "",
    branchCode: branch.branchCode || "",
  });
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!form.nameEn.trim()) {
      setError("Branch name (English) is required.");
      return;
    }

    onSubmit(form);
  }

  return (
    <Modal
      title="Edit Branch"
      onClose={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #eef0f3",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 18px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            style={{
              border: "none",
              background: NAVY,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>
        </div>
      }
    >
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: 12.5,
            padding: "10px 12px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Name (English)">
          <input
            value={form.nameEn}
            onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
            style={inputStyle}
          />
        </FormField>

        <FormField label="Name (Arabic)">
          <input
            value={form.nameAr}
            onChange={(e) => setForm((f) => ({ ...f, nameAr: e.target.value }))}
            style={{ ...inputStyle, direction: "rtl" }}
          />
        </FormField>
      </div>

      <FormField label="Location">
        <input
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          style={inputStyle}
        />
      </FormField>

      <FormField label="Branch Code">
        <input
          value={form.branchCode}
          onChange={(e) => setForm((f) => ({ ...f, branchCode: e.target.value }))}
          style={inputStyle}
        />
      </FormField>
    </Modal>
  );
}

export default function Branches() {
  const {
    navigateTo,
    goBack,
    setSelectedBranchId,
    deleteBranchEnabled,
    setDeleteBranchEnabled,
  } = useApp();

  const [locationFilter, setLocationFilter] = useState(null);
  const [deptFilter, setDeptFilter] = useState(null);
  const [search, setSearch] = useState("");
  const [branchPage, setBranchPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [apiBranches, setApiBranches] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  async function fetchBranches() {
    try {
      setApiLoading(true);

      const data = await apiGet(ENDPOINTS.get_all_branches);
      const branchArray = Array.isArray(data) ? data : data.results || [];

      setApiBranches(branchArray.map(mapBranch));
      setApiError(null);
    } catch {
      setApiError("Could not reach the server.");
    } finally {
      setApiLoading(false);
    }
  }

  useEffect(() => {
    fetchBranches();
  }, []);

  const branches = apiBranches || [];

  const allDepts = Array.from(new Set(branches.flatMap((b) => b.departments))).sort();
  const allLocations = Array.from(new Set(branches.map((b) => b.region).filter(Boolean))).sort();

  const filteredBranches = branches.filter(
    (b) =>
      (!locationFilter || b.region === locationFilter) &&
      (!deptFilter || b.departments.includes(deptFilter)) &&
      (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.nameAr.includes(search))
  );

  const BRANCH_PAGE_SIZE = 10;
  const branchTotalPages = Math.max(1, Math.ceil(filteredBranches.length / BRANCH_PAGE_SIZE));
  const pagedBranches = filteredBranches.slice((branchPage - 1) * BRANCH_PAGE_SIZE, branchPage * BRANCH_PAGE_SIZE);

  const totalAssets = filteredBranches.reduce((s, b) => s + b.assets, 0);
  const totalDepts = new Set(filteredBranches.flatMap((b) => b.departments)).size;

  const activePct = filteredBranches.length
    ? Math.round(
        (filteredBranches.filter((b) => b.health === "good").length / filteredBranches.length) * 100
      )
    : 0;

  function openBranch(id) {
    setSelectedBranchId(id);
    navigateTo("branchDetail");
  }

  async function handleAddBranch(form) {
    try {
      const body = {
        name_en: form.nameEn,
        name_ar: form.nameAr || "",
        location: form.location || "",
        branch_code: form.branchCode || "",
      };

      await apiPost(ENDPOINTS.post_new_branch, body);
      await fetchBranches();
      setShowAddBranch(false);
    } catch {
      setApiError("Failed to create branch.");
      setShowAddBranch(false);
    }
  }

  async function handleEditBranch(form) {
    if (!editingBranch) return;

    try {
      const body = {
        name_en: form.nameEn,
        name_ar: form.nameAr || "",
        location: form.location || "",
        branch_code: form.branchCode || "",
      };

      await apiPatch(ENDPOINTS.update_branch(editingBranch.id), body);

      await fetchBranches();

      setEditingBranch(null);
    } catch {
      setApiError("Failed to update branch.");
    }
  }

  async function handleDeleteBranch(id) {
    try {
      await apiDelete(ENDPOINTS.delete_branch(id));
      await fetchBranches();
    } catch {
      setApiError("Failed to delete branch.");
    }

    setPendingDeleteId(null);
  }

  const csvHeaders = ["BRANCH ID", "BRANCH NAME", "LOCATION", "BRANCH CODE"];

  const csvRows = filteredBranches.map((b) => ({
    "BRANCH ID": b.id,
    "BRANCH NAME": b.name,
    LOCATION: b.region,
    "BRANCH CODE": b.branchCode || "",
  }));

  const activeFilterCount = deptFilter ? 1 : 0;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      {apiError && (
        <div
          style={{
            background: "#fef9f0",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "#92400e",
            marginBottom: 14,
          }}
        >
          {apiError}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>
            Branches
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            {apiLoading ? "Loading…" : ""}
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
                deptFilter={deptFilter}
                setDeptFilter={(val) => { setDeptFilter(val); setBranchPage(1); }}
                allDepts={allDepts}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          <button
            onClick={() => setShowCsvPreview(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              border: "1px solid #eef0f3",
              borderRadius: 8,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: "#475569",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Export
          </button>

          <button
            onClick={() => setShowAddBranch(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              border: "none",
              borderRadius: 8,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              background: NAVY,
              cursor: "pointer",
            }}
          >
            <Plus size={14} /> Add Branch
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{
                border: `1px solid ${deleteBranchEnabled ? "#fecaca" : "#eef0f3"}`,
                borderRadius: 8,
                padding: 0,
                height: 38,
                width: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showAdvanced ? "#f1f5f9" : deleteBranchEnabled ? "#fff5f5" : "#fff",
                cursor: "pointer",
                color: deleteBranchEnabled ? "#dc2626" : "#475569",
              }}
            >
              <MoreVertical size={14} />
            </button>

            {showAdvanced && (
              <BranchAdvancedSettingsPopover
                deleteEnabled={deleteBranchEnabled}
                setDeleteEnabled={setDeleteBranchEnabled}
                onClose={() => setShowAdvanced(false)}
              />
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "18px 20px 12px",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>
              Branch Inventory Index
            </div>

            <span
              style={{
                fontSize: 12,
                color: "#94a3b8",
                background: "#f1f5f9",
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {apiLoading
                ? "Loading…"
                : filteredBranches.length === 0
                ? "No regions"
                : `${(branchPage - 1) * BRANCH_PAGE_SIZE + 1}–${Math.min(branchPage * BRANCH_PAGE_SIZE, filteredBranches.length)} of ${filteredBranches.length}`}
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, padding: "0 20px 14px", alignItems: "center" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setBranchPage(1); }}
              placeholder="Search branches…"
              style={{ flex: 1, border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, outline: "none", color: "#0f172a" }}
            />
            <SearchableSelect
              options={allLocations.map((loc) => ({ value: loc, label: loc }))}
              value={locationFilter}
              onChange={(val) => { setLocationFilter(val); setBranchPage(1); }}
              placeholder="All Locations"
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["BRANCH NAME", "LOCATION", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 20px",
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 700,
                      borderBottom: "1px solid #eef0f3",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {apiLoading ? (
                <tr>
                  <td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Loading branches…
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    No branches match the selected filters.
                  </td>
                </tr>
              ) : (
                pagedBranches.map((b) => (
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
                          flexShrink: 0,
                        }}
                      >
                        {b.branchCode ? b.branchCode.slice(0, 3).toUpperCase() : b.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                          {b.name}
                        </div>
                        {b.nameAr && (
                          <div style={{ fontSize: 11, color: "#94a3b8", direction: "rtl" }}>
                            {b.nameAr}
                          </div>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                      {b.region || "—"}
                    </td>

                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <ChevronRight size={15} color="#cbd5e1" />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingBranch(b);
                          }}
                          title="Edit branch"
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#94a3b8",
                            display: "flex",
                            padding: 2,
                          }}
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            if (!deleteBranchEnabled) {
                              setShowDeleteError(true);
                              return;
                            }

                            setPendingDeleteId(b.id);
                          }}
                          title="Delete branch"
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#fca5a5",
                            display: "flex",
                            padding: 2,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {branchTotalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                Page {branchPage} of {branchTotalPages}
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={() => setBranchPage((p) => Math.max(1, p - 1))}
                  disabled={branchPage === 1}
                  style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: branchPage === 1 ? "#cbd5e1" : "#475569", cursor: branchPage === 1 ? "default" : "pointer" }}
                >
                  ‹ Prev
                </button>
                {Array.from({ length: branchTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setBranchPage(p)}
                    style={{ border: "1px solid", borderColor: p === branchPage ? NAVY : "#eef0f3", background: p === branchPage ? NAVY : "#fff", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 700, color: p === branchPage ? "#fff" : "#475569", cursor: "pointer" }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setBranchPage((p) => Math.min(branchTotalPages, p + 1))}
                  disabled={branchPage === branchTotalPages}
                  style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: branchPage === branchTotalPages ? "#cbd5e1" : "#475569", cursor: branchPage === branchTotalPages ? "default" : "pointer" }}
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </Card>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
              Asset Distribution
            </div>

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
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
              Recent Maintenance Alerts
            </div>

            <button
              onClick={() => {
                const wn = branches.find((b) => b.name.includes("Wadi"));
                if (wn) openBranch(wn.id);
              }}
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 12,
                border: "none",
                background: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                padding: 0,
              }}
            >
              <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Wadi El Natrun Hub
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  5 unassigned IT assets detected.
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                const ap = branches.find((b) => b.name.includes("Alexandria"));
                if (ap) openBranch(ap.id);
              }}
              style={{
                display: "flex",
                gap: 10,
                border: "none",
                background: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                padding: 0,
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  Alexandria Port
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>
                  New shipment of 12 mobile units received.
                </div>
              </div>
            </button>
          </Card>
        </div>
      </div>

      {showCsvPreview && (
        <CsvPreviewModal
          onClose={() => setShowCsvPreview(false)}
          rows={csvRows}
          headers={csvHeaders}
          filename="branches_export.csv"
        />
      )}

      {showAddBranch && (
        <AddBranchModal
          onClose={() => setShowAddBranch(false)}
          onSubmit={handleAddBranch}
        />
      )}

      {editingBranch && (
        <EditBranchModal
          branch={editingBranch}
          onClose={() => setEditingBranch(null)}
          onSubmit={handleEditBranch}
        />
      )}

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete Branch"
          message="Are you sure you want to permanently delete this branch? This cannot be undone."
          confirmLabel="Delete Branch"
          onConfirm={() => handleDeleteBranch(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(null)}
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
                Branch deletion is not enabled
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> (⋮ button in the toolbar) and enable branch deletion to proceed.
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
    </div>
  );
}