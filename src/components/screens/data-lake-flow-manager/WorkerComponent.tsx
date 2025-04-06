import { ChevronDown, ChevronRight, Search, FolderCog} from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing WorkerWithIcon import with:
import type { WorkerWithIcon } from "./types";

interface WorkerComponentProps {
  worker: WorkerWithIcon;
  onFilter: (text: string) => void;
  onToggleScripts: (workerId: string) => void;
}

export function WorkerComponent({
  worker,
  onToggleScripts,
  onFilter,
}: WorkerComponentProps) {
  return (
    <div className="flex items-center p-2 border rounded hover:bg-gray-50">
      <FolderCog />
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onToggleScripts(worker.id)}
      >
        {worker.showScripts ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
      <div className="ml-2 flex-1">
        <span className="text-sm font-medium">{worker.name}</span>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">
            {worker.scripts?.length || 0} scripts
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onFilter(worker.name);
        }}
      >
        <Search className="h-4 w-4" />

      </Button>
    </div>
  );
}