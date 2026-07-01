import { useState, useEffect } from "react";
import {
  Boxes, Wifi, Code2, Mail, Users, Building2,
  BarChart2, MapPin, Package, ClipboardCheck, ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { NAVY, ORANGE } from "../theme.js";

function Tile({ icon, label, desc, stat, onClick, navigable, gs }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...gs,
        background: "#fff",
        border: `1px solid ${hovered && navigable ? ORANGE + "55" : "#eef0f3"}`,
        borderRadius: 14,
        padding: "18px 20px",
        cursor: navigable ? "pointer" : "default",
        transition: "box-shadow .15s, transform .15s, border-color .15s",
        boxShadow: hovered && navigable ? "0 8px 24px rgba(15,23,42,0.09)" : "none",
        transform: hovered && navigable ? "translateY(-2px)" : "none",
        opacity: navigable ? 1 : 0.72,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: navigable ? "#fef3e2" : "#f1f5f9",
            color: navigable ? ORANGE : "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 11,
          }}
        >
          {icon}
        </div>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0f172a", marginBottom: 4 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>

      <div
        style={{
          fontSize: 11.5,
          fontWeight: 700,
          color: navigable ? NAVY : "#94a3b8",
          display: "flex",
          alignItems: "center",
          gap: 3,
          marginTop: 12,
        }}
      >
        {stat}
        {navigable && <ChevronRight size={12} />}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { navigateTo } = useApp();

  const [stats, setStats] = useState({ total: 0, inStock: 0, assigned: 0 });
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const unwrap = (d) => (Array.isArray(d) ? d : d?.results ?? []);
    const normalize = (s) => (s || "").trim().toLowerCase();

    async function fetchAll() {
      const [computers, printers, hardware, assignedAssets, employees] = await Promise.all([
        apiGet(ENDPOINTS.get_all_computers).catch(() => []),
        apiGet(ENDPOINTS.get_all_printers).catch(() => []),
        apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
        apiGet(ENDPOINTS.get_all_assigned_assets).catch(() => []),
        apiGet(ENDPOINTS.get_all_employees).catch(() => []),
      ]);

      const all = [
        ...unwrap(computers),
        ...unwrap(printers),
        ...unwrap(hardware).filter((a) => a.pc_type === undefined && a.printer_type === undefined),
      ];

      setStats({
        total: all.length,
        inStock: all.filter((a) => normalize(a.status) === "in stock").length,
        assigned: unwrap(assignedAssets).length,
      });
      setEmployeeCount(unwrap(employees).length);
    }

    fetchAll();
  }, []);

  const nav = (key) => () => navigateTo(key);
  const noop = () => {};

  return (
    <div style={{ padding: "0 28px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "1fr",
          gap: 12,
        }}
      >
        {/* ── Row 1 ── */}
        <Tile
          gs={{ gridColumn: 1, gridRow: 1 }}
          icon={<Boxes size={18} />}
          label="Hardware"
          desc="Monitor lifecycle, status, and health of all physical devices across your network."
          stat={`${stats.total} active devices`}
          onClick={nav("inventory")}
          navigable
        />
        <Tile
          gs={{ gridColumn: 2, gridRow: 1 }}
          icon={<Wifi size={18} />}
          label="Networking"
          desc="Visualize topology, manage ports, and ensure seamless connectivity for regional hubs."
          stat="— global nodes"
          onClick={noop}
          navigable={false}
        />
        <Tile
          gs={{ gridColumn: 3, gridRow: 1 }}
          icon={<Code2 size={18} />}
          label="Software"
          desc="License compliance, version control, and enterprise-wide distribution monitoring."
          stat="— active licenses"
          onClick={noop}
          navigable={false}
        />
        <Tile
          gs={{ gridColumn: 4, gridRow: 1 }}
          icon={<Mail size={18} />}
          label="Emails"
          desc="Administrative control over corporate domains, mailboxes, and security aliases."
          stat="— active aliases"
          onClick={noop}
          navigable={false}
        />

        {/* ── Row 2 ── */}
        <Tile
          gs={{ gridColumn: 1, gridRow: 2 }}
          icon={<Users size={18} />}
          label="Employees"
          desc="Directory, profiles, and assigned equipment tracking for all staff members."
          stat={`${employeeCount} people`}
          onClick={nav("employees")}
          navigable
        />
        <Tile
          gs={{ gridColumn: 2, gridRow: 2 }}
          icon={<Building2 size={18} />}
          label="Daltex"
          desc="Regional logistics, department-specific assets, and local distribution."
          stat="Central hub active"
          onClick={nav("daltex")}
          navigable
        />
        <Tile
          gs={{ gridColumn: 3, gridRow: 2 }}
          icon={<BarChart2 size={18} />}
          label="Reporting"
          desc="Analytics on asset utilization, depreciation, and future forecasting."
          stat="— reports pending"
          onClick={noop}
          navigable={false}
        />
        <Tile
          gs={{ gridColumn: 4, gridRow: 2 }}
          icon={<MapPin size={18} />}
          label="Asset Tracking"
          desc="Movement history and checkout records for all managed inventory."
          stat={`${stats.assigned} items in transit`}
          onClick={nav("assignments")}
          navigable
        />

        {/* ── Row 3: only cols 2 & 3, cols 1 & 4 intentionally empty ── */}
        <Tile
          gs={{ gridColumn: 2, gridRow: 3 }}
          icon={<Package size={18} />}
          label="Stock"
          desc="Inventory levels for peripherals and expendables."
          stat={`${stats.inStock} items in stock`}
          onClick={nav("stock")}
          navigable
        />
        <Tile
          gs={{ gridColumn: 3, gridRow: 3 }}
          icon={<ClipboardCheck size={18} />}
          label="Assignments"
          desc="Active checkouts and the hardware checkout wizard."
          stat={`${stats.assigned} active`}
          onClick={nav("assignments")}
          navigable
        />
      </div>
    </div>
  );
}
