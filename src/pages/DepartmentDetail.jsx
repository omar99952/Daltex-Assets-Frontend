import { useState } from "react";
import { GitBranch } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import BackButton from "../components/BackButton.jsx";
import { NAVY } from "../theme.js";

export default function DepartmentDetail() {
  const {
    selectedDeptName,
    selectedSectorName,
    selectedBranchName,
    goBack,
  } = useApp();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");

  return (
    <div style={{ padding: "24px 28px" }}>
      <BackButton onClick={() => goBack()} label="Back to Departments" />

      {/* ── Header ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>
          Home &rsaquo; Daltex &rsaquo;{" "}
          {selectedBranchName && <span>{selectedBranchName} &rsaquo; </span>}
          {selectedSectorName && <span>{selectedSectorName} &rsaquo; </span>}
          <span style={{ color: "#475569", fontWeight: 700 }}>{selectedDeptName || "Department"}</span>
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a" }}>{selectedDeptName || "Department"}</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>Sub-departments within this department.</div>
      </div>

      {/* ── Stat card ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<GitBranch size={17} color={NAVY} />} iconBg="#e2e8f0" label="SUB-DEPARTMENTS" value={0} />
      </div>

      {/* ── Sub-Department Index table ── */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 12px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Sub-Department Index</div>
          <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "4px 10px", borderRadius: 999 }}>No sub-departments</span>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 20px 14px", alignItems: "center" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sub-departments…"
            style={{ flex: 1, border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, outline: "none", color: "#0f172a" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none" }}
          >
            <option value="name-asc">الاسم أ ← ي</option>
            <option value="name-desc">الاسم ي ← أ</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["SUB-DEPARTMENT NAME", "ID", ""].map((h) => (
                <th key={h} style={{ padding: "8px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} style={{ padding: 48, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
                No sub-departments found.
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
