import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineWithIcons } from "@/components/screens/data-lake-flow-manager/types";
import { DatasetComponent } from "@/components/screens/data-lake-flow-manager/file-item";
import { WorkerComponent } from "@/components/screens/data-lake-flow-manager/WorkerComponent";
import { ArrowRight } from "lucide-react";
import { Loader2 } from "lucide-react";
import { fetchDatasetsAndWorkersByPipeline, fetchFilesByDataset, fetchScriptsByWorker } from "@/lib/api";
import { useEffect, useState } from "react";
import { WorkerCreationDialog } from "./dialogs/worker-creation-dialog";
import { DatasetCreationDialog } from "./dialogs/dataset-creation-dialog";

interface PipelineComponentProps {
  pipeline: PipelineWithIcons;
  isExpanded: boolean;
  onToggle: () => void;
  onToggleFiles: (datasetId: string) => void;
  onToggleScripts: (workerId: string) => void;
  onFilter: (text: string) => void;
  onAddDataset: () => void;
  onAddWorker: () => void;
  onSendToSandbox: (text: string) => void;
  onExecutePipeline: (pipelineId: string) => void;
  isExecuting?: boolean;
  onSendToArchive: (elementId: string) => void;
  refreshFlows: () => void; // Add this prop
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
  onSendToSandbox,
  onExecutePipeline,
  isExecuting,
  onSendToArchive,
  refreshFlows, // Add this prop
}: PipelineComponentProps & {
  onDatasetCreated?: () => void;
  onWorkerCreated?: () => void;
}) {
  const [datasetsWorkers, setDatasetsWorkers] = useState<{
    datasets: any[];
    workers: any[];
  } | null>(null);
  const [isDatasetDialogOpen, setIsDatasetDialogOpen] = useState(false);
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  // Function to fetch and update all datasets and workers (with scripts)
  const fetchAll = async () => {
    const base = await fetchDatasetsAndWorkersByPipeline(pipeline.id);
    const datasets = await Promise.all(
      base.datasets.map(async (item: any) => {
        const files = await fetchFilesByDataset(item.id);
        return { ...item, files };
      })
    );
    const workers = await Promise.all(
      base.workers.map(async (item: any) => {
        const scripts = await fetchScriptsByWorker(item.id);
        return { ...item, scripts };
      })
    );
    // Enrich pipeline.worker.input/output with files
    const enrichWithFiles = (arr: any[]) =>
      arr.map((item) => {
        if (item.type === 'dataset') {
          const found = datasets.find((d) => d.id === item.id);
          return found ? { ...item, ...found } : item;
        }
        return item;
      });
    if (base.worker) {
      base.worker.input = enrichWithFiles(base.worker.input || []);
      base.worker.output = enrichWithFiles(base.worker.output || []);
    }
    setDatasetsWorkers({ datasets, workers });
  };

  useEffect(() => {
    if (isExpanded && !datasetsWorkers) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, pipeline.id]);

  // Handler to refresh after creation
  const handleRefresh = () => {
    setDatasetsWorkers(null); // Force re-fetch and re-render
    fetchAll();
  };

  // Handler to toggle showScripts for a worker
  const handleToggleScripts = (workerId: string) => {
    setDatasetsWorkers((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        workers: prev.workers.map((w) =>
          w.id === workerId ? { ...w, showScripts: !w.showScripts } : w
        ),
      };
    });
  };

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
            variant="default"
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
              "Run Pipeline"
            )}
          </Button>
        </div>
      </div>

      {isExpanded && !datasetsWorkers && (
        <div className="p-4 bg-white flex items-center justify-center min-h-[100px]">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-500" />
          <span className="text-blue-600">Loading pipeline data...</span>
        </div>
      )}
      {isExpanded && datasetsWorkers && (
        <div className="p-4 bg-white">
          <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-blue-600">Inputs</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedPipelineId(pipeline.id); setIsDatasetDialogOpen(true); }}
                    className="text-xs text-blue-600 hover:text-blue-700 h-5 px-2 py-0"
                  >
                    + Add Dataset
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedPipelineId(pipeline.id); setIsWorkerDialogOpen(true); }}
                    className="text-xs text-blue-600 hover:text-blue-700 h-5 px-2 py-0"
                  >
                    + Add Worker
                  </Button>
                </div>
              </div>

              {/* Render both datasets and workers in the input section, always showing names and inner elements */}
              {pipeline.worker.input.map((item) => {
                if (item.type === 'dataset') {
                  const enriched = datasetsWorkers.datasets.find((d) => d.id === item.id);
                  const merged = { ...(enriched || {}), ...item };
                  return (
                    <DatasetComponent
                      key={merged.id}
                      dataset={merged}
                      onToggleFiles={onToggleFiles}
                      onFilter={onFilter}
                      onSendFileToSandbox={onSendToSandbox}
                      onSendToArchive={() => onSendToArchive(merged.id)}
                      refreshFlows={refreshFlows}
                      onFileCreated={async () => {
                        refreshFlows();
                        setDatasetsWorkers(null);
                        await fetchAll(); // Await fetch to ensure state updates and spinner stops
                      }}
                    />
                  );
                } else if (item.type === 'worker') {
                  // Find the enriched worker and also check if showScripts is set in the merged object
                  const enriched = datasetsWorkers.workers.find((w) => w.id === item.id);
                  // If showScripts is set in enriched, use it; otherwise, fallback to item
                  const showScripts = enriched && typeof enriched.showScripts !== 'undefined' ? enriched.showScripts : item.showScripts;
                  const merged = { ...(enriched || {}), ...item, showScripts };
                  return (
                    <WorkerComponent
                      key={merged.id}
                      worker={merged}
                      onToggleScripts={handleToggleScripts}
                      onFilter={onFilter}
                      onSuccess={async () => {
                        refreshFlows();
                        setDatasetsWorkers(null);
                        await fetchAll(); // Await fetch to ensure state updates and spinner stops
                      }}
                    />
                  );
                }
                return null;
              })}
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
                    refreshFlows={refreshFlows}
                    onFileCreated={async () => {
                      refreshFlows();
                      setDatasetsWorkers(null);
                      await fetchAll(); // Await fetch to ensure state updates and spinner stops
                    }}
                  />
                ) : (
                  <span> THIS IS AN ERROR </span>
                )
              )}
            </div>
          </div>
        </div>
      )}
      <WorkerCreationDialog
        isOpen={isWorkerDialogOpen}
        onClose={() => setIsWorkerDialogOpen(false)}
        onSuccess={refreshFlows} // Use global refresh
        pipelineId={pipeline.id}
      />
      <DatasetCreationDialog
        isOpen={isDatasetDialogOpen}
        onClose={() => setIsDatasetDialogOpen(false)}
        onSuccess={refreshFlows} // Use global refresh
        pipelineId={pipeline.id}
      />
    </div>
  );
}
