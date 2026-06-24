import { useState } from "react";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import { ORANGE } from "../theme.js";

const EMP_DEPARTMENTS = ["Engineering", "Product", "Design", "Marketing", "Finance", "Legal", "IT", "People Operations"];
const EMP_STATUSES = ["Active", "On Leave", "Offboarded"];

export default function EmployeeFormModal({ onClose, onSubmit, initialEmployee = null }) {
  const isEdit = !!initialEmployee;
  const [form, setForm] = useState({
    name: initialEmployee?.name || "",
    role: initialEmployee?.role || "",
    dept: initialEmployee?.dept || EMP_DEPARTMENTS[0],
    location: initialEmployee?.location || "",
    email: initialEmployee?.email || "",
    status: initialEmployee?.status || "Active",
    tenure: initialEmployee?.tenure || "0.0 Years",
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) {
      setError("Name, role, and email are required.");
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal
      title={isEdit ? "Edit Employee" : "Add New Employee"}
      subtitle={isEdit ? `Update ${initialEmployee.name}'s profile.` : "Add a new team member to the directory."}
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
        <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Full Name">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Sarah Jenkins" style={inputStyle} />
        </FormField>
        <FormField label="Email Address">
          <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@daltexhq.com" style={inputStyle} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Role / Title">
          <input value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="e.g. Senior Product Manager" style={inputStyle} />
        </FormField>
        <FormField label="Department">
          <select value={form.dept} onChange={(e) => update("dept", e.target.value)} style={inputStyle}>
            {EMP_DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Office Location">
          <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="e.g. London, UK" style={inputStyle} />
        </FormField>
        <FormField label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} style={inputStyle}>
            {EMP_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </FormField>
      </div>

      {isEdit && (
        <FormField label="Tenure">
          <input value={form.tenure} onChange={(e) => update("tenure", e.target.value)} placeholder="e.g. 2.1 Years" style={inputStyle} />
        </FormField>
      )}

      {!isEdit && (
        <div style={{ background: "#fef3e2", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#b45309" }}>
          New employees start with <strong>0.0 Years</strong> tenure and an auto-generated employee ID.
        </div>
      )}
    </Modal>
  );
}
