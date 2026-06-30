import { createContext, useContext, useState } from "react";

const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const [page, setPageRaw] = useState("home");
  const [pageHistory, setPageHistory] = useState([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const [lastContract, setLastContract] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(null);
  const [inventoryCategory, setInventoryCategory] = useState(null);
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
  }

  function logout() {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setPageHistory([]);
    setPageRaw("home");
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