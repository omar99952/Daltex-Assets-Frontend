import { useState, useEffect } from "react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import { ORANGE } from "../theme.js";

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

        // Fallback: fetch departments sector by sector
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

  function handleBranchChange(e) {
    update("branchId", e.target.value);
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

  const branchSelectStyle = {
    ...inputStyle,
    color: form.branchId ? "#0f172a" : "#94a3b8",
  };

  const deptSelectStyle = {
    ...inputStyle,
    color: form.department ? "#0f172a" : "#94a3b8",
    cursor: !form.branchId ? "not-allowed" : "pointer",
    background: !form.branchId ? "#f8fafc" : "#fff",
  };

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
              background: ORANGE,
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              padding: "10px 20px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {isEdit ? "Save Changes" : "Add Employee"}
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
          <select value={form.branchId} onChange={handleBranchChange} style={branchSelectStyle}>
            <option value="">Select branch…</option>
            {branches.map((b) => (
              <option key={b.branch_id || b.id} value={String(b.branch_id || b.id)}>
                {b.name_en || b.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label={
            loadingDepts
              ? "Department (loading…)"
              : !form.branchId
              ? "Department (select branch first)"
              : "Department"
          }
        >
          <select
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            disabled={!form.branchId || loadingDepts}
            style={deptSelectStyle}
          >
            <option value="">
              {loadingDepts
                ? "Loading departments…"
                : departments.length === 0 && form.branchId
                ? "No departments found"
                : "Select department…"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </Modal>
  );
}
