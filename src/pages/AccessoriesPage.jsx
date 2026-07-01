import { useState, useEffect } from "react";
import {
  ChevronRight, Package, Headphones, Zap, Cable,
  Shield, Router, Cpu, Monitor, Mouse, Keyboard, Camera,
} from "lucide-react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { useApp } from "../context/AppContext.jsx";
import { normalizeArray } from "../utils/assetHelpers.js";
import { ORANGE, NAVY } from "../theme.js";
import BackButton from "../components/BackButton.jsx";

function catIcon(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("headphone") || n.includes("audio") || n.includes("speaker")) return <Headphones size={20} />;
  if (n.includes("monitor") || n.includes("screen") || n.includes("display"))  return <Monitor size={20} />;
  if (n.includes("mouse"))     return <Mouse    size={20} />;
  if (n.includes("keyboard"))  return <Keyboard size={20} />;
  if (n.includes("camera"))    return <Camera   size={20} />;
  if (n.includes("router") || n.includes("switch") || n.includes("network")) return <Router size={20} />;
  if (n.includes("firewall") || n.includes("security")) return <Shield size={20} />;
  if (n.includes("cable") || n.includes("cabling"))     return <Cable  size={20} />;
  if (n.includes("power") || n.includes("charger") || n.includes("ups")) return <Zap size={20} />;
  if (n.includes("processor") || n.includes("chip") || n.includes("cpu")) return <Cpu size={20} />;
  return <Package size={20} />;
}

function catDesc(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("headphone") || n.includes("audio")) return "Headsets, earphones, and conferencing audio equipment across departments.";
  if (n.includes("monitor") || n.includes("screen"))  return "External displays, collaborative panels, and specialized monitors.";
  if (n.includes("keyboard"))  return "Standard, ergonomic, and mechanical keyboards for workstation setups.";
  if (n.includes("mouse"))     return "Wired and wireless pointing devices for office and field use.";
  if (n.includes("camera"))    return "Webcams, security cameras, and conferencing visual hardware.";
  if (n.includes("cable") || n.includes("cabling")) return "Fiber optics, CAT6 reels, patch panels, and server rack wiring.";
  if (n.includes("power") || n.includes("charger"))  return "Power adapters, charging stations, and UPS peripherals.";
  if (n.includes("router") || n.includes("switch"))  return "Managed network switches, distribution layers, and rack-mounted equipment.";
  if (n.includes("firewall") || n.includes("security")) return "Next-gen threat protection hardware and VPN concentrators.";
  return `Browse and manage all ${name} accessories.`;
}

function CategoryCard({ cat }) {
  const [hovered, setHovered] = useState(false);
  const count = cat.count ?? cat.asset_count ?? cat.items_count ?? null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? ORANGE + "55" : "#eef0f3"}`,
        borderRadius: 14,
        padding: "22px 24px",
        cursor: "default",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: hovered ? "0 8px 24px rgba(15,23,42,0.09)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        {catIcon(cat.name)}
      </div>

      <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>
        {cat.name || cat.name_en}
      </div>

      {cat.name_ar && (
        <div style={{ fontSize: 12, color: "#64748b", direction: "rtl", textAlign: "right", marginBottom: 4 }}>
          {cat.name_ar}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, flex: 1, marginBottom: 14 }}>
        {catDesc(cat.name || cat.name_en || "")}
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: NAVY, display: "flex", alignItems: "center", gap: 4 }}>
        {count != null ? `${count} items` : "Bulk tracked"}
        <ChevronRight size={13} />
      </div>
    </div>
  );
}

export default function AccessoriesPage() {
  const { goBack } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    apiGet(ENDPOINTS.get_all_accessory_categories)
      .then((data) => setCategories(normalizeArray(data)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "24px 28px" }}>

      <BackButton onClick={() => goBack()} />

      {/* ── Breadcrumb + header ── */}
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 18 }}>
        Home &rsaquo; Stock &rsaquo; <span style={{ fontWeight: 700, color: "#475569" }}>Accessories</span>
      </div>

      <div style={{ marginBottom: 26 }}>
        <div style={{ fontWeight: 900, fontSize: 24, color: "#0f172a", marginBottom: 3 }}>Accessories</div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>
          Peripheral equipment and workspace accessory inventory by category.
        </div>
      </div>

      {/* ── Category grid ── */}
      {loading ? (
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading categories…</div>
      ) : categories.length === 0 ? (
        <div style={{ fontSize: 13, color: "#94a3b8", padding: "40px 0", textAlign: "center" }}>
          No accessory categories found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id ?? i} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
