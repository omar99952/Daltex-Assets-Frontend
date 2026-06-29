import { useState, useEffect } from "react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { ClipboardCheck, Users, Building2, Wrench, ChevronRight, Laptop } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import { NAVY, ORANGE } from "../theme.js";

export default function Dashboard() {
  const { navigateTo, goToInventory } = useApp();
  const [stats, setStats] = useState({ total: 0, assigned: 0, inStock: 0, maintenance: 0 });
  const [branches, setBranches] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [computers, printers, hardware, branchData, historyData] = await Promise.all([
          apiGet(ENDPOINTS.get_all_computers).catch(() => []),
          apiGet(ENDPOINTS.get_all_printers).catch(() => []),
          apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
          apiGet(ENDPOINTS.get_all_branches).catch(() => []),
          apiGet(ENDPOINTS.global_history_to_track_assets).catch(() => []),
        ]);
        const all = [
          ...(Array.isArray(computers) ? computers : []),
          ...(Array.isArray(printers) ? printers : []),
          ...(Array.isArray(hardware) ? hardware : []),
        ];
        setStats({
          total: all.length,
          assigned: all.filter((a) => (a.status || "").toLowerCase() === "assigned").length,
          inStock: all.filter((a) => (a.status || "").toLowerCase() === "in stock").length,
          maintenance: all.filter((a) => (a.status || "").toLowerCase() === "repair").length,
        });
        setBranches(
          (Array.isArray(branchData) ? branchData : []).map((b) => ({
            id: String(b.branch_id || b.id),
            name: b.name_en || b.name || "",
            assets: b.assets || 0,
          }))
        );
        const hist = Array.isArray(historyData) ? historyData : [];
        setActivity(
          hist.slice(0, 6).map((h, i) => ({
            id: String(h.id || i),
            title: h.asset_serial || h.serial_number || "Asset Event",
            desc: h.employee_name || h.description || "",
            time: h.date || h.created_at || "",
          }))
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const pctAssigned = stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0;

  return (
    <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16 }}>
        <StatCard
          icon={<ClipboardCheck size={18} color={NAVY} />}
          iconBg="#e2e8f0"
          label="TOTAL ASSETS"
          value={loading ? "…" : stats.total}
          onClick={() => goToInventory(null)}
        />
        <StatCard
          icon={<Users size={18} color={NAVY} />}
          iconBg="#e2e8f0"
          label="ASSIGNED"
          value={loading ? "…" : stats.assigned}
          onClick={() => goToInventory("Assigned")}
          sub={
            <div style={{ height: 6, borderRadius: 99, background: "#eef0f3", overflow: "hidden" }}>
              <div style={{ width: `${pctAssigned}%`, height: "100%", background: NAVY }} />
            </div>
          }
        />
        <StatCard
          icon={<Building2 size={18} color={NAVY} />}
          iconBg="#e2e8f0"
          label="IN STOCK"
          value={loading ? "…" : stats.inStock}
          onClick={() => goToInventory("In Stock")}
          sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Available for deployment</div>}
        />
        <StatCard
          icon={<Wrench size={18} color={NAVY} />}
          iconBg="#e2e8f0"
          label="IN MAINTENANCE"
          value={loading ? "…" : stats.maintenance}
          onClick={() => goToInventory("Repair")}
        />
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <Card style={{ flex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Branch Distribution</div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2 }}>Asset allocation across operational hubs</div>
            </div>
            <button
              onClick={() => navigateTo("branches")}
              style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, color: "#475569", background: "#fff", cursor: "pointer" }}
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {loading ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</div>
            ) : branches.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13 }}>No branch data available.</div>
            ) : (
              branches.slice(0, 5).map((b) => {
                const max = Math.max(...branches.map((x) => x.assets), 1);
                const pct = Math.round((b.assets / max) * 100);
                return (
                  <div key={b.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{b.name}</span>
                      <span style={{ color: "#64748b" }}>{b.assets} assets</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 99, background: "#eef0f3", overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: NAVY }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Recent Activity</div>
          <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 2, marginBottom: 16 }}>Assignment history</div>
          {loading ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading…</div>
          ) : activity.length === 0 ? (
            <div style={{ color: "#94a3b8", fontSize: 13 }}>No recent activity.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {activity.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "#fef3e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Laptop size={15} color={ORANGE} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.title}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8 }}>{a.time}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 1 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => navigateTo("assignments")}
            style={{ width: "100%", marginTop: 16, background: "#f8fafc", border: "1px solid #eef0f3", color: ORANGE, fontWeight: 700, fontSize: 13, padding: "10px", borderRadius: 8, cursor: "pointer" }}
          >
            View All Logs
          </button>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Branches Overview</div>
          <button
            onClick={() => navigateTo("branches")}
            style={{ fontSize: 12.5, color: ORANGE, fontWeight: 700, border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            View all <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
          {loading && <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading…</div>}
          {!loading && branches.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8" }}>No branches to display.</div>}
          {branches.slice(0, 4).map((b) => (
            <div key={b.id} style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{b.name}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{b.assets.toLocaleString()} assets</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
