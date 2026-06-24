import Modal from "./Modal.jsx";
import { ORANGE } from "../theme.js";

export default function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <div style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>{message}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{ border: "1px solid #eef0f3", background: "#fff", color: "#475569", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 8, cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={{
            border: "none",
            background: danger ? "#dc2626" : ORANGE,
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
