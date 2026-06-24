import { Plus, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { NAVY, ORANGE } from "../theme.js";

export default function Sidebar({ items, activePage, onNavigate, onAddNewAsset, brand, sub, collapsed, onToggleCollapse }) {
  const width = collapsed ? 72 : 230;
  return (
    <div
      style={{
        width,
        background: NAVY,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: collapsed ? "24px 12px" : "24px 16px",
        flexShrink: 0,
        transition: "width .18s ease, padding .18s ease",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: collapsed ? "0 0 28px" : "0 8px 28px" }}>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.3, whiteSpace: "nowrap" }}>{brand}</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap" }}>{sub}</div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            border: "none",
            background: "rgba(255,255,255,0.08)",
            borderRadius: 7,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#cbd5e1",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((item) => {
          const active = item.key === activePage;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 11,
                padding: collapsed ? "10px" : "10px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                background: active ? ORANGE : "transparent",
                color: active ? "#fff" : "#cbd5e1",
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                transition: "background .15s",
                whiteSpace: "nowrap",
              }}
            >
              {item.icon}
              {!collapsed && item.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={() => (onAddNewAsset ? onAddNewAsset() : onNavigate("newAssignment"))}
        title={collapsed ? "Add New Asset" : undefined}
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
        <Plus size={16} /> {!collapsed && "Add New Asset"}
      </button>
    </div>
  );
}
