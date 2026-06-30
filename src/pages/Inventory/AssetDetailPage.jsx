import AssetAssignmentSection from "../../components/Inventory/AssetAssignmentSection.jsx";
export function AssetDetailPage() {
  const { selectedAssetId, selectedAssetType, goBack } = useApp();

  const [pendingReturnId, setPendingReturnId] = useState(null);
  const [apiAsset, setApiAsset] = useState(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function loadAssetDetails() {
    if (!selectedAssetId) return;

    setDetailLoading(true);
    setHistoryLoading(true);

    try {
      const mapped = await fetchAssetDetails(selectedAssetId, selectedAssetType);

      let assignedEmployee = null;
      let history = [];

      if (mapped.serial) {
        assignedEmployee = await fetchAssignedEmployee(mapped.serial);
        history = await fetchAssetHistory(mapped.serial);
      }

      setApiAsset({
        ...mapped,
        assignedTo: assignedEmployee || mapped.assignedTo || null,
      });

      setAssetHistory(history);
    } catch {
      setApiAsset(null);
      setAssetHistory([]);
    } finally {
      setDetailLoading(false);
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadAssetDetails();
  }, [selectedAssetId, selectedAssetType]);

  const asset = apiAsset;

  async function handleEditSubmit(form) {
    try {
      const updated = await updateAsset(asset, form);
      setApiAsset((prev) => ({
        ...updated,
        assignedTo: prev?.assignedTo || updated.assignedTo || null,
      }));
    } catch {
      setApiAsset((prev) => ({ ...(prev || asset), ...form }));
    }

    setShowEdit(false);
  }

  async function handleReturnToStock(id) {
    try {
      await returnAssetToStock(asset);

      setApiAsset((prev) =>
        prev ? { ...prev, status: "In Stock", assignedTo: null } : null
      );
    } catch {
      // ignore
    }

    setPendingReturnId(null);
  }

  if (!detailLoading && !asset) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <Boxes size={36} color="#cbd5e1" />
        <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>
          Asset not found.
        </div>
        <button
          onClick={() => goBack()}
          style={{
            marginTop: 16,
            background: ORANGE,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (detailLoading && !asset) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        Loading asset details…
      </div>
    );
  }

  const isComputer = asset.category === "Laptops & PCs";
  const isPrinter = asset.category === "Printers";

  return (
    <div style={{ padding: 28, maxWidth: 820 }}>
      <BackButton onClick={() => goBack()} />

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ width: 52, height: 52, borderRadius: 12, background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CategoryIcon category={asset.category} size={24} />
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "#0f172a" }}>
            {asset.brand} {asset.model}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>
            SN: {asset.serial}
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setShowEdit(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #eef0f3",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 12.5,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <Pencil size={13} /> Edit
          </button>

          <StatusPill status={asset.status} />
        </div>
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 14 }}>
          Asset Details
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Row label="Brand" value={asset.brand} />
          <Row label="Model / Part No." value={asset.model} />
          <Row label="Serial Number" value={asset.serial} />
          <Row label="Category" value={asset.category} />
          <Row label="Condition" value={asset.condition || "—"} />
          <Row label="Branch / Location" value={asset.branch || "—"} />
          {asset.department && <Row label="Department" value={asset.department} />}
          {asset.sector && <Row label="Sector" value={asset.sector} />}
          {asset.deliveryDate && <Row label="Delivery Date" value={asset.deliveryDate} />}
          {asset.description && <Row label="Description" value={asset.description} />}
        </div>

        {isComputer && (
          <>
            <DetailSection title="Hardware Specifications">
              {asset.pcType && <Row label="PC Type" value={asset.pcType} />}
              {asset.processor && <Row label="Processor" value={asset.processor} />}
              {asset.memoryRam && <Row label="Memory (RAM)" value={asset.memoryRam} />}
              {asset.hardDisk && <Row label="Storage" value={asset.hardDisk} />}
            </DetailSection>

            {(asset.monitorBrand || asset.monitorModel) && (
              <DetailSection title="Monitor">
                {asset.monitorBrand && <Row label="Brand" value={asset.monitorBrand} />}
                {asset.monitorModel && <Row label="Model" value={asset.monitorModel} />}
                {asset.monitorInches && <Row label="Size" value={`${asset.monitorInches}"`} />}
                {asset.monitorSerial && <Row label="Serial" value={asset.monitorSerial} />}
              </DetailSection>
            )}

            {(asset.keyboardBrand || asset.mouseBrand || asset.bagBrand) && (
              <DetailSection title="Peripherals">
                {asset.keyboardBrand && <Row label="Keyboard" value={`${asset.keyboardBrand} ${asset.keyboardModel || ""}`.trim()} />}
                {asset.keyboardSerial && <Row label="Keyboard Serial" value={asset.keyboardSerial} />}
                {asset.mouseBrand && <Row label="Mouse" value={`${asset.mouseBrand} ${asset.mouseModel || ""}`.trim()} />}
                {asset.mouseSerial && <Row label="Mouse Serial" value={asset.mouseSerial} />}
                {asset.bagBrand && <Row label="Bag" value={`${asset.bagBrand} — ${asset.bagModelDescription || ""}`.trim()} />}
              </DetailSection>
            )}
          </>
        )}

        {isPrinter && (
          <>
            <DetailSection title="Printer Details">
              {asset.printerType && <Row label="Printer Type" value={asset.printerType} />}
              {asset.printerColor && <Row label="Color" value={asset.printerColor} />}
              {asset.technology && <Row label="Technology" value={asset.technology} />}
              {asset.connectionType && <Row label="Connection" value={asset.connectionType} />}
              <Row label="Multifunction" value={asset.multifunctions ? "Yes" : "No"} />
            </DetailSection>

            {(asset.cartridgeNumber || asset.inkDetails) && (
              <DetailSection title="Cartridge / Ink">
                {asset.cartridgeNumber && <Row label="Cartridge No." value={asset.cartridgeNumber} />}
                {asset.cartridgeColor && <Row label="Color" value={asset.cartridgeColor} />}
                {asset.inkDetails && <Row label="Ink Details" value={asset.inkDetails} />}
              </DetailSection>
            )}

            {(asset.macAddressEth || asset.ipAddressEth || asset.macAddressWifi) && (
              <DetailSection title="Network">
                {asset.activeConnection && <Row label="Active Connection" value={asset.activeConnection} />}
                {asset.macAddressEth && <Row label="MAC (Ethernet)" value={asset.macAddressEth} />}
                {asset.ipAddressEth && <Row label="IP (Ethernet)" value={asset.ipAddressEth} />}
                {asset.macAddressWifi && <Row label="MAC (Wi-Fi)" value={asset.macAddressWifi} />}
              </DetailSection>
            )}
          </>
        )}

        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 12, textTransform: "uppercase" }}>
            Current Assignment
          </div>

          {asset.assignedTo ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0f172a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>
                  {String(asset.assignedTo).slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                    {asset.assignedTo}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Assigned employee
                  </div>
                </div>
              </div>

              <button
                onClick={() => setPendingReturnId(asset.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  border: "1px solid #eef0f3",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 12.5,
                  padding: "8px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={13} /> Return to Stock
              </button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              No employee assigned.
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid #eef0f3", paddingTop: 18, marginTop: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#94a3b8", letterSpacing: 0.4, marginBottom: 14, textTransform: "uppercase" }}>
            Assignment History
          </div>

          {historyLoading ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading history…</div>
          ) : assetHistory.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>
              No history found for this asset.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {assetHistory.map((h, i) => {
                const type = (h.action_type || h.action || h.type || "").toLowerCase();

                let icon = <ClipboardCheck size={13} color="#475569" />;
                let bg = "#e2e8f0";

                if (type === "issue" || type === "assign" || type === "assigned") {
                  icon = <Laptop size={13} color="#d97706" />;
                  bg = "#fef3e2";
                } else if (type === "return" || type === "returned") {
                  icon = <RotateCcw size={13} color="#16a34a" />;
                  bg = "#dcfce7";
                } else if (type === "repair") {
                  icon = <Wrench size={13} color="#dc2626" />;
                  bg = "#fee2e2";
                }

                return (
                  <div key={h.id || i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                          {getEmployeeFromHistory(h) || "—"}
                        </div>

                        <div style={{ fontSize: 11, color: "#94a3b8", flexShrink: 0, marginLeft: 10 }}>
                          {h.assignment_date || h.date || h.created_at || ""}
                        </div>
                      </div>

                      <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>
                        {h.action_type || h.action || h.type || "Event"}
                        {h.asset_serial ? ` · ${h.asset_serial}` : ""}
                      </div>

                      {h.notes && (
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 2 }}>
                          {h.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {pendingReturnId && (
        <ConfirmDialog
          title="Return Asset"
          message="Are you sure you want to return this asset to stock? It will be marked as unassigned."
          confirmLabel="Return"
          danger={false}
          onConfirm={() => handleReturnToStock(pendingReturnId)}
          onCancel={() => setPendingReturnId(null)}
        />
      )}

      {showEdit && (
        <AssetEditModal
          asset={asset}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}