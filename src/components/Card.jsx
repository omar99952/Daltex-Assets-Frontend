export default function Card({ children, style, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #eef0f3",
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
