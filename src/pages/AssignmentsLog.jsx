import { useState, useEffect } from "react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { Plus, Laptop, RotateCcw, Wrench, ClipboardCheck } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { ORANGE } from "../theme.js";

function mapAssignedAsset(item) {
  const asset = item.asset || item.hardware_asset || item.computer || item.printer || item;

  return {
    id: String(item.id || asset?.id || asset?.serial_number || Math.random()),
    brand: asset?.brand || item.brand || "",
    model: asset?.model_or_pn || asset?.model || item.model_or_pn || item.model || "",
    serial: asset?.serial_number || asset?.serial || item.serial_number || item.serial || "",
    status: "Assigned",
    category: asset?.category || item.category || "Asset",
    condition: asset?.condition || item.condition || "",
    branch:
      item.branch_name ||
      item.branch ||
      asset?.branch?.name_en ||
      asset?.branch?.name ||
      asset?.branch ||
      "",
   assignedTo:
  item.employee?.name_en ||
  item.employee?.name ||
  item.assigned_to_name ||
  item.employee_name ||
  "—",
  };
}

export default function AssignmentsLog() {
  const { navigateTo, goBack } = useApp();

  const [assignedAssets, setAssignedAssets] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [assignedData, historyData] = await Promise.all([
          apiGet(ENDPOINTS.get_all_assigned_assets).catch(() => []),
          apiGet(ENDPOINTS.global_history_to_track_assets).catch(() => []),
        ]);

        const assignedArray = Array.isArray(assignedData)
          ? assignedData
          : assignedData.results || [];

        setAssignedAssets(assignedArray.map(mapAssignedAsset));

        const hist = Array.isArray(historyData)
          ? historyData
          : historyData.results || [];

        setActivity(
          hist.slice(0, 10).map((h, i) => ({
            id: String(h.id || i),
            type: (h.action || h.type || "audit").toLowerCase(),
            title: h.asset_serial || h.serial_number || "Asset Event",
            desc: h.employee_name || h.description || "",
            time: h.date || h.created_at || "",
            sub: h.notes || "",
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  function activityIcon(type) {
    if (type === "assign") return <Laptop size={15} color={ORANGE} />;
    if (type === "return") return <RotateCcw size={15} color="#16a34a" />;
    if (type === "repair") return <Wrench size={15} color="#dc2626" />;
    return <ClipboardCheck size={15} color="#475569" />;
  }

  function activityBg(type) {
    if (type === "assign") return "#fef3e2";
    if (type === "return") return "#dcfce7";
    if (type === "repair") return "#fee2e2";
    return "#e2e8f0";
  }

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Assignments</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Track active checkouts and recent assignment activity.
          </div>
        </div>

        <button
          onClick={() => navigateTo("newAssignment")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "none",
            borderRadius: 8,
            padding: "10px 18px",
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            background: ORANGE,
            cursor: "pointer",
          }}
        >
          <Plus size={14} /> New Assignment
        </button>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <Card style={{ flex: 1, minWidth: 0, padding: 0 }}>
          <div style={{ padding: "18px 20px", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>
            Active Checkouts
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "35%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>

            <thead>
              <tr style={{ textAlign: "left" }}>
                {["ASSET", "ASSIGNED TO", "BRANCH", "CONDITION"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 20px",
                      fontSize: 11,
                      color: "#94a3b8",
                      fontWeight: 700,
                      borderBottom: "1px solid #eef0f3",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    Loading…
                  </td>
                </tr>
              ) : assignedAssets.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    No active checkouts.
                  </td>
                </tr>
              ) : (
                assignedAssets.map((a) => (
                  <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "13px 20px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 7,
                          background: "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <CategoryIcon category={a.category} size={14} />
                      </div>

                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a.brand} {a.model}
                      </span>
                    </td>

                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.assignedTo || "—"}
                    </td>

                    <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.branch || "—"}
                    </td>

                    <td style={{ padding: "13px 20px", fontSize: 12.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.condition || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        <Card style={{ width: 360, flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
            Activity Log
          </div>

          {loading ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading…</div>
          ) : activity.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>No recent activity.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {activity.map((a) => (
                <div key={a.id} style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      flexShrink: 0,
                      background: activityBg(a.type),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activityIcon(a.type)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                        {a.title}
                      </span>
                      <span style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 8 }}>
                        {a.time}
                      </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 1 }}>
                      {a.desc}
                    </div>

                    {a.sub && (
                      <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 1 }}>
                        {a.sub}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}