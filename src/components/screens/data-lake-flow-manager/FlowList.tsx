import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Search } from "lucide-react";
import { PipelineComponent } from "@/components/screens/data-lake-flow-manager/PipelineComponent";
import { Flow } from "@/lib/types";
import { PipelineWithIcons, FlowWithIcons } from "./types";

interface FlowListProps {
  flows: FlowWithIcons[];
  selectedPipelineId: string | null;
  onSendToArchive: (id: string) => void;
  onFilterByFlow: (flow: FlowWithIcons) => void;
  onFilter: (text: string) => void;
  onToggleFiles: (datasetId: string) => void;
  onToggleScripts: (workerId: string) => void;
  setSelectedPipelineId: (id: string | null) => void;
  handleExecutePipeline: (flows: FlowWithIcons[], flowId: string, pipelineId: string) => void;
  flowsData: FlowWithIcons[];
  refreshFlows: () => void; // Add this prop
}

export const FlowList: React.FC<FlowListProps> = ({
  flows,
  selectedPipelineId,
  onSendToArchive,
  onFilterByFlow,
  onFilter,
  onToggleFiles,
  onToggleScripts,
  setSelectedPipelineId,
  handleExecutePipeline,
  flowsData,
  refreshFlows
}) => {
  return (
    <>
      {flows.map((flow) => (
        <div key={flow.id} className="mb-6 last:mb-0">
          <div className="space-y-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between p-3">
              <h3 className="text-lg font-semibold text-gray-800">{flow.name ?? flow.id}</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-200"
                  onClick={() => onSendToArchive(flow.id)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-200"
                  onClick={() => onFilterByFlow(flow)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {flow.pipelines.map((pipeline) => (
              <PipelineComponent
                key={pipeline.id}
                onSendToArchive={() => onSendToArchive(pipeline.id)}
                pipeline={pipeline}
                isExpanded={selectedPipelineId === pipeline.id}
                onToggle={() =>
                  setSelectedPipelineId(selectedPipelineId === pipeline.id ? null : pipeline.id)
                }
                onFilter={onFilter}
                onToggleFiles={onToggleFiles}
                onToggleScripts={onToggleScripts}
                onAddWorker={() => setSelectedPipelineId(pipeline.id)}
                onAddDataset={() => setSelectedPipelineId(pipeline.id)}
                onAddFile={() => setSelectedPipelineId(pipeline.id)}
                onAddTransform={() => setSelectedPipelineId(pipeline.id)}
                onExecutePipeline={() =>
                  handleExecutePipeline(flowsData, flow.id, pipeline.id)
                }
                refreshFlows={refreshFlows} // Pass down
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
};
