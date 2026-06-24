import { useState, useEffect, useRef } from "react";
import { Bell, Settings, HelpCircle, ChevronDown, LogOut } from "lucide-react";
import { NotificationsPopover, SettingsPopover, HelpPopover } from "./TopBarPopovers.jsx";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  inventory: "Inventory",
  employees: "Employee Directory",
  employeeDetail: "Employee Profile",
  branches: "Branches & Departments",
  branchDetail: "Branch Detail",
  assignments: "Assignments",
  newAssignment: "Hardware Checkout",
  contract: "Delivery Contract",
};

export default function TopBar({ page, userName, userRole, avatarColor, alert, onLogout, activity, lastReadActivityId, onOpenNotifications, settings, updateSetting, onOpenHelpGuide }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleNotif() {
    setNotifOpen((o) => {
      const next = !o;
      if (next) onOpenNotifications && onOpenNotifications();
      return next;
    });
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 28px",
        background: "#fff",
        borderBottom: "1px solid #eef0f3",
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{PAGE_TITLES[page] || "Dashboard"}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ position: "relative" }}>
          <button onClick={toggleNotif} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <Bell size={18} color="#475569" />
            {alert && (
              <span
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: "#ef4444",
                }}
              />
            )}
          </button>
          {notifOpen && <NotificationsPopover activity={activity} lastReadActivityId={lastReadActivityId} onClose={() => setNotifOpen(false)} />}
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setSettingsOpen((o) => !o)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <Settings size={18} color="#475569" />
          </button>
          {settingsOpen && <SettingsPopover settings={settings} updateSetting={updateSetting} onClose={() => setSettingsOpen(false)} />}
        </div>
        <div style={{ position: "relative" }}>
          <button onClick={() => setHelpOpen((o) => !o)} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}>
            <HelpCircle size={18} color="#475569" />
          </button>
          {helpOpen && <HelpPopover onClose={() => setHelpOpen(false)} onOpenGuide={onOpenHelpGuide} />}
        </div>
        <div style={{ width: 1, height: 26, background: "#eef0f3" }} />
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{ display: "flex", alignItems: "center", gap: 9, border: "none", background: "none", cursor: "pointer", padding: 0 }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: avatarColor || "#0f172a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {userName.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{userName}</div>
              <div style={{ fontSize: 11.5, color: "#d97706", fontWeight: 600 }}>{userRole}</div>
            </div>
            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                background: "#fff",
                border: "1px solid #eef0f3",
                borderRadius: 10,
                boxShadow: "0 12px 32px rgba(15,23,42,0.12)",
                width: 180,
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout && onLogout();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "11px 14px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#dc2626",
                  textAlign: "left",
                }}
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
