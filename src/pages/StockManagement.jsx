import { useState } from "react";
import { Archive, Wrench, Headphones, ChevronRight } from "lucide-react";
import { NAVY, ORANGE } from "../theme.js";
import { useApp } from "../context/AppContext.jsx";

function CategoryCard({ icon, label, desc, onClick }) {
  const [hovered, setHovered] = useState(false);
  const navigable = !!onClick;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered && navigable ? ORANGE + "55" : "#eef0f3"}`,
        borderRadius: 14,
        padding: "20px 22px",
        cursor: navigable ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: hovered && navigable ? "0 8px 24px rgba(15,23,42,0.09)" : "none",
        transform: hovered && navigable ? "translateY(-2px)" : "none",
        opacity: navigable ? 1 : 0.75,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        {icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, flex: 1, marginBottom: 14 }}>{desc}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: navigable ? NAVY : "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
        {navigable ? "Browse →" : "— items"} <ChevronRight size={12} />
      </div>
    </div>
  );
}

export default function StockManagement() {
  const { navigateTo } = useApp();
  return (
    <div style={{ padding: "24px 28px" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
          Home &rsaquo; Stock
        </div>
        <div style={{ fontWeight: 900, fontSize: 24, color: "#0f172a", marginBottom: 4 }}>
          Stock Management
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", maxWidth: 500 }}>
          Manage your organizational inventory levels, spare parts availability, and peripheral accessories across all branches.
        </div>
      </div>

      {/* ── Category cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <CategoryCard
          icon={<Archive size={18} />}
          label="Assets"
          desc="Detailed catalog of primary hardware units including laptops, workstations, and servers currently in warehouse storage."
        />
        <CategoryCard
          icon={<Wrench size={18} />}
          label="Spare Parts"
          desc="Maintenance components, internal hardware replacements, RAM modules, and storage drives for repairs and upgrades."
        />
        <CategoryCard
          icon={<Headphones size={18} />}
          label="Accessories"
          desc="Peripheral equipment including monitors, keyboards, mice, docking stations, and ergonomic workspace tools."
          onClick={() => navigateTo("accessories")}
        />
      </div>

      {/* ── Low Stock Alerts (full width) ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Low Stock Alerts</div>
          <button
            style={{ fontSize: 12.5, fontWeight: 700, color: ORANGE, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            View All
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #eef0f3", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["ITEM NAME", "CATEGORY", "AVAILABLE", "THRESHOLD", "STATUS"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "10px 20px", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textAlign: "left", borderBottom: "1px solid #eef0f3" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
                  No low stock alerts at this time.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
