import { ArrowLeft, Boxes, Users, ClipboardCheck } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { NAVY, ORANGE } from "../theme.js";

export default function BranchDetail() {
  const { branches, assets, employees, selectedBranchId, goBack } = useApp();
  const branch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Our seed assets use full branch names like "London HQ"; match loosely against the branch name.
  const branchAssets = assets.filter((a) => a.branch && branch.name && a.branch.toLowerCase().includes(branch.name.split(" ")[0].toLowerCase()));

  function empName(id) {
    const e = employees.find((e) => e.id === id);
    return e ? e.name : "—";
  }

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 18 }}
      >
        <ArrowLeft size={15} /> Back to Branches
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 10,
            background: NAVY,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {branch.id}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{branch.name}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{branch.region}</div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            fontWeight: 700,
            color: branch.health === "good" ? "#16a34a" : "#b45309",
            background: branch.health === "good" ? "#dcfce7" : "#fef3c7",
            padding: "6px 12px",
            borderRadius: 999,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 99, background: branch.health === "good" ? "#16a34a" : "#f59e0b" }} />
          {branch.health === "good" ? "Healthy" : "Needs Attention"}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="MANAGED ASSETS" value={branch.assets.toLocaleString()} />
        <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="DEPARTMENTS" value={branch.departments.length} />
        <StatCard icon={<ClipboardCheck size={17} color="#475569" />} iconBg="#e2e8f0" label="LOCAL INVENTORY MATCHES" value={branchAssets.length} />
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>Departments</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 22, marginTop: 12 }}>
          {branch.departments.map((d) => (
            <span key={d} style={{ background: "#fef3e2", color: ORANGE, fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 999 }}>
              {d}
            </span>
          ))}
        </div>

        <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a", marginBottom: 12 }}>Assets at this branch</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["ASSET", "MODEL", "STATUS", "ASSIGNED TO"].map((h) => (
                <th key={h} style={{ padding: "8px 0", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {branchAssets.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon category={a.category} size={14} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.id}</span>
                </td>
                <td style={{ fontSize: 13, color: "#475569" }}>{a.brand} {a.model}</td>
                <td><StatusPill status={a.status} /></td>
                <td style={{ fontSize: 13, color: "#475569" }}>{a.assignedTo ? empName(a.assignedTo) : "—"}</td>
              </tr>
            ))}
            {branchAssets.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>
                  No inventory records directly matched to this branch yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
