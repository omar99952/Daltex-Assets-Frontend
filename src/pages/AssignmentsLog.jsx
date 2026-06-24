import { useState } from "react";
import { Plus, RotateCcw, Laptop, Wrench, ClipboardCheck } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import Card from "../components/Card.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { ORANGE } from "../theme.js";

export default function AssignmentsLog() {
  const { activity, assets, employees, navigateTo, goBack, returnAsset } = useApp();
  const assignedAssets = assets.filter((a) => a.status === "Assigned");
  const [pendingReturnId, setPendingReturnId] = useState(null);

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Assignments</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Track active checkouts and recent assignment activity.</div>
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
          <div style={{ padding: "18px 20px", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Active Checkouts</div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "32%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["ASSET", "ASSIGNED TO", "BRANCH", "CONDITION", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignedAssets.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "13px 20px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CategoryIcon category={a.category} size={14} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.brand} {a.model}
                    </span>
                  </td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{empName(a.assignedTo)}</td>
                  <td style={{ padding: "13px 20px", fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.branch}</td>
                  <td style={{ padding: "13px 20px", fontSize: 12.5, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.condition}</td>
                  <td style={{ padding: "13px 12px" }}>
                    <button
                      onClick={() => setPendingReturnId(a.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        border: "1px solid #eef0f3",
                        background: "#fff",
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 7,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <RotateCcw size={12} /> Return
                    </button>
                  </td>
                </tr>
              ))}
              {assignedAssets.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                    No active checkouts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card style={{ width: 360, flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>Activity Log</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activity.map((a) => (
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
                  <div style={{ fontSize: 11.5, color: a.type === "return" ? "#16a34a" : "#94a3b8", marginTop: 1 }}>{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be unassigned from the current employee."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => { returnAsset(pendingReturnId); setPendingReturnId(null); }}
          onCancel={() => setPendingReturnId(null)}
        />
      )}
    </div>
  );
}
