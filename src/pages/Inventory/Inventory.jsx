import { useApp } from "../../context/AppContext.jsx";
import { INVENTORY_CATEGORIES, categoryDataKey } from "../../utils/assetHelpers.js";
import BackButton from "../../components/BackButton.jsx";
import CategoryIcon from "../../components/CategoryIcon.jsx";
import InventoryStatusView from "./InventoryStatusView.jsx";

export default function Inventory() {
  const {
    inventoryStatusFilter,
    setInventoryStatusFilter,
    goBack,
    navigateTo,
    setInventoryCategory,
  } = useApp();

  function openCategory(label) {
    setInventoryCategory(label);
    navigateTo("inventoryCategory");
  }

  if (inventoryStatusFilter) {
    return (
      <InventoryStatusView
        statusFilter={inventoryStatusFilter}
        onClearFilter={() => setInventoryStatusFilter(null)}
        onBack={goBack}
      />
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <BackButton onClick={() => goBack()} />

      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>
        Assets
      </div>

      <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 24 }}>
        Choose a category to view and manage its assets.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
        {INVENTORY_CATEGORIES.map((label) => {
          const dataKey = categoryDataKey(label);

          return (
            <div
              key={label}
              onClick={() => openCategory(label)}
              style={{
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: 20,
                cursor: "pointer",
                transition: "box-shadow .15s, transform .15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,0.08)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <CategoryIcon category={dataKey} size={18} />
              </div>

              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>
                {label}
              </div>

              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Click to browse</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
