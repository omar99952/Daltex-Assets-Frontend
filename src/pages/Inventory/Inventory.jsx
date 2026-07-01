import { useState, useEffect } from "react";
import { Download, Plus, ChevronRight } from "lucide-react";
import { apiGet, apiPost } from "../../api/client.js";
import { ENDPOINTS } from "../../api/endpoints.js";
import { useApp } from "../../context/AppContext.jsx";
import { INVENTORY_CATEGORIES, categoryDataKey, normalizeArray, getEmployeeFromHistory } from "../../utils/assetHelpers.js";
import CategoryIcon from "../../components/CategoryIcon.jsx";
import Modal from "../../components/Modal.jsx";
import FormField, { inputStyle } from "../../components/FormField.jsx";
import { NAVY, ORANGE } from "../../theme.js";
import InventoryStatusView from "./InventoryStatusView.jsx";

const CAT_DESCS = {
  "laptops & pcs": "Laptops, workstations, and thin clients across all departments.",
  "pcs": "Laptops, workstations, and thin clients across all departments.",
  "printers": "Network and local printers, multifunction devices, and copiers.",
  "monitors": "External displays, collaborative panels, and specialized monitors.",
  "screens": "External displays, collaborative panels, and specialized monitors.",
  "tablets": "Mobile tablets and handheld devices for field and office use.",
  "networking": "Switches, routers, access points, and network infrastructure.",
  "peripherals": "Keyboards, mice, headsets, and other workstation accessories.",
  "ups": "Uninterruptible power supplies and power protection devices.",
};

function catDesc(name) {
  return CAT_DESCS[name.toLowerCase()] || `Browse and manage all ${name} assets.`;
}

function deployStatus(h) {
  const type = String(h.action_type || h.action || h.type || "").toLowerCase();
  if (type.includes("assign") || type.includes("issue")) return "Active";
  if (type.includes("return")) return "Returned";
  if (type.includes("repair")) return "Repair";
  return "Deploying";
}

function StatusBadge({ status }) {
  const map = {
    Active:    { bg: "#dcfce7", color: "#16a34a" },
    Deploying: { bg: "#fef3e2", color: ORANGE },
    Returned:  { bg: "#f1f5f9", color: "#64748b" },
    Repair:    { bg: "#fee2e2", color: "#dc2626" },
  };
  const s = map[status] || map.Deploying;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
      {status}
    </span>
  );
}

function CategoryCard({ cat, count, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? ORANGE + "55" : "#eef0f3"}`,
        borderRadius: 14,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: hovered ? "0 8px 24px rgba(15,23,42,0.09)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <CategoryIcon category={categoryDataKey(cat.name)} size={18} />
      </div>

      <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", marginBottom: 3 }}>{cat.name}</div>

      {cat.nameAr && (
        <div style={{ fontSize: 11.5, color: "#64748b", direction: "rtl", textAlign: "right", marginBottom: 4, lineHeight: 1.3 }}>
          {cat.nameAr}
        </div>
      )}

      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.55, flex: 1, marginBottom: 12 }}>
        {catDesc(cat.name)}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 3 }}>
        {count != null ? `${count} assets tracked` : "Browse assets"}
        <ChevronRight size={12} />
      </div>
    </div>
  );
}


export default function Inventory() {
  const {
    inventoryStatusFilter,
    setInventoryStatusFilter,
    goBack,
    navigateTo,
    setInventoryCategory,
    setInventoryCategoryId,
  } = useApp();

  const [categories, setCategories]     = useState([]);
  const [catLoading, setCatLoading]     = useState(true);
  const [countMap, setCountMap] = useState({});
  const [recentHistory, setRecentHistory]       = useState([]);
  const [historyLoading, setHistoryLoading]     = useState(true);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatNameEn, setNewCatNameEn]       = useState("");
  const [newCatNameAr, setNewCatNameAr]       = useState("");
  const [addCatError, setAddCatError]         = useState("");
  const [addCatLoading, setAddCatLoading]     = useState(false);

  // Fetch dynamic categories from base-assets endpoint
  useEffect(() => {
    apiGet(ENDPOINTS.get_all_base_categories)
      .then((data) => {
        const arr = normalizeArray(data);
        setCategories(
          arr.length > 0
            ? arr.map((c) => ({ id: c.id, name: c.name_en || c.name || String(c.id), nameAr: c.name_ar || "" }))
            : INVENTORY_CATEGORIES.map((name, i) => ({ id: i, name, nameAr: "" }))
        );
      })
      .catch(() => setCategories(INVENTORY_CATEGORIES.map((name, i) => ({ id: i, name, nameAr: "" }))))
      .finally(() => setCatLoading(false));
  }, []);

  // Fetch all asset counts for cards + fleet health
  useEffect(() => {
    async function fetchCounts() {
      const [computers, printers, monitors, tablets, hardware] = await Promise.all([
        apiGet(ENDPOINTS.get_all_computers).catch(() => []),
        apiGet(ENDPOINTS.get_all_printers).catch(() => []),
        apiGet(ENDPOINTS.get_all_monitors).catch(() => []),
        apiGet(ENDPOINTS.get_all_tablets).catch(() => []),
        apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
      ]);

      const map = {};

      const addGroup = (raw, key) => {
        map[key] = (map[key] || 0) + normalizeArray(raw).length;
      };

      addGroup(computers, "laptops & pcs");
      addGroup(printers, "printers");
      addGroup(monitors, "monitors");
      addGroup(tablets, "tablets");

      normalizeArray(hardware).forEach((a) => {
        const cat = (a.category?.name_en || a.category?.name || String(a.category || "other")).toLowerCase();
        map[cat] = (map[cat] || 0) + 1;
      });

      setCountMap(map);
    }

    fetchCounts();
  }, []);

  // Fetch recent global assignment history
  useEffect(() => {
    apiGet(ENDPOINTS.global_history_to_track_assets)
      .then((data) => setRecentHistory(normalizeArray(data).slice(0, 6)))
      .catch(() => setRecentHistory([]))
      .finally(() => setHistoryLoading(false));
  }, []);

  function openCategory(name, id) {
    setInventoryCategory(name);
    setInventoryCategoryId(id ?? null);
    navigateTo("inventoryCategory");
  }

  function getCatCount(cat) {
    const key = cat.name.toLowerCase();
    if (countMap[key] !== undefined) return countMap[key];
    if (key === "pcs") return countMap["laptops & pcs"] ?? null;
    return null;
  }

  async function handleAddCategory() {
    const nameEn = newCatNameEn.trim();
    const nameAr = newCatNameAr.trim();
    if (!nameEn) { setAddCatError("English name is required."); return; }
    if (categories.some((c) => c.name.toLowerCase() === nameEn.toLowerCase())) {
      setAddCatError("A category with this name already exists."); return;
    }
    setAddCatLoading(true);
    setAddCatError("");
    try {
      const created = await apiPost(ENDPOINTS.post_new_asset_category, { name_en: nameEn, name_ar: nameAr });
      setCategories((prev) => [...prev, { id: created.id ?? Date.now(), name: created.name_en || nameEn, nameAr: created.name_ar || nameAr }]);
      setShowAddCategory(false);
      setNewCatNameEn("");
      setNewCatNameAr("");
    } catch {
      setAddCatError("Failed to create category. Please try again.");
    } finally {
      setAddCatLoading(false);
    }
  }

  function closeAddCategory() {
    setShowAddCategory(false);
    setNewCatNameEn("");
    setNewCatNameAr("");
    setAddCatError("");
  }

  if (inventoryStatusFilter) {
    return <InventoryStatusView statusFilter={inventoryStatusFilter} onClearFilter={() => setInventoryStatusFilter(null)} onBack={goBack} />;
  }

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
            Home &rsaquo; Hardware
          </div>
          <div style={{ fontWeight: 900, fontSize: 24, color: "#0f172a", marginBottom: 3 }}>Hardware Fleet</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            Manage regional hardware distribution and inventory cycles.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
          <button
            onClick={() => setShowAddCategory(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #eef0f3", borderRadius: 8, padding: "9px 14px", fontWeight: 700, fontSize: 13, color: "#475569", background: "#fff", cursor: "pointer" }}
          >
            <Plus size={14} /> Add Category
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 8, padding: "9px 16px", fontWeight: 700, fontSize: 13, color: "#fff", background: NAVY, cursor: "pointer" }}
          >
            <Download size={14} /> Export Fleet Data
          </button>
        </div>
      </div>

      {/* ── Category cards + Fleet Health ── */}
      {catLoading ? (
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 32 }}>Loading categories…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              count={getCatCount(cat)}
              onClick={() => openCategory(cat.name, cat.id)}
            />
          ))}
        </div>
      )}

      {/* ── Recent Deployments ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Recent Deployments</div>
          <button style={{ fontSize: 12.5, fontWeight: 700, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            View All History
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["ASSET ID", "CATEGORY", "EMPLOYEE", "BRANCH", "STATUS"].map((h) => (
                  <th key={h} style={{ padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textAlign: "left", borderBottom: "1px solid #eef0f3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 36, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
                    Loading…
                  </td>
                </tr>
              ) : recentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 36, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
                    No recent deployment history.
                  </td>
                </tr>
              ) : recentHistory.map((h, i) => {
                const serial  = h.asset_serial || h.serial || "—";
                const cat     = h.category?.name_en || h.category?.name || (typeof h.category === "string" ? h.category : null) || h.asset_category || "—";
                const emp     = getEmployeeFromHistory(h) || "—";
                const branch  = h.branch?.name_en || h.branch?.name || (typeof h.branch === "string" ? h.branch : null) || "—";
                const status  = deployStatus(h);

                return (
                  <tr key={h.id || i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: ORANGE, flexShrink: 0 }} />
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0f172a", fontFamily: "monospace" }}>
                          {serial}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{cat}</td>
                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{emp}</td>
                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569" }}>{branch}</td>
                    <td style={{ padding: "13px 20px" }}>
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Category Modal ── */}
      {showAddCategory && (
        <Modal
          title="Add Category"
          subtitle="Create a new asset category."
          onClose={closeAddCategory}
          width={420}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={closeAddCategory}
                style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={addCatLoading}
                style={{ border: "none", background: addCatLoading ? "#94a3b8" : NAVY, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: addCatLoading ? "not-allowed" : "pointer" }}
              >
                {addCatLoading ? "Adding…" : "Add Category"}
              </button>
            </div>
          }
        >
          {addCatError && (
            <div style={{ background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 16 }}>
              {addCatError}
            </div>
          )}
          <FormField label="Name (English)">
            <input
              value={newCatNameEn}
              onChange={(e) => { setNewCatNameEn(e.target.value); setAddCatError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
              placeholder="e.g. UPS Devices"
              style={inputStyle}
              autoFocus
            />
          </FormField>
          <FormField label="Name (Arabic)">
            <input
              value={newCatNameAr}
              onChange={(e) => setNewCatNameAr(e.target.value)}
              placeholder="مثال: أجهزة UPS"
              style={{ ...inputStyle, direction: "rtl" }}
            />
          </FormField>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            This category will appear on the assets page and assets can be assigned to it.
          </div>
        </Modal>
      )}
    </div>
  );
}
