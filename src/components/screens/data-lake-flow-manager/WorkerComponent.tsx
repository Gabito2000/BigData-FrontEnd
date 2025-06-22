import { ChevronDown, ChevronRight, Search, FolderCog} from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing WorkerWithIcon import with:
import type { WorkerWithIcon } from "./types";
import { Plus } from "lucide-react";
import { FileCode2 as ScriptIcon } from "lucide-react";
import { TransactionItem } from "./transaction-item";
import { useState } from "react";
import { TransformCreationDialog } from "./dialogs/transform-creation-dialog";

interface WorkerComponentProps {
  worker: WorkerWithIcon;
  onFilter: (text: string) => void;
  onToggleScripts: (workerId: string) => void;
  onSuccess?: () => void; // Renamed from onTransformCreated
}

export function WorkerComponent({
  worker,
  onToggleScripts,
  onFilter,
  onSuccess,
}: WorkerComponentProps) {
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);

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
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsTransformDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
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
        {worker.showScripts && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {worker.scripts && worker.scripts.length > 0 ? (
              worker.scripts.map((script) => (
                <TransactionItem
                  key={script.id}
                  script={script}
                  onSearch={onFilter}
                />
              ))
            ) : (
              <div className="text-xs text-gray-400 italic text-center py-2">
                No transformations found in this worker.
              </div>
            )}
          </div>
        )}
      </div>
      <TransformCreationDialog
        isOpen={isTransformDialogOpen}
        onClose={() => setIsTransformDialogOpen(false)}
        onSuccess={() => {
          setIsTransformDialogOpen(false);
          onSuccess && onSuccess();
        }}
        workerId={worker.id}
      />
    </div>
  );
}