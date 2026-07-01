import { useState, useEffect } from "react";
import { apiGet, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { Users, Boxes, Hash, ChevronRight, Pencil } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import Modal from "../components/Modal.jsx";
import FormField, { inputStyle } from "../components/FormField.jsx";
import BackButton from "../components/BackButton.jsx";
import { NAVY, ORANGE } from "../theme.js";

function mapBranch(b) {
  return {
    id: String(b.branch_id || b.id),
    name: b.name_en || b.name || "",
    nameAr: b.name_ar || "",
    region: b.location || "",
    branchCode: b.branch_code || "",
  };
}

const PAGE_SIZE = 10;

export default function BranchDetail() {
  const {
    selectedBranchId,
    setSelectedBranchName,
    setSelectedSectorId,
    setSelectedSectorName,
    navigateTo,
    goBack,
  } = useApp();

  const [branch, setBranch] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [deptCountMap, setDeptCountMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name-asc");
  const [page, setPage] = useState(1);

  const [showEditBranch, setShowEditBranch] = useState(false);
  const [editForm, setEditForm] = useState({ nameEn: "", nameAr: "", location: "" });

  useEffect(() => {
    if (!selectedBranchId) return;
    setLoading(true);

    async function fetchAll() {
      try {
        const [branchData, sectorsData] = await Promise.all([
          apiGet(ENDPOINTS.get_branch_by_id(selectedBranchId)),
          apiGet(ENDPOINTS.get_all_sectors_inside_branch(selectedBranchId)),
        ]);

        const mapped = mapBranch(branchData);
        setBranch(mapped);
        setSelectedBranchName(mapped.name);

        const arr = Array.isArray(sectorsData) ? sectorsData : sectorsData?.results ?? [];
        const mappedSectors = arr.map((s) => ({
          id: String(s.sector_id || s.id),
          name: s.sector_name || s.name_en || s.name || "",
          nameAr: s.name_ar || "",
        }));
        setSectors(mappedSectors);

        const counts = await Promise.all(
          mappedSectors.map((s) =>
            apiGet(ENDPOINTS.get_all_departments_inside_sector(s.id))
              .then((d) => ({ id: s.id, count: (Array.isArray(d) ? d : d?.results ?? []).length }))
              .catch(() => ({ id: s.id, count: 0 }))
          )
        );
        const map = {};
        counts.forEach(({ id, count }) => { map[id] = count; });
        setDeptCountMap(map);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchAll();
  }, [selectedBranchId]);

  function openSector(sector) {
    setSelectedSectorId(sector.id);
    setSelectedSectorName(sector.name);
    navigateTo("sectorDetail");
  }

  async function handleEditBranch() {
    if (!editForm.nameEn.trim()) return;
    try {
      const updated = await apiPatch(ENDPOINTS.update_branch(branch.id), {
        name_en: editForm.nameEn,
        name_ar: editForm.nameAr || "",
        location: editForm.location || "",
      });
      const mapped = mapBranch(updated);
      setBranch(mapped);
      setSelectedBranchName(mapped.name);
    } catch { /* silent */ }
    setShowEditBranch(false);
  }

  const filtered = sectors
    .filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === "name-asc"
        ? a.name.localeCompare(b.name, "ar", { sensitivity: "base" })
        : b.name.localeCompare(a.name, "ar", { sensitivity: "base" })
    );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalDepts = Object.values(deptCountMap).reduce((s, n) => s + n, 0);

  if (loading && !branch) {
    return <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading branch details…</div>;
  }
  if (!loading && !branch) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>Branch not found.</div>
        <button onClick={() => goBack()} style={{ marginTop: 16, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 28px" }}>
      <BackButton onClick={() => goBack()} label="Back to Branches" />

      {/* ── Branch header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 10, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
            {branch.branchCode ? branch.branchCode.slice(0, 3).toUpperCase() : branch.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>
              Home &rsaquo; Daltex &rsaquo; <span style={{ color: "#475569", fontWeight: 700 }}>{branch.name}</span>
            </div>
            <div style={{ fontWeight: 900, fontSize: 22, color: "#0f172a" }}>{branch.name}</div>
            {branch.region && <div style={{ fontSize: 13, color: "#94a3b8" }}>{branch.region}</div>}
          </div>
        </div>
        <button
          onClick={() => { setEditForm({ nameEn: branch.name, nameAr: branch.nameAr, location: branch.region }); setShowEditBranch(true); }}
          style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          <Pencil size={13} /> Edit
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <StatCard icon={<Users size={17} color={NAVY} />} iconBg="#e2e8f0" label="SECTORS" value={sectors.length} />
        <StatCard icon={<Boxes size={17} color="#475569" />} iconBg="#e2e8f0" label="DEPARTMENTS" value={totalDepts || "—"} />
        <StatCard icon={<Hash size={17} color="#475569" />} iconBg="#e2e8f0" label="BRANCH CODE" value={branch.branchCode || "—"} />
      </div>

      {/* ── Sector Index table ── */}
      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 12px" }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>Sector Index</div>
          <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "4px 10px", borderRadius: 999 }}>
            {loading ? "Loading…" : filtered.length === 0 ? "No sectors" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "0 20px 14px", alignItems: "center" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search sectors…"
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
              {["SECTOR NAME", "DEPARTMENTS", ""].map((h) => (
                <th key={h} style={{ padding: "8px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>Loading sectors…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={3} style={{ padding: 30, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No sectors found.</td></tr>
            ) : paged.map((s) => (
              <tr
                key={s.id}
                onClick={() => openSector(s)}
                style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafbfc")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "14px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.name}</div>
                      {s.nameAr && <div style={{ fontSize: 11, color: "#94a3b8", direction: "rtl" }}>{s.nameAr}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>
                  {deptCountMap[s.id] != null ? `${deptCountMap[s.id]} dept${deptCountMap[s.id] !== 1 ? "s" : ""}` : "—"}
                </td>
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

      {/* ── Edit Branch Modal ── */}
      {showEditBranch && (
        <Modal title="Edit Branch" onClose={() => setShowEditBranch(false)} width={460}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowEditBranch(false)} style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleEditBranch} style={{ border: "none", background: NAVY, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 20px", borderRadius: 8, cursor: "pointer" }}>Save Changes</button>
            </div>
          }
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <FormField label="Name (English)">
              <input value={editForm.nameEn} onChange={(e) => setEditForm((f) => ({ ...f, nameEn: e.target.value }))} style={inputStyle} />
            </FormField>
            <FormField label="Name (Arabic)">
              <input value={editForm.nameAr} onChange={(e) => setEditForm((f) => ({ ...f, nameAr: e.target.value }))} style={{ ...inputStyle, direction: "rtl" }} />
            </FormField>
          </div>
          <FormField label="Location">
            <input value={editForm.location} onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} />
          </FormField>
        </Modal>
      )}
    </div>
  );
}
