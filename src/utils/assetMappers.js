export function normalizeStatus(s) {
  const str = (s || "").toLowerCase().replace(/_/g, " ").trim();
  if (str === "in stock") return "In Stock";
  if (str === "assigned") return "Assigned";
  if (str === "repair") return "Repair";
  if (str === "retired") return "Retired";
  return s || "In Stock";
}

export function extractCategoryName(cat) {
  if (!cat && cat !== 0) return "";
  if (typeof cat === "object") return cat.name_en || cat.name || String(cat.id || "");
  return String(cat);
}

export function extractBranchInfo(raw) {
  if (!raw) return { name: "", dept: "", sector: "" };

  if (typeof raw === "object") {
    const dept = raw.department
      ? typeof raw.department === "object"
        ? raw.department.name || ""
        : String(raw.department)
      : "";

    const sector = raw.sector
      ? typeof raw.sector === "object"
        ? raw.sector.name || ""
        : String(raw.sector)
      : "";

    return {
      name: raw.name_en || raw.name || "",
      dept,
      sector,
    };
  }

  return { name: String(raw), dept: "", sector: "" };
}

export function mapComputer(c) {
  const branchInfo = extractBranchInfo(c.branch);

  return {
    id: String(c.id),
    brand: c.brand || "",
    model: c.model_or_pn || c.model || "",
    serial: c.serial_number || c.serial || "",
    status: normalizeStatus(c.status),
    category: "Laptops & PCs",
    condition: c.condition || "",
    branch: branchInfo.name,
    department:
      (typeof c.department === "object" ? c.department?.name : c.department) ||
      branchInfo.dept ||
      "",
    sector:
      (typeof c.sector === "object" ? c.sector?.name : c.sector) ||
      branchInfo.sector ||
      "",
    assignedTo: c.assigned_to || c.assignedTo || null,
    description: c.description || "",
    deliveryDate: c.delivery_date || "",
    pcType: c.pc_type || "",
    processor: c.processor || "",
    memoryRam: c.memory_ram || "",
    hardDisk: c.hard_disk || "",
    monitorBrand: c.monitor_brand || null,
    monitorModel: c.monitor_model || null,
    monitorInches: c.monitor_inches ? String(c.monitor_inches) : null,
    monitorSerial: c.monitor_serial || null,
    keyboardBrand: c.keyboard_brand || null,
    keyboardModel: c.keyboard_model || null,
    keyboardSerial: c.keyboard_serial || null,
    mouseBrand: c.mouse_brand || null,
    mouseModel: c.mouse_model || null,
    mouseSerial: c.mouse_serial || null,
    bagBrand: c.bag_brand || null,
    bagModelDescription: c.bag_model_or_description || null,
  };
}

export function mapPrinter(p) {
  const branchInfo = extractBranchInfo(p.branch);

  return {
    id: String(p.id),
    brand: p.brand || "",
    model: p.model_or_pn || p.model || "",
    serial: p.serial_number || p.serial || "",
    status: normalizeStatus(p.status),
    category: "Printers",
    condition: p.condition || "",
    branch: branchInfo.name,
    department:
      (typeof p.department === "object" ? p.department?.name : p.department) ||
      branchInfo.dept ||
      "",
    sector:
      (typeof p.sector === "object" ? p.sector?.name : p.sector) ||
      branchInfo.sector ||
      "",
    assignedTo: p.assigned_to || null,
    description: p.description || "",
    deliveryDate: p.delivery_date || "",
    multifunctions: p.multifunctions || false,
    printerType: p.printer_type || "",
    printerColor: p.printer_color || "",
    connectionType: p.connection_type || "",
    technology: p.technology || "",
    cartridgeNumber: p.cartridge_number || "",
    cartridgeColor: p.cartridge_color || "",
    inkDetails: p.ink_details || "",
    activeConnection: p.active_connection || "",
    macAddressEth: p.mac_address_eth || null,
    ipAddressEth: p.ip_address_eth || null,
    macAddressWifi: p.mac_address_wifi || null,
  };
}

export function mapMonitor(m) {
  const branchInfo = extractBranchInfo(m.branch);

  return {
    id: String(m.id),
    brand: m.brand || "",
    model: m.model_or_pn || m.model || "",
    serial: m.serial_number || m.serial || "",
    status: normalizeStatus(m.status),
    category: "Monitors",
    condition: m.condition || "",
    branch: branchInfo.name,
    department:
      (typeof m.department === "object" ? m.department?.name : m.department) ||
      branchInfo.dept ||
      "",
    sector:
      (typeof m.sector === "object" ? m.sector?.name : m.sector) ||
      branchInfo.sector ||
      "",
    assignedTo: m.assigned_to || null,
    description: m.description || "",
    deliveryDate: m.delivery_date || "",
    monitorType: m.monitor_type || "",
    monitorSize: m.monitor_size || "",
    resolution: m.resolution || "",
    refreshRate: m.refresh_rate || "",
    panelType: m.panel_type || "",
    ports: m.ports || "",
  };
}

export function mapTablet(t) {
  const branchInfo = extractBranchInfo(t.branch);

  return {
    id: String(t.id),
    brand: t.brand || "",
    model: t.model_or_pn || t.model || "",
    serial: t.serial_number || t.serial || "",
    status: normalizeStatus(t.status),
    category: "Tablets",
    condition: t.condition || "",
    branch: branchInfo.name,
    department:
      (typeof t.department === "object" ? t.department?.name : t.department) ||
      branchInfo.dept ||
      "",
    sector:
      (typeof t.sector === "object" ? t.sector?.name : t.sector) ||
      branchInfo.sector ||
      "",
    assignedTo: t.assigned_to || null,
    description: t.description || "",
    deliveryDate: t.delivery_date || "",
    screenSize: t.screen_size || "",
    storage: t.storage || "",
    ram: t.ram || "",
    operatingSystem: t.operating_system || "",
    simSupport: t.sim_support || false,
    imei: t.imei || "",
  };
}

export function mapHardwareAsset(a) {
  if (a.pc_type !== undefined) return mapComputer(a);
  if (a.printer_type !== undefined) return mapPrinter(a);
  if (a.monitor_type !== undefined) return mapMonitor(a);
  if (a.tablet_type !== undefined) return mapTablet(a);

  const branchInfo = extractBranchInfo(a.branch);

  return {
    id: String(a.id),
    brand: a.brand || "",
    model: a.model_or_pn || a.model || "",
    serial: a.serial_number || a.serial || "",
    status: normalizeStatus(a.status),
    category: extractCategoryName(a.category),
    condition: a.condition || "",
    branch: branchInfo.name,
    department:
      (typeof a.department === "object" ? a.department?.name : a.department) ||
      branchInfo.dept ||
      "",
    sector:
      (typeof a.sector === "object" ? a.sector?.name : a.sector) ||
      branchInfo.sector ||
      "",
    assignedTo: a.assigned_to || null,
    description: a.description || "",
    deliveryDate: a.delivery_date || "",
  };
}