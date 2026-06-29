import { useState } from "react";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { NAVY, ORANGE } from "../theme.js";
import daltexLogo from "../assets/daltex-logo-light-final.png";

const DEMO_ACCOUNTS = [
  { email: "alex.mercer@daltexhq.com", password: "daltex2024", name: "Alex Mercer", role: "Systems Admin", avatar: "#475569" },
  { email: "admin@daltexhq.com", password: "admin123", name: "Admin User", role: "Global Admin", avatar: "#0f172a" },
];

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const match = DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.password === password
    );
    if (!match) {
      setError("Incorrect email or password. Try the demo credentials below.");
      return;
    }
    setError("");
    login(match);
  }

  function fillDemo(acc) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f5f7",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ display: "flex", width: 880, maxWidth: "92vw", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(15,23,42,0.12)" }}>
        {/* Left brand panel */}
        <div
          style={{
            flex: 1,
            background: NAVY,
            padding: 44,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src={daltexLogo} alt="Daltex" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>DALTEX HQ</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>IT Asset Management</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35, marginBottom: 14 }}>
              Every laptop, router, and badge — tracked in one place.
            </div>
            <div style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>
              Sign in to manage inventory, assignments, and branch operations across all 21 regional hubs.
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: "#64748b" }}>© 2024 Daltex HQ. All rights reserved.</div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: 1, background: "#fff", padding: 44, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 28 }}>Sign in to your Asset Central account.</div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 7 }}>Email Address</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px" }}>
                <Mail size={15} color="#94a3b8" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@daltexhq.com"
                  required
                  style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 7 }}>Password</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #eef0f3", borderRadius: 8, padding: "11px 14px" }}>
                <Lock size={15} color="#94a3b8" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
                />
                <button type="button" onClick={() => setShowPassword((s) => !s)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#fee2e2", color: "#dc2626", fontSize: 12.5, padding: "10px 12px", borderRadius: 8, marginBottom: 14 }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, marginTop: error ? 0 : 14 }}>
              <button type="button" style={{ border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                background: ORANGE,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ marginTop: 26, borderTop: "1px solid #eef0f3", paddingTop: 18 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94a3b8", marginBottom: 10, letterSpacing: 0.3 }}>DEMO CREDENTIALS</div>
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => fillDemo(acc)}
                type="button"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #eef0f3",
                  borderRadius: 8,
                  padding: "9px 12px",
                  marginBottom: 8,
                  background: "#f8fafc",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{acc.name}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8" }}>{acc.email}</div>
                </div>
                <span style={{ fontSize: 11, color: ORANGE, fontWeight: 700 }}>Use</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

