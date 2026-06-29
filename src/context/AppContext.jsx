import { createContext, useContext, useState, useMemo } from "react";
import { initialAssets, initialEmployees, initialBranches, initialActivity, initialSectors } from "../data/seedData.js";

const AppCtx = createContext(null);

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const [assets, setAssets] = useState(initialAssets);
  const [employees, setEmployees] = useState(initialEmployees);
  const [branches, setBranches] = useState(initialBranches);
  const [sectors] = useState(initialSectors);
  const [activity, setActivity] = useState(initialActivity);
  const [page, setPageRaw] = useState("home");
  const [pageHistory, setPageHistory] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [lastContract, setLastContract] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState(null);
  const [inventoryCategory, setInventoryCategory] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
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

  // navigateTo pushes the page we're leaving onto the history stack, so goBack
  // always returns to wherever the person actually came from (not a fixed page).
  function navigateTo(next) {
    setPageHistory((prev) => [...prev, page]);
    setPageRaw(next);
  }

  // setPage is kept for cases that should NOT be added to back-history,
  // e.g. logging in/out, or resetting to a known root.
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
  }

  function goToInventory(statusFilter = null) {
    setInventoryStatusFilter(statusFilter);
    setInventoryCategory(null);
    navigateTo("inventory");
  }

  function openAssetDetail(assetId) {
    setSelectedAssetId(assetId);
    navigateTo("assetDetail");
  }

  function addAsset(newAsset) {
    const id = `AST-${Math.floor(10000 + Math.random() * 89999)}`;
    const asset = {
      id,
      status: "Unregistered",
      assignedTo: null,
      condition: "Brand New",
      ...newAsset,
    };
    setAssets((prev) => [asset, ...prev]);
    setActivity((prev) => [
      {
        id: Date.now(),
        title: `${asset.brand} ${asset.model}`,
        desc: "Registered as new device",
        sub: asset.branch,
        time: "Just now",
        type: "register",
      },
      ...prev,
    ]);
    return asset;
  }

  function addEmployee(newEmp) {
    const id = String(Math.floor(80000 + Math.random() * 9999));
    const emp = {
      id,
      status: "Active",
      tenure: "0.0 Years",
      avatarColor: "#0f172a",
      ...newEmp,
    };
    setEmployees((prev) => [emp, ...prev]);
    setActivity((prev) => [
      {
        id: Date.now(),
        title: emp.name,
        desc: `Added to ${emp.dept} as ${emp.role}`,
        sub: emp.location,
        time: "Just now",
        type: "register",
      },
      ...prev,
    ]);
    return emp;
  }

  function updateEmployee(id, patch) {
    const existing = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    setActivity((prev) => [
      {
        id: Date.now(),
        title: patch.name || existing?.name || "Employee",
        desc: "Employee profile updated",
        sub: null,
        time: "Just now",
        type: "register",
      },
      ...prev,
    ]);
  }

  function deleteEmployee(id) {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    // Unassign any assets that were tied to this employee so the data stays consistent.
    setAssets((prev) => prev.map((a) => (a.assignedTo === id ? { ...a, assignedTo: null, status: "In Stock" } : a)));
    if (emp) {
      setActivity((prev) => [
        {
          id: Date.now(),
          title: emp.name,
          desc: "Employee removed from directory",
          sub: emp.dept,
          time: "Just now",
          type: "return",
        },
        ...prev,
      ]);
    }
  }

  function deleteAsset(id) {
    const asset = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (asset) {
      setActivity((prev) => [
        { id: Date.now(), title: asset.model, desc: "Asset removed from inventory", sub: asset.branch, time: "Just now", type: "return" },
        ...prev,
      ]);
    }
  }

  function deleteBranch(id) {
    const branch = branches.find((b) => b.id === id);
    setBranches((prev) => prev.filter((b) => b.id !== id));
    if (branch) {
      setActivity((prev) => [
        { id: Date.now(), title: branch.name, desc: "Branch removed", sub: branch.region, time: "Just now", type: "return" },
        ...prev,
      ]);
    }
  }

  function removeDepartment(branchId, deptName) {
    setBranches((prev) =>
      prev.map((b) => b.id === branchId ? { ...b, departments: b.departments.filter((d) => d !== deptName) } : b)
    );
  }

  function markActivityAsRead() {
    if (activity.length > 0) setLastReadActivityId(activity[0].id);
  }

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function assignAsset(assetId, recipient) {
    // recipient is either { type: "employee", employeeId } or { type: "branch", branchId, departmentName }
    const asset = assets.find((a) => a.id === assetId);
    if (!asset || !recipient) return null;

    if (recipient.type === "branch") {
      const branch = branches.find((b) => b.id === recipient.branchId);
      if (!branch) return null;

      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId
            ? { ...a, status: "Assigned", assignedTo: null, assignedBranch: branch.id, branch: branch.name }
            : a
        )
      );

      setActivity((prev) => [
        {
          id: Date.now(),
          title: asset.model,
          desc: `Assigned to ${branch.name}${recipient.departmentName ? ` (${recipient.departmentName})` : ""}`,
          sub: branch.region,
          time: "Just now",
          type: "assign",
        },
        ...prev,
      ]);

      const contract = {
        docId: `DX-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
        date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        branchRecipient: { branch, departmentName: recipient.departmentName || null },
        asset,
        officer: "Alex Mercer",
      };
      setLastContract(contract);
      return contract;
    }

    // Default: employee recipient
    const employeeId = recipient.type === "employee" ? recipient.employeeId : recipient;
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return null;

    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: "Assigned", assignedTo: employeeId } : a))
    );

    setActivity((prev) => [
      {
        id: Date.now(),
        title: asset.model,
        desc: `Assigned to ${emp.name}`,
        sub: emp.location,
        time: "Just now",
        type: "assign",
      },
      ...prev,
    ]);

    const contract = {
      docId: `DX-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      employee: emp,
      asset,
      officer: "Alex Mercer",
    };
    setLastContract(contract);
    return contract;
  }

  function returnAsset(assetId) {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    setAssets((prev) =>
      prev.map((a) => (a.id === assetId ? { ...a, status: "In Stock", assignedTo: null } : a))
    );

    setActivity((prev) => [
      {
        id: Date.now(),
        title: asset.model,
        desc: `Returned to stock from ${asset.branch}`,
        sub: `Condition: ${asset.condition}`,
        time: "Just now",
        type: "return",
      },
      ...prev,
    ]);
  }

  const stats = useMemo(() => {
    const total = assets.length;
    const assigned = assets.filter((a) => a.status === "Assigned").length;
    const inStock = assets.filter((a) => a.status === "In Stock").length;
    const maintenance = assets.filter((a) => a.status === "Repair").length;
    return { total, assigned, inStock, maintenance };
  }, [assets]);

  const value = {
    assets,
    employees,
    branches,
    sectors,
    activity,
    stats,
    page,
    setPage,
    navigateTo,
    goBack,
    pageHistory,
    selectedEmployeeId,
    setSelectedEmployeeId,
    assignAsset,
    returnAsset,
    addAsset,
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
    selectedAssetId,
    setSelectedAssetId,
    openAssetDetail,
    selectedBranchId,
    setSelectedBranchId,
    showAddDeviceModal,
    setShowAddDeviceModal,
    globalSearchQuery,
    setGlobalSearchQuery,
    employeeSearchQuery,
    setEmployeeSearchQuery,
    employeeSort,
    setEmployeeSort,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    lastReadActivityId,
    markActivityAsRead,
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
    deleteAsset,
    deleteBranch,
    removeDepartment,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

