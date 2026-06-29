import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { Boxes, Users, Building2, Wrench, Download, Plus, RotateCcw, ChevronRight, X, MoreVertical, Settings, Trash2, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Modal from "../components/Modal.jsx";
import { Row } from "../components/Misc.jsx";
import { NAVY, ORANGE } from "../theme.js";

// ── field mappers ──────────────────────────────────────────────────────────────
function mapComputer(c) {
  return {
    id: String(c.id),
    brand: c.brand || "",
    model: c.model_or_pn || c.model || "",
    serial: c.serial_number || c.serial || "",
    status: c.status || "In Stock",
    category: "Laptops & PCs",
    condition: c.condition || "",
    branch: typeof c.branch === "object" ? (c.branch?.name_en || c.branch?.name || "") : (c.branch || ""),
    assignedTo: c.assigned_to || c.assignedTo || null,
    description: c.description || "",
    deliveryDate: c.delivery_date || "",
    pcType: c.pc_type || "",
    processor: c.processor || "",
    memoryRam: c.memory_ram || "",
    hardDisk: c.hard_disk || "",
    monitorBrand: c.monitor_brand || null,
    monitorModel: c.monitor_model || null,
    monitorInches: c.monitor_inches ? String(c.monitor_inches) : null,
    monitorSerial: c.monitor_serial || null,
    keyboardBrand: c.keyboard_brand || null,
    keyboardModel: c.keyboard_model || null,
    keyboardSerial: c.keyboard_serial || null,
    mouseBrand: c.mouse_brand || null,
    mouseModel: c.mouse_model || null,
    mouseSerial: c.mouse_serial || null,
    bagBrand: c.bag_brand || null,
    bagModelDescription: c.bag_model_or_description || null,
  };
}
function mapPrinter(p) {
  return {
    id: String(p.id),
    brand: p.brand || "",
    model: p.model_or_pn || p.model || "",
    serial: p.serial_number || p.serial || "",
    status: p.status || "In Stock",
    category: "Printers",
    condition: p.condition || "",
    branch: typeof p.branch === "object" ? (p.branch?.name_en || p.branch?.name || "") : (p.branch || ""),
    assignedTo: p.assigned_to || null,
    description: p.description || "",
    deliveryDate: p.delivery_date || "",
    multifunctions: p.multifunctions || false,
    printerType: p.printer_type || "",
    printerColor: p.printer_color || "",
    connectionType: p.connection_type || "",
    technology: p.technology || "",
    cartridgeNumber: p.cartridge_number || "",
    cartridgeColor: p.cartridge_color || "",
    inkDetails: p.ink_details || "",
    activeConnection: p.active_connection || "",
    macAddressEth: p.mac_address_eth || null,
    ipAddressEth: p.ip_address_eth || null,
    macAddressWifi: p.mac_address_wifi || null,
  };
}
function mapHardwareAsset(a) {
  if (a.pc_type !== undefined) return mapComputer(a);
  if (a.printer_type !== undefined) return mapPrinter(a);
  return {
    id: String(a.id),
    brand: a.brand || "",
    model: a.model_or_pn || a.model || "",
    serial: a.serial_number || a.serial || "",
    status: a.status || "In Stock",
    category: a.category || "",
    condition: a.condition || "",
    branch: typeof a.branch === "object" ? (a.branch?.name_en || a.branch?.name || "") : (a.branch || ""),
    assignedTo: a.assigned_to || null,
    description: a.description || "",
    deliveryDate: a.delivery_date || "",
  };
}
// ──────────────────────────────────────────────────────────────────────────────

function AssetAdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
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
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Allow asset deletion</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{deleteEnabled ? "Deletion is currently enabled." : "Check to allow deleting assets."}</div>
        </div>
      </label>
    </div>
  );
}

const INVENTORY_CATEGORIES = ["PCs", "Monitors", "Printers", "Networking", "Peripherals"];
// Asset records still use the original category string in seed data; map the
// new short label back to it so existing data keeps working unchanged.
const CATEGORY_LABEL_TO_DATA = { "PCs": "Laptops & PCs" };
function categoryDataKey(label) {
  return CATEGORY_LABEL_TO_DATA[label] || label;
}

export default function Inventory() {
  const {
    assets,
    inventoryStatusFilter,
    setInventoryStatusFilter,
    goBack,
    navigateTo,
    setInventoryCategory,
  } = useApp();
  const [mainFilter, setMainFilter] = useState("All");

  function openCategory(label) {
    setInventoryCategory(label);
    navigateTo("inventoryCategory");
  }

  // Arriving here from a Dashboard stat click skips the category picker and
  // goes straight to a flat, status-filtered view across every category.
  if (inventoryStatusFilter) {
    return <InventoryStatusView statusFilter={inventoryStatusFilter} onClearFilter={() => setInventoryStatusFilter(null)} onBack={goBack} />;
  }

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>Assets</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ fontSize: 13.5, color: "#94a3b8" }}>Choose a category to view and manage its assets.</div>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Assigned", "Unassigned"].map((f) => (
            <button
              key={f}
              onClick={() => setMainFilter(f)}
              style={{
                border: mainFilter === f ? "none" : "1px solid #eef0f3",
                borderRadius: 7,
                padding: "7px 16px",
                fontWeight: 700,
                fontSize: 12.5,
                color: mainFilter === f ? "#fff" : "#475569",
                background: mainFilter === f ? NAVY : "#fff",
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {INVENTORY_CATEGORIES.map((label) => {
          const dataKey = categoryDataKey(label);
          const items = assets.filter((a) => a.category === dataKey);
          const assignedCount = items.filter((a) => a.status === "Assigned").length;
          const unassignedCount = items.filter((a) => a.status !== "Assigned").length;
          return (
            <div
              key={label}
              onClick={() => openCategory(label)}
              style={{
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
                transition: "box-shadow .15s, transform .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <CategoryIcon category={dataKey} size={18} />
              </div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>{label}</div>
              {mainFilter === "All" && (
                <>
                  <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{items.length} total</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{assignedCount} assigned</div>
                </>
              )}
              {mainFilter === "Assigned" && (
                <>
                  <div style={{ fontSize: 12.5, color: "#10b981", fontWeight: 700 }}>{assignedCount}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>assigned</div>
                </>
              )}
              {mainFilter === "Unassigned" && (
                <>
                  <div style={{ fontSize: 12.5, color: "#f59e0b", fontWeight: 700 }}>{unassignedCount}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>unassigned</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryStatusView({ statusFilter, onClearFilter, onBack }) {
  const { assets, employees, returnAsset, openAssetDetail, globalSearchQuery, setGlobalSearchQuery } = useApp();
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const query = globalSearchQuery;
  const setQuery = setGlobalSearchQuery;

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  const scopeBase = assets.filter((a) => a.status === statusFilter);
  const filtered = scopeBase.filter(
    (a) =>
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase())
  );

  const csvHeaders = ["ASSET", "BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    ASSET: a.id,
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
    "ASSIGNED TO": a.assignedTo ? empName(a.assignedTo) : "—",
    BRANCH: a.branch,
  }));
  const csvFilename = `inventory_${statusFilter.toLowerCase().replace(/\s+/g, "_")}.csv`;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={onBack} />
      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        Assets &gt; Status: {statusFilter}
        <button
          onClick={onClearFilter}
          style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "#fef3e2", color: ORANGE, fontWeight: 700, fontSize: 11, padding: "3px 8px", borderRadius: 999, cursor: "pointer" }}
        >
          Clear filter <X size={11} />
        </button>
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 20 }}>Assets</div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, model, serial, or asset ID..."
            style={{ border: "1px solid #eef0f3", borderRadius: 7, padding: "8px 12px", fontSize: 13, width: 320, outline: "none" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
              Showing 1-{filtered.length} of {scopeBase.length} items
            </div>
            <button
              onClick={() => setShowCsvPreview(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", fontWeight: 700, fontSize: 12.5, color: "#475569", background: "#fff", cursor: "pointer" }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.3, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => openAssetDetail(a.id)}
                style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
                <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
                <td style={{ padding: "14px 20px" }}>
                  <StatusPill status={a.status} />
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.assignedTo ? empName(a.assignedTo) : "—"}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.branch}</td>
                <td style={{ padding: "14px 20px" }}>
                  {a.status === "Assigned" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingReturnId(a.id);
                      }}
                      title="Return to stock"
                      style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}
                    >
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <ChevronRight size={16} color="#cbd5e1" />
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showCsvPreview && (
        <CsvPreviewModal onClose={() => setShowCsvPreview(false)} rows={csvRows} headers={csvHeaders} filename={csvFilename} />
      )}
      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be unassigned."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => { returnAsset(pendingReturnId); setPendingReturnId(null); }}
          onCancel={() => setPendingReturnId(null)}
        />
      )}
    </div>
  );
}

export function InventoryCategoryPage() {
  const {
    assets: seedAssets,
    employees,
    returnAsset,
    deleteAsset,
    deleteAssetEnabled,
    setDeleteAssetEnabled,
    inventoryCategory,
    goBack,
    openAssetDetail,
    globalSearchQuery,
    setGlobalSearchQuery,
    setShowAddDeviceModal,
  } = useApp();
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  // ── API state ───────────────────────────────────────────────────────────────
  const [apiAssets, setApiAssets] = useState(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const label = inventoryCategory || INVENTORY_CATEGORIES[0];
  const dataKey = categoryDataKey(label);

  useEffect(() => {
    setApiAssets(null);
    setApiLoading(true);
    setApiError(null);

    async function fetchByCategory() {
      try {
        if (label === "PCs") {
          const data = await apiGet(ENDPOINTS.get_all_computers);
          setApiAssets(data.map(mapComputer));
        } else if (label === "Printers") {
          const data = await apiGet(ENDPOINTS.get_all_printers);
          setApiAssets(data.map(mapPrinter));
        } else {
          // Hardware assets endpoint for everything else
          const data = await apiGet(ENDPOINTS.get_all_hardware_assets);
          setApiAssets(data.filter((a) => a.category === dataKey).map(mapHardwareAsset));
        }
      } catch {
        setApiError("Could not reach the server — showing local data.");
      } finally {
        setApiLoading(false);
      }
    }
    fetchByCategory();
  }, [label, dataKey]);

  const query = globalSearchQuery;
  const setQuery = setGlobalSearchQuery;

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  // Use API data if loaded; fall back to seed
  const scopeBase = apiAssets || seedAssets.filter((a) => a.category === dataKey);

  const filtered = scopeBase.filter((a) => {
    const matchesSearch =
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase());
    const matchesAssignment =
      assignmentFilter === "All" ? true :
      assignmentFilter === "Assigned" ? a.status === "Assigned" :
      a.status !== "Assigned";
    return matchesSearch && matchesAssignment;
  });

  const total = scopeBase.length;
  const assigned = scopeBase.filter((a) => a.status === "Assigned").length;
  const inStock = scopeBase.filter((a) => a.status === "In Stock").length;
  const repair = scopeBase.filter((a) => a.status === "Repair").length;

  async function handleDeleteAsset(id) {
    try {
      if (label === "PCs") {
        await apiDelete(ENDPOINTS.delete_computer(id));
      } else if (label === "Printers") {
        await apiDelete(ENDPOINTS.delete_printer(id));
      } else {
        await apiDelete(ENDPOINTS.delete_hardware_asset(id));
      }
      setApiAssets((prev) => prev ? prev.filter((a) => a.id !== id) : null);
    } catch {
      // Fall back to local context delete
      deleteAsset(id);
    }
    setPendingDeleteId(null);
  }

  const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
    "ASSIGNED TO": a.assignedTo ? empName(a.assignedTo) : "—",
    BRANCH: a.branch,
  }));
  const csvFilename = `inventory_${label.toLowerCase().replace(/\s+/g, "_")}.csv`;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      {apiError && (
        <div style={{ background: "#fef9f0", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#92400e", marginBottom: 14 }}>
          {apiError}
        </div>
      )}
      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>Assets &gt; {label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CategoryIcon category={dataKey} size={16} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{label}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setShowCsvPreview(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #eef0f3", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#475569", background: "#fff", cursor: "pointer" }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowAddDeviceModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#fff", background: NAVY, cursor: "pointer" }}
          >
            <Plus size={14} /> Add Device
          </button>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{ border: `1px solid ${deleteAssetEnabled ? "#fecaca" : "#eef0f3"}`, borderRadius: 8, padding: 0, height: 38, width: 38, display: "flex", alignItems: "center", justifyContent: "center", background: showAdvanced ? "#f1f5f9" : deleteAssetEnabled ? "#fff5f5" : "#fff", cursor: "pointer", color: deleteAssetEnabled ? "#dc2626" : "#475569" }}
            >
              <MoreVertical size={14} />
            </button>
            {showAdvanced && (
              <AssetAdvancedSettingsPopover deleteEnabled={deleteAssetEnabled} setDeleteEnabled={setDeleteAssetEnabled} onClose={() => setShowAdvanced(false)} />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="TOTAL MANAGED" value={total} />
        <StatCard
          icon={<Users size={17} color="#475569" />}
          iconBg="#e2e8f0"
          label="ASSIGNED"
          value={assigned}
          sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>{total ? Math.round((assigned / total) * 100) : 0}% util</div>}
        />
        <StatCard icon={<Building2 size={17} color="#475569" />} iconBg="#e2e8f0" label="IN STOCK" value={inStock} />
        <StatCard
          icon={<Wrench size={17} color="#dc2626" />}
          iconBg="#fee2e2"
          label="IN REPAIR"
          value={repair}
          danger
          sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Pending fix</div>}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["All", "Assigned", "Unassigned"].map((f) => (
          <button
            key={f}
            onClick={() => setAssignmentFilter(f)}
            style={{
              border: assignmentFilter === f ? "none" : "1px solid #eef0f3",
              borderRadius: 7,
              padding: "7px 16px",
              fontWeight: 700,
              fontSize: 12.5,
              color: assignmentFilter === f ? "#fff" : "#475569",
              background: assignmentFilter === f ? NAVY : "#fff",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, model, serial, or asset ID..."
            style={{ border: "1px solid #eef0f3", borderRadius: 7, padding: "8px 12px", fontSize: 13, width: 320, outline: "none" }}
          />
          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
            {apiLoading ? "Loading…" : `Showing 1-${filtered.length} of ${scopeBase.length} items`}
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH", "", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.3, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiLoading ? (
              <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading assets…</td></tr>
            ) : filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => openAssetDetail(a.id)}
                style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
                <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
                <td style={{ padding: "14px 20px" }}>
                  <StatusPill status={a.status} />
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.assignedTo ? empName(a.assignedTo) : "—"}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.branch}</td>
                <td style={{ padding: "14px 20px" }}>
                  {a.status === "Assigned" ? (
                    <button onClick={(e) => { e.stopPropagation(); setPendingReturnId(a.id); }} title="Return to stock" style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <ChevronRight size={16} color="#cbd5e1" />
                  )}
                </td>
                <td style={{ padding: "14px 20px" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!deleteAssetEnabled) { setShowDeleteError(true); return; }
                      setPendingDeleteId(a.id);
                    }}
                    title="Delete asset"
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#fca5a5" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {!apiLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showCsvPreview && (
        <CsvPreviewModal onClose={() => setShowCsvPreview(false)} rows={csvRows} headers={csvHeaders} filename={csvFilename} />
      )}
      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be unassigned."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => { returnAsset(pendingReturnId); setPendingReturnId(null); }}
          onCancel={() => setPendingReturnId(null)}
        />
      )}
      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete Asset"
          message="Are you sure you want to permanently delete this asset? This cannot be undone."
          confirmLabel="Delete Asset"
          onConfirm={() => handleDeleteAsset(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
      {showDeleteError && (
        <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={18} color="#dc2626" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Asset deletion is not enabled</div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> (⋮ button in the toolbar) and enable asset deletion to proceed.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setShowDeleteError(false)} style={{ border: "none", background: "#0f172a", color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 8, cursor: "pointer" }}>Got it</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 12, textTransform: "uppercase" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{children}</div>
    </div>
  );
}

export function AssetDetailPage() {
  const { assets: seedAssets, employees, selectedAssetId, goBack, returnAsset } = useApp();
  const seedAsset = seedAssets.find((a) => a.id === selectedAssetId);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [apiAsset, setApiAsset] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffect(() => {
    if (!selectedAssetId) return;
    setDetailLoading(true);
    apiGet(ENDPOINTS.get_hardware_asset_by_id(selectedAssetId))
      .then((data) => setApiAsset(mapHardwareAsset(data)))
      .catch(() => setApiAsset(null))
      .finally(() => setDetailLoading(false));
  }, [selectedAssetId]);

  const asset = apiAsset || seedAsset;

  if (!detailLoading && !asset) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Boxes size={36} color="#cbd5e1" />
        <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>Asset not found.</div>
        <button
          onClick={() => goBack()}
          style={{ marginTop: 16, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (detailLoading && !asset) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        Loading asset details…
      </div>
    );
  }

  const owner = asset.assignedTo ? employees.find((e) => e.id === asset.assignedTo) : null;
  const isComputer = asset.category === "Laptops & PCs";
  const isPrinter = asset.category === "Printers";

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CategoryIcon category={asset.category} size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
            {asset.brand} {asset.model}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>SN: {asset.serial}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusPill status={asset.status} />
        </div>
      </div>

      <Card>
        {/* Core details — always shown */}
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>Asset Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label="Brand" value={asset.brand} />
          <Row label="Model / Part No." value={asset.model} />
          <Row label="Serial Number" value={asset.serial} />
          <Row label="Category" value={asset.category} />
          <Row label="Condition" value={asset.condition} />
          <Row label="Branch / Location" value={asset.branch} />
          {asset.deliveryDate && <Row label="Delivery Date" value={asset.deliveryDate} />}
          {asset.description && <Row label="Description" value={asset.description} />}
        </div>

        {/* Computer-specific sections */}
        {isComputer && (
          <>
            <DetailSection title="Hardware Specifications">
              {asset.pcType && <Row label="PC Type" value={asset.pcType} />}
              {asset.processor && <Row label="Processor" value={asset.processor} />}
              {asset.memoryRam && <Row label="Memory (RAM)" value={asset.memoryRam} />}
              {asset.hardDisk && <Row label="Storage" value={asset.hardDisk} />}
            </DetailSection>

            {(asset.monitorBrand || asset.monitorModel) && (
              <DetailSection title="Monitor">
                {asset.monitorBrand && <Row label="Brand" value={asset.monitorBrand} />}
                {asset.monitorModel && <Row label="Model" value={asset.monitorModel} />}
                {asset.monitorInches && <Row label="Size" value={`${asset.monitorInches}"`} />}
                {asset.monitorSerial && <Row label="Serial" value={asset.monitorSerial} />}
              </DetailSection>
            )}

            {(asset.keyboardBrand || asset.mouseBrand || asset.bagBrand) && (
              <DetailSection title="Peripherals">
                {asset.keyboardBrand && <Row label="Keyboard" value={`${asset.keyboardBrand} ${asset.keyboardModel || ""}`.trim()} />}
                {asset.keyboardSerial && <Row label="Keyboard Serial" value={asset.keyboardSerial} />}
                {asset.mouseBrand && <Row label="Mouse" value={`${asset.mouseBrand} ${asset.mouseModel || ""}`.trim()} />}
                {asset.mouseSerial && <Row label="Mouse Serial" value={asset.mouseSerial} />}
                {asset.bagBrand && <Row label="Bag" value={`${asset.bagBrand} — ${asset.bagModelDescription || ""}`.trim()} />}
              </DetailSection>
            )}
          </>
        )}

        {/* Printer-specific sections */}
        {isPrinter && (
          <>
            <DetailSection title="Printer Details">
              {asset.printerType && <Row label="Printer Type" value={asset.printerType} />}
              {asset.printerColor && <Row label="Color" value={asset.printerColor} />}
              {asset.technology && <Row label="Technology" value={asset.technology} />}
              {asset.connectionType && <Row label="Connection" value={asset.connectionType} />}
              <Row label="Multifunction" value={asset.multifunctions ? "Yes" : "No"} />
            </DetailSection>

            {(asset.cartridgeNumber || asset.inkDetails) && (
              <DetailSection title="Cartridge / Ink">
                {asset.cartridgeNumber && <Row label="Cartridge No." value={asset.cartridgeNumber} />}
                {asset.cartridgeColor && <Row label="Color" value={asset.cartridgeColor} />}
                {asset.inkDetails && <Row label="Ink Details" value={asset.inkDetails} />}
              </DetailSection>
            )}

            {(asset.macAddressEth || asset.ipAddressEth || asset.macAddressWifi) && (
              <DetailSection title="Network">
                {asset.activeConnection && <Row label="Active Connection" value={asset.activeConnection} />}
                {asset.macAddressEth && <Row label="MAC (Ethernet)" value={asset.macAddressEth} />}
                {asset.ipAddressEth && <Row label="IP (Ethernet)" value={asset.ipAddressEth} />}
                {asset.macAddressWifi && <Row label="MAC (Wi-Fi)" value={asset.macAddressWifi} />}
              </DetailSection>
            )}
          </>
        )}

        {/* Assignment */}
        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 12, textTransform: "uppercase" }}>Assignment</div>
          {owner ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: owner.avatarColor,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 12,
                  }}
                >
                  {owner.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{owner.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{owner.role} · {owner.id}</div>
                </div>
              </div>
              <button
                onClick={() => setPendingReturnId(asset.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 12.5, padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}
              >
                <RotateCcw size={13} /> Return to Stock
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              {asset.status === "Assigned" ? "Assigned to a branch or department." : "Not currently assigned."}
            </div>
          )}
        </div>
      </Card>

      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be unassigned."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => { returnAsset(pendingReturnId); setPendingReturnId(null); }}
          onCancel={() => setPendingReturnId(null)}
        />
      )}
    </div>
  );
}
