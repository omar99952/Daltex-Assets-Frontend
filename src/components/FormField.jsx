export const inputStyle = {
  width: "100%",
  border: "1px solid #eef0f3",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
};

export default function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
