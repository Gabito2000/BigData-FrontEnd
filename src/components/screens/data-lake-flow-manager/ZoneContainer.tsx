import { PipelineWithIcons } from "@/components/screens/data-lake-flow-manager/types";

interface ZoneContainerProps {
  zone: string;
  pipelines: PipelineWithIcons[];
  children: React.ReactNode;
}

export function ZoneContainer({ zone, pipelines, children }: ZoneContainerProps) {
  // Update the zoneColor function
  const zoneColor = (zone: string) => {
    switch (zone.toLowerCase()) {
      case "landing": return "rgba(173, 216, 230, 0.3)";
      case "raw": return "rgba(255, 228, 196, 0.3)";
      case "trusted": return "rgba(255, 182, 193, 0.3)";
      case "refined": return "rgba(144, 238, 144, 0.3)";
      case "sandbox": return "rgba(221, 160, 221, 0.3)";
      case "archival": return "rgba(169, 169, 169, 0.3)";
      default: return "rgba(255, 255, 255, 0.3)";
    }
  };

  return (
    <div 
      className="p-4 rounded-lg mb-4"
      style={{ backgroundColor: zoneColor(zone) }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{zone} Zone</h3>
      </div>
      {children}
    </div>
  );
}