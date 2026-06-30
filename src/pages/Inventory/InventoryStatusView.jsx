function InventoryStatusView({ statusFilter, onClearFilter, onBack }) {
  const { openAssetDetail, globalSearchQuery, setGlobalSearchQuery } = useApp();

  const [statusAssets, setStatusAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCsvPreview, setShowCsvPreview] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      try {
        const assets = await fetchAssetsByStatus(statusFilter);
        setStatusAssets(assets);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
  }, [statusFilter]);

  const query = globalSearchQuery;

  const filtered = statusAssets.filter(
    (a) =>
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase())
  );

  const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
    BRANCH: a.branch,
  }));
  const csvFilename = `inventory_${statusFilter.toLowerCase().replace(/\s+/g, "_")}.csv`;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={onBack} />

      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
        Assets &gt; Status: {statusFilter}

        <button
          onClick={onClearFilter}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "#fef3e2",
            color: ORANGE,
            fontWeight: 700,
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 999,
            cursor: "pointer",
          }}
        >
          Clear filter <X size={11} />
        </button>
      </div>

      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 20 }}>
        Assets
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
          <input
            value={query}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search by brand, model, serial, or asset ID..."
            style={{
              border: "1px solid #eef0f3",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 13,
              width: 320,
              outline: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
              {loading ? "Loading…" : `Showing ${filtered.length} of ${statusAssets.length} items`}
            </div>

            <button
              onClick={() => setShowCsvPreview(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid #eef0f3",
                borderRadius: 7,
                padding: "7px 12px",
                fontWeight: 700,
                fontSize: 12.5,
                color: "#475569",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  Loading assets…
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => openAssetDetail(a.id, a.category)}
                  style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                >
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.brand}</td>
                  <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.model}</td>
                  <td style={{ padding: "14px 20px", fontSize: 12.5, color: "#94a3b8" }}>SN: {a.serial}</td>
                  <td style={{ padding: "14px 20px" }}><StatusPill status={a.status} /></td>
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{a.branch}</td>
                  <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
                </tr>
              ))
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {showCsvPreview && (
        <CsvPreviewModal
          onClose={() => setShowCsvPreview(false)}
          rows={csvRows}
          headers={csvHeaders}
          filename={csvFilename}
        />
      )}
    </div>
  );
}