import Modal from "./Modal.jsx";

export default function HelpGuideModal({ onClose }) {
  const sections = [
    {
      title: "Inventory",
      items: [
        "Click \"Add Device\" to register new hardware.",
        "Use the search box to filter by brand, model, serial, or asset ID.",
        "Click the return icon next to an assigned item to put it back in stock.",
      ],
    },
    {
      title: "Assignments",
      items: [
        "Click \"New Assignment\" to start a hardware checkout.",
        "Choose an individual employee, or a branch / department as the recipient.",
        "Confirming generates a printable delivery contract automatically.",
      ],
    },
    {
      title: "Employees",
      items: [
        "Click \"Add Employee\" to create a new directory entry.",
        "Open a profile and use \"Edit Profile\" to update existing details in place.",
        "\"Delete Employee\" removes them and returns any assigned assets to stock.",
      ],
    },
    {
      title: "Exporting data",
      items: [
        "Any \"Export\" button opens a preview before downloading.",
        "Choose CSV for spreadsheets, or \"Save as PDF\" for a printable copy.",
      ],
    },
  ];

  return (
    <Modal title="Quick Reference Guide" subtitle="A short overview of how things work in Asset Central" onClose={onClose} width={560}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {sections.map((s) => (
          <div key={s.title}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0f172a", marginBottom: 6 }}>{s.title}</div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
              {s.items.map((item) => (
                <li key={item} style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Modal>
  );
}
