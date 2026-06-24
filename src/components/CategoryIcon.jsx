import { Laptop, Monitor, Printer, Network, Mouse, Boxes } from "lucide-react";

export default function CategoryIcon({ category, size = 16 }) {
  const props = { size, strokeWidth: 1.8 };
  switch (category) {
    case "Laptops & PCs":
      return <Laptop {...props} />;
    case "Monitors":
      return <Monitor {...props} />;
    case "Printers":
      return <Printer {...props} />;
    case "Networking":
      return <Network {...props} />;
    case "Peripherals":
      return <Mouse {...props} />;
    default:
      return <Boxes {...props} />;
  }
}
