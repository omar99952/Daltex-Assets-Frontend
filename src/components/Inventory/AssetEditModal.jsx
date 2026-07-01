import { useState } from "react";
import Modal from "../Modal.jsx";
import FormField, { inputStyle } from "../FormField.jsx";
import SearchableDropdown from "../SearchableDropdown.jsx";
import { NAVY } from "../../theme.js";

function AssetEditModal({ asset, onClose, onSubmit }) {
  const isComputer = asset.category === "Laptops & PCs";
  const isPrinter = asset.category === "Printers";

  const [form, setForm] = useState({
    brand: asset.brand || "",
    model: asset.model || "",
    serial: asset.serial || "",
    status: asset.status || "In Stock",
    description: asset.description || "",

    pcType: asset.pcType || "",
    processor: asset.processor || "",
    memoryRam: asset.memoryRam || "",
    hardDisk: asset.hardDisk || "",

    printerType: asset.printerType || "",
    printerColor: asset.printerColor || "",
    technology: asset.technology || "",
    connectionType: asset.connectionType || "",
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <Modal
      title="Edit Asset"
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
            onClick={() => onSubmit(form)}
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <FormField label="Brand">
          <input value={form.brand} onChange={(e) => update("brand", e.target.value)} style={inputStyle} />
        </FormField>

        <FormField label="Model / Part No.">
          <input value={form.model} onChange={(e) => update("model", e.target.value)} style={inputStyle} />
        </FormField>

        <FormField label="Serial Number">
          <input value={form.serial} onChange={(e) => update("serial", e.target.value)} style={inputStyle} />
        </FormField>

        <FormField label="Status">
          <SearchableDropdown
            options={["In Stock", "Assigned", "Repair", "Retired"].map((s) => ({ value: s, label: s }))}
            value={form.status}
            onChange={(val) => update("status", val)}
            placeholder="Select status…"
          />
        </FormField>
      </div>

      <FormField label="Description">
        <input value={form.description} onChange={(e) => update("description", e.target.value)} style={inputStyle} />
      </FormField>

      {isComputer && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
          <FormField label="PC Type">
            <input value={form.pcType} onChange={(e) => update("pcType", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Processor">
            <input value={form.processor} onChange={(e) => update("processor", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Memory (RAM)">
            <input value={form.memoryRam} onChange={(e) => update("memoryRam", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Storage">
            <input value={form.hardDisk} onChange={(e) => update("hardDisk", e.target.value)} style={inputStyle} />
          </FormField>
        </div>
      )}

      {isPrinter && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
          <FormField label="Printer Type">
            <input value={form.printerType} onChange={(e) => update("printerType", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Color">
            <input value={form.printerColor} onChange={(e) => update("printerColor", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Technology">
            <input value={form.technology} onChange={(e) => update("technology", e.target.value)} style={inputStyle} />
          </FormField>

          <FormField label="Connection">
            <input value={form.connectionType} onChange={(e) => update("connectionType", e.target.value)} style={inputStyle} />
          </FormField>
        </div>
      )}
    </Modal>
  );
}

export default AssetEditModal;
