import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineWithIcons } from "./data-lake-flow-manager";
import { DatasetComponent } from "./DatasetComponent";
import { WorkerComponent } from "./WorkerComponent";

interface PipelineComponentProps {
  pipeline: PipelineWithIcons;
  isExpanded: boolean;
  onToggle: () => void;
  onFilterByPipeline: (pipeline: PipelineWithIcons) => void;
  onToggleFiles: (datasetId: string) => void;
  onToggleScripts: (workerId: string) => void;
}

export function PipelineComponent({
  pipeline,
  isExpanded,
  onToggle,
  onFilterByPipeline,
  onToggleFiles,
  onToggleScripts
}: PipelineComponentProps) {
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <div className="flex items-center bg-gray-100 px-4 py-2">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <span className="ml-2 font-medium">{pipeline.name}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => onFilterByPipeline(pipeline)}
        >
          Filter
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-600">Inputs</h4>
              {pipeline.worker.input.map((item) =>
                item.type === "dataset" ? (
                  <DatasetComponent
                    key={item.id}
                    dataset={item}
                    onToggleFiles={onToggleFiles}
                  />
                ) : (
                  <WorkerComponent
                    key={item.id}
                    worker={item}
                    onToggleScripts={onToggleScripts}
                  />
                )
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-purple-600">Outputs</h4>
              {pipeline.worker.output.map((item) => (
                <DatasetComponent
                  key={item.id}
                  dataset={item}
                  onToggleFiles={onToggleFiles}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}