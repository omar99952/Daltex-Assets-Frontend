import { useState } from "react";
import { Table2, Code, FileText, Download } from "lucide-react";
import Modal from "./Modal.jsx";
import { toCsv, downloadAsPdf } from "./exportUtils.js";
import { ORANGE } from "../theme.js";

export default function CsvPreviewModal({ onClose, rows, headers, filename, title = "Export Preview" }) {
  const [view, setView] = useState("table");
  const csvText = toCsv(rows, headers);
  const pdfTitle = filename.replace(/\.csv$/i, "").replace(/_/g, " ");

  function handleDownloadCsv() {
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function handleDownloadPdf() {
    downloadAsPdf(pdfTitle, headers, rows);
  }

  return (
    <Modal
      title={title}
      subtitle={`${filename} · ${rows.length} row${rows.length === 1 ? "" : "s"}`}
      onClose={onClose}
      width={760}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setView("table")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px",
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                background: view === "table" ? "#f1f5f9" : "#fff",
                color: view === "table" ? "#0f172a" : "#94a3b8",
              }}
            >
              <Table2 size={13} /> Table
            </button>
            <button
              onClick={() => setView("raw")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid #eef0f3", borderRadius: 7, padding: "7px 12px",
                fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                background: view === "raw" ? "#f1f5f9" : "#fff",
                color: view === "raw" ? "#0f172a" : "#94a3b8",
              }}
            >
              <Code size={13} /> Raw CSV
            </button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDownloadPdf}
              style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 16px", borderRadius: 8, cursor: "pointer" }}
            >
              <FileText size={14} /> Save as PDF
            </button>
            <button
              onClick={handleDownloadCsv}
              style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: ORANGE, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}
            >
              <Download size={14} /> Download CSV
            </button>
          </div>
        </div>
      }
    >
      {view === "table" ? (
        <div style={{ overflowX: "auto", border: "1px solid #eef0f3", borderRadius: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {headers.map((h) => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", color: "#94a3b8", fontWeight: 700, fontSize: 11, borderBottom: "1px solid #eef0f3", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {headers.map((h) => (
                    <td key={h} style={{ padding: "9px 14px", color: "#0f172a", whiteSpace: "nowrap" }}>
                      {String(r[h] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
                    No rows to export.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <pre
          style={{
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 8,
            padding: 16,
            fontSize: 12,
            lineHeight: 1.6,
            overflowX: "auto",
            margin: 0,
            fontFamily: "'SF Mono', Menlo, Consolas, monospace",
          }}
        >
          {csvText}
        </pre>
      )}
    </Modal>
  );
}
