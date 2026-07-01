import { useState, useEffect, useRef } from "react";
import { ORANGE } from "../theme.js";

const triggerStyle = {
  width: "100%",
  border: "1px solid #eef0f3",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  textAlign: "left",
  cursor: "pointer",
  background: "#fff",
};

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select…",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    if (disabled) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen((s) => !s);
    setQuery("");
  }

  const selected = options.find((o) => String(o.value) === String(value));
  const filtered = options.filter(
    (o) => !query || o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        style={{
          ...triggerStyle,
          cursor: disabled ? "not-allowed" : "pointer",
          background: disabled ? "#f8fafc" : "#fff",
          color: selected ? "#0f172a" : "#94a3b8",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <span style={{ fontSize: 9, color: "#94a3b8", flexShrink: 0, marginLeft: 6 }}>▾</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: pos.width,
            background: "#fff",
            border: "1px solid #eef0f3",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            zIndex: 9999,
          }}
        >
          <div style={{ padding: "8px 8px 4px" }}>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{
                width: "100%",
                border: "1px solid #eef0f3",
                borderRadius: 6,
                padding: "5px 8px",
                fontSize: 12.5,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); setQuery(""); }}
              style={{
                width: "100%", border: "none", padding: "7px 12px",
                textAlign: "left", fontSize: 13, cursor: "pointer",
                background: !value ? "#fef3e2" : "none",
                color: !value ? ORANGE : "#475569",
              }}
            >
              {placeholder}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setQuery(""); }}
                style={{
                  width: "100%", border: "none", padding: "7px 12px",
                  textAlign: "left", fontSize: 13, cursor: "pointer",
                  background: String(value) === String(o.value) ? "#fef3e2" : "none",
                  color: String(value) === String(o.value) ? ORANGE : "#475569",
                }}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "7px 12px", fontSize: 12, color: "#94a3b8" }}>No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
