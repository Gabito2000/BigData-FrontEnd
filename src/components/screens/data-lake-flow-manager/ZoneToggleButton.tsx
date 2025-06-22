import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Archive, Box } from "lucide-react";
import React from "react";

interface ZoneToggleButtonProps {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  zoneName: string;
}

export const ZoneToggleButton: React.FC<ZoneToggleButtonProps> = ({ isVisible, setIsVisible, zoneName }) => {
  const icon =
    zoneName === "Archival" ? (
      <Archive className="h-4 w-4" />
    ) : (
      <Box className="h-4 w-4" />
    );

  return (
    <Button
      variant={isVisible ? "default" : "outline"}
      className="flex items-center gap-2 transition-all duration-200"
      onClick={() => setIsVisible(!isVisible)}
    >
      {icon}
      <span>{zoneName} Zone</span>
      {isVisible ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </Button>
  );
};
