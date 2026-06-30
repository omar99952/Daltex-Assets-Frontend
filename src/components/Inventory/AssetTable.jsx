import { ChevronRight, Trash2 } from "lucide-react";
import StatusPill from "../StatusPill.jsx";

function displayAssignedTo(value) {
  if (!value) return "—";
  if (typeof value === "string") return value;
  return value.employee_name_en || value.name_en || value.name || value.employee_code || "—";
}

export default function AssetTable({ assets, loading, onRowClick, onDeleteClick }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#f8fafc", textAlign: "left" }}>
          {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "", ""].map((h) => (
            <th
              key={h}
              style={{
                padding: "10px 20px",
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 700,
                letterSpacing: 0.3,
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
            <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              Loading assets…
            </td>
          </tr>
        ) : (
          assets.map((a) => (
            <tr
              key={a.id}
              onClick={() => onRowClick(a)}
              style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
              <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
              <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
              <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
              <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{displayAssignedTo(a.assignedTo)}</td>
              <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
              <td style={{ padding: "14px 20px" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteClick(a.id); }}
                  title="Delete asset"
                  style={{ border: "none", background: "none", cursor: "pointer", color: "#fca5a5" }}
                >
                  <Trash2 size={15} />
                </button>
              </td>
            </tr>
          ))
        )}

        {!loading && assets.length === 0 && (
          <tr>
            <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              No assets match your search in this category.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
