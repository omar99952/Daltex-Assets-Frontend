import { ArrowLeft } from "lucide-react";
import { ORANGE } from "../theme.js";

export default function BackButton({ onClick, label = "Back" }) {
  return (
    <button
      onClick={onClick}
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
        marginBottom: 18,
        padding: 0,
      }}
    >
      <ArrowLeft size={15} /> {label}
    </button>
  );
}
