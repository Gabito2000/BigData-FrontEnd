import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineWithIcons } from "@/components/screens/data-lake-flow-manager/types";
import { DatasetComponent } from "@/components/screens/data-lake-flow-manager/file-item";
import { WorkerComponent } from "@/components/screens/data-lake-flow-manager/WorkerComponent";
import { ArrowRight } from "lucide-react";

// Add to imports
import { Loader2 } from "lucide-react";

interface PipelineComponentProps {
  pipeline: PipelineWithIcons;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleFiles: (datasetId: string) => void;
  onToggleScripts: (workerId: string) => void;
  onFilter: (text: string) => void;
  onAddDataset: () => void;
  onAddWorker: () => void;
  onAddTransform: () => void;
  onAddFile: () => void;
  onSendToSandbox: (text: string) => void;
  onExecutePipeline: (pipelineId: string) => void;  // Add this line
  isExecuting?: boolean;
}

export function PipelineComponent({
  pipeline,
  isExpanded,
  onToggle,
  onFilter,
  onToggleFiles,
  onToggleScripts,
  onAddDataset,
  onAddWorker,
  onAddTransform,
  onAddFile,
  onSendToSandbox,
  onExecutePipeline,  // Add this line
  isExecuting,
}: PipelineComponentProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center bg-gray-100 px-4 py-2">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <span className="ml-2 font-medium">{pipeline.name}</span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilter(pipeline.name)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onExecutePipeline(pipeline.id)}
            className="bg-green-600 text-white hover:bg-green-700"
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Executing...
              </>
            ) : (
              'Run Pipeline'
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-blue-600">Inputs</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddDataset}
                    className="text-xs text-blue-600 hover:text-blue-700 h-5 px-2 py-0"
                  >
                    + Add Dataset
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddWorker}
                    className="text-xs text-blue-600 hover:text-blue-700 h-5 px-2 py-0"
                  >
                    + Add Worker
                  </Button>
                </div>
              </div>
              
              {pipeline.worker.input.map((item) =>
                item.type === "dataset" ? (
                  <DatasetComponent
                    key={item.id}
                    dataset={item}
                    onToggleFiles={onToggleFiles}
                    onFilter={onFilter}
                    onAddFile={onAddFile}
                    onSendFileToSandbox={onSendToSandbox}
                  />
                ) : (
                  <WorkerComponent
                    key={item.id}
                    worker={item}
                    onToggleScripts={onToggleScripts}
                    onFilter={onFilter}
                    onAddTransform={onAddTransform}
                  />
                )
              )}
            </div>
            
            <div className="flex items-center justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-purple-600">Outputs</h4>

              {pipeline.worker.output.map((item) =>
                item.type === "dataset" ? (
                  <DatasetComponent
                    key={item.id}
                    dataset={item}
                    onToggleFiles={onToggleFiles}
                    onFilter={onFilter}
                    onSendFileToSandbox={onSendToSandbox}
                  />
                ) : (
                  <span> THIS IS AN ERROR </span>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
