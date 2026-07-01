import { createContext, useContext, useState, useEffect } from "react";

const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

function loadNav() {
  try {
    const stored = localStorage.getItem("daltex_nav");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  const nav = loadNav();

  const [page, setPageRaw] = useState(nav.page || "home");
  const [pageHistory, setPageHistory] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(nav.selectedEmployeeId ?? null);
  const [selectedAssetId, setSelectedAssetId] = useState(nav.selectedAssetId ?? null);
  const [selectedAssetType, setSelectedAssetType] = useState(nav.selectedAssetType ?? null);
  const [selectedBranchId, setSelectedBranchId] = useState(nav.selectedBranchId ?? null);
  const [selectedBranchName, setSelectedBranchName] = useState(nav.selectedBranchName ?? null);
  const [selectedSectorId, setSelectedSectorId] = useState(nav.selectedSectorId ?? null);
  const [selectedSectorName, setSelectedSectorName] = useState(nav.selectedSectorName ?? null);
  const [selectedDeptId, setSelectedDeptId] = useState(nav.selectedDeptId ?? null);
  const [selectedDeptName, setSelectedDeptName] = useState(nav.selectedDeptName ?? null);

  const [lastContract, setLastContract] = useState(nav.lastContract ?? null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("daltex_auth") === "true";
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("daltex_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(nav.inventoryStatusFilter ?? null);
  const [inventoryCategory, setInventoryCategory] = useState(nav.inventoryCategory ?? null);
  const [inventoryCategoryId, setInventoryCategoryId] = useState(nav.inventoryCategoryId ?? null);
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [employeeSort, setEmployeeSort] = useState("name-asc");

  const [lastReadActivityId, setLastReadActivityId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [settings, setSettings] = useState({
    emailAlerts: true,
    desktopAlerts: false,
    compactMode: false,
    weeklyDigest: true,
  });

  const [deleteEmployeeEnabled, setDeleteEmployeeEnabled] = useState(false);
  const [deleteAssetEnabled, setDeleteAssetEnabled] = useState(false);
  const [deleteBranchEnabled, setDeleteBranchEnabled] = useState(false);
  const [deleteDeptEnabled, setDeleteDeptEnabled] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    try {
      localStorage.setItem("daltex_nav", JSON.stringify({
        page,
        selectedEmployeeId,
        selectedAssetId,
        selectedAssetType,
        selectedBranchId,
        selectedBranchName,
        selectedSectorId,
        selectedSectorName,
        selectedDeptId,
        selectedDeptName,
        inventoryCategory,
        inventoryCategoryId,
        inventoryStatusFilter,
        lastContract,
      }));
    } catch {
      // localStorage full or unavailable
    }
  }, [
    isAuthenticated,
    page,
    selectedEmployeeId,
    selectedAssetId,
    selectedAssetType,
    selectedBranchId,
    selectedBranchName,
    selectedSectorId,
    selectedSectorName,
    selectedDeptId,
    selectedDeptName,
    inventoryCategory,
    inventoryCategoryId,
    inventoryStatusFilter,
    lastContract,
  ]);

  function navigateTo(next) {
    setPageHistory((prev) => [...prev, page]);
    setPageRaw(next);
  }

  function setPage(next) {
    setPageRaw(next);
  }

  function goBack(fallback = "home") {
    setPageHistory((prev) => {
      if (prev.length === 0) {
        setPageRaw(fallback);
        return prev;
      }

      const next = prev[prev.length - 1];
      setPageRaw(next);
      return prev.slice(0, -1);
    });
  }

  function login(user) {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setPageHistory([]);
    setPageRaw("home");
    localStorage.setItem("daltex_auth", "true");
    localStorage.setItem("daltex_user", JSON.stringify(user));
    localStorage.setItem("daltex_nav", JSON.stringify({ page: "home" }));
  }

  function logout() {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPageHistory([]);
    setPageRaw("home");
    localStorage.removeItem("daltex_auth");
    localStorage.removeItem("daltex_user");
    localStorage.removeItem("daltex_nav");
  }

  function goToInventory(statusFilter = null) {
    setInventoryStatusFilter(statusFilter);
    setInventoryCategory(null);
    navigateTo("inventory");
  }

  function openAssetDetail(assetId, assetType = null) {
    setSelectedAssetId(assetId);
    setSelectedAssetType(assetType);
    navigateTo("assetDetail");
  }

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  const value = {
    page,
    setPage,
    navigateTo,
    goBack,
    pageHistory,

    selectedEmployeeId,
    setSelectedEmployeeId,

    selectedAssetId,
    setSelectedAssetId,
    selectedAssetType,
    setSelectedAssetType,
    openAssetDetail,

    selectedBranchId,
    setSelectedBranchId,
    selectedBranchName,
    setSelectedBranchName,
    selectedSectorId,
    setSelectedSectorId,
    selectedSectorName,
    setSelectedSectorName,
    selectedDeptId,
    setSelectedDeptId,
    selectedDeptName,
    setSelectedDeptName,

    lastContract,
    setLastContract,

    isAuthenticated,
    currentUser,
    login,
    logout,

    inventoryStatusFilter,
    setInventoryStatusFilter,
    inventoryCategory,
    setInventoryCategory,
    inventoryCategoryId,
    setInventoryCategoryId,
    goToInventory,

    showAddDeviceModal,
    setShowAddDeviceModal,

    globalSearchQuery,
    setGlobalSearchQuery,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    employeeSort,
    setEmployeeSort,

    lastReadActivityId,
    setLastReadActivityId,

    settings,
    updateSetting,

    sidebarCollapsed,
    setSidebarCollapsed,

    deleteEmployeeEnabled,
    setDeleteEmployeeEnabled,
    deleteAssetEnabled,
    setDeleteAssetEnabled,
    deleteBranchEnabled,
    setDeleteBranchEnabled,
    deleteDeptEnabled,
    setDeleteDeptEnabled,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
