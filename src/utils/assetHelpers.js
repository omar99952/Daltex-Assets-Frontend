export const INVENTORY_CATEGORIES = ["PCs", "Monitors", "Printers", "Tablets", "Networking", "Peripherals"];

export const CATEGORY_LABEL_TO_DATA = {
  PCs: "Laptops & PCs",
};

export function categoryDataKey(label) {
  return CATEGORY_LABEL_TO_DATA[label] || label;
}

export function matchesCategory(assetCat, label) {
  if (!assetCat) return false;

  const asset = String(assetCat).trim().toLowerCase();
  const selected = categoryDataKey(label).trim().toLowerCase();

  return asset === selected || asset.includes(selected) || selected.includes(asset);
}

export function normalizeArray(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

export function normalizeHistory(data) {
  return normalizeArray(data);
}

export function getEmployeeFromHistory(h) {
  if (!h) return null;

  if (h.employee_name_en) return h.employee_name_en;
  if (h.employee_name_ar) return h.employee_name_ar;
  if (h.employee_name) return h.employee_name;
  if (h.employee_code) return h.employee_code;

  if (typeof h.employee === "object") {
    return (
      h.employee.employee_name_en ||
      h.employee.name_en ||
      h.employee.name ||
      h.employee.employee_code ||
      null
    );
  }

  if (typeof h.employee === "string") return h.employee;

  return null;
}

export function getLatestAssignedEmployee(history) {
  const latestAssign = history.find((h) => {
    const type = String(h.action_type || h.action || h.type || "").toLowerCase();
    return type.includes("assign") || type.includes("issue");
  });

  return getEmployeeFromHistory(latestAssign);
}

export function assetToApiBody(form, isComputer, isPrinter) {
  const base = {
    brand: form.brand || "",
    model_or_pn: form.model || "",
    serial_number: form.serial || "",
    status: form.status || "In Stock",
    description: form.description || "",
  };

  if (isComputer) {
    return {
      ...base,
      pc_type: form.pcType || "",
      processor: form.processor || "",
      memory_ram: form.memoryRam || "",
      hard_disk: form.hardDisk || "",
    };
  }

  if (isPrinter) {
    return {
      ...base,
      printer_type: form.printerType || "",
      printer_color: form.printerColor || "",
      technology: form.technology || "",
      connection_type: form.connectionType || "",
    };
  }

  return base;
}