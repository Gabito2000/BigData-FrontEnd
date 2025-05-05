import { Button } from "@/components/ui/button";
// Update the lucide-react import
import { ChevronDown, ChevronRight, File as FileIcon, Search, Code } from "lucide-react";
import { File, Worker } from "@/lib/types";
import { Script } from "vm";

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
}

export function TransactionItem({ worker, isLoading, onToggleScripts, onSearch }: TransactionItemProps) {
  const SearchButton = ({ 
    size = "icon", 
    className = "h-4 w-4 p-0 ml-auto", 
    iconSize = "h-3 w-3",
    onClick 
  }: { 
    text: string; 
    size?: "default" | "sm" | "lg" | "icon"; 
    className?: string;
    iconSize?: string;
    onClick: (e: React.MouseEvent) => void 
  }) => {
    return (
      <Button
        variant="ghost"
        size={size}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
      >
        <Search className={iconSize} />
      </Button>
    );
  };

  return (
    <div key={worker.id} className="flex flex-col w-full">
      <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded border border-gray-200">
        <Code/>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 flex-shrink-0"
          onClick={() => onToggleScripts(worker.id)}
        >
          {worker.showScripts ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        <FileIcon className="h-4 w-4 text-green-500" /> 
        
        
        <span className="text-sm truncate">{worker.name}</span>
        <SearchButton
          text={worker.name}
          size="icon"
          iconSize="h-3 w-3"
          className="h-4 w-4 p-0 ml-auto"
          onClick={() => onSearch(worker.name)}
        />
      </div>
      
      {worker.showScripts && (
        <div className="ml-5 mt-1 space-y-1">
          {isLoading ? (
            <div className="text-xs text-gray-500">Loading scripts...</div>
          ) : worker.scripts && worker.scripts.length > 0 ? (
            worker.scripts.map(script => (
              <div key={script.id} className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-gray-100 text-xs">
                <FileIcon className="h-3 w-3 text-green-500 flex-shrink-0" />
                <a
                  href={`/archivos?file=${encodeURIComponent(script.filePath || script.name || script.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-blue-600 hover:underline font-semibold"
                  onClick={e => e.stopPropagation()}
                >
                  {script.name || script.id}
                </a>
                {script.fileType && (
                  <span className="text-gray-500 text-xs">({script.fileType})</span>
                )}
                <SearchButton 
                  text={script.name || script.id}
                  className="h-3 w-3 p-0 ml-auto"
                  iconSize="h-2 w-2"
                  onClick={() => onSearch(script.name || script.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No scripts</div>
          )}
        </div>
      )}
    </div>
  );
}