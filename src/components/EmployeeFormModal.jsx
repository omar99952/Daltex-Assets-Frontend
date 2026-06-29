import { useState } from "react";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import { ORANGE } from "../theme.js";

export default function EmployeeFormModal({
  onClose,
  onSubmit,
  initialEmployee = null,
}) {
  const isEdit = !!initialEmployee;

  const [form, setForm] = useState({
    employeeCode: initialEmployee?.employee_code || initialEmployee?.id || "",
    nameEn: initialEmployee?.employee_name_en || initialEmployee?.name || "",
    nameAr: initialEmployee?.employee_name_ar || initialEmployee?.nameAr || "",
    branch: initialEmployee?.last_known_branch || initialEmployee?.location || "",
    department: initialEmployee?.last_known_department || initialEmployee?.dept || "",
  });

  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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
      last_known_branch: form.branch,
      last_known_department: form.department,
    });
  }

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
        <FormField label="Last Known Branch">
          <input
            value={form.branch}
            onChange={(e) => update("branch", e.target.value)}
            placeholder="Headquarter"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Last Known Department">
          <input
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            placeholder="مكاتب ودعم ادارى"
            style={inputStyle}
          />
        </FormField>
      </div>
    </Modal>
  );
}