// import { useState, useEffect, useRef } from "react";
// import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
// import { ENDPOINTS } from "../api/endpoints.js";
// import { Boxes, Users, Building2, Wrench, Download, Plus, RotateCcw, ChevronRight, X, MoreVertical, Settings, Trash2, AlertCircle, Pencil, Filter, Search, Laptop, ClipboardCheck } from "lucide-react";
// import { useApp } from "../context/AppContext.jsx";
// import BackButton from "../components/BackButton.jsx";
// import Card from "../components/Card.jsx";
// import StatCard from "../components/StatCard.jsx";
// import StatusPill from "../components/StatusPill.jsx";
// import CategoryIcon from "../components/CategoryIcon.jsx";
// import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
// import ConfirmDialog from "../components/ConfirmDialog.jsx";
// import Modal from "../components/Modal.jsx";
// import AddDeviceModal from "../components/AddDeviceModal.jsx";
// import FormField, { inputStyle } from "../components/FormField.jsx";
// import { Row } from "../components/Misc.jsx";
// import { NAVY, ORANGE } from "../theme.js";

// // ── field mappers ──────────────────────────────────────────────────────────────
// function normalizeStatus(s) {
//   const str = (s || "").toLowerCase().replace(/_/g, " ").trim();
//   if (str === "in stock") return "In Stock";
//   if (str === "assigned") return "Assigned";
//   if (str === "repair") return "Repair";
//   if (str === "retired") return "Retired";
//   return s || "In Stock";
// }

// function extractCategoryName(cat) {
//   if (!cat && cat !== 0) return "";
//   if (typeof cat === "object") return cat.name_en || cat.name || String(cat.id || "");
//   return String(cat);
// }

// function matchesCategory(assetCat, label) {
//   if (!assetCat) return false;
//   const a = String(assetCat).trim().toLowerCase();
//   const l = label.trim().toLowerCase();
//   // "PCs" UI label maps to "Laptops & PCs" in the API
//   const labelAliases = { "pcs": "laptops & pcs" };
//   const dk = labelAliases[l] || l;
//   return a === l || a === dk || a.includes(l) || l.includes(a);
// }

// function extractBranchInfo(raw) {
//   if (!raw) return { name: "", dept: "", sector: "" };
//   if (typeof raw === "object") {
//     const dept = raw.department
//       ? (typeof raw.department === "object" ? (raw.department.name || "") : String(raw.department))
//       : "";
//     const sector = raw.sector
//       ? (typeof raw.sector === "object" ? (raw.sector.name || "") : String(raw.sector))
//       : "";
//     return { name: raw.name_en || raw.name || "", dept, sector };
//   }
//   return { name: String(raw), dept: "", sector: "" };
// }

// function mapComputer(c) {
//   const branchInfo = extractBranchInfo(c.branch);
//   return {
//     id: String(c.id),
//     brand: c.brand || "",
//     model: c.model_or_pn || c.model || "",
//     serial: c.serial_number || c.serial || "",
//     status: normalizeStatus(c.status),
//     category: "Laptops & PCs",
//     condition: c.condition || "",
//     branch: branchInfo.name,
//     department: (typeof c.department === "object" ? c.department?.name : c.department) || branchInfo.dept || "",
//     sector: (typeof c.sector === "object" ? c.sector?.name : c.sector) || branchInfo.sector || "",
//     assignedTo: c.assigned_to || c.assignedTo || null,
//     description: c.description || "",
//     deliveryDate: c.delivery_date || "",
//     pcType: c.pc_type || "",
//     processor: c.processor || "",
//     memoryRam: c.memory_ram || "",
//     hardDisk: c.hard_disk || "",
//     monitorBrand: c.monitor_brand || null,
//     monitorModel: c.monitor_model || null,
//     monitorInches: c.monitor_inches ? String(c.monitor_inches) : null,
//     monitorSerial: c.monitor_serial || null,
//     keyboardBrand: c.keyboard_brand || null,
//     keyboardModel: c.keyboard_model || null,
//     keyboardSerial: c.keyboard_serial || null,
//     mouseBrand: c.mouse_brand || null,
//     mouseModel: c.mouse_model || null,
//     mouseSerial: c.mouse_serial || null,
//     bagBrand: c.bag_brand || null,
//     bagModelDescription: c.bag_model_or_description || null,
//   };
// }
// function mapPrinter(p) {
//   const branchInfo = extractBranchInfo(p.branch);
//   return {
//     id: String(p.id),
//     brand: p.brand || "",
//     model: p.model_or_pn || p.model || "",
//     serial: p.serial_number || p.serial || "",
//     status: normalizeStatus(p.status),
//     category: "Printers",
//     condition: p.condition || "",
//     branch: branchInfo.name,
//     department: (typeof p.department === "object" ? p.department?.name : p.department) || branchInfo.dept || "",
//     sector: (typeof p.sector === "object" ? p.sector?.name : p.sector) || branchInfo.sector || "",
//     assignedTo: p.assigned_to || null,
//     description: p.description || "",
//     deliveryDate: p.delivery_date || "",
//     multifunctions: p.multifunctions || false,
//     printerType: p.printer_type || "",
//     printerColor: p.printer_color || "",
//     connectionType: p.connection_type || "",
//     technology: p.technology || "",
//     cartridgeNumber: p.cartridge_number || "",
//     cartridgeColor: p.cartridge_color || "",
//     inkDetails: p.ink_details || "",
//     activeConnection: p.active_connection || "",
//     macAddressEth: p.mac_address_eth || null,
//     ipAddressEth: p.ip_address_eth || null,
//     macAddressWifi: p.mac_address_wifi || null,
//   };
// }
// function mapMonitor(m) {
//   const branchInfo = extractBranchInfo(m.branch);

//   return {
//     id: String(m.id),
//     brand: m.brand || "",
//     model: m.model_or_pn || m.model || "",
//     serial: m.serial_number || m.serial || "",
//     status: normalizeStatus(m.status),
//     category: "Monitors",
//     condition: m.condition || "",

//     branch: branchInfo.name,
//     department:
//       (typeof m.department === "object"
//         ? m.department?.name
//         : m.department) ||
//       branchInfo.dept ||
//       "",
//     sector:
//       (typeof m.sector === "object"
//         ? m.sector?.name
//         : m.sector) ||
//       branchInfo.sector ||
//       "",

//     assignedTo: m.assigned_to || null,

//     description: m.description || "",
//     deliveryDate: m.delivery_date || "",

//     monitorType: m.monitor_type || "",
//     monitorSize: m.monitor_size || "",
//     resolution: m.resolution || "",
//     refreshRate: m.refresh_rate || "",
//     panelType: m.panel_type || "",
//     ports: m.ports || "",
//   };
// }
// function mapTablet(t) {
//   const branchInfo = extractBranchInfo(t.branch);

//   return {
//     id: String(t.id),
//     brand: t.brand || "",
//     model: t.model_or_pn || t.model || "",
//     serial: t.serial_number || t.serial || "",
//     status: normalizeStatus(t.status),
//     category: "Tablets",
//     condition: t.condition || "",

//     branch: branchInfo.name,
//     department:
//       (typeof t.department === "object"
//         ? t.department?.name
//         : t.department) ||
//       branchInfo.dept ||
//       "",
//     sector:
//       (typeof t.sector === "object"
//         ? t.sector?.name
//         : t.sector) ||
//       branchInfo.sector ||
//       "",

//     assignedTo: t.assigned_to || null,

//     description: t.description || "",
//     deliveryDate: t.delivery_date || "",

//     screenSize: t.screen_size || "",
//     storage: t.storage || "",
//     ram: t.ram || "",
//     operatingSystem: t.operating_system || "",
//     simSupport: t.sim_support || false,
//     imei: t.imei || "",
//   };
// }
// function mapHardwareAsset(a) {
//   if (a.pc_type !== undefined) return mapComputer(a);
//   if (a.printer_type !== undefined) return mapPrinter(a);
//   if (a.monitor_type !== undefined) return mapMonitor(a);
//   if (a.tablet_type !== undefined) return mapTablet(a);
//   const branchInfo = extractBranchInfo(a.branch);
//   return {
//     id: String(a.id),
//     brand: a.brand || "",
//     model: a.model_or_pn || a.model || "",
//     serial: a.serial_number || a.serial || "",
//     status: normalizeStatus(a.status),
//     category: extractCategoryName(a.category),
//     condition: a.condition || "",
//     branch: branchInfo.name,
//     department: (typeof a.department === "object" ? a.department?.name : a.department) || branchInfo.dept || "",
//     sector: (typeof a.sector === "object" ? a.sector?.name : a.sector) || branchInfo.sector || "",
//     assignedTo: a.assigned_to || null,
//     description: a.description || "",
//     deliveryDate: a.delivery_date || "",
//   };
// }
// // ──────────────────────────────────────────────────────────────────────────────

// function AssetAdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
//   const ref = useRef(null);
//   useEffect(() => {
//     function handleOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) onClose();
//     }
//     document.addEventListener("mousedown", handleOutside);
//     return () => document.removeEventListener("mousedown", handleOutside);
//   }, [onClose]);

//   return (
//     <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", border: "1px solid #eef0f3", borderRadius: 12, boxShadow: "0 12px 32px rgba(15,23,42,0.12)", width: 270, padding: 18, zIndex: 60 }}>
//       <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
//         <Settings size={14} color="#475569" />
//         <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Advanced Settings</div>
//       </div>
//       <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #eef0f3" }}>
//         <input type="checkbox" checked={deleteEnabled} onChange={(e) => setDeleteEnabled(e.target.checked)} style={{ marginTop: 2, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
//         <div>
//           <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Allow asset deletion</div>
//           <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{deleteEnabled ? "Deletion is currently enabled." : "Check to allow deleting assets."}</div>
//         </div>
//       </label>
//     </div>
//   );
// }

// const INVENTORY_CATEGORIES = ["PCs", "Monitors", "Printers", "Networking", "Peripherals"];
// const CATEGORY_LABEL_TO_DATA = { "PCs": "Laptops & PCs" };
// function categoryDataKey(label) {
//   return CATEGORY_LABEL_TO_DATA[label] || label;
// }

// function assetToApiBody(form, isComputer, isPrinter) {
//   const base = {
//     brand: form.brand || "",
//     model_or_pn: form.model || "",
//     serial_number: form.serial || "",
//     status: form.status || "In Stock",
//     description: form.description || "",
//   };
//   if (isComputer) return { ...base, pc_type: form.pcType || "", processor: form.processor || "", memory_ram: form.memoryRam || "", hard_disk: form.hardDisk || "" };
//   if (isPrinter) return { ...base, printer_type: form.printerType || "", printer_color: form.printerColor || "", technology: form.technology || "", connection_type: form.connectionType || "" };
//   return base;
// }

// // ── Asset Edit Modal ───────────────────────────────────────────────────────────
// function AssetEditModal({ asset, onClose, onSubmit }) {
//   const isComputer = asset.category === "Laptops & PCs";
//   const isPrinter = asset.category === "Printers";
//   const [form, setForm] = useState({
//     brand: asset.brand || "",
//     model: asset.model || "",
//     serial: asset.serial || "",
//     status: asset.status || "In Stock",
//     description: asset.description || "",
//     pcType: asset.pcType || "",
//     processor: asset.processor || "",
//     memoryRam: asset.memoryRam || "",
//     hardDisk: asset.hardDisk || "",
//     printerType: asset.printerType || "",
//     printerColor: asset.printerColor || "",
//     technology: asset.technology || "",
//     connectionType: asset.connectionType || "",
//   });

//   return (
//     <Modal title="Edit Asset" onClose={onClose} footer={
//       <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
//         <button onClick={onClose} style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
//         <button onClick={() => onSubmit(form)} style={{ border: "none", background: NAVY, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>Save Changes</button>
//       </div>
//     }>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
//         <FormField label="Brand">
//           <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} style={inputStyle} />
//         </FormField>
//         <FormField label="Model / Part No.">
//           <input value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} style={inputStyle} />
//         </FormField>
//         <FormField label="Serial Number">
//           <input value={form.serial} onChange={(e) => setForm((f) => ({ ...f, serial: e.target.value }))} style={inputStyle} />
//         </FormField>
//         <FormField label="Status">
//           <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} style={inputStyle}>
//             {["In Stock", "Assigned", "Repair", "Retired"].map((s) => <option key={s} value={s}>{s}</option>)}
//           </select>
//         </FormField>
//       </div>
//       <FormField label="Description">
//         <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={inputStyle} />
//       </FormField>
//       {isComputer && (
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
//           <FormField label="PC Type">
//             <input value={form.pcType} onChange={(e) => setForm((f) => ({ ...f, pcType: e.target.value }))} placeholder="e.g. Laptop, Desktop" style={inputStyle} />
//           </FormField>
//           <FormField label="Processor">
//             <input value={form.processor} onChange={(e) => setForm((f) => ({ ...f, processor: e.target.value }))} style={inputStyle} />
//           </FormField>
//           <FormField label="Memory (RAM)">
//             <input value={form.memoryRam} onChange={(e) => setForm((f) => ({ ...f, memoryRam: e.target.value }))} placeholder="e.g. 16 GB" style={inputStyle} />
//           </FormField>
//           <FormField label="Storage">
//             <input value={form.hardDisk} onChange={(e) => setForm((f) => ({ ...f, hardDisk: e.target.value }))} placeholder="e.g. 512 GB SSD" style={inputStyle} />
//           </FormField>
//         </div>
//       )}
//       {isPrinter && (
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
//           <FormField label="Printer Type">
//             <input value={form.printerType} onChange={(e) => setForm((f) => ({ ...f, printerType: e.target.value }))} style={inputStyle} />
//           </FormField>
//           <FormField label="Color">
//             <input value={form.printerColor} onChange={(e) => setForm((f) => ({ ...f, printerColor: e.target.value }))} style={inputStyle} />
//           </FormField>
//           <FormField label="Technology">
//             <input value={form.technology} onChange={(e) => setForm((f) => ({ ...f, technology: e.target.value }))} style={inputStyle} />
//           </FormField>
//           <FormField label="Connection">
//             <input value={form.connectionType} onChange={(e) => setForm((f) => ({ ...f, connectionType: e.target.value }))} style={inputStyle} />
//           </FormField>
//         </div>
//       )}
//     </Modal>
//   );
// }

// export default function Inventory() {
//   const { inventoryStatusFilter, setInventoryStatusFilter, goBack, navigateTo, setInventoryCategory } = useApp();
//   const [mainFilter, setMainFilter] = useState("All");

//   function openCategory(label) {
//     setInventoryCategory(label);
//     navigateTo("inventoryCategory");
//   }

//   if (inventoryStatusFilter) {
//     return <InventoryStatusView statusFilter={inventoryStatusFilter} onClearFilter={() => setInventoryStatusFilter(null)} onBack={goBack} />;
//   }

//   return (
//     <div style={{ padding: 28 }}>
//       <BackButton onClick={() => goBack()} />
//       <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>Assets</div>
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
//         <div style={{ fontSize: 13.5, color: "#94a3b8" }}>Choose a category to view and manage its assets.</div>
//         {/* <div style={{ display: "flex", gap: 6 }}>
//           {["All", "Assigned", "Unassigned"].map((f) => (
//             <button key={f} onClick={() => setMainFilter(f)} style={{ border: mainFilter === f ? "none" : "1px solid #eef0f3", borderRadius: 7, padding: "7px 16px", fontWeight: 700, fontSize: 12.5, color: mainFilter === f ? "#fff" : "#475569", background: mainFilter === f ? NAVY : "#fff", cursor: "pointer" }}>
//               {f}
//             </button>
//           ))}
//         </div> */}
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
//         {INVENTORY_CATEGORIES.map((label) => {
//           const dataKey = categoryDataKey(label);
//           return (
//             <div key={label} onClick={() => openCategory(label)} style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 12, padding: 20, cursor: "pointer", transition: "box-shadow .15s, transform .15s" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
//               <div style={{ width: 38, height: 38, borderRadius: 9, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
//                 <CategoryIcon category={dataKey} size={18} />
//               </div>
//               <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>{label}</div>
//               <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Click to browse</div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function InventoryStatusView({ statusFilter, onClearFilter, onBack }) {
//   const { openAssetDetail, globalSearchQuery, setGlobalSearchQuery } = useApp();
//   const [statusAssets, setStatusAssets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showCsvPreview, setShowCsvPreview] = useState(false);

//   useEffect(() => {
//     async function fetchStatusAssets() {
//       try {
//         const [computers, printers, hardware, monitors, tablets] = await Promise.all([
//           apiGet(ENDPOINTS.get_all_computers).catch(() => []),
//           apiGet(ENDPOINTS.get_all_printers).catch(() => []),
//           apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
//           apiGet(ENDPOINTS.get_all_monitors).catch(() => []),
//           apiGet(ENDPOINTS.get_all_tablets).catch(() => []),
//         ]);
//         const all = [
//           ...(Array.isArray(computers) ? computers.map(mapComputer) : []),
//           ...(Array.isArray(printers) ? printers.map(mapPrinter) : []),
//           ...(Array.isArray(hardware) ? hardware.map(mapHardwareAsset) : []),
//           ...(Array.isArray(monitors) ? monitors.map(mapMonitor) : []),
//           ...(Array.isArray(tablets) ? tablets.map(mapTablet) : []),
//         ];
//         setStatusAssets(all.filter((a) => a.status === statusFilter));
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchStatusAssets();
//   }, [statusFilter]);

//   const query = globalSearchQuery;
//   const setQuery = setGlobalSearchQuery;

//   const filtered = statusAssets.filter(
//     (a) => query === "" ||
//       a.model.toLowerCase().includes(query.toLowerCase()) ||
//       a.serial.toLowerCase().includes(query.toLowerCase()) ||
//       a.id.toLowerCase().includes(query.toLowerCase()) ||
//       a.brand.toLowerCase().includes(query.toLowerCase())
//   );

//   const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
//   const csvRows = filtered.map((a) => ({ BRAND: a.brand, MODEL: a.model, "SERIAL NUMBER": a.serial, STATUS: a.status, BRANCH: a.branch }));
//   const csvFilename = `inventory_${statusFilter.toLowerCase().replace(/\s+/g, "_")}.csv`;

//   return (
//     <div style={{ padding: 28 }}>
//       <BackButton onClick={onBack} />
//       <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
//         Assets &gt; Status: {statusFilter}
//         <button onClick={onClearFilter} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "#fef3e2", color: ORANGE, fontWeight: 700, fontSize: 11, padding: "3px 8px", borderRadius: 999, cursor: "pointer" }}>
//           Clear filter <X size={11} />
//         </button>
//       </div>
//       <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 20 }}>Assets</div>
//       <Card style={{ padding: 0 }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
//           <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by brand, model, serial, or asset ID..." style={{ border: "1px solid #eef0f3", borderRadius: 7, padding: "8px 12px", fontSize: 13, width: 320, outline: "none" }} />
//           <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//             <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{loading ? "Loading…" : `Showing ${filtered.length} of ${statusAssets.length} items`}</div>
//             <button onClick={() => setShowCsvPreview(true)} style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", fontWeight: 700, fontSize: 12.5, color: "#475569", background: "#fff", cursor: "pointer" }}>
//               <Download size={13} /> Export
//             </button>
//           </div>
//         </div>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#f8fafc", textAlign: "left" }}>
//               {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH", ""].map((h) => (
//                 <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.3, borderBottom: "1px solid #eef0f3" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading assets…</td></tr>
//             ) : filtered.map((a) => (
//               <tr key={a.id} onClick={() => openAssetDetail(a.id, a.category)} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
//                 <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
//                 <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
//                 <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
//                 <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
//                 <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.branch}</td>
//                 <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
//               </tr>
//             ))}
//             {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No assets match your search.</td></tr>}
//           </tbody>
//         </table>
//       </Card>
//       {showCsvPreview && <CsvPreviewModal onClose={() => setShowCsvPreview(false)} rows={csvRows} headers={csvHeaders} filename={csvFilename} />}
//     </div>
//   );
// }

// export function InventoryCategoryPage() {
//   const {
//     inventoryCategory,
//     globalSearchQuery, setGlobalSearchQuery,
//     goBack,
//     openAssetDetail,
//     showAddDeviceModal, setShowAddDeviceModal,
//     deleteAssetEnabled, setDeleteAssetEnabled,
//   } = useApp();

//   const [showCsvPreview, setShowCsvPreview] = useState(false);
//   const [pendingDeleteId, setPendingDeleteId] = useState(null);
//   const [showDeleteError, setShowDeleteError] = useState(false);
//   const [showAdvanced, setShowAdvanced] = useState(false);
//   const [assignmentFilter, setAssignmentFilter] = useState("All");

//   const [apiAssets, setApiAssets] = useState(null);
//   const [apiLoading, setApiLoading] = useState(true);
//   const [apiError, setApiError] = useState(null);

//   const label = inventoryCategory || INVENTORY_CATEGORIES[0];
//   const dataKey = categoryDataKey(label);

//   useEffect(() => {
//     setApiAssets(null);
//     setApiLoading(true);
//     setApiError(null);

//     async function fetchByCategory() {
//       try {
//         if (label === "PCs") {
//           const data = await apiGet(ENDPOINTS.get_all_computers);
//           setApiAssets(data.map(mapComputer));
//         } else if (label === "Printers") {
//           const data = await apiGet(ENDPOINTS.get_all_printers);
//           setApiAssets(data.map(mapPrinter));
//         } else {
//           const data = await apiGet(ENDPOINTS.get_all_hardware_assets);
//           setApiAssets(data.filter((a) => a.category === dataKey).map(mapHardwareAsset));
//         }
//       } catch {
//         setApiError("Could not reach the server.");
//         setApiAssets([]);
//       } finally {
//         setApiLoading(false);
//       }
//     }
//     fetchByCategory();
//   }, [label, dataKey]);

//   const query = globalSearchQuery;
//   const setQuery = setGlobalSearchQuery;

//   const scopeBase = apiAssets || [];

//   const filtered = scopeBase.filter((a) => {
//     const matchesSearch = query === "" || a.model.toLowerCase().includes(query.toLowerCase()) || a.serial.toLowerCase().includes(query.toLowerCase()) || a.id.toLowerCase().includes(query.toLowerCase()) || a.brand.toLowerCase().includes(query.toLowerCase());
//     const matchesAssignment = assignmentFilter === "All" ? true : assignmentFilter === "Assigned" ? a.status === "Assigned" : a.status !== "Assigned";
//     return matchesSearch && matchesAssignment;
//   });

//   const total = scopeBase.length;
//   const assigned = scopeBase.filter((a) => a.status === "Assigned").length;
//   const inStock = scopeBase.filter((a) => a.status === "In Stock").length;
//   const repair = scopeBase.filter((a) => a.status === "Repair").length;

//   async function handleAddDeviceSubmit(form) {
//     try {
//       let body;
//       let endpoint;
//       const branchVal = form.branchId || form.branch || null;
//       const statusVal = form.status || "In Stock";
//       if (label === "PCs" || form.category === "Laptops & PCs") {
//         body = {
//           brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
//           branch: branchVal, status: statusVal,
//           description: form.description || "", delivery_date: form.deliveryDate || null,
//           pc_type: form.pcType || "Laptop",
//           processor: form.processor || "", memory_ram: form.memoryRam || "", hard_disk: form.hardDisk || "",
//           monitor_brand: form.monitorBrand || null, monitor_model: form.monitorModel || null,
//           monitor_screen_size_in_inches: form.monitorInches ? Number(form.monitorInches) : null,
//           monitor_serial_number: form.monitorSerial || null,
//           keyboard_brand: form.keyboardBrand || null, keyboard_model: form.keyboardModel || null,
//           keyboard_serial_number: form.keyboardSerial || null,
//           mouse_brand: form.mouseBrand || null, mouse_model: form.mouseModel || null,
//           mouse_serial_number: form.mouseSerial || null,
//           bag_brand: form.bagBrand || null, bag_model_or_description: form.bagModelDescription || null,
//         };
//         endpoint = ENDPOINTS.post_new_computer;
//       } else if (label === "Printers" || form.category === "Printers") {
//         body = {
//           brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
//           branch: branchVal, status: statusVal,
//           description: form.description || "", delivery_date: form.deliveryDate || null,
//           printer_type: form.printerType || "", printer_color: form.printerColor || "",
//           technology: form.technology || "", connection_type: form.connectionType || "",
//           multifunctions: !!form.multifunctions,
//           cartridge_number: form.cartridgeNumber || "", cartridge_color: form.cartridgeColor || "",
//           ink_details: form.inkDetails || "",
//           active_connection: form.activeConnection || "",
//           mac_address_eth: form.macAddressEth || null, ip_address_eth: form.ipAddressEth || null,
//           mac_address_wifi: form.macAddressWifi || null,
//         };
//         endpoint = ENDPOINTS.post_printer;
//       } else if (label === "Monitors" || form.category === "Monitors") {
//         body = {
//           brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
//           branch: branchVal, status: statusVal,
//           description: form.description || "", delivery_date: form.deliveryDate || null,
//           part_number: form.partNumber || null,
//           inches: form.inches || null,
//           color: form.devColor || null,
//           location_details: form.locationDetails || null,
//           is_meeting_room_tv: !!form.isMeetingRoomTv,
//           is_curved: !!form.isCurved,
//         };
//         endpoint = ENDPOINTS.post_new_monitor;
//       } else {
//         body = {
//           brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
//           branch: branchVal, status: statusVal, category: form.category || label,
//           description: form.description || "", delivery_date: form.deliveryDate || null,
//         };
//         endpoint = ENDPOINTS.post_new_hardware_asset;
//       }
//       const created = await apiPost(endpoint, body);
//       const mapped = (label === "PCs" || form.category === "Laptops & PCs") ? mapComputer(created)
//         : (label === "Printers" || form.category === "Printers") ? mapPrinter(created)
//         : mapHardwareAsset(created);
//       setApiAssets((prev) => [mapped, ...(prev || [])]);
//     } catch {
//       setApiError("Failed to add device. Please check your connection.");
//     }
//     setShowAddDeviceModal(false);
//   }

//   async function handleDeleteAsset(id) {
//     try {
//       if (label === "PCs") await apiDelete(ENDPOINTS.delete_computer(id));
//       else if (label === "Printers") await apiDelete(ENDPOINTS.delete_printer(id));
//       else await apiDelete(ENDPOINTS.delete_hardware_asset(id));
//       setApiAssets((prev) => prev ? prev.filter((a) => a.id !== id) : null);
//     } catch {
//       setApiError("Failed to delete asset. Please try again.");
//     }
//     setPendingDeleteId(null);
//   }

//   const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
//   const csvRows = filtered.map((a) => ({ BRAND: a.brand, MODEL: a.model, "SERIAL NUMBER": a.serial, STATUS: a.status, BRANCH: a.branch }));
//   const csvFilename = `inventory_${label.toLowerCase().replace(/\s+/g, "_")}.csv`;

//   return (
//     <div style={{ padding: 28 }}>
//       <BackButton onClick={() => goBack()} />
//       {apiError && <div style={{ background: "#fef9f0", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#92400e", marginBottom: 14 }}>{apiError}</div>}
//       <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>Assets &gt; {label}</div>
//       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//           <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
//             <CategoryIcon category={dataKey} size={16} />
//           </div>
//           <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{label}</div>
//         </div>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           <button onClick={() => setShowCsvPreview(true)} style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #eef0f3", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#475569", background: "#fff", cursor: "pointer" }}>
//             <Download size={14} /> Export CSV
//           </button>
//           <button onClick={() => setShowAddDeviceModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#fff", background: NAVY, cursor: "pointer" }}>
//             <Plus size={14} /> Add Device
//           </button>
//           <div style={{ position: "relative" }}>
//             <button onClick={() => setShowAdvanced((s) => !s)} title="Advanced Settings" style={{ border: `1px solid ${deleteAssetEnabled ? "#fecaca" : "#eef0f3"}`, borderRadius: 8, padding: 0, height: 38, width: 38, display: "flex", alignItems: "center", justifyContent: "center", background: showAdvanced ? "#f1f5f9" : deleteAssetEnabled ? "#fff5f5" : "#fff", cursor: "pointer", color: deleteAssetEnabled ? "#dc2626" : "#475569" }}>
//               <MoreVertical size={14} />
//             </button>
//             {showAdvanced && <AssetAdvancedSettingsPopover deleteEnabled={deleteAssetEnabled} setDeleteEnabled={setDeleteAssetEnabled} onClose={() => setShowAdvanced(false)} />}
//           </div>
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
//         <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="TOTAL MANAGED" value={total} />
//         <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="ASSIGNED" value={assigned} sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>{total ? Math.round((assigned / total) * 100) : 0}% util</div>} />
//         <StatCard icon={<Building2 size={17} color="#475569" />} iconBg="#e2e8f0" label="IN STOCK" value={inStock} />
//         <StatCard icon={<Wrench size={17} color="#dc2626" />} iconBg="#fee2e2" label="IN REPAIR" value={repair} danger sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Pending fix</div>} />
//       </div>

//       <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
//           <Filter size={12} color="#94a3b8" />
//           <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textTransform: "uppercase" }}>Filter</span>
//         </div>
//         <div style={{ width: 1, height: 16, background: "#e2e8f0", flexShrink: 0 }} />
//         {["All", "Assigned", "Unassigned"].map((f) => (
//           <button key={f} onClick={() => setAssignmentFilter(f)} style={{ border: assignmentFilter === f ? "none" : "1px solid #eef0f3", borderRadius: 7, padding: "7px 16px", fontWeight: 700, fontSize: 12.5, color: assignmentFilter === f ? "#fff" : "#475569", background: assignmentFilter === f ? NAVY : "#fff", cursor: "pointer" }}>
//             {f}
//           </button>
//         ))}
//         <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", background: "#fff" }}>
//           <Search size={13} color="#94a3b8" />
//           <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search brand, model, serial…" style={{ border: "none", outline: "none", fontSize: 13, width: 220, background: "transparent" }} />
//         </div>
//       </div>

//       <Card style={{ padding: 0 }}>
//         <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #eef0f3" }}>
//           <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{apiLoading ? "Loading…" : `${filtered.length} of ${scopeBase.length} items`}</div>
//         </div>
//         <table style={{ width: "100%", borderCollapse: "collapse" }}>
//           <thead>
//             <tr style={{ background: "#f8fafc", textAlign: "left" }}>
//               {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "", ""].map((h) => (
//                 <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.3, borderBottom: "1px solid #eef0f3" }}>{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {apiLoading ? (
//               <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading assets…</td></tr>
//             ) : filtered.map((a) => (
//               <tr key={a.id} onClick={() => openAssetDetail(a.id, inventoryCategory)} style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
//                 <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
//                 <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
//                 <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
//                 <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
//                 <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.assignedTo || "—"}</td>
//                 <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
//                 <td style={{ padding: "14px 20px" }}>
//                   <button onClick={(e) => { e.stopPropagation(); if (!deleteAssetEnabled) { setShowDeleteError(true); return; } setPendingDeleteId(a.id); }} title="Delete asset" style={{ border: "none", background: "none", cursor: "pointer", color: "#fca5a5" }}>
//                     <Trash2 size={15} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {!apiLoading && filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No assets match your search in this category.</td></tr>}
//           </tbody>
//         </table>
//       </Card>

//       {showCsvPreview && <CsvPreviewModal onClose={() => setShowCsvPreview(false)} rows={csvRows} headers={csvHeaders} filename={csvFilename} />}
//       {pendingDeleteId && <ConfirmDialog title="Delete Asset" message="Are you sure you want to permanently delete this asset? This cannot be undone." confirmLabel="Delete Asset" onConfirm={() => handleDeleteAsset(pendingDeleteId)} onCancel={() => setPendingDeleteId(null)} />}
//       {showDeleteError && (
//         <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
//           <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
//             <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><AlertCircle size={18} color="#dc2626" /></div>
//             <div>
//               <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Asset deletion is not enabled</div>
//               <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>Open <strong>Advanced Settings</strong> (⋮ button in the toolbar) and enable asset deletion to proceed.</div>
//             </div>
//           </div>
//           <div style={{ display: "flex", justifyContent: "flex-end" }}>
//             <button onClick={() => setShowDeleteError(false)} style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>Got it</button>
//           </div>
//         </Modal>
//       )}
//       {showAddDeviceModal && <AddDeviceModal onClose={() => setShowAddDeviceModal(false)} onSubmit={handleAddDeviceSubmit} />}
//     </div>
//   );
// }

// function DetailSection({ title, children }) {
//   return (
//     <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
//       <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 12, textTransform: "uppercase" }}>{title}</div>
//       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>
//     </div>
//   );
// }


// function normalizeHistory(data) {
//   return Array.isArray(data) ? data : data?.results || [];
// }

// function getEmployeeFromHistory(h) {
//   if (!h) return null;

//   if (h.employee_name) return h.employee_name;
//   if (h.employee_code) return h.employee_code;

//   if (typeof h.employee === "object") {
//     return (
//       h.employee.employee_name_en ||
//       h.employee.name_en ||
//       h.employee.name ||
//       h.employee.employee_code ||
//       null
//     );
//   }

//   if (typeof h.employee === "string") return h.employee;

//   return null;
// }

// function getLatestAssignedEmployee(history) {
//   const latestAssign = history.find((h) => {
//     const type = String(h.action || h.type || "").toLowerCase();
//     return type.includes("assign");
//   });

//   return getEmployeeFromHistory(latestAssign);
// }

// export function AssetDetailPage() {
//   const { selectedAssetId, selectedAssetType, goBack } = useApp();

//   const [pendingReturnId, setPendingReturnId] = useState(null);
//   const [apiAsset, setApiAsset] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(true);
//   const [showEdit, setShowEdit] = useState(false);
//   const [assetHistory, setAssetHistory] = useState([]);
//   const [historyLoading, setHistoryLoading] = useState(false);

//   useEffect(() => {
//     if (!selectedAssetId) return;

//     setDetailLoading(true);
//     setHistoryLoading(true);

//     async function fetchAll() {
//       try {
//         let endpoint;
//         const typeStr = (selectedAssetType || "").toLowerCase();

//         if (typeStr === "pcs" || typeStr === "laptops & pcs") {
//           endpoint = ENDPOINTS.get_computer_by_id(selectedAssetId);
//         } else if (typeStr === "printers") {
//           endpoint = ENDPOINTS.get_printer_by_id(selectedAssetId);
//         } else if (typeStr === "monitors") {
//           endpoint = ENDPOINTS.get_monitor_by_id(selectedAssetId);
//         } else {
//           endpoint = ENDPOINTS.get_hardware_asset_by_id(selectedAssetId);
//         }

//         const data = await apiGet(endpoint);
//         const mapped = mapHardwareAsset(data);

//         if (mapped.serial) {
//           let currentAssignedEmployee = null;

//           try {
//             const assignedData = await apiGet(
//               ENDPOINTS.get_assigned_employee_by_serial(mapped.serial)
//             );

//             currentAssignedEmployee =
//               assignedData.employee_name_en ||
//               assignedData.employee_name_ar ||
//               assignedData.employee_code ||
//               null;
//           } catch {
//             currentAssignedEmployee = null;
//           }

//           try {
//             const hist = await apiGet(
//               ENDPOINTS.history_to_track_assets_by_serial(mapped.serial)
//             );

//             const normalizedHistory = normalizeHistory(hist);
//             setAssetHistory(normalizedHistory);
//           } catch {
//             setAssetHistory([]);
//           }

//           setApiAsset({
//             ...mapped,
//             assignedTo: currentAssignedEmployee,
//           });
//         } else {
//           setAssetHistory([]);
//           setApiAsset(mapped);
//         }
//       } catch {
//         setApiAsset(null);
//       } finally {
//         setDetailLoading(false);
//         setHistoryLoading(false);
//       }
//     }

//     fetchAll();
//   }, [selectedAssetId, selectedAssetType]);

//   const asset = apiAsset;

//   async function handleEditSubmit(form) {
//     const isComputer = asset.category === "Laptops & PCs";
//     const isPrinter = asset.category === "Printers";

//     try {
//       const body = assetToApiBody(form, isComputer, isPrinter);
//       let updated;

//       if (isComputer) {
//         updated = await apiPatch(ENDPOINTS.update_computer(asset.id), body);
//       } else if (isPrinter) {
//         updated = await apiPatch(ENDPOINTS.update_printer(asset.id), body);
//       } else {
//         updated = await apiPatch(ENDPOINTS.update_hardware_asset(asset.id), body);
//       }

//       setApiAsset(mapHardwareAsset(updated));
//     } catch {
//       setApiAsset((prev) => ({ ...(prev || asset), ...form }));
//     }

//     setShowEdit(false);
//   }

//   async function handleReturnToStock(id) {
//     try {
//       const body = { status: "In Stock" };

//       if (asset.category === "Laptops & PCs") {
//         await apiPatch(ENDPOINTS.update_computer(id), body);
//       } else if (asset.category === "Printers") {
//         await apiPatch(ENDPOINTS.update_printer(id), body);
//       } else {
//         await apiPatch(ENDPOINTS.update_hardware_asset(id), body);
//       }

//       setApiAsset((prev) =>
//         prev ? { ...prev, status: "In Stock", assignedTo: null } : null
//       );
//     } catch {
//       // ignore
//     }

//     setPendingReturnId(null);
//   }

//   if (!detailLoading && !asset) {
//     return (
//       <div style={{ padding: 60, textAlign: "center" }}>
//         <Boxes size={36} color="#cbd5e1" />
//         <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>
//           Asset not found.
//         </div>
//         <button
//           onClick={() => goBack()}
//           style={{
//             marginTop: 16,
//             background: ORANGE,
//             color: "#fff",
//             border: "none",
//             borderRadius: 8,
//             padding: "10px 20px",
//             fontWeight: 700,
//             fontSize: 13,
//             cursor: "pointer",
//           }}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   if (detailLoading && !asset) {
//     return (
//       <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
//         Loading asset details…
//       </div>
//     );
//   }

//   const isComputer = asset.category === "Laptops & PCs";
//   const isPrinter = asset.category === "Printers";

//   return (
//     <div style={{ padding: 28, maxWidth: 820 }}>
//       <BackButton onClick={() => goBack()} />

//       <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
//         <div
//           style={{
//             width: 52,
//             height: 52,
//             borderRadius: 12,
//             background: "#e2e8f0",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <CategoryIcon category={asset.category} size={24} />
//         </div>

//         <div>
//           <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
//             {asset.brand} {asset.model}
//           </div>
//           <div style={{ fontSize: 13, color: "#94a3b8" }}>
//             SN: {asset.serial}
//           </div>
//         </div>

//         <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
//           <button
//             onClick={() => setShowEdit(true)}
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 6,
//               border: "1px solid #eef0f3",
//               background: "#fff",
//               color: "#475569",
//               fontWeight: 700,
//               fontSize: 12.5,
//               padding: "8px 14px",
//               borderRadius: 8,
//               cursor: "pointer",
//             }}
//           >
//             <Pencil size={13} /> Edit
//           </button>

//           <StatusPill status={asset.status} />
//         </div>
//       </div>

//       <Card>
//         <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
//           Asset Details
//         </div>

//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
//           <Row label="Brand" value={asset.brand} />
//           <Row label="Model / Part No." value={asset.model} />
//           <Row label="Serial Number" value={asset.serial} />
//           <Row label="Category" value={asset.category} />
//           <Row label="Condition" value={asset.condition || "—"} />
//           <Row label="Branch / Location" value={asset.branch || "—"} />
//           {asset.department && <Row label="Department" value={asset.department} />}
//           {asset.sector && <Row label="Sector" value={asset.sector} />}
//           {asset.deliveryDate && <Row label="Delivery Date" value={asset.deliveryDate} />}
//           {asset.description && <Row label="Description" value={asset.description} />}
//         </div>

//         {isComputer && (
//           <>
//             <DetailSection title="Hardware Specifications">
//               {asset.pcType && <Row label="PC Type" value={asset.pcType} />}
//               {asset.processor && <Row label="Processor" value={asset.processor} />}
//               {asset.memoryRam && <Row label="Memory (RAM)" value={asset.memoryRam} />}
//               {asset.hardDisk && <Row label="Storage" value={asset.hardDisk} />}
//             </DetailSection>

//             {(asset.monitorBrand || asset.monitorModel) && (
//               <DetailSection title="Monitor">
//                 {asset.monitorBrand && <Row label="Brand" value={asset.monitorBrand} />}
//                 {asset.monitorModel && <Row label="Model" value={asset.monitorModel} />}
//                 {asset.monitorInches && <Row label="Size" value={`${asset.monitorInches}"`} />}
//                 {asset.monitorSerial && <Row label="Serial" value={asset.monitorSerial} />}
//               </DetailSection>
//             )}

//             {(asset.keyboardBrand || asset.mouseBrand || asset.bagBrand) && (
//               <DetailSection title="Peripherals">
//                 {asset.keyboardBrand && (
//                   <Row
//                     label="Keyboard"
//                     value={`${asset.keyboardBrand} ${asset.keyboardModel || ""}`.trim()}
//                   />
//                 )}
//                 {asset.keyboardSerial && <Row label="Keyboard Serial" value={asset.keyboardSerial} />}
//                 {asset.mouseBrand && (
//                   <Row
//                     label="Mouse"
//                     value={`${asset.mouseBrand} ${asset.mouseModel || ""}`.trim()}
//                   />
//                 )}
//                 {asset.mouseSerial && <Row label="Mouse Serial" value={asset.mouseSerial} />}
//                 {asset.bagBrand && (
//                   <Row
//                     label="Bag"
//                     value={`${asset.bagBrand} — ${asset.bagModelDescription || ""}`.trim()}
//                   />
//                 )}
//               </DetailSection>
//             )}
//           </>
//         )}

//         {isPrinter && (
//           <>
//             <DetailSection title="Printer Details">
//               {asset.printerType && <Row label="Printer Type" value={asset.printerType} />}
//               {asset.printerColor && <Row label="Color" value={asset.printerColor} />}
//               {asset.technology && <Row label="Technology" value={asset.technology} />}
//               {asset.connectionType && <Row label="Connection" value={asset.connectionType} />}
//               <Row label="Multifunction" value={asset.multifunctions ? "Yes" : "No"} />
//             </DetailSection>

//             {(asset.cartridgeNumber || asset.inkDetails) && (
//               <DetailSection title="Cartridge / Ink">
//                 {asset.cartridgeNumber && <Row label="Cartridge No." value={asset.cartridgeNumber} />}
//                 {asset.cartridgeColor && <Row label="Color" value={asset.cartridgeColor} />}
//                 {asset.inkDetails && <Row label="Ink Details" value={asset.inkDetails} />}
//               </DetailSection>
//             )}

//             {(asset.macAddressEth || asset.ipAddressEth || asset.macAddressWifi) && (
//               <DetailSection title="Network">
//                 {asset.activeConnection && <Row label="Active Connection" value={asset.activeConnection} />}
//                 {asset.macAddressEth && <Row label="MAC (Ethernet)" value={asset.macAddressEth} />}
//                 {asset.ipAddressEth && <Row label="IP (Ethernet)" value={asset.ipAddressEth} />}
//                 {asset.macAddressWifi && <Row label="MAC (Wi-Fi)" value={asset.macAddressWifi} />}
//               </DetailSection>
//             )}
//           </>
//         )}

//         <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
//           <div
//             style={{
//               fontWeight: 700,
//               fontSize: 13,
//               color: "#94a3b8",
//               letterSpacing: 0.4,
//               marginBottom: 12,
//               textTransform: "uppercase",
//             }}
//           >
//             Current Assignment
//           </div>

//           {asset.assignedTo ? (
//             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <div
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: "50%",
//                     background: "#0f172a",
//                     color: "#fff",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: 700,
//                     fontSize: 12,
//                   }}
//                 >
//                   {String(asset.assignedTo).slice(0, 2).toUpperCase()}
//                 </div>

//                 <div>
//                   <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
//                     {asset.assignedTo}
//                   </div>
//                   <div style={{ fontSize: 12, color: "#94a3b8" }}>
//                     Assigned employee
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={() => setPendingReturnId(asset.id)}
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 6,
//                   border: "1px solid #eef0f3",
//                   background: "#fff",
//                   color: "#475569",
//                   fontWeight: 700,
//                   fontSize: 12.5,
//                   padding: "8px 14px",
//                   borderRadius: 8,
//                   cursor: "pointer",
//                 }}
//               >
//                 <RotateCcw size={13} /> Return to Stock
//               </button>
//             </div>
//           ) : (
//             <div style={{ fontSize: 13, color: "#94a3b8" }}>
//               No employee assigned.
//             </div>
//           )}
//         </div>

//         <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
//           <div
//             style={{
//               fontWeight: 700,
//               fontSize: 13,
//               color: "#94a3b8",
//               letterSpacing: 0.4,
//               marginBottom: 14,
//               textTransform: "uppercase",
//             }}
//           >
//             Assignment History
//           </div>

//           {historyLoading ? (
//             <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading history…</div>
//           ) : assetHistory.length === 0 ? (
//             <div style={{ fontSize: 13, color: "#94a3b8" }}>
//               No history found for this asset.
//             </div>
//           ) : (
//             <div style={{ display: "flex", flexDirection: "column" }}>
//               {assetHistory.map((h, i) => {
//                 const type = (h.action_type || h.action || h.type || "").toLowerCase();

//                 let icon = <ClipboardCheck size={13} color="#475569" />;
//                 let bg = "#e2e8f0";

//                 if (type === "issue" || type === "assign" || type === "assigned") {
//                   icon = <Laptop size={13} color="#d97706" />;
//                   bg = "#fef3e2";
//                 } else if (type === "return" || type === "returned") {
//                   icon = <RotateCcw size={13} color="#16a34a" />;
//                   bg = "#dcfce7";
//                 } else if (type === "repair") {
//                   icon = <Wrench size={13} color="#dc2626" />;
//                   bg = "#fee2e2";
//                 }

//                 return (
//                   <div
//                     key={h.id || i}
//                     style={{
//                       display: "flex",
//                       gap: 12,
//                       alignItems: "flex-start",
//                       padding: "10px 0",
//                       borderBottom: "1px solid #f3f4f6",
//                     }}
//                   >
//                     <div
//                       style={{
//                         width: 30,
//                         height: 30,
//                         borderRadius: 8,
//                         flexShrink: 0,
//                         background: bg,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       {icon}
//                     </div>

//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <div
//                         style={{
//                           display: "flex",
//                           justifyContent: "space-between",
//                           alignItems: "flex-start",
//                         }}
//                       >
//                         <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
//                           {h.employee_name_en ||
//                             h.employee_name_ar ||
//                             h.employee_name ||
//                             h.employee_code ||
//                             getEmployeeFromHistory(h) ||
//                             "—"}
//                         </div>

//                         <div
//                           style={{
//                             fontSize: 11,
//                             color: "#94a3b8",
//                             flexShrink: 0,
//                             marginLeft: 10,
//                           }}
//                         >
//                           {h.assignment_date || h.date || h.created_at || ""}
//                         </div>
//                       </div>

//                       <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
//                         {h.action_type || h.action || h.type || "Event"}
//                         {h.asset_serial ? ` · ${h.asset_serial}` : ""}
//                       </div>

//                       {h.notes && (
//                         <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
//                           {h.notes}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </Card>

//       {pendingReturnId && (
//         <ConfirmDialog
//           title="Return Asset"
//           message="Are you sure you want to return this asset to stock? It will be marked as unassigned."
//           confirmLabel="Return"
//           danger={false}
//           onConfirm={() => handleReturnToStock(pendingReturnId)}
//           onCancel={() => setPendingReturnId(null)}
//         />
//       )}

//       {showEdit && (
//         <AssetEditModal
//           asset={asset}
//           onClose={() => setShowEdit(false)}
//           onSubmit={handleEditSubmit}
//         />
//       )}
//     </div>
//   );
// }
