import { RotateCcw, Laptop, Wrench, ClipboardCheck } from "lucide-react";
import { getEmployeeFromHistory } from "../../utils/assetHelpers.js";

export default function AssetHistoryList({ history, loading }) {
  if (loading) {
    return <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading history…</div>;
  }

  if (!history || history.length === 0) {
    return <div style={{ fontSize: 13, color: "#94a3b8" }}>No history found for this asset.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {history.map((h, i) => {
        const type = (h.action_type || h.action || h.type || "").toLowerCase();

        let icon = <ClipboardCheck size={13} color="#475569" />;
        let bg = "#e2e8f0";

        if (type === "issue" || type === "assign" || type === "assigned") {
          icon = <Laptop size={13} color="#d97706" />;
          bg = "#fef3e2";
        } else if (type === "return" || type === "returned") {
          icon = <RotateCcw size={13} color="#16a34a" />;
          bg = "#dcfce7";
        } else if (type === "repair") {
          icon = <Wrench size={13} color="#dc2626" />;
          bg = "#fee2e2";
        }

        return (
          <div
            key={h.id || i}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                flexShrink: 0,
                background: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                  {getEmployeeFromHistory(h) || "—"}
                </div>

                <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 10 }}>
                  {h.assignment_date || h.date || h.created_at || ""}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                {h.action_type || h.action || h.type || "Event"}
                {h.asset_serial ? ` · ${h.asset_serial}` : ""}
              </div>

              {h.notes && (
                <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                  {h.notes}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
