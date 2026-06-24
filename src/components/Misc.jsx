export function Dot({ color }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 99,
        background: color,
        display: "inline-block",
      }}
    />
  );
}

export function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div
        style={{
          border: "1px solid #eef0f3",
          borderRadius: 7,
          padding: "9px 12px",
          fontSize: 13.5,
          color: "#0f172a",
          background: "#f8fafc",
        }}
      >
        {value}
      </div>
    </div>
  );
}
