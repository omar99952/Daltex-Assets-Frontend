import { useState } from "react";
import { TrendingUp, ChevronRight } from "lucide-react";
import Card from "./Card.jsx";

export default function StatCard({ icon, iconBg, label, value, badge, sub, danger, onClick }) {
  const [hover, setHover] = useState(false);
  const clickable = typeof onClick === "function";

  return (
    <Card
      onMouseEnter={() => clickable && setHover(true)}
      onMouseLeave={() => clickable && setHover(false)}
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        cursor: clickable ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: clickable && hover ? "0 8px 20px rgba(15,23,42,0.08)" : "none",
        transform: clickable && hover ? "translateY(-2px)" : "none",
        borderColor: clickable && hover ? "#d1d5db" : "#eef0f3",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 9,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        {badge && (
          <span style={{ color: "#16a34a", fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <TrendingUp size={13} />
            {badge}
          </span>
        )}
        {!badge && clickable && (
          <ChevronRight size={15} color={hover ? "#475569" : "#cbd5e1"} style={{ transition: "color .15s" }} />
        )}
      </div>
      <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 700, letterSpacing: 0.4, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: danger ? "#dc2626" : "#0f172a" }}>{value}</div>
      {sub && <div style={{ marginTop: 8 }}>{sub}</div>}
    </Card>
  );
}
