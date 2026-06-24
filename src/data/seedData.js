export const initialEmployees = [
  { id: "88201", name: "Marcus Thorne", role: "Senior Product Manager", dept: "Product", location: "London, UK", status: "On Leave", email: "marcus.thorne@daltexhq.com", tenure: "2.1 Years", avatarColor: "#6b7280" },
  { id: "88402", name: "Sarah Jenkins", role: "Director of People Ops", dept: "People Operations", location: "London, UK (HQ)", status: "Active", email: "s.jenkins@daltexhq.com", tenure: "3.4 Years", avatarColor: "#d97706" },
  { id: "88105", name: "Elena Rodriguez", role: "Lead Frontend Engineer", dept: "Engineering", location: "Madrid, ES", status: "Active", email: "elena.rodriguez@daltexhq.com", tenure: "1.8 Years", avatarColor: "#0f172a" },
  { id: "88310", name: "Chen Wei", role: "Cybersecurity Analyst", dept: "IT", location: "Singapore, SG", status: "Active", email: "chen.wei@daltexhq.com", tenure: "0.9 Years", avatarColor: "#0f172a" },
  { id: "88511", name: "Jonathan Wu", role: "Chief Financial Officer", dept: "Finance", location: "San Francisco, US", status: "Active", email: "jonathan.wu@daltexhq.com", tenure: "5.2 Years", avatarColor: "#0f172a" },
  { id: "88612", name: "Amina Diallo", role: "Senior UX Designer", dept: "Design", location: "Paris, FR", status: "Offboarded", email: "amina.diallo@daltexhq.com", tenure: "2.6 Years", avatarColor: "#9ca3af" },
  { id: "88713", name: "Robert Grant", role: "General Counsel", dept: "Legal", location: "Toronto, CA", status: "Active", email: "robert.grant@daltexhq.com", tenure: "4.0 Years", avatarColor: "#0f172a" },
  { id: "88820", name: "Liam O'Connell", role: "Marketing Specialist", dept: "Marketing", location: "Dublin, IE", status: "Active", email: "liam.oconnell@daltexhq.com", tenure: "1.1 Years", avatarColor: "#0f172a" },
];


export const initialAssets = [
  { id: "AST-99021", brand: "Apple", model: 'MacBook Pro 14" M3', serial: "XG8829-91", status: "Assigned", assignedTo: "88105", branch: "London HQ", category: "Laptops & PCs", condition: "Excellent" },
  { id: "AST-88210", brand: "Dell", model: "XPS 15 (9530)", serial: "JX-112-QW", status: "In Stock", assignedTo: null, branch: "New York Hub", category: "Laptops & PCs", condition: "Brand New" },
  { id: "AST-44109", brand: "Lenovo", model: "ThinkPad X1 Carbon", serial: "LNV-881-TP", status: "Repair", assignedTo: null, branch: "Berlin Office", category: "Laptops & PCs", condition: "Pending Fix" },
  { id: "AST-11002", brand: "Apple", model: 'iMac 21.5" (2017)', serial: "AP-OLD-99", status: "Retired", assignedTo: null, branch: "London HQ", category: "Laptops & PCs", condition: "Retired" },
  { id: "AST-99443", brand: "Dell", model: "Precision 3581", serial: "DL-PRC-44", status: "Assigned", assignedTo: "88310", branch: "Singapore R&D", category: "Laptops & PCs", condition: "Excellent" },
  { id: "AST-14001", brand: "Apple", model: 'MacBook Pro 14"', serial: "C02XL01P0G9", status: "Assigned", assignedTo: "88402", branch: "London HQ", category: "Laptops & PCs", condition: "Premium" },
  { id: "AST-77302", brand: "Dell", model: '32" UltraSharp', serial: "DELL-882-X90", status: "Assigned", assignedTo: "88402", branch: "London HQ", category: "Monitors", condition: "Standard" },
  { id: "AST-50012", brand: "Cisco", model: "Router X-200", serial: "CS-RX2-0012", status: "In Stock", assignedTo: null, branch: "Khatatba Branch", category: "Networking", condition: "Excellent" },
  { id: "AST-60019", brand: "Apple", model: "iPad Air Gen 5", serial: "IPD-AIR5-09", status: "Repair", assignedTo: null, branch: "Sadat City Farm", category: "Mobile Devices", condition: "Screen Repair" },
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

