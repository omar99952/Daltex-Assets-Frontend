// src/components/Inventory/AssetStats.jsx

import { Boxes, Users, Building2, Wrench } from "lucide-react";
import StatCard from "../StatCard.jsx";
import { NAVY } from "../../theme.js";

export default function AssetStats({ total, assigned, inStock, repair }) {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
      <StatCard
        icon={<Boxes size={17} color={NAVY} />}
        iconBg="#e2e8f0"
        label="TOTAL MANAGED"
        value={total}
      />

      <StatCard
        icon={<Users size={17} color="#475569" />}
        iconBg="#e2e8f0"
        label="ASSIGNED"
        value={assigned}
        sub={
          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {total ? Math.round((assigned / total) * 100) : 0}% util
          </div>
        }
      />

      <StatCard
        icon={<Building2 size={17} color="#475569" />}
        iconBg="#e2e8f0"
        label="IN STOCK"
        value={inStock}
      />

      <StatCard
        icon={<Wrench size={17} color="#dc2626" />}
        iconBg="#fee2e2"
        label="IN REPAIR"
        value={repair}
        danger
        sub={<div style={{ fontSize: 12, color: "#94a3b8" }}>Pending fix</div>}
      />
    </div>
  );
}