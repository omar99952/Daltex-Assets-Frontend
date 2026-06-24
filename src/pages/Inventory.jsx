import { useState } from "react";
import { Boxes, Users, Building2, Wrench, Download, Plus, RotateCcw, ChevronRight, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { Row } from "../components/Misc.jsx";
import { NAVY, ORANGE } from "../theme.js";

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
      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>System Inventory</div>
      <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 24 }}>Choose a category to view and manage its assets.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {INVENTORY_CATEGORIES.map((label) => {
          const dataKey = categoryDataKey(label);
          const items = assets.filter((a) => a.category === dataKey);
          const assignedCount = items.filter((a) => a.status === "Assigned").length;
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
              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{items.length} total</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>{assignedCount} assigned</div>
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
        Inventory &gt; Status: {statusFilter}
        <button
          onClick={onClearFilter}
          style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "#fef3e2", color: ORANGE, fontWeight: 700, fontSize: 11, padding: "3px 8px", borderRadius: 999, cursor: "pointer" }}
        >
          Clear filter <X size={11} />
        </button>
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 20 }}>System Inventory</div>

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
              {["ASSET", "BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH", ""].map((h) => (
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
                <td style={{ padding: "14px 20px", fontWeight: 700, fontSize: 13, color: NAVY }}>{a.id}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#0f172a" }}>{a.model}</td>
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
                <td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
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
    assets,
    employees,
    returnAsset,
    inventoryCategory,
    goBack,
    openAssetDetail,
    globalSearchQuery,
    setGlobalSearchQuery,
    setShowAddDeviceModal,
  } = useApp();
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [pendingReturnId, setPendingReturnId] = useState(null);
  const label = inventoryCategory || INVENTORY_CATEGORIES[0];
  const dataKey = categoryDataKey(label);

  const query = globalSearchQuery;
  const setQuery = setGlobalSearchQuery;

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  const scopeBase = assets.filter((a) => a.category === dataKey);
  const filtered = scopeBase.filter(
    (a) =>
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase())
  );

  const total = scopeBase.length;
  const assigned = scopeBase.filter((a) => a.status === "Assigned").length;
  const inStock = scopeBase.filter((a) => a.status === "In Stock").length;
  const repair = scopeBase.filter((a) => a.status === "Repair").length;

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
  const csvFilename = `inventory_${label.toLowerCase().replace(/\s+/g, "_")}.csv`;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>Inventory &gt; {label}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CategoryIcon category={dataKey} size={16} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{label}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
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

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by brand, model, serial, or asset ID..."
            style={{ border: "1px solid #eef0f3", borderRadius: 7, padding: "8px 12px", fontSize: 13, width: 320, outline: "none" }}
          />
          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
            Showing 1-{filtered.length} of {scopeBase.length} items
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["ASSET", "BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "BRANCH", ""].map((h) => (
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
                <td style={{ padding: "14px 20px", fontWeight: 700, fontSize: 13, color: NAVY }}>{a.id}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#0f172a" }}>{a.model}</td>
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
    </div>
  );
}

export function AssetDetailPage() {
  const { assets, employees, selectedAssetId, goBack, returnAsset } = useApp();
  const asset = assets.find((a) => a.id === selectedAssetId);
  const [pendingReturnId, setPendingReturnId] = useState(null);

  if (!asset) {
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

  const owner = asset.assignedTo ? employees.find((e) => e.id === asset.assignedTo) : null;

  return (
    <div style={{ padding: 28, maxWidth: 760 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CategoryIcon category={asset.category} size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
            {asset.brand} {asset.model}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{asset.id}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusPill status={asset.status} />
        </div>
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>Asset Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <Row label="Asset ID" value={asset.id} />
          <Row label="Category" value={asset.category} />
          <Row label="Brand" value={asset.brand} />
          <Row label="Model" value={asset.model} />
          <Row label="Serial Number" value={asset.serial} />
          <Row label="Condition" value={asset.condition} />
          <Row label="Branch / Location" value={asset.branch} />
          <Row label="Status" value={<StatusPill status={asset.status} />} />
        </div>

        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 10 }}>Assignment</div>
          {owner ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: owner.avatarColor,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {owner.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{owner.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {owner.role} · {owner.location}
                  </div>
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
              {asset.status === "Assigned" ? "Assigned to a branch or department." : "Not currently assigned to anyone."}
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
