import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client.js";
import { ENDPOINTS } from "../api/endpoints.js";
import { FileText, ArrowLeft, Building2, ClipboardCheck, Printer as PrinterIcon } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import Card from "../components/Card.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { Row } from "../components/Misc.jsx";
import { printContract } from "../components/exportUtils.js";
import { NAVY, ORANGE } from "../theme.js";

export default function ContractPreview() {
  const { lastContract, navigateTo, goBack } = useApp();

  if (!lastContract) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <FileText size={36} color="#cbd5e1" />
        <div style={{ marginTop: 12, color: "#94a3b8", fontSize: 14 }}>No contract has been generated yet.</div>
        <button
          onClick={() => navigateTo("newAssignment")}
          style={{ marginTop: 16, background: ORANGE, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
        >
          Start New Assignment
        </button>
      </div>
    );
  }

  const { docId, date, employee, branchRecipient, asset, officer } = lastContract;

  return (
    <div style={{ padding: 28 }}>
      <button
        onClick={() => goBack()}
        style={{ display: "flex", alignItems: "center", gap: 6, border: "none", background: "none", color: ORANGE, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Back
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Asset Central</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>Delivery Contract #{docId}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => navigateTo("newAssignment")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              border: "1px solid #eef0f3",
              borderRadius: 8,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13,
              color: "#475569",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Edit Details
          </button>
          <button
            onClick={() => printContract(lastContract)}
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
              background: ORANGE,
              cursor: "pointer",
            }}
          >
            <PrinterIcon size={14} /> Print Contract
          </button>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0f172a", paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>DALTEX HQ</div>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>IT ASSET MANAGEMENT DIVISION</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a", letterSpacing: 0.4 }}>ASSET DELIVERY CONTRACT</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>DOC_ID: {docId}</div>
            <div style={{ fontSize: 11.5, color: "#94a3b8" }}>DATE: {date}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 30, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 0.4, marginBottom: 10 }}>RECIPIENT INFORMATION</div>
            {employee ? (
              <>
                <Row label="Employee Name" value={employee.name} />
                <Row label="Department" value={employee.dept} />
                <Row label="Employee ID" value={`EMP-${employee.id}`} />
                <Row label="Branch Location" value={employee.location} />
              </>
            ) : (
              <>
                <Row label="Branch Name" value={branchRecipient.branch.name} />
                <Row label="Department" value={branchRecipient.departmentName || "Whole Branch"} />
                <Row label="Branch ID" value={branchRecipient.branch.id} />
                <Row label="Region" value={branchRecipient.branch.region} />
              </>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 0.4, marginBottom: 10 }}>ISSUING OFFICER</div>
            <Row label="Officer Name" value={officer} />
            <Row label="IT Designation" value="Senior Asset Manager" />
            <Row label="Status" value={<StatusPill status="Assigned" />} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: 0.4, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <ClipboardCheck size={13} /> ASSIGNED IT ASSETS
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left" }}>
              {["ASSET TYPE", "MAKE & MODEL", "SERIAL NUMBER", "CONDITION"].map((h) => (
                <th key={h} style={{ padding: "9px 14px", fontSize: 11, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid #eef0f3" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{asset.category}</td>
              <td style={{ padding: "12px 14px", fontSize: 13, color: "#475569" }}>
                {asset.brand} {asset.model}
              </td>
              <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#94a3b8" }}>SN: {asset.serial}</td>
              <td style={{ padding: "12px 14px" }}>
                <span style={{ background: "#dcfce7", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>
                  {asset.condition.toUpperCase()}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
