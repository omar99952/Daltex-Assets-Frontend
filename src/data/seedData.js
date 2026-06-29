export const initialEmployees = [
  { id: "88201", name: "Marcus Thorne", nameAr: "مارك ثورن", role: "Senior Product Manager", dept: "Product", location: "London, UK", status: "On Leave", email: "marcus.thorne@daltexhq.com", tenure: "2.1 Years", avatarColor: "#6b7280", branchId: "HQ" },
  { id: "88402", name: "Sarah Jenkins", nameAr: "سارة جنكينز", role: "Director of People Ops", dept: "People Operations", location: "London, UK (HQ)", status: "Active", email: "s.jenkins@daltexhq.com", tenure: "3.4 Years", avatarColor: "#d97706", branchId: "HQ" },
  { id: "88105", name: "Elena Rodriguez", nameAr: "إيلينا رودريغيز", role: "Lead Frontend Engineer", dept: "Engineering", location: "Madrid, ES", status: "Active", email: "elena.rodriguez@daltexhq.com", tenure: "1.8 Years", avatarColor: "#0f172a", branchId: "SD" },
  { id: "88310", name: "Chen Wei", nameAr: "شن وي", role: "Cybersecurity Analyst", dept: "IT", location: "Singapore, SG", status: "Active", email: "chen.wei@daltexhq.com", tenure: "0.9 Years", avatarColor: "#0f172a", branchId: "AP" },
  { id: "88511", name: "Jonathan Wu", nameAr: "جوناثان وو", role: "Chief Financial Officer", dept: "Finance", location: "San Francisco, US", status: "Active", email: "jonathan.wu@daltexhq.com", tenure: "5.2 Years", avatarColor: "#0f172a", branchId: "HQ" },
  { id: "88612", name: "Amina Diallo", nameAr: "أمينا ديالو", role: "Senior UX Designer", dept: "Design", location: "Paris, FR", status: "Offboarded", email: "amina.diallo@daltexhq.com", tenure: "2.6 Years", avatarColor: "#9ca3af", branchId: "HQ" },
  { id: "88713", name: "Robert Grant", nameAr: "روبرت غرانت", role: "General Counsel", dept: "Legal", location: "Toronto, CA", status: "Active", email: "robert.grant@daltexhq.com", tenure: "4.0 Years", avatarColor: "#0f172a", branchId: "HQ" },
  { id: "88820", name: "Liam O'Connell", nameAr: "ليام أوكونيل", role: "Marketing Specialist", dept: "Marketing", location: "Dublin, IE", status: "Active", email: "liam.oconnell@daltexhq.com", tenure: "1.1 Years", avatarColor: "#0f172a", branchId: "WN" },
];

export const initialSectors = [
  { id: "S1", name: "Corporate", branchId: "HQ", departments: ["Finance", "Legal", "People Operations", "Marketing"] },
  { id: "S2", name: "Technology", branchId: "HQ", departments: ["IT", "Engineering", "Product", "Design"] },
  { id: "S3", name: "Field Operations", branchId: "WN", departments: ["Marketing", "Logistics"] },
  { id: "S4", name: "Production", branchId: "SD", departments: ["Engineering", "Manufacturing"] },
  { id: "S5", name: "Port Operations", branchId: "AP", departments: ["IT", "Logistics"] },
  { id: "S6", name: "Regional Ops", branchId: "SM", departments: ["Logistics"] },
  { id: "S7", name: "Storage", branchId: "SH", departments: ["Operations"] },
];


export const initialAssets = [
  {
    id: "AST-99021", brand: "Apple", model: 'MacBook Pro 14" M3', serial: "XG8829-91", status: "Assigned", assignedTo: "88105", branch: "London HQ", category: "Laptops & PCs", condition: "Excellent",
    pcType: "Laptop", processor: "Apple M3 Pro (11-core)", memoryRam: "18 GB", hardDisk: "512 GB SSD",
    deliveryDate: "2023-11-15", description: "Primary development machine",
    monitorBrand: null, monitorModel: null, monitorInches: null, monitorSerial: null,
    keyboardBrand: "Apple", keyboardModel: "Magic Keyboard", keyboardSerial: "C02KG1Y3",
    mouseBrand: "Apple", mouseModel: "Magic Mouse 2", mouseSerial: "C02MP9X1",
    bagBrand: "Incase", bagModelDescription: "13\" ICON Backpack (Black)",
  },
  {
    id: "AST-88210", brand: "Dell", model: "XPS 15 (9530)", serial: "JX-112-QW", status: "In Stock", assignedTo: null, branch: "New York Hub", category: "Laptops & PCs", condition: "Brand New",
    pcType: "Laptop", processor: "Intel Core i7-13700H", memoryRam: "32 GB", hardDisk: "1 TB SSD",
    deliveryDate: "2023-06-10", description: "Standard developer workstation",
    monitorBrand: null, monitorModel: null, monitorInches: null, monitorSerial: null,
    keyboardBrand: null, keyboardModel: null, keyboardSerial: null,
    mouseBrand: "Logitech", mouseModel: "MX Master 3", mouseSerial: "LGT-MX3-0012",
    bagBrand: "Targus", bagModelDescription: "15.6\" Laptop Backpack",
  },
  {
    id: "AST-44109", brand: "Lenovo", model: "ThinkPad X1 Carbon", serial: "LNV-881-TP", status: "Repair", assignedTo: null, branch: "Berlin Office", category: "Laptops & PCs", condition: "Pending Fix",
    pcType: "Laptop", processor: "Intel Core i5-1235U", memoryRam: "16 GB", hardDisk: "512 GB SSD",
    deliveryDate: "2022-09-01", description: "Currently under repair — battery replacement",
    monitorBrand: null, monitorModel: null, monitorInches: null, monitorSerial: null,
    keyboardBrand: null, keyboardModel: null, keyboardSerial: null,
    mouseBrand: null, mouseModel: null, mouseSerial: null,
    bagBrand: "Lenovo", bagModelDescription: "ThinkPad Essential Backpack",
  },
  {
    id: "AST-11002", brand: "Apple", model: 'iMac 21.5" (2017)', serial: "AP-OLD-99", status: "Retired", assignedTo: null, branch: "London HQ", category: "Laptops & PCs", condition: "Retired",
    pcType: "All-in-One", processor: "Intel Core i5-7500", memoryRam: "8 GB", hardDisk: "256 GB SSD",
    deliveryDate: "2017-03-01", description: "Legacy unit — retired from active use",
    monitorBrand: "Apple", monitorModel: "Built-in Retina Display", monitorInches: "21.5", monitorSerial: "AP-MON-9901",
    keyboardBrand: "Apple", keyboardModel: "Magic Keyboard (2017)", keyboardSerial: "C01KA8Z2",
    mouseBrand: "Apple", mouseModel: "Magic Mouse (2017)", mouseSerial: "C01MA7X1",
    bagBrand: null, bagModelDescription: null,
  },
  {
    id: "AST-99443", brand: "Dell", model: "Precision 3581", serial: "DL-PRC-44", status: "Assigned", assignedTo: "88310", branch: "Singapore R&D", category: "Laptops & PCs", condition: "Excellent",
    pcType: "Workstation Laptop", processor: "Intel Core i7-13800H", memoryRam: "64 GB", hardDisk: "2 TB SSD",
    deliveryDate: "2023-08-20", description: "High-performance workstation for security analysis",
    monitorBrand: "Dell", monitorModel: "U2722D", monitorInches: "27", monitorSerial: "DELL-MON-4430",
    keyboardBrand: "Dell", keyboardModel: "KB216", keyboardSerial: "DKBD-0443",
    mouseBrand: "Dell", mouseModel: "MS116", mouseSerial: "DMSE-0443",
    bagBrand: null, bagModelDescription: null,
  },
  {
    id: "AST-14001", brand: "Apple", model: 'MacBook Pro 14"', serial: "C02XL01P0G9", status: "Assigned", assignedTo: "88402", branch: "London HQ", category: "Laptops & PCs", condition: "Premium",
    pcType: "Laptop", processor: "Apple M2 Pro (10-core)", memoryRam: "16 GB", hardDisk: "512 GB SSD",
    deliveryDate: "2023-01-15", description: "Standard HR management machine",
    monitorBrand: null, monitorModel: null, monitorInches: null, monitorSerial: null,
    keyboardBrand: "Apple", keyboardModel: "Magic Keyboard", keyboardSerial: "C02KG2Y1",
    mouseBrand: "Apple", mouseModel: "Magic Mouse 2", mouseSerial: "C02MP8X3",
    bagBrand: "Apple", bagModelDescription: "Leather Sleeve 13\"",
  },
  { id: "AST-77302", brand: "Dell", model: '32" UltraSharp U3223QE', serial: "DELL-882-X90", status: "Assigned", assignedTo: "88402", branch: "London HQ", category: "Monitors", condition: "Standard" },
  { id: "AST-50012", brand: "Cisco", model: "Router X-200", serial: "CS-RX2-0012", status: "In Stock", assignedTo: null, branch: "Khatatba Branch", category: "Networking", condition: "Excellent" },
  { id: "AST-60019", brand: "Apple", model: "iPad Air Gen 5", serial: "IPD-AIR5-09", status: "Repair", assignedTo: null, branch: "Sadat City Farm", category: "Mobile Devices", condition: "Screen Repair" },
  {
    id: "AST-33001", brand: "HP", model: "LaserJet Pro MFP M428fdn", serial: "HP-LJ-003301", status: "In Stock", assignedTo: null, branch: "Daltex Headquarters", category: "Printers", condition: "Brand New",
    multifunctions: true, printerType: "Laser", printerColor: "Black & White",
    connectionType: "Ethernet / USB", technology: "Laser Electrophotographic",
    cartridgeNumber: "CF259A", cartridgeColor: "Black", inkDetails: "Standard yield — approx. 3,000 pages",
    activeConnection: "Ethernet", macAddressEth: "A4:C3:F0:85:3D:22", ipAddressEth: "192.168.1.105", macAddressWifi: null,
    deliveryDate: "2024-02-10", description: "Main office multifunction printer — scan, copy, fax",
  },
];


export const initialBranches = [
  { id: "HQ", name: "Daltex Headquarters", region: "Cairo - Central District", departments: ["IT", "HR", "OPS"], assets: 1240, health: "good" },
  { id: "WN", name: "Wadi El Natrun", region: "Agricultural Hub", departments: ["LOG", "OPS"], assets: 854, health: "good" },
  { id: "SD", name: "Sadat City", region: "Production Plant", departments: ["IT", "LOG"], assets: 612, health: "warning" },
  { id: "AP", name: "Alexandria Port", region: "Logistics Center", departments: ["LOG", "HR"], assets: 433, health: "good" },
  { id: "SM", name: "Samalout", region: "Upper Egypt Hub", departments: ["LOG"], assets: 218, health: "good" },
  { id: "SH", name: "Sharqia", region: "Storage Facility", departments: ["OPS"], assets: 305, health: "good" },
];


export const initialActivity = [
  { id: 1, title: 'MacBook Pro 14"', desc: "Assigned to Ahmed Mansour", sub: "Sadat City Hub", time: "2m ago", type: "assign" },
  { id: 2, title: "Cisco Router X-200", desc: "Returned to stock from Khatatba Branch", sub: "Condition: Excellent", time: "45m ago", type: "return" },
  { id: 3, title: "iPad Air Gen 5", desc: "Moved to Repair Queue", sub: "Ticket #DX-9902: Screen replacement", time: "2h ago", type: "repair" },
  { id: 4, title: "Bulk Audit: Zone B", desc: "Audit completed by S. Khalil", sub: "42 assets verified, 0 discrepancies", time: "5h ago", type: "audit" },
];
