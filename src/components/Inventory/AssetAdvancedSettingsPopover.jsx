function AssetAdvancedSettingsPopover({ deleteEnabled, setDeleteEnabled, onClose }) {
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
          style={{
            marginTop: 2,
            accentColor: "#dc2626",
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Allow asset deletion
          </div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
            {deleteEnabled
              ? "Deletion is currently enabled."
              : "Check to allow deleting assets."}
          </div>
        </div>
      </label>
    </div>
  );
}
export default AssetAdvancedSettingsPopover;