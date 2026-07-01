import { useState, useEffect } from "react";
import { Building2, MapPin, Users, Layers, LayoutGrid, GitBranch, Component } from "lucide-react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { useApp } from "../context/AppContext.jsx";
import { ORANGE, NAVY } from "../theme.js";

function fmt(n) {
  if (n == null) return "—";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div style={{ flex: 1, background: "#fff", border: "1px solid #eef0f3", borderRadius: 14, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>
        {value} <span style={{ fontSize: 14, fontWeight: 700, color: "#475569" }}>{sub}</span>
      </div>
    </div>
  );
}

function OrgCard({ icon, label, desc, linkLabel, onClick, navigable }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={navigable ? onClick : undefined}
      onMouseEnter={() => navigable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1px solid ${hovered ? ORANGE + "66" : "#eef0f3"}`,
        borderRadius: 14,
        padding: "22px 24px",
        cursor: navigable ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: hovered ? "0 8px 24px rgba(15,23,42,0.09)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        display: "flex",
        flexDirection: "column",
        opacity: navigable ? 1 : 0.72,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 11, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        {icon}
      </div>
      <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{desc}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: navigable ? ORANGE : "#94a3b8" }}>
        {linkLabel} {navigable ? "→" : ""}
      </div>
    </div>
  );
}

export default function DaltexDirectory() {
  const { navigateTo } = useApp();

  const [counts, setCounts] = useState({ branches: null, employees: null, sectors: null, departments: null });

  useEffect(() => {
    const unwrap = (d) => Array.isArray(d) ? d : d?.results ?? [];
    Promise.all([
      apiGet(ENDPOINTS.get_all_branches).catch(() => []),
      apiGet(ENDPOINTS.get_all_employees).catch(() => []),
      apiGet(ENDPOINTS.get_all_sectors).catch(() => []),
      apiGet(ENDPOINTS.get_all_departments).catch(() => []),
    ]).then(([b, e, s, d]) => {
      setCounts({
        branches:    unwrap(b).length,
        employees:   unwrap(e).length,
        sectors:     unwrap(s).length,
        departments: unwrap(d).length,
      });
    });
  }, []);

  return (
    <div style={{ padding: "24px 28px" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
        Global &rsaquo; <span style={{ fontWeight: 700, color: "#475569" }}>Organizational Directory</span>
      </div>

      {/* ── Stat bar ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
        <StatCard icon={<Building2 size={18} />} label="Active Branches"  value={fmt(counts.branches)}    sub="Hubs"     />
        <StatCard icon={<Users     size={18} />} label="Total Employees"  value={fmt(counts.employees)}   sub="staff"    />
        <StatCard icon={<Layers    size={18} />} label="Total Sectors"    value={fmt(counts.sectors)}     sub="Sectors"  />
        <StatCard icon={<Component size={18} />} label="Departments"      value={fmt(counts.departments)} sub="Depts"    />
      </div>

      {/* ── Org cards grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <OrgCard
          icon={<LayoutGrid size={20} />}
          label="Company Names"
          desc="Manage parent organizations and legal entities across the global Daltex portfolio."
          linkLabel="View Companies"
          navigable={false}
        />
        <OrgCard
          icon={<MapPin size={20} />}
          label="Branches"
          desc="Overview of geographical operating locations, regional hubs, and local office facilities."
          linkLabel="View Branches"
          navigable
          onClick={() => navigateTo("branches")}
        />
        
      </div>
    </div>
  );
}
