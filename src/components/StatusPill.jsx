const STATUS_MAP = {
  Assigned: { bg: "#dcfce7", color: "#15803d", label: "ASSIGNED" },
  "In Stock": { bg: "#f1f5f9", color: "#475569", label: "IN STOCK" },
  Repair: { bg: "#fee2e2", color: "#dc2626", label: "REPAIR" },
  Retired: { bg: "#fee2e2", color: "#dc2626", label: "RETIRED" },
  Unregistered: { bg: "#fef3c7", color: "#b45309", label: "UNREGISTERED" },
  Active: { bg: "#dcfce7", color: "#15803d", label: "ACTIVE" },
  "On Leave": { bg: "#fef3c7", color: "#b45309", label: "ON LEAVE" },
  Offboarded: { bg: "#fee2e2", color: "#dc2626", label: "OFFBOARDED" },
};

export default function StatusPill({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP["In Stock"];
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 999,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}
