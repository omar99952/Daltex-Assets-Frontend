import { useState } from "react";
import { Home, LayoutGrid, Boxes, Users, Building2, ClipboardCheck } from "lucide-react";
import "./App.css";

import { AppProvider, useApp } from "./context/AppContext.jsx";

import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import HelpGuideModal from "./components/HelpGuideModal.jsx";

import Login from "./pages/Login.jsx";
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Inventory from "./pages/Inventory/Inventory.jsx";
import { InventoryCategoryPage } from "./pages/Inventory/InventoryCategoryPage.jsx";
import AssetDetailPage from "./pages/Inventory/AssetDetailPage.jsx";import EmployeeDirectory from "./pages/EmployeeDirectory.jsx";
import EmployeeDetail from "./pages/EmployeeDetail.jsx";
import Branches from "./pages/Branches.jsx";
import BranchDetail from "./pages/BranchDetail.jsx";
import AssignmentsLog from "./pages/AssignmentsLog.jsx";
import NewAssignment from "./pages/NewAssignment.jsx";
import ContractPreview from "./pages/ContractPreview.jsx";


const NAV_ITEMS = [
  { key: "home", label: "Home", icon: <Home size={17} /> },
  { key: "dashboard", label: "Dashboard", icon: <LayoutGrid size={17} /> },
  { key: "inventory", label: "Assets", icon: <Boxes size={17} /> },
  { key: "employees", label: "Employees", icon: <Users size={17} /> },
  { key: "branches", label: "Branches", icon: <Building2 size={17} /> },
  { key: "assignments", label: "Assignments", icon: <ClipboardCheck size={17} /> },
];

function Shell() {
  const {
    page,
    navigateTo,
    setInventoryStatusFilter,
    setInventoryCategory,
    inventoryCategory,
    setShowAddDeviceModal,
    lastReadActivityId,
    readNotifIds,
    toggleNotifRead,
    markAllNotifsRead,
    settings,
    updateSetting,
    currentUser,
    logout,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useApp();

  const [showHelpGuide, setShowHelpGuide] = useState(false);

  // Temporary until activity/notifications come from API
  const activity = [];
  const hasUnread = false;

  function markActivityAsRead() {
    // Empty for now because seed/local activity was removed
  }

  function navigate(key) {
    if (key === "inventory") {
      setInventoryStatusFilter(null);
      setInventoryCategory(null);
    }

    navigateTo(key);
  }

  function handleAddNewAsset() {
    if (page !== "inventoryCategory") {
      setInventoryCategory(inventoryCategory || "PCs");
      navigateTo("inventoryCategory");
    }

    setShowAddDeviceModal(true);
  }

  const activeNav = ["newAssignment", "contract"].includes(page)
    ? "assignments"
    : page === "employeeDetail"
    ? "employees"
    : page === "branchDetail"
    ? "branches"
    : ["inventoryCategory", "assetDetail"].includes(page)
    ? "inventory"
    : page;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f4f5f7",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {page !== "home" && (
        <Sidebar
          items={NAV_ITEMS}
          activePage={activeNav}
          onNavigate={navigate}
          onLogout={logout}
          brand="DALTEX HQ"
          sub="IT Asset Management"
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar
          page={page}
          userName={currentUser?.name || "Alex Mercer"}
          userRole={currentUser?.role || "Systems Admin"}
          avatarColor={currentUser?.avatar || "#475569"}
          alert={hasUnread}
          onLogout={logout}
          activity={activity}
          lastReadActivityId={lastReadActivityId}
          onOpenNotifications={markActivityAsRead}
          readNotifIds={readNotifIds}
          toggleNotifRead={toggleNotifRead}
          markAllNotifsRead={markAllNotifsRead}
          settings={settings}
          updateSetting={updateSetting}
          onOpenHelpGuide={() => setShowHelpGuide(true)}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          {page === "home" && <HomePage />}
          {page === "dashboard" && <Dashboard />}
          {page === "inventory" && <Inventory />}
          {page === "inventoryCategory" && <InventoryCategoryPage />}
          {page === "assetDetail" && <AssetDetailPage />}
          {page === "employees" && <EmployeeDirectory />}
          {page === "employeeDetail" && <EmployeeDetail />}
          {page === "branches" && <Branches />}
          {page === "branchDetail" && <BranchDetail />}
          {page === "assignments" && <AssignmentsLog />}
          {page === "newAssignment" && <NewAssignment />}
          {page === "contract" && <ContractPreview />}
        </div>
      </div>

      {showHelpGuide && <HelpGuideModal onClose={() => setShowHelpGuide(false)} />}
    </div>
  );
}

function Root() {
  const { isAuthenticated } = useApp();

  return isAuthenticated ? <Shell /> : <Login />;
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}