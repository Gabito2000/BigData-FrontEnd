import { ChevronDown, ChevronRight, DatabaseIcon, Search, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing DatasetWithIcon import with:
import type { DatasetWithIcon } from "./types";
import { Plus } from "lucide-react";

interface DatasetComponentProps {
  dataset: DatasetWithIcon;
  onFilter: (text: string) => void;
  onToggleFiles: (datasetId: string) => void;
  onAddFile?: () => void;
  onSendDatasetToSandbox?: (datasetId: string) => void;
  onSendFileToSandbox?: (fileId: string) => void;
}

export function DatasetComponent({
  dataset,
  onToggleFiles,
  onFilter,
  onAddFile,
  onSendDatasetToSandbox,
  onSendFileToSandbox,
}: DatasetComponentProps) {
  return (
    <div className="flex items-center p-2 border rounded hover:bg-gray-50">
      <DatabaseIcon/>
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
      <div className="flex gap-1">
        {onAddFile && (
          <><Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onSendDatasetToSandbox && onSendDatasetToSandbox(dataset.id);
            } }
          >
            <Box className="h-4 w-4" />
          </Button><Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onAddFile();
            } }
          >
              <Plus className="h-4 w-4" />
            </Button></>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onFilter(dataset.name);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}