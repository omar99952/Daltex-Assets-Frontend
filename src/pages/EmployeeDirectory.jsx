import { useState, useEffect, useRef } from "react";
import { Search, Filter, Download, UserPlus, Check } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import BackButton from "../components/BackButton.jsx";
import StatusPill from "../components/StatusPill.jsx";
import CsvPreviewModal from "../components/CsvPreviewModal.jsx";
import EmployeeFormModal from "../components/EmployeeFormModal.jsx";
import { NAVY, ORANGE } from "../theme.js";

function EmployeeRow({ emp, assetCount, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 160px 140px 110px 90px",
        alignItems: "center",
        gap: 16,
        padding: "12px 18px",
        background: hovered ? "#f8fafc" : "#fff",
        borderBottom: "1px solid #eef0f3",
        cursor: "pointer",
        transition: "background .1s",
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
          flexShrink: 0,
        }}
      >
        {emp.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
        <div style={{ fontSize: 12, color: ORANGE, fontWeight: 600, marginTop: 1 }}>{emp.role}</div>
      </div>
      <div style={{ fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.dept}</div>
      <div style={{ fontSize: 13, color: "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.location}</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <StatusPill status={emp.status} />
      </div>
      <div style={{ fontSize: 13, color: assetCount === 0 ? "#94a3b8" : "#475569", textAlign: "right" }}>
        {assetCount === 0 ? "—" : `${assetCount} item${assetCount > 1 ? "s" : ""}`}
      </div>
    </div>
  );
}

function EmployeeStatusFilterPopover({ statusFilter, setStatusFilter, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const options = [
    { key: null, label: "All" },
    { key: "Active", label: "Active" },
    { key: "On Leave", label: "On Leave" },
    { key: "Offboarded", label: "Offboarded" },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 10,
        boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
        width: 200,
        padding: 14,
        zIndex: 60,
      }}
    >
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.3, marginBottom: 10 }}>STATUS</div>
      {options.map((opt) => (
        <button
          key={opt.label}
          onClick={() => setStatusFilter(opt.key)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            background: statusFilter === opt.key ? "#fef3e2" : "none",
            borderRadius: 7,
            padding: "8px 10px",
            fontSize: 13,
            fontWeight: 600,
            color: statusFilter === opt.key ? ORANGE : "#475569",
            cursor: "pointer",
            marginBottom: 2,
          }}
        >
          {opt.label}
          {statusFilter === opt.key && <Check size={14} />}
        </button>
      ))}
    </div>
  );
}

export default function EmployeeDirectory() {
  const {
    employees,
    assets,
    setSelectedEmployeeId,
    navigateTo,
    goBack,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    employeeSort,
    setEmployeeSort,
    addEmployee,
  } = useApp();
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const depts = ["All Departments", ...Array.from(new Set(employees.map((e) => e.dept)))];

  function handleAddEmployeeSubmit(form) {
    addEmployee(form);
    setShowAddEmployee(false);
  }

  function assetCountFor(empId) {
    return assets.filter((a) => a.assignedTo === empId).length;
  }

  const query = employeeSearchQuery.trim().toLowerCase();

  let filtered = employees.filter(
    (e) =>
      (deptFilter === "All Departments" || e.dept === deptFilter) &&
      (!statusFilter || e.status === statusFilter) &&
      (query === "" ||
        e.name.toLowerCase().includes(query) ||
        e.role.toLowerCase().includes(query) ||
        e.id.includes(query) ||
        e.email.toLowerCase().includes(query))
  );

  const SORTERS = {
    "name-asc": (a, b) => a.name.localeCompare(b.name),
    "name-desc": (a, b) => b.name.localeCompare(a.name),
    "tenure-desc": (a, b) => parseFloat(b.tenure) - parseFloat(a.tenure),
    "tenure-asc": (a, b) => parseFloat(a.tenure) - parseFloat(b.tenure),
    "assets-desc": (a, b) => assetCountFor(b.id) - assetCountFor(a.id),
    "status-asc": (a, b) => a.status.localeCompare(b.status),
  };
  filtered = [...filtered].sort(SORTERS[employeeSort] || SORTERS["name-asc"]);

  function openEmployee(id) {
    setSelectedEmployeeId(id);
    navigateTo("employeeDetail");
  }

  const csvHeaders = ["EMPLOYEE ID", "NAME", "ROLE", "DEPARTMENT", "LOCATION", "STATUS", "TENURE", "ASSIGNED ASSETS"];
  const csvRows = filtered.map((e) => ({
    "EMPLOYEE ID": e.id,
    NAME: e.name,
    ROLE: e.role,
    DEPARTMENT: e.dept,
    LOCATION: e.location,
    STATUS: e.status,
    TENURE: e.tenure,
    "ASSIGNED ASSETS": assetCountFor(e.id),
  }));

  const activeFilterCount = (statusFilter ? 1 : 0) + (deptFilter !== "All Departments" ? 1 : 0);

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>Employee Directory</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
            Managing {employees.length} total staff across {depts.length - 1} departments
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 8, padding: "0 12px", background: "#fff", width: 240 }}>
            <Search size={14} color="#94a3b8" />
            <input
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
              placeholder="Search employees..."
              style={{ border: "none", outline: "none", fontSize: 13, padding: "9px 0", width: "100%" }}
            />
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowStatusFilter((s) => !s)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                border: `1px solid ${activeFilterCount ? ORANGE : "#eef0f3"}`,
                borderRadius: 8,
                padding: "9px 16px",
                fontWeight: 700,
                fontSize: 13,
                color: activeFilterCount ? ORANGE : "#475569",
                background: activeFilterCount ? "#fef3e2" : "#fff",
                cursor: "pointer",
              }}
            >
              <Filter size={14} /> Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {showStatusFilter && (
              <EmployeeStatusFilterPopover statusFilter={statusFilter} setStatusFilter={setStatusFilter} onClose={() => setShowStatusFilter(false)} />
            )}
          </div>
          <select
            value={employeeSort}
            onChange={(e) => setEmployeeSort(e.target.value)}
            style={{
              border: "1px solid #eef0f3",
              borderRadius: 8,
              padding: "9px 12px",
              fontWeight: 700,
              fontSize: 13,
              color: "#475569",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="name-asc">Sort: Name (A–Z)</option>
            <option value="name-desc">Sort: Name (Z–A)</option>
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
              padding: "9px 16px",
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
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: "#fff",
              background: NAVY,
              cursor: "pointer",
            }}
          >
            <UserPlus size={14} /> Add Employee
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {depts.map((d) => (
          <button
            key={d}
            onClick={() => setDeptFilter(d)}
            style={{
              padding: "8px 16px",
              borderRadius: 999,
              border: "1px solid #eef0f3",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              background: deptFilter === d ? ORANGE : "#fff",
              color: deptFilter === d ? "#fff" : "#475569",
            }}
          >
            {d}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 14 }}>
        Showing {filtered.length} of {employees.length} employees
      </div>

      <div style={{ border: "1px solid #eef0f3", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 160px 140px 110px 90px",
            gap: 16,
            padding: "10px 18px",
            background: "#f8fafc",
            borderBottom: "1px solid #eef0f3",
          }}
        >
          <div />
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4 }}>EMPLOYEE</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4 }}>DEPARTMENT</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4 }}>LOCATION</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4 }}>STATUS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textAlign: "right" }}>ASSETS</div>
        </div>
        {filtered.map((emp) => {
          const count = assetCountFor(emp.id);
          return <EmployeeRow key={emp.id} emp={emp} assetCount={count} onOpen={() => openEmployee(emp.id)} />;
        })}
        {filtered.length === 0 && (
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
      {showAddEmployee && <EmployeeFormModal onClose={() => setShowAddEmployee(false)} onSubmit={handleAddEmployeeSubmit} />}
    </div>
  );
}
