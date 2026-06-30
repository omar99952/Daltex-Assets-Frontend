export function InventoryCategoryPage() {
  const {
    inventoryCategory,
    globalSearchQuery,
    setGlobalSearchQuery,
    goBack,
    openAssetDetail,
    showAddDeviceModal,
    setShowAddDeviceModal,
    deleteAssetEnabled,
    setDeleteAssetEnabled,
  } = useApp();

  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [assignmentFilter, setAssignmentFilter] = useState("All");

  const [apiAssets, setApiAssets] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const label = inventoryCategory || INVENTORY_CATEGORIES[0];
  const dataKey = categoryDataKey(label);

  async function loadCategoryAssets() {
    try {
      setApiLoading(true);
      setApiError(null);

      const assets = await fetchAssetsByCategory(label);
      setApiAssets(assets);
    } catch {
      setApiError("Could not reach the server.");
      setApiAssets([]);
    } finally {
      setApiLoading(false);
    }
  }

  useEffect(() => {
    loadCategoryAssets();
  }, [label]);

  const query = globalSearchQuery;
  const scopeBase = apiAssets;

  const filtered = scopeBase.filter((a) => {
    const matchesSearch =
      query === "" ||
      a.model.toLowerCase().includes(query.toLowerCase()) ||
      a.serial.toLowerCase().includes(query.toLowerCase()) ||
      a.id.toLowerCase().includes(query.toLowerCase()) ||
      a.brand.toLowerCase().includes(query.toLowerCase());

    const matchesAssignment =
      assignmentFilter === "All"
        ? true
        : assignmentFilter === "Assigned"
        ? a.status === "Assigned"
        : a.status !== "Assigned";

    return matchesSearch && matchesAssignment;
  });

  const total = scopeBase.length;
  const assigned = scopeBase.filter((a) => a.status === "Assigned").length;
  const inStock = scopeBase.filter((a) => a.status === "In Stock").length;
  const repair = scopeBase.filter((a) => a.status === "Repair").length;

  async function handleAddDeviceSubmit(form) {
    try {
      const created = await createAsset(form, label);
      setApiAssets((prev) => [created, ...prev]);
      setApiError(null);
    } catch {
      setApiError("Failed to add device. Please check your connection.");
    }

    setShowAddDeviceModal(false);
  }

  async function handleDeleteAsset(id) {
    try {
      await deleteAssetRequest(id, label);
      setApiAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setApiError("Failed to delete asset. Please try again.");
    }

    setPendingDeleteId(null);
  }

  const csvHeaders = ["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "BRANCH"];
  const csvRows = filtered.map((a) => ({
    BRAND: a.brand,
    MODEL: a.model,
    "SERIAL NUMBER": a.serial,
    STATUS: a.status,
    BRANCH: a.branch,
  }));
  const csvFilename = `inventory_${label.toLowerCase().replace(/\s+/g, "_")}.csv`;

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      {apiError && (
        <div style={{ background: "#fef9f0", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#92400e", marginBottom: 14 }}>
          {apiError}
        </div>
      )}

      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>
        Assets &gt; {label}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CategoryIcon category={dataKey} size={16} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{label}</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setShowCsvPreview(true)}
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
            <Download size={14} /> Export CSV
          </button>

          <button
            onClick={() => setShowAddDeviceModal(true)}
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
            <Plus size={14} /> Add Device
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              title="Advanced Settings"
              style={{
                border: `1px solid ${deleteAssetEnabled ? "#fecaca" : "#eef0f3"}`,
                borderRadius: 8,
                padding: 0,
                height: 38,
                width: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showAdvanced ? "#f1f5f9" : deleteAssetEnabled ? "#fff5f5" : "#fff",
                cursor: "pointer",
                color: deleteAssetEnabled ? "#dc2626" : "#475569",
              }}
            >
              <MoreVertical size={14} />
            </button>

            {showAdvanced && (
              <AssetAdvancedSettingsPopover
                deleteEnabled={deleteAssetEnabled}
                setDeleteEnabled={setDeleteAssetEnabled}
                onClose={() => setShowAdvanced(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <StatCard icon={<Boxes size={17} color={NAVY} />} iconBg="#e2e8f0" label="TOTAL MANAGED" value={total} />
        <StatCard icon={<Users size={17} color="#475569" />} iconBg="#e2e8f0" label="ASSIGNED" value={assigned} sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>{total ? Math.round((assigned / total) * 100) : 0}% util</div>} />
        <StatCard icon={<Building2 size={17} color="#475569" />} iconBg="#e2e8f0" label="IN STOCK" value={inStock} />
        <StatCard icon={<Wrench size={17} color="#dc2626" />} iconBg="#fee2e2" label="IN REPAIR" value={repair} danger sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Pending fix</div>} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <Filter size={12} color="#94a3b8" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.4, textTransform: "uppercase" }}>Filter</span>
        </div>

        <div style={{ width: 1, height: 16, background: "#e2e8f0", flexShrink: 0 }} />

        {["All", "Assigned", "Unassigned"].map((f) => (
          <button
            key={f}
            onClick={() => setAssignmentFilter(f)}
            style={{
              border: assignmentFilter === f ? "none" : "1px solid #eef0f3",
              borderRadius: 7,
              padding: "7px 16px",
              fontWeight: 700,
              fontSize: 12.5,
              color: assignmentFilter === f ? "#fff" : "#475569",
              background: assignmentFilter === f ? NAVY : "#fff",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px", background: "#fff" }}>
          <Search size={13} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search brand, model, serial…"
            style={{ border: "none", outline: "none", fontSize: 13, width: 220, background: "transparent" }}
          />
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #eef0f3" }}>
          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>
            {apiLoading ? "Loading…" : `${filtered.length} of ${scopeBase.length} items`}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["BRAND", "MODEL", "SERIAL NUMBER", "STATUS", "ASSIGNED TO", "", ""].map((h) => (
                <th key={h} style={{ padding: "10px 20px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {apiLoading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
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
                  <td style={{ padding: "14px 20px", fontSize: 13, color: "#475569" }}>{displayAssignedTo(a.assignedTo)}</td>
                  <td style={{ padding: "14px 20px" }}><ChevronRight size={16} color="#cbd5e1" /></td>
                  <td style={{ padding: "14px 20px" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        if (!deleteAssetEnabled) {
                          setShowDeleteError(true);
                          return;
                        }

                        setPendingDeleteId(a.id);
                      }}
                      title="Delete asset"
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        color: "#fca5a5",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}

            {!apiLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  No assets match your search in this category.
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

      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete Asset"
          message="Are you sure you want to permanently delete this asset? This cannot be undone."
          confirmLabel="Delete Asset"
          onConfirm={() => handleDeleteAsset(pendingDeleteId)}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

      {showDeleteError && (
        <Modal title="Deletion Disabled" onClose={() => setShowDeleteError(false)} width={400}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertCircle size={18} color="#dc2626" />
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>
                Asset deletion is not enabled
              </div>
              <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
                Open <strong>Advanced Settings</strong> and enable asset deletion to proceed.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowDeleteError(false)}
              style={{
                border: "none",
                background: "#0f172a",
                color: "#fff",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 22px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}

      {showAddDeviceModal && (
        <AddDeviceModal
          onClose={() => setShowAddDeviceModal(false)}
          onSubmit={handleAddDeviceSubmit}
        />
      )}
    </div>
  );
}