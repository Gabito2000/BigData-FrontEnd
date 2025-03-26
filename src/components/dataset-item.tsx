import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, File as FileIcon, Search } from "lucide-react";
import { Dataset, File } from "@/lib/api";

type DatasetWithIcon = Dataset & {
    icon: React.ReactNode;
    files?: File[];
    showFiles?: boolean;
  };
  
interface DatasetItemProps {
  dataset: DatasetWithIcon;
  isLoading: boolean;
  onToggleFiles: (datasetId: string) => void;
  onSearch: (text: string) => void;
}

export function DatasetItem({ dataset, isLoading, onToggleFiles, onSearch }: DatasetItemProps) {
  const SearchButton = ({ 
    text, 
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
    <div key={dataset.id} className="flex flex-col w-full">
      <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded border border-gray-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 flex-shrink-0"
          onClick={() => onToggleFiles(dataset.id)}
        >
          {dataset.showFiles ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </Button>
        <div className="flex-shrink-0">{dataset.icon}</div>
        <span className="text-sm truncate">{dataset.name}</span>
        <SearchButton 
          text={dataset.name}
          size="icon"
          iconSize="h-3 w-3"
          className="h-4 w-4 p-0 ml-auto"
          onClick={() => onSearch(dataset.name)}
        />
      </div>
      
      {dataset.showFiles && (
        <div className="ml-5 mt-1 space-y-1">
          {isLoading ? (
            <div className="text-xs text-gray-500">Loading...</div>
          ) : dataset.files && dataset.files.length > 0 ? (
            dataset.files.map(file => (
              <div key={file.id} className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-gray-100 text-xs">
                <FileIcon className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <span className="truncate">{file.name || file.id}</span>
                {file.fileType && (
                  <span className="text-gray-500 text-xs">({file.fileType})</span>
                )}
                <SearchButton 
                  text={file.name || file.id}
                  className="h-3 w-3 p-0 ml-auto"
                  iconSize="h-2 w-2"
                  onClick={() => onSearch(file.name || file.id)}
                />
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No files</div>
          )}
        </div>
      )}
    </div>
  );
}