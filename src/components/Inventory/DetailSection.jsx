export default function DetailSection({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: "#94a3b8",
          letterSpacing: 0.4,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}
