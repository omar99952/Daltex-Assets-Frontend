import { useState, useEffect } from "react";
import { ChevronRight, Boxes } from "lucide-react";
import { apiGet } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import BackButton from "../components/BackButton.jsx";
import { NAVY } from "../theme.js";

const PAGE_SIZE = 10;

export default function SectorDetail() {
  const {
    selectedSectorId,
    selectedSectorName,
    selectedBranchName,
    setSelectedDeptId,
    setSelectedDeptName,
    navigateTo,
    goBack,
  } = useApp();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedSectorId) return;
    setLoading(true);
    apiGet(ENDPOINTS.get_all_departments_inside_sector(selectedSectorId))
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.results ?? [];
        setDepartments(arr.map((d) => ({
          id: String(d.id),
          name: d.name_en || d.name || "",
          nameAr: d.name_ar || "",
        })));
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoading(false));
  }, [selectedSectorId]);

  function openDept(dept) {
    setSelectedDeptId(dept.id);
    setSelectedDeptName(dept.name);
    navigateTo("departmentDetail");
  }

  const filtered = departments
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "name-asc"
        ? a.name.localeCompare(b.name, "ar", { sensitivity: "base" })
        : b.name.localeCompare(a.name, "ar", { sensitivity: "base" })
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ padding: "24px 28px" }}>
      <BackButton onClick={() => goBack()} label="Back to Sectors" />

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>
            Home &rsaquo; Daltex &rsaquo;{" "}
            {selectedBranchName && <span>{selectedBranchName} &rsaquo; </span>}
            <span style={{ color: "#475569", fontWeight: 700 }}>{selectedSectorName || "Sector"}</span>
          </div>
          <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a" }}>{selectedSectorName || "Sector"}</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            {loading ? "Loading departments…" : `${departments.length} department${departments.length !== 1 ? "s" : ""} in this sector`}
          </div>
        </div>
      </div>

      {/* ── Stat card ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="DEPARTMENTS" value={loading ? "—" : departments.length} />
      </div>

      {/* ── Department Index table ── */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 12px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Department Index</div>
          <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "4px 10px", borderRadius: 999 }}>
            {loading ? "Loading…" : filtered.length === 0 ? "No departments" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 20px 14px", alignItems: "center" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search departments…"
            style={{ flex: 1, border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, outline: "none", color: "#0f172a" }}
          />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            style={{ border: "1px solid #eef0f3", borderRadius: 8, padding: "7px 11px", fontSize: 13, color: "#64748b", background: "#fff", cursor: "pointer", outline: "none" }}
          >
            <option value="name-asc">الاسم أ ← ي</option>
            <option value="name-desc">الاسم ي ← أ</option>
          </select>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["DEPARTMENT NAME", "ID", ""].map((h) => (
                <th key={h} style={{ padding: "8px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading departments…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                {departments.length === 0 ? "No departments found in this sector." : "No results match your search."}
              </td></tr>
            ) : paged.map((dept) => (
              <tr
                key={dept.id}
                onClick={() => openDept(dept)}
                style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {dept.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{dept.name}</div>
                      {dept.nameAr && <div style={{ fontSize: 11, color: "#94a3b8", direction: "rtl" }}>{dept.nameAr}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>{dept.id}</td>
                <td style={{ padding: "14px 20px" }}>
                  <ChevronRight size={15} color="#cbd5e1" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: page === 1 ? "#cbd5e1" : "#475569", cursor: page === 1 ? "default" : "pointer" }}>‹ Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} style={{ border: "1px solid", borderColor: p === page ? NAVY : "#eef0f3", background: p === page ? NAVY : "#fff", borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 700, color: p === page ? "#fff" : "#475569", cursor: "pointer" }}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: "1px solid #eef0f3", background: "#fff", borderRadius: 7, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: page === totalPages ? "#cbd5e1" : "#475569", cursor: page === totalPages ? "default" : "pointer" }}>Next ›</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
