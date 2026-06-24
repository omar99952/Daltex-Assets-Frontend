import React, { useState } from "react";
import { ArrowLeft, Users, Building2, Search, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { NAVY, ORANGE } from "../theme.js";

export default function NewAssignment() {
  const { employees, assets, branches, assignAsset, returnAsset, navigateTo, goBack, lastContract } = useApp();

  // If we arrived here via "Edit Details" on a contract, pre-fill everything from
  // the existing assignment instead of starting from a blank wizard.
  const editingFromContract = lastContract;
  const initialRecipientType = editingFromContract?.branchRecipient ? "branch" : "employee";
  const initialEmp = editingFromContract?.employee || null;
  const initialBranch = editingFromContract?.branchRecipient?.branch || null;
  const initialDept = editingFromContract?.branchRecipient?.departmentName || null;
  const initialAssetId = editingFromContract?.asset?.id || null;

  const [step, setStep] = useState(editingFromContract ? 3 : 1);
  const [recipientType, setRecipientType] = useState(initialRecipientType);
  const [query, setQuery] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(initialEmp);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId);

  const candidates = employees.filter((e) => query === "" || e.name.toLowerCase().includes(query.toLowerCase()) || e.id.includes(query));
  const branchCandidates = branches.filter(
    (b) => query === "" || b.name.toLowerCase().includes(query.toLowerCase()) || b.id.toLowerCase().includes(query.toLowerCase())
  );
  // When editing, the asset that's already on this contract should stay selectable
  // even though its status is "Assigned" rather than "In Stock".
  const availableAssets = assets.filter((a) => a.status === "In Stock" || a.id === initialAssetId);

  const hasValidRecipient = recipientType === "employee" ? !!selectedEmp : !!selectedBranch;

  function goNext() {
    if (step === 3) {
      // If editing and the asset was swapped for a different one, free up the
      // original asset first so it doesn't stay stuck as "Assigned" with no owner.
      if (editingFromContract && initialAssetId && initialAssetId !== selectedAssetId) {
        returnAsset(initialAssetId);
      }
      if (recipientType === "employee") {
        assignAsset(selectedAssetId, { type: "employee", employeeId: selectedEmp.id });
      } else {
        assignAsset(selectedAssetId, { type: "branch", branchId: selectedBranch.id, departmentName: selectedDept });
      }
      navigateTo("contract");
    } else {
      setStep(step + 1);
    }
  }

  function switchRecipientType(key) {
    setRecipientType(key);
    setSelectedEmp(null);
    setSelectedBranch(null);
    setSelectedDept(null);
    setQuery("");
  }

  const steps = [
    { n: 1, label: "RECIPIENT", sub: "Identity Selection" },
    { n: 2, label: "ASSETS", sub: "Inventory Selection" },
    { n: 3, label: "LOGISTICS", sub: "Review & Confirm" },
  ];

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Back
      </button>
      <div style={{ fontSize: 12.5, color: "#94a3b8", marginBottom: 6 }}>
        Asset Central &nbsp;&nbsp;<span style={{ color: ORANGE, fontWeight: 700 }}>{editingFromContract ? "Edit Assignment" : "New Assignment"}</span> &nbsp;&nbsp;Batch Returns
      </div>
      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginTop: 12 }}>Hardware Checkout</div>
      <div style={{ fontSize: 13.5, color: "#94a3b8", marginTop: 2, marginBottom: 26 }}>
        Assign technology assets to employees or organizational branches.
      </div>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.n}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step >= s.n ? NAVY : "#f1f5f9",
                  color: step >= s.n ? "#fff" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {step > s.n ? <Check size={15} /> : s.n}
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: step >= s.n ? "#0f172a" : "#94a3b8", letterSpacing: 0.4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.sub}</div>
              </div>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: "#eef0f3", margin: "0 14px" }} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            {[
              { key: "employee", title: "Individual Employee", desc: "Assign assets directly to a specific team member.", icon: <Users size={18} /> },
              { key: "branch", title: "Dept / Branch", desc: "Assign assets to a physical location or department pool.", icon: <Building2 size={18} /> },
            ].map((opt) => (
              <div
                key={opt.key}
                onClick={() => switchRecipientType(opt.key)}
                style={{
                  flex: 1,
                  border: `1.5px solid ${recipientType === opt.key ? ORANGE : "#eef0f3"}`,
                  borderRadius: 10,
                  padding: 18,
                  cursor: "pointer",
                  position: "relative",
                  background: recipientType === opt.key ? "#fffaf3" : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eef0f3", display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>
                    {opt.icon}
                  </div>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      border: `2px solid ${recipientType === opt.key ? ORANGE : "#cbd5e1"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {recipientType === opt.key && <div style={{ width: 9, height: 9, borderRadius: "50%", background: ORANGE }} />}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", marginTop: 12 }}>{opt.title}</div>
                <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4 }}>{opt.desc}</div>
              </div>
            ))}
          </div>

          {recipientType === "employee" ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Search Recipient Name or ID</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #eef0f3", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <Search size={15} color="#94a3b8" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Marcus Thorne or EMP ID..."
                  style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
                />
              </div>

              <div style={{ border: "1px solid #eef0f3", borderRadius: 10, overflow: "hidden" }}>
                {candidates.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEmp(e)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      background: selectedEmp?.id === e.id ? "#fffaf3" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: e.avatarColor,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {e.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{e.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>
                          {e.role} · ID: {e.id}
                        </div>
                      </div>
                    </div>
                    {selectedEmp?.id === e.id && (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={13} color="#fff" />
                      </div>
                    )}
                  </div>
                ))}
                {candidates.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No matching employees.</div>}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>Search Branch Name or ID</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid #eef0f3", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <Search size={15} color="#94a3b8" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Sadat City or HQ..."
                  style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
                />
              </div>

              <div style={{ border: "1px solid #eef0f3", borderRadius: 10, overflow: "hidden", marginBottom: selectedBranch ? 16 : 0 }}>
                {branchCandidates.slice(0, 6).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBranch(b);
                      setSelectedDept(null);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: "1px solid #f3f4f6",
                      cursor: "pointer",
                      background: selectedBranch?.id === b.id ? "#fffaf3" : "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          background: NAVY,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 11,
                        }}
                      >
                        {b.id}
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>{b.region}</div>
                      </div>
                    </div>
                    {selectedBranch?.id === b.id && (
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Check size={13} color="#fff" />
                      </div>
                    )}
                  </div>
                ))}
                {branchCandidates.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No matching branches.</div>}
              </div>

              {selectedBranch && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>
                    Department within {selectedBranch.name} <span style={{ color: "#94a3b8", fontWeight: 500 }}>(optional)</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => setSelectedDept(null)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "1px solid #eef0f3",
                        cursor: "pointer",
                        fontSize: 12.5,
                        fontWeight: 700,
                        background: selectedDept === null ? ORANGE : "#fff",
                        color: selectedDept === null ? "#fff" : "#475569",
                      }}
                    >
                      Whole Branch
                    </button>
                    {selectedBranch.departments.map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDept(d)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 999,
                          border: "1px solid #eef0f3",
                          cursor: "pointer",
                          fontSize: 12.5,
                          fontWeight: 700,
                          background: selectedDept === d ? ORANGE : "#fff",
                          color: selectedDept === d ? "#fff" : "#475569",
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>Select an available asset from stock</div>
          <div style={{ border: "1px solid #eef0f3", borderRadius: 10, overflow: "hidden" }}>
            {availableAssets.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedAssetId(a.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderBottom: "1px solid #f3f4f6",
                  cursor: "pointer",
                  background: selectedAssetId === a.id ? "#fffaf3" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <CategoryIcon category={a.category} size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                      {a.brand} {a.model}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      SN: {a.serial} · {a.branch}
                    </div>
                  </div>
                </div>
                {selectedAssetId === a.id && (
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={13} color="#fff" />
                  </div>
                )}
              </div>
            ))}
            {availableAssets.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No assets currently in stock.</div>}
          </div>
        </div>
      )}

      {step === 3 && hasValidRecipient && selectedAsset && (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
            {editingFromContract ? "Review Changes" : "Review Assignment"}
          </div>
          {recipientType === "employee" ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Recipient</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {selectedEmp.name} ({selectedEmp.role})
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Location</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedEmp.location}</span>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Recipient</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                  {selectedBranch.name}
                  {selectedDept ? ` — ${selectedDept} Dept.` : " (Whole Branch)"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>Region</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedBranch.region}</span>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Asset</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {selectedAsset.brand} {selectedAsset.model}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Serial Number</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{selectedAsset.serial}</span>
          </div>
          <div style={{ marginTop: 14, background: "#fef3e2", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#b45309" }}>
            {editingFromContract
              ? "Saving will update this assignment and refresh the delivery contract with the new details."
              : "Confirming will mark this asset as Assigned and generate a delivery contract."}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
        <button
          onClick={() => (step === 1 ? goBack() : setStep(step - 1))}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "1px solid #eef0f3",
            background: "#fff",
            color: "#475569",
            fontWeight: 700,
            fontSize: 13.5,
            padding: "11px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={15} /> Back
        </button>
        <button
          onClick={goNext}
          disabled={(step === 1 && !hasValidRecipient) || (step === 2 && !selectedAssetId)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13.5,
            padding: "11px 22px",
            borderRadius: 8,
            cursor: "pointer",
            background: (step === 1 && !hasValidRecipient) || (step === 2 && !selectedAssetId) ? "#fcd9a8" : ORANGE,
          }}
        >
          {step === 3 ? (editingFromContract ? "Save Changes" : "Confirm & Generate Contract") : "Next Step"} <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
