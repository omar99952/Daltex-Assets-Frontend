import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { apiGet, apiPost } from "../../api/client.js";
import { ENDPOINTS } from "../../api/endpoints.js";
import { useApp } from "../../context/AppContext.jsx";
import { INVENTORY_CATEGORIES, categoryDataKey } from "../../utils/assetHelpers.js";
import BackButton from "../../components/BackButton.jsx";
import CategoryIcon from "../../components/CategoryIcon.jsx";
import Modal from "../../components/Modal.jsx";
import FormField, { inputStyle } from "../../components/FormField.jsx";
import { NAVY } from "../../theme.js";
import InventoryStatusView from "./InventoryStatusView.jsx";

export default function Inventory() {
  const {
    inventoryStatusFilter,
    setInventoryStatusFilter,
    goBack,
    navigateTo,
    setInventoryCategory,
    setInventoryCategoryId,
  } = useApp();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [addCatError, setAddCatError] = useState("");
  const [addCatLoading, setAddCatLoading] = useState(false);

  useEffect(() => {
    apiGet(ENDPOINTS.get_all_asset_categories)
      .then((data) => {
        const arr = Array.isArray(data) ? data : data?.results || [];
        if (arr.length > 0) {
          setCategories(arr.map((c) => ({
            id: c.id,
            name: c.name_en || c.name || String(c.id),
            nameAr: c.name_ar || "",
          })));
        } else {
          setCategories(INVENTORY_CATEGORIES.map((name, i) => ({ id: i, name, nameAr: "" })));
        }
      })
      .catch(() => {
        setCategories(INVENTORY_CATEGORIES.map((name, i) => ({ id: i, name, nameAr: "" })));
      })
      .finally(() => setCatLoading(false));
  }, []);

  function openCategory(name, id) {
    setInventoryCategory(name);
    setInventoryCategoryId(id ?? null);
    navigateTo("inventoryCategory");
  }

  async function handleAddCategory() {
    const nameEn = newCatNameEn.trim();
    const nameAr = newCatNameAr.trim();

    if (!nameEn) {
      setAddCatError("English name is required.");
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === nameEn.toLowerCase())) {
      setAddCatError("A category with this name already exists.");
      return;
    }

    setAddCatLoading(true);
    setAddCatError("");

    try {
      const created = await apiPost(ENDPOINTS.post_new_asset_category, {
        name_en: nameEn,
        name_ar: nameAr,
      });
      setCategories((prev) => [
        ...prev,
        {
          id: created.id ?? Date.now(),
          name: created.name_en || created.name || nameEn,
          nameAr: created.name_ar || nameAr,
        },
      ]);
      setShowAddCategory(false);
      setNewCatNameEn("");
      setNewCatNameAr("");
    } catch {
      setAddCatError("Failed to create category. Please try again.");
    } finally {
      setAddCatLoading(false);
    }
  }

  function closeAddCategory() {
    setShowAddCategory(false);
    setNewCatNameEn("");
    setNewCatNameAr("");
    setAddCatError("");
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>
            Assets
          </div>
          <div style={{ fontSize: 13.5, color: "#94a3b8" }}>
            Choose a category to view and manage its assets.
          </div>
        </div>

        <button
          onClick={() => setShowAddCategory(true)}
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
            flexShrink: 0,
          }}
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {catLoading ? (
        <div style={{ fontSize: 13, color: "#94a3b8" }}>Loading categories…</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 16,
          }}
        >
          {categories.map((cat) => {
            const dataKey = categoryDataKey(cat.name);

            return (
              <div
                key={cat.id}
                onClick={() => openCategory(cat.name, cat.id)}
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

                <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: cat.nameAr ? 3 : 6 }}>
                  {cat.name}
                </div>

                {cat.nameAr && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#64748b",
                      direction: "rtl",
                      textAlign: "right",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {cat.nameAr}
                  </div>
                )}

                <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Click to browse</div>
              </div>
            );
          })}
        </div>
      )}

      {showAddCategory && (
        <Modal
          title="Add Category"
          subtitle="Create a new asset category."
          onClose={closeAddCategory}
          width={420}
          footer={
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={closeAddCategory}
                style={{
                  border: "1px solid #eef0f3",
                  background: "#fff",
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 18px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleAddCategory}
                disabled={addCatLoading}
                style={{
                  border: "none",
                  background: addCatLoading ? "#94a3b8" : NAVY,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  padding: "10px 20px",
                  borderRadius: 8,
                  cursor: addCatLoading ? "not-allowed" : "pointer",
                }}
              >
                {addCatLoading ? "Adding…" : "Add Category"}
              </button>
            </div>
          }
        >
          {addCatError && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: 12.5,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 16,
              }}
            >
              {addCatError}
            </div>
          )}

          <FormField label="Name (English)">
            <input
              value={newCatNameEn}
              onChange={(e) => { setNewCatNameEn(e.target.value); setAddCatError(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddCategory(); }}
              placeholder="e.g. UPS Devices"
              style={inputStyle}
              autoFocus
            />
          </FormField>

          <FormField label="Name (Arabic)">
            <input
              value={newCatNameAr}
              onChange={(e) => setNewCatNameAr(e.target.value)}
              placeholder="مثال: أجهزة UPS"
              style={{ ...inputStyle, direction: "rtl" }}
            />
          </FormField>

          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            This category will appear on the assets page and assets can be assigned to it.
          </div>
        </Modal>
      )}
    </div>
  );
}
