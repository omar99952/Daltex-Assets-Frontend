import { useState } from "react";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import { ORANGE } from "../theme.js";

const CATEGORIES = ["Laptops & PCs", "Monitors", "Printers", "Networking", "Peripherals"];
const BRANCHES = ["London HQ", "New York Hub", "Berlin Office", "Singapore R&D", "Khatatba Branch", "Sadat City Farm"];

export default function AddDeviceModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    brand: "",
    model: "",
    serial: "",
    branch: BRANCHES[0],
  });
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.brand.trim() || !form.model.trim() || !form.serial.trim()) {
      setError("Brand, model, and serial number are required.");
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal
      title="Add New Device"
      subtitle="Register a new device into inventory. It will be unregistered until assigned or verified."
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
            Add Device
          </button>
        </div>
      }
    >
      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>{error}</div>
      )}

      <FormField label="Category">
        <select value={form.category} onChange={(e) => update("category", e.target.value)} style={inputStyle}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === "Laptops & PCs" ? "PCs" : c}</option>
          ))}
        </select>
      </FormField>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Brand">
          <input value={form.brand} onChange={(e) => update("brand", e.target.value)} placeholder="e.g. Dell, Apple, Cisco" style={inputStyle} />
        </FormField>
        <FormField label="Model">
          <input value={form.model} onChange={(e) => update("model", e.target.value)} placeholder='e.g. XPS 15 (9530)' style={inputStyle} />
        </FormField>
      </div>

      <FormField label="Serial Number">
        <input value={form.serial} onChange={(e) => update("serial", e.target.value)} placeholder="e.g. SN-882-X90" style={inputStyle} />
      </FormField>

      <FormField label="Branch / Location">
        <select value={form.branch} onChange={(e) => update("branch", e.target.value)} style={inputStyle}>
          {BRANCHES.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </FormField>

      <div style={{ background: "#fef3e2", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#b45309" }}>
        New devices are added with status <strong>Unregistered</strong> until they&apos;re checked in or assigned.
      </div>
    </Modal>
  );
}
