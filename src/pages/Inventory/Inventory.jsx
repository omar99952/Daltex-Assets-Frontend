import {
  fetchAssetsByCategory,
  fetchAssetsByStatus,
  fetchAssetDetails,
  fetchAssetHistory,
  fetchAssignedEmployee,
  createAsset,
  updateAsset,
  deleteAsset,
  returnAssetToStock,
} from "../services/assetService.js";

import {
  INVENTORY_CATEGORIES,
  categoryDataKey,
  getEmployeeFromHistory,
} from "../utils/assetHelpers.js";

import { useState, useEffect, useRef } from "react";
import {
  Boxes,
  Users,
  Building2,
  Wrench,
  Download,
  Plus,
  RotateCcw,
  ChevronRight,
  X,
  MoreVertical,
  Settings,
  Trash2,
  AlertCircle,
  Pencil,
  Filter,
  Search,
  Laptop,
  ClipboardCheck,
} from "lucide-react";

import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import Modal from "../components/Modal.jsx";
import AddDeviceModal from "../components/AddDeviceModal.jsx";
import FormField, { inputStyle } from "../components/FormField.jsx";
import { Row } from "../components/Misc.jsx";
import { NAVY, ORANGE } from "../theme.js";
import InventoryStatusView from "./InventoryStatusView.jsx";
import {
  fetchAssetsByCategory,
  fetchAssetsByStatus,
  fetchAssetDetails,
  fetchAssetHistory,
  fetchAssignedEmployee,
  createAsset,
  updateAsset,
  deleteAsset as deleteAssetRequest,
  returnAssetToStock,
} from "../services/assetService.js";

import {
  INVENTORY_CATEGORIES,
  categoryDataKey,
  getEmployeeFromHistory,
} from "../utils/assetHelpers.js";

function displayAssignedTo(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return (
    value.employee_name_en ||
    value.name_en ||
    value.name ||
    value.employee_code ||
    "—"
  );
}





export default function Inventory() {
  const {
    inventoryStatusFilter,
    setInventoryStatusFilter,
    goBack,
    navigateTo,
    setInventoryCategory,
  } = useApp();

  function openCategory(label) {
    setInventoryCategory(label);
    navigateTo("inventoryCategory");
  }

  if (inventoryStatusFilter) {
    return (
      <InventoryStatusView
        statusFilter={inventoryStatusFilter}
        onClearFilter={() => setInventoryStatusFilter(null)}
        onBack={goBack}
      />
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>
        Assets
      </div>

      <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 24 }}>
        Choose a category to view and manage its assets.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {INVENTORY_CATEGORIES.map((label) => {
          const dataKey = categoryDataKey(label);

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
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <CategoryIcon category={dataKey} size={18} />
              </div>

              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>
                {label}
              </div>

              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
                Click to browse
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InventoryStatusView({ statusFilter, onClearFilter, onBack }) {
  const { openAssetDetail, globalSearchQuery, setGlobalSearchQuery } = useApp();

  const [statusAssets, setStatusAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const assets = await fetchAssetsByStatus(statusFilter);
        setStatusAssets(assets);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [statusFilter]);

  const query = globalSearchQuery;

  const filtered = statusAssets.filter(
    (a) =>
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase())
  );

  const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "#fef3e2",
            color: ORANGE,
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          Clear filter <X size={11} />
        </button>
      </div>

      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 20 }}>
        Assets
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <input
            value={query}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search by brand, model, serial, or asset ID..."
            style={{
              border: "1px solid #eef0f3",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 13,
              width: 320,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
              {loading ? "Loading…" : `Showing ${filtered.length} of ${statusAssets.length} items`}
            </div>

            <button
              onClick={() => setShowCsvPreview(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid #eef0f3",
                borderRadius: 7,
                padding: "7px 12px",
                fontWeight: 700,
                fontSize: 12.5,
                color: "#475569",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  Loading assets…
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openAssetDetail(a.id, a.category)}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                >
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
                  <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.branch}</td>
                  <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
                </tr>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showCsvPreview && (
        <CsvPreviewModal
          onClose={() => setShowCsvPreview(false)}
          rows={csvRows}
          headers={csvHeaders}
          filename={csvFilename}
        />
      )}
    </div>
  );
}

export function InventoryCategoryPage() {
  const {
    inventoryCategory,
    globalSearchQuery,
    setGlobalSearchQuery,
    goBack,
    openAssetDetail,
    showAddDeviceModal,
    setShowAddDeviceModal,
    deleteAssetEnabled,
    setDeleteAssetEnabled,
  } = useApp();

  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  const [apiAssets, setApiAssets] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const label = inventoryCategory || INVENTORY_CATEGORIES[0];
  const dataKey = categoryDataKey(label);

  async function loadCategoryAssets() {
    try {
      setApiLoading(true);
      setApiError(null);

      const assets = await fetchAssetsByCategory(label);
      setApiAssets(assets);
    } catch {
      setApiError("Could not reach the server.");
      setApiAssets([]);
    } finally {
      setApiLoading(false);
    }
  }

  useEffect(() => {
    loadCategoryAssets();
  }, [label]);

  const query = globalSearchQuery;
  const scopeBase = apiAssets;

  const filtered = scopeBase.filter((a) => {
    const matchesSearch =
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase());

    const matchesAssignment =
      assignmentFilter === "All"
        ? true
        : assignmentFilter === "Assigned"
        ? a.status === "Assigned"
        : a.status !== "Assigned";

    return matchesSearch && matchesAssignment;
  });

  const total = scopeBase.length;
  const assigned = scopeBase.filter((a) => a.status === "Assigned").length;
  const inStock = scopeBase.filter((a) => a.status === "In Stock").length;
  const repair = scopeBase.filter((a) => a.status === "Repair").length;

  async function handleAddDeviceSubmit(form) {
    try {
      const created = await createAsset(form, label);
      setApiAssets((prev) => [created, ...prev]);
      setApiError(null);
    } catch {
      setApiError("Failed to add device. Please check your connection.");
    }

    setShowAddDeviceModal(false);
  }

  async function handleDeleteAsset(id) {
    try {
      await deleteAssetRequest(id, label);
      setApiAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setApiError("Failed to delete asset. Please try again.");
    }

    setPendingDeleteId(null);
  }

  const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
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

      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>
        Assets &gt; {label}
      </div>

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
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setShowAddDeviceModal(true)}
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
            <Plus size={14} /> Add Device
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{
                border: `1px solid ${deleteAssetEnabled ? "#fecaca" : "#eef0f3"}`,
                borderRadius: 8,
                padding: 0,
                height: 38,
                width: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showAdvanced ? "#f1f5f9" : deleteAssetEnabled ? "#fff5f5" : "#fff",
                cursor: "pointer",
                color: deleteAssetEnabled ? "#dc2626" : "#475569",
              }}
            >
              <MoreVertical size={14} />
            </button>

            {showAdvanced && (
              <AssetAdvancedSettingsPopover
                deleteEnabled={deleteAssetEnabled}
                setDeleteEnabled={setDeleteAssetEnabled}
                onClose={() => setShowAdvanced(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="TOTAL MANAGED" value={total} />
        <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="ASSIGNED" value={assigned} sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>{total ? Math.round((assigned / total) * 100) : 0}% util</div>} />
        <StatCard icon={<Building2 size={17} color="#475569" />} iconBg="#e2e8f0" label="IN STOCK" value={inStock} />
        <StatCard icon={<Wrench size={17} color="#dc2626" />} iconBg="#fee2e2" label="IN REPAIR" value={repair} danger sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Pending fix</div>} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <Filter size={12} color="#94a3b8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textTransform: "uppercase" }}>Filter</span>
        </div>

        <div style={{ width: 1, height: 16, background: "#e2e8f0", flexShrink: 0 }} />

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

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", background: "#fff" }}>
          <Search size={13} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search brand, model, serial…"
            style={{ border: "none", outline: "none", fontSize: 13, width: 220, background: "transparent" }}
          />
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #eef0f3" }}>
          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
            {apiLoading ? "Loading…" : `${filtered.length} of ${scopeBase.length} items`}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {apiLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  Loading assets…
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openAssetDetail(a.id, a.category)}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                >
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
                  <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{displayAssignedTo(a.assignedTo)}</td>
                  <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!deleteAssetEnabled) {
                          setShowDeleteError(true);
                          return;
                        }

                        setPendingDeleteId(a.id);
                      }}
                      title="Delete asset"
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#fca5a5",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}

            {!apiLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showCsvPreview && (
        <CsvPreviewModal
          onClose={() => setShowCsvPreview(false)}
          rows={csvRows}
          headers={csvHeaders}
          filename={csvFilename}
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
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>
                Asset deletion is not enabled
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> and enable asset deletion to proceed.
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

      {showAddDeviceModal && (
        <AddDeviceModal
          onClose={() => setShowAddDeviceModal(false)}
          onSubmit={handleAddDeviceSubmit}
        />
      )}
    </div>
  );
}



export function AssetDetailPage() {
  const { selectedAssetId, selectedAssetType, goBack } = useApp();

  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [apiAsset, setApiAsset] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadAssetDetails() {
    if (!selectedAssetId) return;

    setDetailLoading(true);
    setHistoryLoading(true);

    try {
      const mapped = await fetchAssetDetails(selectedAssetId, selectedAssetType);

      let assignedEmployee = null;
      let history = [];

      if (mapped.serial) {
        assignedEmployee = await fetchAssignedEmployee(mapped.serial);
        history = await fetchAssetHistory(mapped.serial);
      }

      setApiAsset({
        ...mapped,
        assignedTo: assignedEmployee || mapped.assignedTo || null,
      });

      setAssetHistory(history);
    } catch {
      setApiAsset(null);
      setAssetHistory([]);
    } finally {
      setDetailLoading(false);
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadAssetDetails();
  }, [selectedAssetId, selectedAssetType]);

  const asset = apiAsset;

  async function handleEditSubmit(form) {
    try {
      const updated = await updateAsset(asset, form);
      setApiAsset((prev) => ({
        ...updated,
        assignedTo: prev?.assignedTo || updated.assignedTo || null,
      }));
    } catch {
      setApiAsset((prev) => ({ ...(prev || asset), ...form }));
    }

    setShowEdit(false);
  }

  async function handleReturnToStock(id) {
    try {
      await returnAssetToStock(asset);

      setApiAsset((prev) =>
        prev ? { ...prev, status: "In Stock", assignedTo: null } : null
      );
    } catch {
      // ignore
    }

    setPendingReturnId(null);
  }

  if (!detailLoading && !asset) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Boxes size={36} color="#cbd5e1" />
        <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>
          Asset not found.
        </div>
        <button
          onClick={() => goBack()}
          style={{
            marginTop: 16,
            background: ORANGE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
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
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            SN: {asset.serial}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowEdit(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #eef0f3",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 12.5,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Pencil size={13} /> Edit
          </button>

          <StatusPill status={asset.status} />
        </div>
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
          Asset Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label="Brand" value={asset.brand} />
          <Row label="Model / Part No." value={asset.model} />
          <Row label="Serial Number" value={asset.serial} />
          <Row label="Category" value={asset.category} />
          <Row label="Condition" value={asset.condition || "—"} />
          <Row label="Branch / Location" value={asset.branch || "—"} />
          {asset.department && <Row label="Department" value={asset.department} />}
          {asset.sector && <Row label="Sector" value={asset.sector} />}
          {asset.deliveryDate && <Row label="Delivery Date" value={asset.deliveryDate} />}
          {asset.description && <Row label="Description" value={asset.description} />}
        </div>

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

        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 12, textTransform: "uppercase" }}>
            Current Assignment
          </div>

          {asset.assignedTo ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                  {String(asset.assignedTo).slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                    {asset.assignedTo}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Assigned employee
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPendingReturnId(asset.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #eef0f3",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={13} /> Return to Stock
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              No employee assigned.
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 14, textTransform: "uppercase" }}>
            Assignment History
          </div>

          {historyLoading ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading history…</div>
          ) : assetHistory.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              No history found for this asset.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {assetHistory.map((h, i) => {
                const type = (h.action_type || h.action || h.type || "").toLowerCase();

                let icon = <ClipboardCheck size={13} color="#475569" />;
                let bg = "#e2e8f0";

                if (type === "issue" || type === "assign" || type === "assigned") {
                  icon = <Laptop size={13} color="#d97706" />;
                  bg = "#fef3e2";
                } else if (type === "return" || type === "returned") {
                  icon = <RotateCcw size={13} color="#16a34a" />;
                  bg = "#dcfce7";
                } else if (type === "repair") {
                  icon = <Wrench size={13} color="#dc2626" />;
                  bg = "#fee2e2";
                }

                return (
                  <div key={h.id || i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                          {getEmployeeFromHistory(h) || "—"}
                        </div>

                        <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 10 }}>
                          {h.assignment_date || h.date || h.created_at || ""}
                        </div>
                      </div>

                      <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                        {h.action_type || h.action || h.type || "Event"}
                        {h.asset_serial ? ` · ${h.asset_serial}` : ""}
                      </div>

                      {h.notes && (
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                          {h.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be marked as unassigned."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => handleReturnToStock(pendingReturnId)}
          onCancel={() => setPendingReturnId(null)}
        />
      )}

      {showEdit && (
        <AssetEditModal
          asset={asset}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}