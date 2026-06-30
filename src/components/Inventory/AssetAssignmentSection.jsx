import { RotateCcw } from "lucide-react";

export default function AssetAssignmentSection({
  assignedTo,
  onReturnToStock,
}) {
  return (
    <div
      style={{
        borderTop: "1px solid #eef0f3",
        paddingTop: 18,
        marginTop: 18,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 13,
          color: "#94a3b8",
          letterSpacing: 0.4,
          marginBottom: 12,
          textTransform: "uppercase",
        }}
      >
        Current Assignment
      </div>

      {assignedTo ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
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
              {String(assignedTo).slice(0, 2).toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                {assignedTo}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "#94a3b8",
                }}
              >
                Assigned employee
              </div>
            </div>
          </div>

          <button
            onClick={onReturnToStock}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #eef0f3",
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
              fontSize: 12.5,
              padding: "8px 14px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={13} />
            Return to Stock
          </button>
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          No employee assigned.
        </div>
      )}
    </div>
  );
}