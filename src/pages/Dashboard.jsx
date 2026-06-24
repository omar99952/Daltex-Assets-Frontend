import { ClipboardCheck, Users, Building2, Wrench, Filter, ChevronRight, Laptop, RotateCcw } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import { Dot } from "../components/Misc.jsx";
import { NAVY, ORANGE } from "../theme.js";

export default function Dashboard() {
  const { stats, branches, activity, navigateTo, goToInventory } = useApp();

  const branchDist = [
    { name: "Sadat City Farm", value: 542, pct: 43, color: NAVY },
    { name: "Khatatba Branch", value: 318, pct: 25, color: ORANGE },
    { name: "Headquarters (Cairo)", value: 290, pct: 23, color: NAVY },
    { name: "Logistics & Sorting", value: 122, pct: 9, color: "#cbd5e1" },
  ];

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          icon={<ClipboardCheck size={18} color={NAVY} />}
          iconBg="#e2e8f0"
          label="TOTAL ASSETS"
          value={stats.total + 1263}
          badge="+2.4%"
          onClick={() => goToInventory(null)}
        />
        <StatCard
          icon={<Users size={18} color="#475569" />}
          iconBg="#e2e8f0"
          label="ASSIGNED"
          value={stats.assigned + 1093}
          onClick={() => goToInventory("Assigned")}
          sub={
            <div style={{ height: 6, borderRadius: 99, background: "#eef0f3", overflow: "hidden" }}>
              <div style={{ width: "86%", height: "100%", background: ORANGE }} />
            </div>
          }
        />
        <StatCard
          icon={<Building2 size={18} color="#475569" />}
          iconBg="#e2e8f0"
          label="IN STOCK"
          value={stats.inStock + 161}
          onClick={() => goToInventory("In Stock")}
          sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Available for deployment</div>}
        />
        <StatCard
          icon={<Wrench size={18} color="#dc2626" />}
          iconBg="#fee2e2"
          label="IN MAINTENANCE"
          value={stats.maintenance + 12}
          danger
          onClick={() => goToInventory("Repair")}
          sub={
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>8 Critical</span>
              <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999 }}>6 Pending</span>
            </div>
          }
        />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <Card style={{ flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Branch Distribution</div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>Asset allocation across primary operational hubs</div>
            </div>
            <button
              onClick={() => navigateTo("branches")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid #eef0f3",
                borderRadius: 7,
                padding: "7px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#475569",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <Filter size={13} /> Filter
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {branchDist.map((b) => (
              <div key={b.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{b.name}</span>
                  <span style={{ color: "#64748b" }}>
                    {b.value} Assets ({b.pct}%)
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "#eef0f3", overflow: "hidden" }}>
                  <div style={{ width: `${b.pct}%`, height: "100%", background: b.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 22, fontSize: 12, color: "#64748b" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Dot color={NAVY} />
              Laptops
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Dot color={ORANGE} />
              Networking
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Dot color="#0f172a" />
              Mobile Devices
            </span>
          </div>
        </Card>

        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Recent Activity</div>
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2, marginBottom: 16 }}>Live assignment logs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activity.slice(0, 4).map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    flexShrink: 0,
                    background:
                      a.type === "assign" ? "#fef3e2" : a.type === "return" ? "#dcfce7" : a.type === "repair" ? "#fee2e2" : "#e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {a.type === "assign" && <Laptop size={15} color={ORANGE} />}
                  {a.type === "return" && <RotateCcw size={15} color="#16a34a" />}
                  {a.type === "repair" && <Wrench size={15} color="#dc2626" />}
                  {a.type === "audit" && <ClipboardCheck size={15} color="#475569" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.title}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8 }}>{a.time}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 1 }}>{a.desc}</div>
                  <div style={{ fontSize: 11.5, color: "#16a34a", marginTop: 1 }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigateTo("assignments")}
            style={{
              width: "100%",
              marginTop: 16,
              background: "#f8fafc",
              border: "1px solid #eef0f3",
              color: ORANGE,
              fontWeight: 700,
              fontSize: 13,
              padding: "10px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            View All Logs
          </button>
        </Card>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ background: NAVY, borderRadius: 12, padding: 22, flex: 1, color: "#fff" }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Audit Due</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 8, lineHeight: 1.5 }}>
            Headquarters inventory audit is scheduled for in 3 days.
          </div>
        </div>
        <Card style={{ flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Branches Overview</div>
            <button
              onClick={() => navigateTo("branches")}
              style={{ fontSize: 12.5, color: ORANGE, fontWeight: 700, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
            {branches.slice(0, 3).map((b) => (
              <div key={b.id} style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{b.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{b.assets.toLocaleString()} assets</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

