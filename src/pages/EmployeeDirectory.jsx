import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import {
  Search,
  Download,
  UserPlus,
  MoreVertical,
  Settings,
  ChevronDown,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import EmployeeFormModal from "../components/EmployeeFormModal.jsx";
import { NAVY } from "../theme.js";

function mapEmployee(e) {
  return {
    id: String(e.employee_code),
    employee_code: e.employee_code,
    name: e.employee_name_en || "",
    nameAr: e.employee_name_ar || "",
    dept:
      typeof e.last_known_department === "object"
        ? e.last_known_department?.name || ""
        : String(e.last_known_department || ""),
    branchId:
      typeof e.last_known_branch === "object"
        ? String(e.last_known_branch?.branch_id || e.last_known_branch?.id || "")
        : String(e.last_known_branch || ""),
    location:
      typeof e.last_known_branch === "object"
        ? e.last_known_branch?.name_en || e.last_known_branch?.name || ""
        : String(e.last_known_branch || ""),
    role: e.role || e.job_title || "",
    email: e.email || "",
    status: e.status || "Active",
    tenure: e.tenure || "",
    avatarColor: "#0f172a",
  };
}

function mapBranch(b) {
  return {
    id: String(b.branch_id || b.id),
    name: b.name_en || b.name || "",
    nameAr: b.name_ar || "",
    region: b.location || "",
    branchCode: b.branch_code || "",
    departments: b.departments || [],
  };
}

function mapSector(s) {
  return {
    id: String(s.sector_id || s.id),
    name: s.sector_name || s.name || "",
    branchId:
      typeof s.branch === "object"
        ? String(s.branch?.branch_id || s.branch?.id || "")
        : String(s.branch || ""),
    departments: s.departments || [],
  };
}

function EmployeeRow({ emp, assetCount, branchName, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 160px 180px 90px",
        alignItems: "center",
        gap: 16,
        padding: "12px 18px",
        background: hovered ? "#f8fafc" : "#fff",
        borderBottom: "1px solid #eef0f3",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: emp.avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {emp.name
          .split(" ")
          .map((p) => p[0])
          .join("")
          .slice(0, 2)}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#0f172a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {emp.name}
        </div>
        <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600 }}>
          {emp.id}
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#475569" }}>{emp.dept || "—"}</div>
      <div style={{ fontSize: 13, color: "#475569" }}>{branchName || "—"}</div>

      <div
        style={{
          fontSize: 13,
          color: assetCount === 0 ? "#94a3b8" : "#475569",
          textAlign: "right",
        }}
      >
        {assetCount === 0 ? "—" : `${assetCount} item${assetCount > 1 ? "s" : ""}`}
      </div>
    </div>
  );
}

function CascadeSelect({ placeholder, value, onChange, options, disabled, errorMsg }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showErr, setShowErr] = useState(false);
  const ref = useRef(null);
  const errTimer = useRef(null);

  useEffect(() => {
    function handleOut(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || null;
  const filteredOpts = options.filter(
    (o) => search === "" || o.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleTrigger() {
    if (disabled) {
      setShowErr(true);
      clearTimeout(errTimer.current);
      errTimer.current = setTimeout(() => setShowErr(false), 2800);
    } else {
      setOpen((o) => !o);
      setSearch("");
    }
  }

  function select(v) {
    onChange(v || null);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={ref} style={{ position: "relative", flex: 1 }}>
      <button
        onClick={handleTrigger}
        style={{
          width: "100%",
          height: 38,
          border: `1px solid ${showErr ? "#fca5a5" : value ? NAVY : "#eef0f3"}`,
          borderRadius: 8,
          padding: "0 32px 0 12px",
          fontWeight: 600,
          fontSize: 13,
          color: disabled ? "#94a3b8" : value ? "#0f172a" : "#64748b",
          background: disabled ? "#f8fafc" : "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selectedLabel || <span style={{ color: disabled ? "#94a3b8" : "#64748b" }}>{placeholder}</span>}
        </span>
        <ChevronDown size={13} color={disabled ? "#cbd5e1" : value ? NAVY : "#94a3b8"} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, boxShadow: "0 8px 24px rgba(15,23,42,0.12)", zIndex: 90, overflow: "hidden" }}>
          <div style={{ padding: "7px 8px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", borderRadius: 6, padding: "5px 8px" }}>
              <Search size={12} color="#94a3b8" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                style={{ border: "none", outline: "none", fontSize: 12.5, background: "transparent", width: "100%" }}
              />
            </div>
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            <div
              onClick={() => select(null)}
              style={{ padding: "9px 12px", fontSize: 13, color: "#64748b", cursor: "pointer", fontStyle: "italic", background: !value ? "#fef9f0" : "#fff" }}
              onMouseEnter={(e) => { if (value) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { if (value) e.currentTarget.style.background = "#fff"; }}
            >
              {placeholder}
            </div>
            {filteredOpts.map((opt) => (
              <div
                key={opt.value}
                onClick={() => select(opt.value)}
                style={{ padding: "9px 12px", fontSize: 13, fontWeight: value === opt.value ? 700 : 400, color: value === opt.value ? NAVY : "#0f172a", background: value === opt.value ? "#f0f5ff" : "#fff", cursor: "pointer" }}
                onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = "#fff"; }}
              >
                {opt.label}
              </div>
            ))}
            {filteredOpts.length === 0 && (
              <div style={{ padding: "12px", fontSize: 12.5, color: "#94a3b8", textAlign: "center" }}>No matches</div>
            )}
          </div>
        </div>
      )}

      {showErr && (
        <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "7px 10px", fontSize: 11.5, color: "#dc2626", fontWeight: 600, zIndex: 60, display: "flex", alignItems: "center", gap: 6 }}>
          <AlertCircle size={12} /> {errorMsg}
        </div>
      )}
    </div>
  );
}

function AdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 12,
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
        width: 270,
        padding: 18,
        zIndex: 60,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
        <Settings size={14} color="#475569" />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
          Advanced Settings
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: "pointer",
          padding: "10px 12px",
          background: "#f8fafc",
          borderRadius: 8,
          border: "1px solid #eef0f3",
        }}
      >
        <input
          type="checkbox"
          checked={deleteEnabled}
          onChange={(e) => setDeleteEnabled(e.target.checked)}
          style={{ marginTop: 2, accentColor: "#dc2626", cursor: "pointer" }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Allow employee deletion
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {deleteEnabled ? "Deletion is currently enabled." : "Check to allow deleting employees."}
          </div>
        </div>
      </label>
    </div>
  );
}

export default function EmployeeDirectory() {
  const {
    setSelectedEmployeeId,
    navigateTo,
    goBack,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    employeeSort,
    setEmployeeSort,
    deleteEmployeeEnabled,
    setDeleteEmployeeEnabled,
  } = useApp();

  const [branchFilter, setBranchFilter] = useState(null);
  const [sectorFilter, setSectorFilter] = useState(null);
  const [deptFilter, setDeptFilter] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);

  const [apiEmployees, setApiEmployees] = useState([]);
  const [apiBranches, setApiBranches] = useState([]);
  const [apiSectors, setApiSectors] = useState([]);
  const [sectorDepts, setSectorDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState(null);

  async function fetchEmployeesPageData() {
    setLoading(true);
    setListError(null);

    try {
      const [empData, branchData, sectorData] = await Promise.all([
        apiGet(ENDPOINTS.get_all_employees),
        apiGet(ENDPOINTS.get_all_branches),
        apiGet(ENDPOINTS.get_all_sectors),
      ]);

      const empArray = Array.isArray(empData) ? empData : empData.results || [];
      const branchArray = Array.isArray(branchData) ? branchData : branchData.results || [];
      const sectorArray = Array.isArray(sectorData) ? sectorData : sectorData.results || [];

      setApiEmployees(empArray.map(mapEmployee));
      setApiBranches(branchArray.map(mapBranch));
      setApiSectors(sectorArray.map(mapSector));
    } catch (err) {
      console.log("Fetch employees failed:", err?.response?.data || err);
      setListError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployeesPageData();
  }, []);

  useEffect(() => {
    if (!sectorFilter) {
      setSectorDepts([]);
      return;
    }

    apiGet(ENDPOINTS.get_all_departments_inside_sector(sectorFilter))
      .then((data) => {
        const deptArray = Array.isArray(data) ? data : data.results || [];
        setSectorDepts(
          deptArray.map((d) => ({
            value: d.name || String(d.id),
            label: d.name || String(d.id),
          }))
        );
      })
      .catch(() => setSectorDepts([]));
  }, [sectorFilter]);

  const employees = apiEmployees;
  const branches = apiBranches;
  const sectors = apiSectors;

  function handleBranchChange(id) {
    setBranchFilter(id);
    setSectorFilter(null);
    setDeptFilter(null);
    setSectorDepts([]);
  }

  function handleSectorChange(id) {
    setSectorFilter(id);
    setDeptFilter(null);
    setSectorDepts([]);
  }

  function assetCountFor() {
    return 0;
  }

  const query = employeeSearchQuery.trim().toLowerCase();
  const selectedSector = sectors.find((s) => s.id === sectorFilter);
  const availableSectors = sectors.filter((s) => s.branchId === branchFilter);

  const availableDepts =
    sectorDepts.length > 0
      ? sectorDepts
      : (selectedSector?.departments || []).map((d) => ({ value: d, label: d }));

  const deptNamesInSector =
    sectorDepts.length > 0 ? sectorDepts.map((d) => d.label) : selectedSector?.departments || [];

  let filtered = employees.filter(
    (e) =>
      (!branchFilter || e.branchId === branchFilter || e.location === branchFilter) &&
      (!sectorFilter || deptNamesInSector.includes(e.dept)) &&
      (!deptFilter || e.dept === deptFilter) &&
      (query === "" ||
        e.name.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query) ||
        e.dept.toLowerCase().includes(query) ||
        e.location.toLowerCase().includes(query))
  );

  const SORTERS = {
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "name-desc": (a, b) => b.name.localeCompare(a.name),
    "tenure-desc": (a, b) => parseFloat(b.tenure || 0) - parseFloat(a.tenure || 0),
    "tenure-asc": (a, b) => parseFloat(a.tenure || 0) - parseFloat(b.tenure || 0),
    "assets-desc": (a, b) => assetCountFor(b.id) - assetCountFor(a.id),
    "status-asc": (a, b) => (a.status || "").localeCompare(b.status || ""),
  };

  filtered = [...filtered].sort(SORTERS[employeeSort] || SORTERS["name-asc"]);

  function openEmployee(id) {
    setSelectedEmployeeId(id);
    navigateTo("employeeDetail");
  }

  async function handleAddEmployee(form) {
    try {
      const body = {
        employee_code: form.employee_code,
        employee_name_en: form.employee_name_en,
        employee_name_ar: form.employee_name_ar || "",
        last_known_branch: form.last_known_branch || "",
        last_known_department: form.last_known_department || "",
      };

      await apiPost(ENDPOINTS.post_new_employee, body);

      await fetchEmployeesPageData();

      setShowAddEmployee(false);
    } catch (err) {
      console.log("Add employee failed:", err?.response?.data || err);
      setListError("Failed to add employee.");
    }
  }

  const csvHeaders = [
    "EMPLOYEE CODE",
    "NAME (EN)",
    "NAME (AR)",
    "DEPARTMENT",
    "BRANCH",
    "STATUS",
    "TENURE",
    "ASSIGNED ASSETS",
  ];

  const csvRows = filtered.map((e) => {
    const branch = branches.find((b) => b.id === e.branchId || b.name === e.location);

    return {
      "EMPLOYEE CODE": e.id,
      "NAME (EN)": e.name,
      "NAME (AR)": e.nameAr || "",
      DEPARTMENT: e.dept,
      BRANCH: branch?.name || e.location || e.branchId || "",
      STATUS: e.status,
      TENURE: e.tenure,
      "ASSIGNED ASSETS": assetCountFor(e.id),
    };
  });

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      {listError && (
        <div
          style={{
            background: "#fef9f0",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12.5,
            color: "#92400e",
            marginBottom: 14,
          }}
        >
          {listError}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 10 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #eef0f3",
            borderRadius: 8,
            padding: "0 12px",
            background: "#fff",
            flex: 3,
            height: 38,
          }}
        >
          <Search size={14} color="#94a3b8" />
          <input
            value={employeeSearchQuery}
            onChange={(e) => setEmployeeSearchQuery(e.target.value)}
            placeholder="Search employees..."
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              width: "100%",
              height: "100%",
            }}
          />
        </div>

        <select
          value={employeeSort}
          onChange={(e) => setEmployeeSort(e.target.value)}
          style={{
            border: "1px solid #eef0f3",
            borderRadius: 8,
            padding: "0 12px",
            height: 38,
            flex: 1,
            fontWeight: 600,
            fontSize: 13,
            color: "#475569",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="tenure-desc">Sort: Tenure (longest)</option>
          <option value="tenure-asc">Sort: Tenure (shortest)</option>
          <option value="assets-desc">Sort: Most assets</option>
          <option value="status-asc">Sort: Status</option>
        </select>

        <button
          onClick={() => setShowExportPreview(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "1px solid #eef0f3",
            borderRadius: 8,
            padding: "0 16px",
            height: 38,
            fontWeight: 700,
            fontSize: 13,
            color: "#475569",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <Download size={14} /> Export
        </button>

        <button
          onClick={() => setShowAddEmployee(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            border: "none",
            borderRadius: 8,
            padding: "0 16px",
            height: 38,
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            background: NAVY,
            cursor: "pointer",
          }}
        >
          <UserPlus size={14} /> Add Employee
        </button>

        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowAdvanced((s) => !s)}
            title="Advanced Settings"
            style={{
              border: `1px solid ${deleteEmployeeEnabled ? "#fecaca" : "#eef0f3"}`,
              borderRadius: 8,
              padding: 0,
              height: 38,
              width: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: showAdvanced ? "#f1f5f9" : deleteEmployeeEnabled ? "#fff5f5" : "#fff",
              cursor: "pointer",
              color: deleteEmployeeEnabled ? "#dc2626" : "#475569",
            }}
          >
            <MoreVertical size={14} />
          </button>

          {showAdvanced && (
            <AdvancedSettingsPopover
              deleteEnabled={deleteEmployeeEnabled}
              setDeleteEnabled={setDeleteEmployeeEnabled}
              onClose={() => setShowAdvanced(false)}
            />
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <Filter size={12} color="#94a3b8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textTransform: "uppercase" }}>Filter</span>
        </div>
        <div style={{ width: 1, height: 16, background: "#e2e8f0", flexShrink: 0 }} />
        <CascadeSelect
          placeholder="All Branches"
          value={branchFilter}
          onChange={handleBranchChange}
          options={branches.map((b) => ({ value: b.id, label: b.name }))}
          disabled={false}
        />

        <CascadeSelect
          placeholder="All Sectors"
          value={sectorFilter}
          onChange={handleSectorChange}
          options={availableSectors.map((s) => ({ value: s.id, label: s.name }))}
          disabled={!branchFilter}
          errorMsg="Select a branch first"
        />

        <CascadeSelect
          placeholder="All Departments"
          value={deptFilter}
          onChange={setDeptFilter}
          options={availableDepts}
          disabled={!sectorFilter}
          errorMsg="Select a sector first"
        />
      </div>

      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 14 }}>
        {loading ? "Loading…" : `Showing ${filtered.length} of ${employees.length} employees`}
      </div>

      <div
        style={{
          border: "1px solid #eef0f3",
          borderRadius: 12,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 160px 180px 90px",
            gap: 16,
            padding: "10px 18px",
            background: "#f8fafc",
            borderBottom: "1px solid #eef0f3",
          }}
        >
          <div />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>EMPLOYEE</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>DEPARTMENT</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>BRANCH</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textAlign: "right" }}>
            ASSETS
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            Loading employees…
          </div>
        ) : (
          filtered.map((emp) => {
            const branch = branches.find((b) => b.id === emp.branchId || b.name === emp.location);

            return (
              <EmployeeRow
                key={emp.id}
                emp={emp}
                assetCount={assetCountFor(emp.id)}
                branchName={branch?.name || emp.location || emp.branchId}
                onOpen={() => openEmployee(emp.id)}
              />
            );
          })
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            No employees match your search or filters.
          </div>
        )}
      </div>

      {showExportPreview && (
        <CsvPreviewModal
          onClose={() => setShowExportPreview(false)}
          rows={csvRows}
          headers={csvHeaders}
          filename="employee_directory.csv"
          title="Export Employee Directory"
        />
      )}

      {showAddEmployee && (
        <EmployeeFormModal
          onClose={() => setShowAddEmployee(false)}
          onSubmit={handleAddEmployee}
        />
      )}
    </div>
  );
}