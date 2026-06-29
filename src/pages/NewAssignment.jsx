import React, { useState, useEffect } from "react";
import { apiGet, apiPost } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import {
  ArrowLeft,
  Users,
  Building2,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import CategoryIcon from "../components/CategoryIcon.jsx";
import { NAVY, ORANGE } from "../theme.js";

function getArray(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function mapEmployee(e) {
  return {
    id: String(e.employee_code),
    name: e.employee_name_en || "",
    role: e.role || e.job_title || "",
    dept:
      typeof e.last_known_department === "object"
        ? e.last_known_department?.name || ""
        : String(e.last_known_department || ""),
    location:
      typeof e.last_known_branch === "object"
        ? e.last_known_branch?.name_en || e.last_known_branch?.name || ""
        : String(e.last_known_branch || ""),
    avatarColor: "#0f172a",
  };
}

function mapBranch(b) {
  return {
    id: String(b.branch_id || b.id),
    name: b.name_en || b.name || "",
    region: b.location || "",
    departments: b.departments || [],
  };
}

function mapAsset(a) {
  const isComputer = a.pc_type !== undefined;
  const isPrinter = a.printer_type !== undefined;

  return {
    id: String(a.id || a.asset_id || a.serial_number),
    brand: a.brand || "",
    model: a.model_or_pn || a.model || "",
    serial: a.serial_number || a.serial || "",
    status: a.status || a.asset_status || "",
    category: isComputer
      ? "Laptops & PCs"
      : isPrinter
      ? "Printers"
      : a.category || a.asset_type || "Hardware",
    condition: a.condition || "Good",
    branch:
      typeof a.branch === "object"
        ? a.branch?.name_en || a.branch?.name || ""
        : a.branch || "",
  };
}

function isAvailableAsset(a) {
  const status = String(a.status || "").toLowerCase();

  return (
    status === "in_stock" ||
    status === "in stock" ||
    status === "available" ||
    status === "unassigned" ||
    status === "not assigned" ||
    status === ""
  );
}

export default function NewAssignment() {
  const { navigateTo, goBack, setLastContract, currentUser } = useApp();

  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [recipientType, setRecipientType] = useState("employee");
  const [query, setQuery] = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [empData, branchData, hardwareData, compData, printData] =
          await Promise.all([
            apiGet(ENDPOINTS.get_all_employees).catch(() => []),
            apiGet(ENDPOINTS.get_all_branches).catch(() => []),
            apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
            apiGet(ENDPOINTS.get_all_computers).catch(() => []),
            apiGet(ENDPOINTS.get_all_printers).catch(() => []),
          ]);

        setEmployees(getArray(empData).map(mapEmployee));
        setBranches(getArray(branchData).map(mapBranch));

        const allAssets = [
          ...getArray(hardwareData).map(mapAsset),
          ...getArray(compData).map(mapAsset),
          ...getArray(printData).map(mapAsset),
        ];

        const uniqueAssets = Array.from(
          new Map(allAssets.map((a) => [a.serial || a.id, a])).values()
        );

        setAvailableAssets(uniqueAssets.filter(isAvailableAsset));
      } finally {
        setDataLoading(false);
      }
    }

    fetchAll();
  }, []);

  const empCandidates = employees.filter(
    (e) =>
      query === "" ||
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase())
  );

  const branchCandidates = branches.filter(
    (b) => query === "" || b.name.toLowerCase().includes(query.toLowerCase())
  );

  const hasValidRecipient =
    recipientType === "employee" ? !!selectedEmp : !!selectedBranch;

  const selectedAsset =
    availableAssets.find((a) => a.id === selectedAssetId) || null;

  function switchRecipientType(key) {
    setRecipientType(key);
    setSelectedEmp(null);
    setSelectedBranch(null);
    setSelectedDept(null);
    setQuery("");
  }

  async function handleConfirm() {
    if (!selectedAsset) return;

    if (recipientType !== "employee") {
      setSubmitError("Branch assignment API is not connected yet.");
      return;
    }

    if (!selectedEmp) {
      setSubmitError("Please select an employee.");
      return;
    }

    if (!selectedAsset.serial) {
      setSubmitError("Selected asset has no serial number, so it cannot be assigned.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
     await apiPost(ENDPOINTS.assign_asset_to_employee, {
     employee_code: selectedEmp.id,
     serial_number: selectedAsset.serial,

      });

      setLastContract({
        docId: `DC-${String(Date.now()).slice(-6)}`,
        date: new Date().toLocaleDateString("en-GB"),
        employee: selectedEmp,
        branchRecipient: null,
        asset: { ...selectedAsset },
        officer: currentUser?.name || "IT Asset Manager",
      });

      navigateTo("contract");
    } catch (err) {
      console.log("Assignment failed:", err?.response?.data || err);
      setSubmitError(
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.detail ||
              err?.response?.data?.error ||
              "Assignment failed. Check employee code and asset serial."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 3) {
      handleConfirm();
    } else {
      setStep(step + 1);
    }
  }

  const steps = [
    { n: 1, label: "RECIPIENT", sub: "Identity Selection" },
    { n: 2, label: "ASSETS", sub: "Inventory Selection" },
    { n: 3, label: "LOGISTICS", sub: "Review & Confirm" },
  ];

  if (dataLoading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
        Loading assignment data…
      </div>
    );
  }

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "none",
          background: "none",
          color: ORANGE,
          fontWeight: 700,
          fontSize: 13.5,
          cursor: "pointer",
          marginBottom: 14,
        }}
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div style={{ fontWeight: 800, fontSize: 22, color: "#0f172a", marginTop: 12 }}>
        Hardware Checkout
      </div>
      <div style={{ fontSize: 13.5, color: "#94a3b8", marginTop: 2, marginBottom: 26 }}>
        Assign technology assets to employees.
      </div>

      {submitError && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            fontSize: 12.5,
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {submitError}
        </div>
      )}

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
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    color: step >= s.n ? "#0f172a" : "#94a3b8",
                    letterSpacing: 0.4,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{s.sub}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: "#eef0f3", margin: "0 14px" }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
            {[
              {
                key: "employee",
                title: "Individual Employee",
                desc: "Assign assets directly to a specific team member.",
                icon: <Users size={18} />,
              },
              {
                key: "branch",
                title: "Dept / Branch",
                desc: "Not connected yet.",
                icon: <Building2 size={18} />,
              },
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
                  background: recipientType === opt.key ? "#fffaf3" : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#eef0f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                    }}
                  >
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
                    {recipientType === opt.key && (
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: ORANGE }} />
                    )}
                  </div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14.5, color: "#0f172a", marginTop: 12 }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: 12.5, color: "#94a3b8", marginTop: 4 }}>
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid #eef0f3",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 14,
            }}
          >
            <Search size={15} color="#94a3b8" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={recipientType === "employee" ? "Search employee name or ID…" : "Search branch name…"}
              style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
            />
          </div>

          {recipientType === "employee" ? (
            <div style={{ border: "1px solid #eef0f3", borderRadius: 10, overflow: "hidden" }}>
              {empCandidates.slice(0, 6).map((e) => (
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
                        background: "#0f172a",
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
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                        {e.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {e.dept || "—"} · {e.id}
                      </div>
                    </div>
                  </div>
                  {selectedEmp?.id === e.id && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: ORANGE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={13} color="#fff" />
                    </div>
                  )}
                </div>
              ))}

              {empCandidates.length === 0 && (
                <div style={{ padding: 20, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                  No matching employees.
                </div>
              )}
            </div>
          ) : (
            <div style={{ border: "1px solid #eef0f3", borderRadius: 10, overflow: "hidden" }}>
              {branchCandidates.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBranch(b);
                    setSelectedDept(null);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    background: selectedBranch?.id === b.id ? "#fffaf3" : "#fff",
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{b.region}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 10 }}>
            Select an available asset from stock
          </div>

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
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CategoryIcon category={a.category} size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                      {a.brand} {a.model}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      SN: {a.serial || "No serial"} · {a.status || "No status"} · {a.branch || "—"}
                    </div>
                  </div>
                </div>

                {selectedAssetId === a.id && (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: ORANGE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={13} color="#fff" />
                  </div>
                )}
              </div>
            ))}

            {availableAssets.length === 0 && (
              <div style={{ padding: 20, fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
                No assets currently in stock.
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && hasValidRecipient && selectedAsset && (
        <Card>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 16 }}>
            Review Assignment
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Recipient</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {recipientType === "employee" ? selectedEmp.name : selectedBranch.name}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Asset</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {selectedAsset.brand} {selectedAsset.model}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>Serial Number</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
              {selectedAsset.serial || "—"}
            </span>
          </div>

          <div style={{ marginTop: 14, background: "#fef3e2", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#b45309" }}>
            Confirming will assign this asset through the API.
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
          disabled={
            submitting ||
            (step === 1 && !hasValidRecipient) ||
            (step === 2 && !selectedAssetId)
          }
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
            background:
              (step === 1 && !hasValidRecipient) ||
              (step === 2 && !selectedAssetId) ||
              submitting
                ? "#fcd9a8"
                : ORANGE,
          }}
        >
          {step === 3 ? (submitting ? "Saving…" : "Confirm & Generate Contract") : "Next Step"}
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}