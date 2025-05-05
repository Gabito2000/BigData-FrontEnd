import { ChevronDown, ChevronRight, Search, FolderCog} from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing WorkerWithIcon import with:
import type { WorkerWithIcon } from "./types";
import { Plus } from "lucide-react";
import { FileCode2 as ScriptIcon } from "lucide-react";

interface WorkerComponentProps {
  worker: WorkerWithIcon;
  onFilter: (text: string) => void;
  onToggleScripts: (workerId: string) => void;
  onAddTransform?: () => void;
}

export function WorkerComponent({
  worker,
  onToggleScripts,
  onFilter,
  onAddTransform,
}: WorkerComponentProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col border rounded shadow bg-white p-2">
        <div className="flex items-center">
          <FolderCog className="mr-2" />
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
                {worker.scripts?.length || 0} transformations
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            {onAddTransform && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTransform();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
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
        </div>
        {worker.showScripts && worker.scripts && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {worker.scripts.map((script) => (
              <div key={script.id} className="flex items-center p-3 border rounded bg-gray-50">
                <ScriptIcon className="text-green-400 mr-2" />
                <div className="flex flex-col flex-1">
                  <span className="font-semibold">{script.id}</span>
                  {/* Add more script details if available */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}