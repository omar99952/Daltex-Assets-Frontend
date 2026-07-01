import { useState, useEffect, useRef } from "react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import { ORANGE } from "../theme.js";

function SearchableDropdown({ options, value, onChange, placeholder, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen((s) => !s);
    setQuery("");
  }

  const filtered = options.filter(
    (o) => !query || o.label.toLowerCase().includes(query.toLowerCase())
  );
  const selected = options.find((o) => o.value === value);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#f8fafc" : "#fff",
          color: selected ? "#0f172a" : "#94a3b8",
          textAlign: "left",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0, marginLeft: 6 }}>▾</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            background: "#fff",
            border: "1px solid #eef0f3",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            zIndex: 9999,
          }}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{ width: "100%", border: "1px solid #eef0f3", borderRadius: 6, padding: "5px 8px", fontSize: 12.5, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
              style={{ width: "100%", border: "none", background: !value ? "#fef3e2" : "none", padding: "7px 12px", textAlign: "left", fontSize: 13, color: !value ? ORANGE : "#475569", cursor: "pointer" }}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{ width: "100%", border: "none", background: value === o.value ? "#fef3e2" : "none", padding: "7px 12px", textAlign: "left", fontSize: 13, color: value === o.value ? ORANGE : "#475569", cursor: "pointer" }}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "7px 12px", fontSize: 12, color: "#94a3b8" }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeFormModal({ onClose, onSubmit, initialEmployee = null }) {
  const isEdit = !!initialEmployee;

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [form, setForm] = useState({
    employeeCode: initialEmployee?.employee_code || initialEmployee?.id || "",
    nameEn: initialEmployee?.employee_name_en || initialEmployee?.name || "",
    nameAr: initialEmployee?.employee_name_ar || initialEmployee?.nameAr || "",
    branchId: initialEmployee?.branchId || "",
    department: initialEmployee?.last_known_department || initialEmployee?.dept || "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(ENDPOINTS.get_all_branches)
      .then((data) => setBranches(Array.isArray(data) ? data : data?.results || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.branchId) {
      setDepartments([]);
      return;
    }

    setLoadingDepts(true);
    setDepartments([]);

    async function loadDepts() {
      try {
        const sectorsData = await apiGet(ENDPOINTS.get_all_sectors_inside_branch(form.branchId));
        const sectors = Array.isArray(sectorsData) ? sectorsData : sectorsData?.results || [];

        const embeddedDepts = [
          ...new Set(
            sectors
              .flatMap((s) => s.departments || [])
              .map((d) => (typeof d === "object" ? d.name || "" : String(d)))
              .filter(Boolean)
          ),
        ];

        if (embeddedDepts.length > 0) {
          setDepartments(embeddedDepts.map((name) => ({ id: name, name })));
          return;
        }

        const deptNames = new Set();
        await Promise.all(
          sectors.map((s) =>
            apiGet(ENDPOINTS.get_all_departments_inside_sector(s.sector_id || s.id))
              .then((dData) => {
                const arr = Array.isArray(dData) ? dData : dData?.results || [];
                arr.forEach((d) => { if (d.name) deptNames.add(d.name); });
              })
              .catch(() => {})
          )
        );

        setDepartments([...deptNames].map((name) => ({ id: name, name })));
      } catch {
        setDepartments([]);
      } finally {
        setLoadingDepts(false);
      }
    }

    loadDepts();
  }, [form.branchId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleBranchChange(value) {
    update("branchId", value);
    update("department", "");
  }

  function handleSubmit() {
    if (!form.employeeCode.trim() || !form.nameEn.trim()) {
      setError("Employee code and English name are required.");
      return;
    }

    onSubmit({
      employee_code: form.employeeCode,
      employee_name_en: form.nameEn,
      employee_name_ar: form.nameAr,
      last_known_branch: form.branchId || "",
      last_known_department: form.department,
    });
  }

  const branchOptions = branches.map((b) => ({
    value: String(b.branch_id || b.id),
    label: b.name_en || b.name,
  }));

  const deptOptions = departments.map((d) => ({ value: d.name, label: d.name }));

  const deptLabel = loadingDepts
    ? "Department (loading…)"
    : !form.branchId
    ? "Department (select branch first)"
    : "Department";

  return (
    <Modal
      title={isEdit ? "Edit Employee" : "Add New Employee"}
      subtitle={
        isEdit
          ? `Update ${form.nameEn || "employee"}'s profile.`
          : "Add a new employee to the directory."
      }
      onClose={onClose}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{ border: "none", background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}
          >
            {isEdit ? "Save Changes" : "Add Employee"}
          </button>
        </div>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Employee Code">
          <input
            value={form.employeeCode}
            onChange={(e) => update("employeeCode", e.target.value)}
            placeholder="EMP-2001"
            style={inputStyle}
            disabled={isEdit}
          />
        </FormField>

        <FormField label="English Name">
          <input
            value={form.nameEn}
            onChange={(e) => update("nameEn", e.target.value)}
            placeholder="Omar Mohamed Omar"
            style={inputStyle}
          />
        </FormField>
      </div>

      <FormField label="Arabic Name">
        <input
          value={form.nameAr}
          onChange={(e) => update("nameAr", e.target.value)}
          placeholder="عمر محمد عمر"
          style={{ ...inputStyle, direction: "rtl" }}
        />
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Branch">
          <SearchableDropdown
            options={branchOptions}
            value={form.branchId}
            onChange={handleBranchChange}
            placeholder="Select branch…"
          />
        </FormField>

        <FormField label={deptLabel}>
          <SearchableDropdown
            options={deptOptions}
            value={form.department}
            onChange={(val) => update("department", val)}
            placeholder={
              loadingDepts
                ? "Loading departments…"
                : departments.length === 0 && form.branchId
                ? "No departments found"
                : "Select department…"
            }
            disabled={!form.branchId || loadingDepts}
          />
        </FormField>
      </div>
    </Modal>
  );
}
