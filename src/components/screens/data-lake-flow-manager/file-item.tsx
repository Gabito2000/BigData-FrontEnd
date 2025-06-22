import { useState } from "react";
import { ChevronDown, ChevronRight, DatabaseIcon, Search, Box, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DatasetWithIcon } from "./types";
import { Plus, Archive } from "lucide-react";
import { FileCreationDialog } from "./dialogs/file-creation-dialog";
import type { File as DataLakeFile } from "@/lib/types";

interface DatasetComponentProps {
  dataset: DatasetWithIcon;
  onFilter: (text: string) => void;
  onToggleFiles: (datasetId: string) => void;
  onFileCreated?: () => void;
  onSendDatasetToSandbox?: (datasetId: string) => void;
  onSendFileToSandbox?: (fileId: string) => void;
  onSendToArchive?: (datasetId: string) => void;
  refreshFlows?: () => void; // Add this prop
}

export function DatasetComponent({
  dataset,
  onToggleFiles,
  onFilter,
  onFileCreated,
  onSendDatasetToSandbox,
  onSendFileToSandbox,
  onSendToArchive,
  refreshFlows,
}: DatasetComponentProps) {
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [showFiles, setShowFiles] = useState(!!dataset.showFiles);

  const handleToggleFiles = () => {
    setShowFiles((prev) => !prev);
    onToggleFiles(dataset.id);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col border rounded shadow bg-white p-2">
        <div className="flex items-center">
          <DatabaseIcon/>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleToggleFiles}
          >
            {showFiles ? (
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
            {onSendToArchive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendToArchive(dataset.id);
                }}
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsFileDialogOpen(true);
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
                onFilter(dataset.name);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {showFiles && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {dataset.files && dataset.files.length > 0 ? (
              (dataset.files as DataLakeFile[]).map((file) => (
                <div key={file.id} className="flex items-center p-3 border rounded bg-gray-50">
                  <FileIcon className="text-blue-400 mr-2" />
                  <div className="flex flex-col flex-1">
                    <a
                      href={`/archivos?file=${encodeURIComponent((file.filePath || file.id) ?? '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-600 hover:underline truncate"
                      title={(file.filePath || file.id) ?? ''}
                    >
                      {(file.filePath || file.id) ?? ''}
                    </a>
                    <span className="text-xs text-gray-500">{file.fileType ?? ''}</span>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFilter((file.filePath || file.id) ?? '');
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 italic text-center py-2">No files found in this dataset.</div>
            )}
          </div>
        )}
      </div>
      <FileCreationDialog
        isOpen={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onFileCreated={() => {
          setIsFileDialogOpen(false);
          refreshFlows && refreshFlows(); // Call global refresh
          onToggleFiles(dataset.id); // Force local re-fetch of files
          onFileCreated && onFileCreated();
        }}
        datasetId={dataset.id}
        datasetZone={dataset.zone || 'landing'}
      />
    </div>
  );
}