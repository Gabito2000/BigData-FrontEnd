import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, File as FileIcon, Search, Code, Box } from "lucide-react";
import { File, Worker } from "@/lib/types";

type WorkerWithIcon = Worker & { 
    icon: React.ReactNode;
    scripts?: File[];
    showScripts?: boolean;
};

interface TransactionItemProps {
  worker: WorkerWithIcon;
  isLoading: boolean;
  onToggleScripts: (workerId: string) => void;
  onSearch: (text: string) => void;
  onSendScriptToSandbox?: (scriptId: string) => void; // Optional, like file-item
}

interface TransactionItemProps {
  script: File;
  onSearch: (text: string) => void;
  onSendToSandbox?: (scriptId: string) => void;
}

export function TransactionItem({
  script,
  onSearch,
  onSendToSandbox,
}: TransactionItemProps) {
  return (
    <div className="flex items-center p-3 border rounded bg-gray-50">
      <FileIcon className="text-green-400 mr-2" />
      <div className="flex flex-col flex-1">
        <a
          href={`/archivos?file=${encodeURIComponent(script.filePath || script.id)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:underline truncate"
          title={script.filePath || script.id}
        >
          {script.filePath || script.id}
        </a>
        <span className="text-xs text-gray-500">{script.fileType}</span>
      </div>
      <div className="flex gap-2">
        {onSendToSandbox && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendToSandbox(script.id)}
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
            onSearch(script.filePath || script.id);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}