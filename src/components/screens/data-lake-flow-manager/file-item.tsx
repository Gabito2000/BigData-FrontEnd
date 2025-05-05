import { ChevronDown, ChevronRight, DatabaseIcon, Search, Box, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
// Replace existing DatasetWithIcon import with:
import type { DatasetWithIcon } from "./types";
import { Plus } from "lucide-react";

interface DatasetComponentProps {
  dataset: DatasetWithIcon;
  onFilter: (text: string) => void;
  onToggleFiles: (datasetId: string) => void;
  onAddFile?: (datasetId: string) => void;
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
    <div className="flex flex-col w-full">
      <div className="flex flex-col border rounded shadow bg-white p-2">
        <div className="flex items-center">
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
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendDatasetToSandbox && onSendDatasetToSandbox(dataset.id);
                  }}
                >
                  <Box className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddFile(dataset.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </>
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
        {dataset.showFiles && dataset.files && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {dataset.files.map((file) => (
              <div key={file.id} className="flex items-center p-3 border rounded bg-gray-50">
                <FileIcon className="text-blue-400 mr-2" />
                <div className="flex flex-col flex-1">
                  <a
                    href={`/archivos?file=${encodeURIComponent(file.filePath || file.id)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 hover:underline truncate"
                    title={file.filePath || file.id}
                  >
                    {file.filePath || file.id}
                  </a>
                  <span className="text-xs text-gray-500">{file.fileType}</span>
                </div>
                <div className="flex gap-2">
                  {onSendFileToSandbox && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSendFileToSandbox(file.id)}
                    >
                      Send to Sandbox
                    </Button>
                  )}
                  {/* Add magnifying glass for filtering by file */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFilter(file.filePath || file.id);
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}