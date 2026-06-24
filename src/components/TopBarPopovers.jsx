import { useEffect, useRef } from "react";
import { BookOpen, MessageCircle, ExternalLink } from "lucide-react";
import { ORANGE } from "../theme.js";

export function NotificationsPopover({ activity, lastReadActivityId, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const recent = activity.slice(0, 8);
  let passedUnread = lastReadActivityId === null ? false : true;

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(15,23,42,0.14)",
        width: 340,
        maxHeight: 420,
        overflowY: "auto",
        zIndex: 70,
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f3", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
        Notifications
      </div>
      {recent.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No notifications yet.</div>
      )}
      {recent.map((a) => {
        let isUnread = false;
        if (lastReadActivityId === null) {
          isUnread = true;
        } else if (passedUnread && a.id !== lastReadActivityId) {
          isUnread = true;
        } else if (a.id === lastReadActivityId) {
          passedUnread = false;
          isUnread = false;
        } else if (!passedUnread) {
          isUnread = false;
        }
        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              gap: 10,
              padding: "12px 16px",
              borderBottom: "1px solid #f3f4f6",
              background: isUnread ? "#fffaf3" : "#fff",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: isUnread ? ORANGE : "transparent",
                flexShrink: 0,
                marginTop: 5,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{a.desc}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{a.time}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SettingsPopover({ settings, updateSetting, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const toggles = [
    { key: "emailAlerts", label: "Email alerts" },
    { key: "desktopAlerts", label: "Desktop alerts" },
    { key: "compactMode", label: "Compact layout" },
    { key: "weeklyDigest", label: "Weekly digest" },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(15,23,42,0.14)",
        width: 260,
        zIndex: 70,
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f3", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
        Preferences
      </div>
      <div style={{ padding: "10px 16px 14px" }}>
        {toggles.map((t) => (
          <div key={t.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>{t.label}</span>
            <button
              onClick={() => updateSetting(t.key, !settings[t.key])}
              style={{
                width: 38,
                height: 22,
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                background: settings[t.key] ? ORANGE : "#e2e8f0",
                position: "relative",
                transition: "background .15s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: settings[t.key] ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left .15s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HelpPopover({ onClose, onOpenGuide }) {
  const ref = useRef(null);
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const links = [
    { icon: <BookOpen size={14} />, label: "Getting started guide", action: onOpenGuide },
    { icon: <MessageCircle size={14} />, label: "Contact support", action: () => window.open("mailto:support@daltexhq.com") },
    { icon: <ExternalLink size={14} />, label: "Keyboard shortcuts", action: onOpenGuide },
  ];

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        right: 0,
        background: "#fff",
        border: "1px solid #eef0f3",
        borderRadius: 12,
        boxShadow: "0 16px 40px rgba(15,23,42,0.14)",
        width: 260,
        overflow: "hidden",
        zIndex: 70,
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f3", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>
        Help &amp; Support
      </div>
      <div style={{ padding: "6px 8px" }}>
        {links.map((l) => (
          <button
            key={l.label}
            onClick={() => {
              l.action && l.action();
              onClose();
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "10px 10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              color: "#334155",
              textAlign: "left",
              borderRadius: 7,
            }}
          >
            {l.icon} {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
