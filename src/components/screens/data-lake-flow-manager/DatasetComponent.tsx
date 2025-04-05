import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing DatasetWithIcon import with:
import type { DatasetWithIcon } from "./types";

interface DatasetComponentProps {
  dataset: DatasetWithIcon;
  onToggleFiles: (datasetId: string) => void;
}

export function DatasetComponent({
  dataset,
  onToggleFiles
}: DatasetComponentProps) {
  return (
    <div className="flex items-center p-2 border rounded hover:bg-gray-50">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onToggleFiles(dataset.id)}
      >
        {dataset.showFiles ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      <div className="ml-2 flex-1">
        <span className="text-sm font-medium">{dataset.name}</span>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {dataset.files?.length || 0} files
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          // Handle search implementation here
        }}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}