export function toCsv(rows, headers) {
  const escape = (val) => {
    const s = String(val ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  rows.forEach((r) => lines.push(headers.map((h) => escape(r[h])).join(",")));
  return lines.join("\n");
}

export function escapeHtml(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildPrintableHtml(title, headers, rows) {
  const headHtml = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const rowsHtml = rows
    .map((r) => `<tr>${headers.map((h) => `<td>${escapeHtml(r[h])}</td>`).join("")}</tr>`)
    .join("");
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 16px; margin: 0 0 4px; }
          .meta { font-size: 11px; color: #64748b; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; white-space: nowrap; }
          th { background: #f8fafc; font-weight: 700; color: #475569; }
          tr:nth-child(even) td { background: #fafbfc; }
        </style>
      </head>
      <body>
        <h1>DALTEX HQ — ${escapeHtml(title)}</h1>
        <div class="meta">${rows.length} row${rows.length === 1 ? "" : "s"} · exported ${new Date().toLocaleString()}</div>
        <table>
          <thead><tr>${headHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `;
}

export function printHtmlDocument(html) {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  iframe.contentWindow.focus();
  // Give the iframe a brief moment to lay out the content before invoking print,
  // which on most browsers offers "Save as PDF" as a destination too.
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  }, 250);
}

export function downloadAsPdf(title, headers, rows) {
  printHtmlDocument(buildPrintableHtml(title, headers, rows));
}

export function buildContractHtml(contract) {
  const { docId, date, employee, branchRecipient, asset, officer } = contract;
  const recipientRows = employee
    ? [
        ["Employee Name", employee.name],
        ["Department", employee.dept],
        ["Employee ID", `EMP-${employee.id}`],
        ["Branch Location", employee.location],
      ]
    : [
        ["Branch Name", branchRecipient.branch.name],
        ["Department", branchRecipient.departmentName || "Whole Branch"],
        ["Branch ID", branchRecipient.branch.id],
        ["Region", branchRecipient.branch.region],
      ];

  const rowHtml = (label, value) => `<div class="row"><span class="label">${escapeHtml(label)}</span><span class="value">${escapeHtml(value)}</span></div>`;

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Delivery Contract ${escapeHtml(docId)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 32px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 20px; }
          .brand { font-weight: 800; font-size: 15px; }
          .brand-sub { font-size: 10.5px; color: #64748b; }
          .doc-title { font-weight: 700; font-size: 12px; letter-spacing: 0.4px; text-align: right; }
          .doc-meta { font-size: 10.5px; color: #64748b; text-align: right; }
          .cols { display: flex; gap: 30px; margin-bottom: 22px; }
          .col { flex: 1; }
          .col-title { font-size: 10px; font-weight: 700; color: #b45309; letter-spacing: 0.4px; margin-bottom: 8px; }
          .row { display: flex; justify-content: space-between; font-size: 11.5px; padding: 5px 0; border-bottom: 1px solid #f1f5f9; }
          .label { color: #64748b; }
          .value { font-weight: 600; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
          th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; }
          th { background: #f8fafc; font-weight: 700; color: #64748b; font-size: 10px; }
          .section-title { font-size: 10.5px; font-weight: 700; color: #475569; letter-spacing: 0.4px; margin-bottom: 8px; }
          .condition { display: inline-block; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">DALTEX HQ</div>
            <div class="brand-sub">IT ASSET MANAGEMENT DIVISION</div>
          </div>
          <div>
            <div class="doc-title">ASSET DELIVERY CONTRACT</div>
            <div class="doc-meta">DOC_ID: ${escapeHtml(docId)}</div>
            <div class="doc-meta">DATE: ${escapeHtml(date)}</div>
          </div>
        </div>
        <div class="cols">
          <div class="col">
            <div class="col-title">RECIPIENT INFORMATION</div>
            ${recipientRows.map(([l, v]) => rowHtml(l, v)).join("")}
          </div>
          <div class="col">
            <div class="col-title">ISSUING OFFICER</div>
            ${rowHtml("Officer Name", officer)}
            ${rowHtml("IT Designation", "Senior Asset Manager")}
            ${rowHtml("Status", "Assigned")}
          </div>
        </div>
        <div class="section-title">ASSIGNED IT ASSETS</div>
        <table>
          <thead><tr><th>ASSET TYPE</th><th>MAKE &amp; MODEL</th><th>SERIAL NUMBER</th><th>CONDITION</th></tr></thead>
          <tbody>
            <tr>
              <td>${escapeHtml(asset.category)}</td>
              <td>${escapeHtml(asset.brand)} ${escapeHtml(asset.model)}</td>
              <td>SN: ${escapeHtml(asset.serial)}</td>
              <td><span class="condition">${escapeHtml(asset.condition.toUpperCase())}</span></td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  `;
}

export function printContract(contract) {
  printHtmlDocument(buildContractHtml(contract));
}
