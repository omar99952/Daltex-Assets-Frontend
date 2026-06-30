import { apiGet } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import {
  mapComputer,
  mapPrinter,
  mapMonitor,
  mapTablet,
  mapHardwareAsset,
} from "../utils/assetMappers";

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
      return (await apiGet(ENDPOINTS.get_all_hardware_assets)).map(
        mapHardwareAsset
      );
  }
}
export async function fetchAssetDetails(id, type) {
  let endpoint;

  switch (type.toLowerCase()) {
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
  const data = await apiGet(
    ENDPOINTS.history_to_track_assets_by_serial(serial)
  );

  return Array.isArray(data) ? data : data.results || [];
}
export async function fetchAssignedEmployee(serial) {
  try {
    const data = await apiGet(
      ENDPOINTS.get_assigned_employee_by_serial(serial)
    );

    return (
      data.employee_name_en ||
      data.employee_name_ar ||
      data.employee_code ||
      null
    );
  } catch {
    return null;
  }
}