import { apiGet, apiPost, apiDelete, apiPatch } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  mapComputer,
  mapPrinter,
  mapMonitor,
  mapTablet,
  mapHardwareAsset,
} from "../utils/assetMappers";
import { assetToApiBody } from "../utils/assetHelpers";

export async function fetchAssetsByCategory(label) {
  switch (label) {
    case "PCs":
      return (await apiGet(ENDPOINTS.get_all_computers)).map(mapComputer);
    case "Printers":
      return (await apiGet(ENDPOINTS.get_all_printers)).map(mapPrinter);
    case "Monitors":
      return (await apiGet(ENDPOINTS.get_all_monitors)).map(mapMonitor);
    case "Tablets":
      return (await apiGet(ENDPOINTS.get_all_tablets)).map(mapTablet);
    default:
      return (await apiGet(ENDPOINTS.get_all_hardware_assets)).map(mapHardwareAsset);
  }
}

export async function fetchAssetsByStatus(statusFilter) {
  const [computers, printers, hardware, monitors, tablets] = await Promise.all([
    apiGet(ENDPOINTS.get_all_computers).catch(() => []),
    apiGet(ENDPOINTS.get_all_printers).catch(() => []),
    apiGet(ENDPOINTS.get_all_hardware_assets).catch(() => []),
    apiGet(ENDPOINTS.get_all_monitors).catch(() => []),
    apiGet(ENDPOINTS.get_all_tablets).catch(() => []),
  ]);

  const all = [
    ...(Array.isArray(computers) ? computers.map(mapComputer) : []),
    ...(Array.isArray(printers) ? printers.map(mapPrinter) : []),
    ...(Array.isArray(hardware) ? hardware.map(mapHardwareAsset) : []),
    ...(Array.isArray(monitors) ? monitors.map(mapMonitor) : []),
    ...(Array.isArray(tablets) ? tablets.map(mapTablet) : []),
  ];

  return all.filter((a) => a.status === statusFilter);
}

export async function fetchAssetDetails(id, type) {
  let endpoint;

  switch ((type || "").toLowerCase()) {
    case "pcs":
    case "laptops & pcs":
      endpoint = ENDPOINTS.get_computer_by_id(id);
      break;
    case "printers":
      endpoint = ENDPOINTS.get_printer_by_id(id);
      break;
    case "monitors":
      endpoint = ENDPOINTS.get_monitor_by_id(id);
      break;
    case "tablets":
      endpoint = ENDPOINTS.get_tablet_by_id(id);
      break;
    default:
      endpoint = ENDPOINTS.get_hardware_asset_by_id(id);
  }

  const data = await apiGet(endpoint);
  return mapHardwareAsset(data);
}

export async function fetchAssetHistory(serial) {
  const data = await apiGet(ENDPOINTS.history_to_track_assets_by_serial(serial));
  return Array.isArray(data) ? data : data?.results || [];
}

export async function fetchAssignedEmployee(serial) {
  try {
    const data = await apiGet(ENDPOINTS.get_assigned_employee_by_serial(serial));
    return data.employee_name_en || data.employee_name_ar || data.employee_code || null;
  } catch {
    return null;
  }
}

export async function createAsset(form, label) {
  const branchVal = form.branchId || form.branch || null;
  const statusVal = form.status || "In Stock";
  let body;
  let endpoint;

  if (label === "PCs" || form.category === "Laptops & PCs") {
    body = {
      brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
      branch: branchVal, status: statusVal,
      description: form.description || "", delivery_date: form.deliveryDate || null,
      pc_type: form.pcType || "Laptop",
      processor: form.processor || "", memory_ram: form.memoryRam || "", hard_disk: form.hardDisk || "",
      monitor_brand: form.monitorBrand || null, monitor_model: form.monitorModel || null,
      monitor_screen_size_in_inches: form.monitorInches ? Number(form.monitorInches) : null,
      monitor_serial_number: form.monitorSerial || null,
      keyboard_brand: form.keyboardBrand || null, keyboard_model: form.keyboardModel || null,
      keyboard_serial_number: form.keyboardSerial || null,
      mouse_brand: form.mouseBrand || null, mouse_model: form.mouseModel || null,
      mouse_serial_number: form.mouseSerial || null,
      bag_brand: form.bagBrand || null, bag_model_or_description: form.bagModelDescription || null,
    };
    endpoint = ENDPOINTS.post_new_computer;
  } else if (label === "Printers" || form.category === "Printers") {
    body = {
      brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
      branch: branchVal, status: statusVal,
      description: form.description || "", delivery_date: form.deliveryDate || null,
      printer_type: form.printerType || "", printer_color: form.printerColor || "",
      technology: form.technology || "", connection_type: form.connectionType || "",
      multifunctions: !!form.multifunctions,
      cartridge_number: form.cartridgeNumber || "", cartridge_color: form.cartridgeColor || "",
      ink_details: form.inkDetails || "",
      active_connection: form.activeConnection || "",
      mac_address_eth: form.macAddressEth || null, ip_address_eth: form.ipAddressEth || null,
      mac_address_wifi: form.macAddressWifi || null,
    };
    endpoint = ENDPOINTS.post_printer;
  } else if (label === "Monitors" || form.category === "Monitors") {
    body = {
      brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
      branch: branchVal, status: statusVal,
      description: form.description || "", delivery_date: form.deliveryDate || null,
      part_number: form.partNumber || null,
      inches: form.inches || null,
      color: form.devColor || null,
      location_details: form.locationDetails || null,
      is_meeting_room_tv: !!form.isMeetingRoomTv,
      is_curved: !!form.isCurved,
    };
    endpoint = ENDPOINTS.post_new_monitor;
  } else {
    body = {
      brand: form.brand, model_or_pn: form.model, serial_number: form.serial,
      branch: branchVal, status: statusVal, category: form.category || label,
      description: form.description || "", delivery_date: form.deliveryDate || null,
    };
    endpoint = ENDPOINTS.post_new_hardware_asset;
  }

  const created = await apiPost(endpoint, body);
  if (label === "PCs" || form.category === "Laptops & PCs") return mapComputer(created);
  if (label === "Printers" || form.category === "Printers") return mapPrinter(created);
  return mapHardwareAsset(created);
}

export async function updateAsset(asset, form) {
  const isComputer = asset.category === "Laptops & PCs";
  const isPrinter = asset.category === "Printers";
  const body = assetToApiBody(form, isComputer, isPrinter);
  let updated;

  if (isComputer) {
    updated = await apiPatch(ENDPOINTS.update_computer(asset.id), body);
  } else if (isPrinter) {
    updated = await apiPatch(ENDPOINTS.update_printer(asset.id), body);
  } else {
    updated = await apiPatch(ENDPOINTS.update_hardware_asset(asset.id), body);
  }

  return mapHardwareAsset(updated);
}

export async function deleteAsset(id, label) {
  if (label === "PCs") return apiDelete(ENDPOINTS.delete_computer(id));
  if (label === "Printers") return apiDelete(ENDPOINTS.delete_printer(id));
  return apiDelete(ENDPOINTS.delete_hardware_asset(id));
}

export async function returnAssetToStock(asset) {
  const body = { status: "In Stock" };
  if (asset.category === "Laptops & PCs") {
    return apiPatch(ENDPOINTS.update_computer(asset.id), body);
  } else if (asset.category === "Printers") {
    return apiPatch(ENDPOINTS.update_printer(asset.id), body);
  } else {
    return apiPatch(ENDPOINTS.update_hardware_asset(asset.id), body);
  }
}
