import { useState, useEffect } from "react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import Modal from "./Modal.jsx";
import FormField, { inputStyle } from "./FormField.jsx";
import SearchableDropdown from "./SearchableDropdown.jsx";
import { ORANGE } from "../theme.js";

const CATEGORIES = ["Laptops & PCs", "Printers", "Monitors", "Networking", "Peripherals"];
const PC_TYPES = ["Laptop", "Desktop", "All-in-One", "Mini PC", "Server", "Workstation"];
const STATUSES = ["In Stock", "Assigned", "Repair"];
const PRINTER_TYPES = ["Laser", "Inkjet", "Thermal", "Dot Matrix"];
const PRINTER_COLORS = ["Color", "Monochrome"];
const TECHNOLOGIES = ["Laser", "Inkjet", "LED", "Thermal"];
const CONNECTION_TYPES = ["USB", "Ethernet", "WiFi", "Bluetooth", "USB + Ethernet", "USB + WiFi"];
// These PC types require a separate external monitor
const DESKTOP_TYPES = ["Desktop", "Mini PC", "Server", "Workstation"];
const MONITOR_SIZES = ["17", "19", "21", "22", "24", "27", "32", "43", "49", "55", "65", "75", "86"];

function SectionHeader({ title }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase", marginTop: 20, marginBottom: 10, paddingTop: 14, borderTop: "1px solid #eef0f3" }}>
      {title}
    </div>
  );
}

function StepIndicator({ current, labels }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 26 }}>
      {labels.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", flex: i < labels.length - 1 ? 1 : "none" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done || active ? ORANGE : "#e2e8f0",
                color: done || active ? "#fff" : "#94a3b8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 11, flexShrink: 0,
              }}>
                {done ? "✓" : num}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: active ? "#0f172a" : "#94a3b8", whiteSpace: "nowrap" }}>{label}</div>
            </div>
            {i < labels.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? ORANGE : "#e2e8f0", margin: "13px 8px 0" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AddDeviceModal({ onClose, onSubmit }) {
  const [apiBranches, setApiBranches] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    category: CATEGORIES[0],
    brand: "", model: "", serial: "", branchId: "", status: "In Stock",
    description: "", deliveryDate: "",
    // PC
    pcType: "Laptop", processor: "", memoryRam: "", hardDisk: "",
    monitorBrand: "", monitorModel: "", monitorInches: "", monitorSerial: "",
    keyboardBrand: "", keyboardModel: "", keyboardSerial: "",
    mouseBrand: "", mouseModel: "", mouseSerial: "",
    bagBrand: "", bagModelDescription: "",
    // Monitor device (standalone)
    inches: "", devColor: "", partNumber: "", locationDetails: "",
    isMeetingRoomTv: false, isCurved: false,
    // Printer
    printerType: "Laser", printerColor: "Color", technology: "Laser",
    connectionType: "USB", multifunctions: false,
    cartridgeNumber: "", cartridgeColor: "", inkDetails: "",
    macAddressEth: "", ipAddressEth: "", macAddressWifi: "", activeConnection: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(ENDPOINTS.get_all_branches)
      .then((data) => {
        const arr = Array.isArray(data) ? data : (data?.results || []);
        const mapped = arr.map((b) => ({ id: String(b.branch_id || b.id), name: b.name_en || b.name || "" }));
        setApiBranches(mapped);
        if (mapped.length > 0) setForm((f) => ({ ...f, branchId: mapped[0].id }));
      })
      .catch(() => setApiBranches([]));
  }, []);

  const branches = apiBranches || [];
  const isPC = form.category === "Laptops & PCs";
  const isPrinter = form.category === "Printers";
  const isMonitor = form.category === "Monitors";
  const needsMonitor = isPC && DESKTOP_TYPES.includes(form.pcType);

  let stepLabels;
  if (isPC) stepLabels = ["Device Info", "Specifications", "Peripherals"];
  else if (isPrinter) stepLabels = ["Device Info", "Printer Details"];
  else if (isMonitor) stepLabels = ["Device Info", "Display Specs"];
  else stepLabels = ["Device Info"];
  const maxSteps = stepLabels.length;

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateStep1() {
    if (!form.brand.trim() || !form.model.trim() || !form.serial.trim()) {
      setError("Brand, model, and serial number are required.");
      return false;
    }
    return true;
  }

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    setError("");
    setStep((s) => s + 1);
  }

  function handleBack() {
    setError("");
    setStep((s) => s - 1);
  }

  function handleSubmit() {
    if (!validateStep1()) return;
    setError("");
    const selectedBranch = branches.find((b) => b.id === form.branchId);
    onSubmit({ ...form, branch: selectedBranch?.name || form.branchId });
  }

  const footer = (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
      <button
        onClick={step === 1 ? onClose : handleBack}
        style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}
      >
        {step === 1 ? "Cancel" : "← Back"}
      </button>
      {step < maxSteps ? (
        <button onClick={handleNext} style={{ border: "none", background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>
          Next →
        </button>
      ) : (
        <button onClick={handleSubmit} style={{ border: "none", background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>
          Add Device
        </button>
      )}
    </div>
  );

  return (
    <Modal title="Add New Device" subtitle="Register a new device into inventory." onClose={onClose} width={600} footer={footer}>
      <StepIndicator current={step} labels={stepLabels} />

      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>{error}</div>
      )}

      {/* ── Step 1: Basic Info ──────────────────────────────── */}
      {step === 1 && (
        <>
          <FormField label="Category">
            <SearchableDropdown
              options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              value={form.category}
              onChange={(val) => { set("category", val); setStep(1); }}
              placeholder="Select category…"
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Brand *">
              <input value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Dell, HP, Canon" style={inputStyle} />
            </FormField>
            <FormField label="Model / Part No. *">
              <input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. XPS 15 9530" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Serial Number *">
              <input value={form.serial} onChange={(e) => set("serial", e.target.value)} placeholder="e.g. SN-882-X90" style={inputStyle} />
            </FormField>
            <FormField label="Status">
              <SearchableDropdown
                options={STATUSES.map((s) => ({ value: s, label: s }))}
                value={form.status}
                onChange={(val) => set("status", val)}
                placeholder="Select status…"
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Branch / Location">
              <SearchableDropdown
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                value={form.branchId}
                onChange={(val) => set("branchId", val)}
                placeholder="— Select branch —"
              />
            </FormField>
            <FormField label="Delivery Date">
              <input type="date" value={form.deliveryDate} onChange={(e) => set("deliveryDate", e.target.value)} style={inputStyle} />
            </FormField>
          </div>

          <FormField label="Description">
            <input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional notes" style={inputStyle} />
          </FormField>
        </>
      )}

      {/* ── Step 2 (PC): Specifications ─────────────────────── */}
      {step === 2 && isPC && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="PC Type">
              <SearchableDropdown
                options={PC_TYPES.map((t) => ({ value: t, label: t }))}
                value={form.pcType}
                onChange={(val) => set("pcType", val)}
                placeholder="Select type…"
              />
            </FormField>
            <FormField label="Processor">
              <input value={form.processor} onChange={(e) => set("processor", e.target.value)} placeholder="e.g. Intel i7-1365U" style={inputStyle} />
            </FormField>
            <FormField label="Memory (RAM)">
              <input value={form.memoryRam} onChange={(e) => set("memoryRam", e.target.value)} placeholder="e.g. 16 GB DDR5" style={inputStyle} />
            </FormField>
            <FormField label="Storage">
              <input value={form.hardDisk} onChange={(e) => set("hardDisk", e.target.value)} placeholder="e.g. 512 GB SSD NVMe" style={inputStyle} />
            </FormField>
          </div>

          {needsMonitor && (
            <>
              <SectionHeader title="Monitor" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FormField label="Monitor Brand">
                  <input value={form.monitorBrand} onChange={(e) => set("monitorBrand", e.target.value)} placeholder="e.g. Dell, LG" style={inputStyle} />
                </FormField>
                <FormField label="Monitor Model">
                  <input value={form.monitorModel} onChange={(e) => set("monitorModel", e.target.value)} placeholder="e.g. U2722D" style={inputStyle} />
                </FormField>
                <FormField label="Screen Size (inches)">
                  <input type="number" value={form.monitorInches} onChange={(e) => set("monitorInches", e.target.value)} placeholder="e.g. 27" style={inputStyle} />
                </FormField>
                <FormField label="Monitor Serial No.">
                  <input value={form.monitorSerial} onChange={(e) => set("monitorSerial", e.target.value)} placeholder="e.g. CN-0XXXX" style={inputStyle} />
                </FormField>
              </div>
            </>
          )}
        </>
      )}

      {/* ── Step 3 (PC): Peripherals ────────────────────────── */}
      {step === 3 && isPC && (
        <>
          <SectionHeader title="Keyboard" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FormField label="Brand">
              <input value={form.keyboardBrand} onChange={(e) => set("keyboardBrand", e.target.value)} placeholder="e.g. Logitech" style={inputStyle} />
            </FormField>
            <FormField label="Model">
              <input value={form.keyboardModel} onChange={(e) => set("keyboardModel", e.target.value)} placeholder="e.g. MX Keys" style={inputStyle} />
            </FormField>
            <FormField label="Serial No.">
              <input value={form.keyboardSerial} onChange={(e) => set("keyboardSerial", e.target.value)} style={inputStyle} />
            </FormField>
          </div>

          <SectionHeader title="Mouse" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FormField label="Brand">
              <input value={form.mouseBrand} onChange={(e) => set("mouseBrand", e.target.value)} placeholder="e.g. Logitech" style={inputStyle} />
            </FormField>
            <FormField label="Model">
              <input value={form.mouseModel} onChange={(e) => set("mouseModel", e.target.value)} placeholder="e.g. MX Master 3" style={inputStyle} />
            </FormField>
            <FormField label="Serial No.">
              <input value={form.mouseSerial} onChange={(e) => set("mouseSerial", e.target.value)} style={inputStyle} />
            </FormField>
          </div>

          <SectionHeader title="Bag (optional)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Brand">
              <input value={form.bagBrand} onChange={(e) => set("bagBrand", e.target.value)} placeholder="e.g. Samsonite" style={inputStyle} />
            </FormField>
            <FormField label="Description">
              <input value={form.bagModelDescription} onChange={(e) => set("bagModelDescription", e.target.value)} placeholder={'e.g. 15.6" Laptop Bag'} style={inputStyle} />
            </FormField>
          </div>
        </>
      )}

      {/* ── Step 2 (Monitor): Display Specs ────────────────── */}
      {step === 2 && isMonitor && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Part Number">
              <input value={form.partNumber} onChange={(e) => set("partNumber", e.target.value)} placeholder="e.g. LU27B550YKEXXE" style={inputStyle} />
            </FormField>
            <FormField label="Screen Size">
              <SearchableDropdown
                options={MONITOR_SIZES.map((s) => ({ value: `${s} Inch`, label: `${s}"` }))}
                value={form.inches}
                onChange={(val) => set("inches", val)}
                placeholder="— Select size —"
              />
            </FormField>
            <FormField label="Color">
              <input value={form.devColor} onChange={(e) => set("devColor", e.target.value)} placeholder="e.g. Black, Silver" style={inputStyle} />
            </FormField>
            <FormField label="Location Details">
              <input value={form.locationDetails} onChange={(e) => set("locationDetails", e.target.value)} placeholder="e.g. Conference Room B" style={inputStyle} />
            </FormField>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            <FormField label="Meeting Room / TV">
              <div style={{ display: "flex", gap: 12, alignItems: "center", height: 38 }}>
                {[["Yes", true], ["No", false]].map(([lbl, val]) => (
                  <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    <input type="radio" name="isMeetingRoomTv" checked={form.isMeetingRoomTv === val} onChange={() => set("isMeetingRoomTv", val)} />
                    {lbl}
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="Curved Screen">
              <div style={{ display: "flex", gap: 12, alignItems: "center", height: 38 }}>
                {[["Yes", true], ["No", false]].map(([lbl, val]) => (
                  <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                    <input type="radio" name="isCurved" checked={form.isCurved === val} onChange={() => set("isCurved", val)} />
                    {lbl}
                  </label>
                ))}
              </div>
            </FormField>
          </div>
        </>
      )}

      {/* ── Step 2 (Printer): Details ───────────────────────── */}
      {step === 2 && isPrinter && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Printer Type">
              <SearchableDropdown
                options={PRINTER_TYPES.map((t) => ({ value: t, label: t }))}
                value={form.printerType}
                onChange={(val) => set("printerType", val)}
                placeholder="Select type…"
              />
            </FormField>
            <FormField label="Color">
              <SearchableDropdown
                options={PRINTER_COLORS.map((c) => ({ value: c, label: c }))}
                value={form.printerColor}
                onChange={(val) => set("printerColor", val)}
                placeholder="Select color…"
              />
            </FormField>
            <FormField label="Technology">
              <SearchableDropdown
                options={TECHNOLOGIES.map((t) => ({ value: t, label: t }))}
                value={form.technology}
                onChange={(val) => set("technology", val)}
                placeholder="Select technology…"
              />
            </FormField>
            <FormField label="Connection Type">
              <SearchableDropdown
                options={CONNECTION_TYPES.map((c) => ({ value: c, label: c }))}
                value={form.connectionType}
                onChange={(val) => set("connectionType", val)}
                placeholder="Select connection…"
              />
            </FormField>
          </div>

          <FormField label="Multifunction (print / scan / copy)">
            <div style={{ display: "flex", gap: 12, alignItems: "center", height: 38 }}>
              {[["Yes", true], ["No", false]].map(([lbl, val]) => (
                <label key={lbl} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
                  <input type="radio" name="multifunctions" checked={form.multifunctions === val} onChange={() => set("multifunctions", val)} />
                  {lbl}
                </label>
              ))}
            </div>
          </FormField>

          <SectionHeader title="Cartridge / Ink" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <FormField label="Cartridge Number">
              <input value={form.cartridgeNumber} onChange={(e) => set("cartridgeNumber", e.target.value)} placeholder="e.g. HP 305XL" style={inputStyle} />
            </FormField>
            <FormField label="Cartridge Color">
              <input value={form.cartridgeColor} onChange={(e) => set("cartridgeColor", e.target.value)} placeholder="e.g. Black, Cyan" style={inputStyle} />
            </FormField>
            <FormField label="Ink Details">
              <input value={form.inkDetails} onChange={(e) => set("inkDetails", e.target.value)} placeholder="Optional notes" style={inputStyle} />
            </FormField>
          </div>

          <SectionHeader title="Network (optional)" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Active Connection">
              <input value={form.activeConnection} onChange={(e) => set("activeConnection", e.target.value)} placeholder="e.g. Ethernet" style={inputStyle} />
            </FormField>
            <FormField label="MAC (Ethernet)">
              <input value={form.macAddressEth} onChange={(e) => set("macAddressEth", e.target.value)} placeholder="xx:xx:xx:xx:xx:xx" style={inputStyle} />
            </FormField>
            <FormField label="IP (Ethernet)">
              <input value={form.ipAddressEth} onChange={(e) => set("ipAddressEth", e.target.value)} placeholder="e.g. 192.168.1.10" style={inputStyle} />
            </FormField>
            <FormField label="MAC (Wi-Fi)">
              <input value={form.macAddressWifi} onChange={(e) => set("macAddressWifi", e.target.value)} placeholder="xx:xx:xx:xx:xx:xx" style={inputStyle} />
            </FormField>
          </div>
        </>
      )}
    </Modal>
  );
}
