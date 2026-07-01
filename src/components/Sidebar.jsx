import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAVY, ORANGE } from "../theme.js";
import daltexLogo from "../assets/daltex-logo-light-final.png";

export default function Sidebar({ items, activePage, onNavigate, onLogout, brand, sub, collapsed, onToggleCollapse }) {
  const width = collapsed ? 72 : 230;
  return (
    <div
      style={{
        width,
        background: NAVY,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "24px 12px" : "24px 3px",
        flexShrink: 0,
        transition: "width .18s ease, padding .18s ease",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "0 0 28px" : "0 8px 28px" }}>
        {collapsed ? null : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={daltexLogo} alt="Daltex" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 6 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{brand}</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap" }}>{sub}</div>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            border: "none",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 7,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cbd5e1",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((item) => {
          const active = item.key === activePage;
          const disabled = !!item.disabled;
          return (
            <button
              key={item.key}
              onClick={disabled ? undefined : () => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 11,
                padding: collapsed ? "10px" : "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: disabled ? "default" : "pointer",
                textAlign: "left",
                background: active ? ORANGE : "transparent",
                color: active ? "#fff" : disabled ? "rgba(255,255,255,0.25)" : "#cbd5e1",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                transition: "background .15s",
                whiteSpace: "nowrap",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {item.icon}
              {!collapsed && item.label}
            </button>
          );
        })}
      </div>
      <button
         onClick={() => {
  onLogout && onLogout();
}}
        title={collapsed ? "Sign out" : undefined}
        style={{
          marginTop: 12,
          background: ORANGE,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: collapsed ? "12px" : "12px 14px",
          fontWeight: 700,
          fontSize: 13.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {!collapsed && "Sign out"}
      </button>
    </div>
  );
}
