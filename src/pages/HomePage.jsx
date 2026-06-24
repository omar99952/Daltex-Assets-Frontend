import { LayoutGrid, Boxes, Users, Building2, ClipboardCheck, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { ORANGE } from "../theme.js";

export default function HomePage() {
  const { navigateTo, currentUser, stats, employees, branches } = useApp();

  const tiles = [
    {
      key: "dashboard",
      label: "Dashboard",
      desc: "Overview of assets, activity, and branch health",
      icon: <LayoutGrid size={22} />,
      stat: `${stats.total + 1263} assets tracked`,
    },
    {
      key: "inventory",
      label: "Inventory",
      desc: "Browse, register, and manage hardware by category",
      icon: <Boxes size={22} />,
      stat: `${stats.total} items`,
    },
    {
      key: "employees",
      label: "Employees",
      desc: "Directory, profiles, and assigned equipment",
      icon: <Users size={22} />,
      stat: `${employees.length} people`,
    },
    {
      key: "branches",
      label: "Branches",
      desc: "Regional hubs, departments, and asset distribution",
      icon: <Building2 size={22} />,
      stat: `${branches.length} branches`,
    },
    {
      key: "assignments",
      label: "Assignments",
      desc: "Active checkouts and the hardware checkout wizard",
      icon: <ClipboardCheck size={22} />,
      stat: `${stats.assigned} checked out`,
    },
  ];

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 800, fontSize: 26, color: "#0f172a" }}>
          Welcome back{currentUser?.name ? `, ${currentUser.name.split(" ")[0]}` : ""}
        </div>
        <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>Where would you like to go?</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {tiles.map((t) => (
          <div
            key={t.key}
            onClick={() => navigateTo(t.key)}
            style={{
              background: "#fff",
              border: "1px solid #eef0f3",
              borderRadius: 14,
              padding: 24,
              cursor: "pointer",
              transition: "box-shadow .15s, transform .15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.10)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 11, background: "#fef3e2", color: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              {t.icon}
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>{t.label}</div>
            <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 14 }}>{t.desc}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              {t.stat} <ChevronRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

