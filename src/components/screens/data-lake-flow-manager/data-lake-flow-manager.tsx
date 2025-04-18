import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Code,
  Database,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Archive,
  Box,
} from "lucide-react";
import {
  fetchFlows,
  fetchTags,
  fetchElementsByTag,
  fetchFilesByDataset,
  fetchScriptsByWorker,
} from "@/lib/api";
import { Flow, Pipeline, Dataset, Worker, File } from "@/lib/types";

// Extended types with icon property
type DatasetWithIcon = Dataset & {
  icon: React.ReactNode;
  files?: File[];
  showFiles?: boolean;
};
type WorkerWithIcon = Worker & {
  icon: React.ReactNode;
  scripts?: File[];
  showScripts?: boolean;
};
type PipelineItemWithIcon = DatasetWithIcon | WorkerWithIcon;

// Extended flow types
// Add to your PipelineWithIcons type:
type PipelineWithIcons = Omit<Pipeline, "worker"> & {
  isExecuting?: boolean;
  worker: {
    input: PipelineItemWithIcon[];
    output: PipelineItemWithIcon[];
  };
};

type FlowWithIcons = Omit<Flow, "pipelines"> & {
  pipelines: PipelineWithIcons[];
};

// Add new imports at the top
import { FlowFilter } from "@/components/screens/data-lake-flow-manager/FlowFilter";
import { ZoneContainer } from "@/components/screens/data-lake-flow-manager/ZoneContainer";
import { PipelineComponent } from "@/components/screens/data-lake-flow-manager/PipelineComponent";
import { WorkerCreationDialog } from "@/components/screens/data-lake-flow-manager/dialogs/worker-creation-dialog";
import { DatasetCreationDialog } from "@/components/screens/data-lake-flow-manager/dialogs/dataset-creation-dialog";
import { FileCreationDialog } from "@/components/screens/data-lake-flow-manager/dialogs/file-creation-dialog";
import { TransformCreationDialog } from "@/components/screens/data-lake-flow-manager/dialogs/transform-creation-dialog";
import { executePipeline } from "@/lib/api"; // Add this import
import { pipeline } from "stream";

export default function DataLakeFlowManager() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);
  const [isDatasetDialogOpen, setIsDatasetDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isTransformDialogOpen, setIsTransformDialogOpen] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState<Record<string, boolean>>(
    {}
  );

  const [flows, setFlows] = useState<FlowWithIcons[]>([]);
  const [tags, setTags] = useState<{ id: string; count?: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  // Add near the other state declarations
  const [isSandboxVisible, setIsSandboxVisible] = useState(true);
  const [isArchivalVisible, setIsArchivalVisible] = useState(false);

  // Add these new state variables for managing selected IDs
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );

  // Fetch flows and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [flowsData, tagsData] = await Promise.all([
          fetchFlows(),
          fetchTags(),
        ]);

        // Enhanced mapping to better represent the data relationships
        const flowsWithIcons = flowsData.map((flow) => ({
          ...flow,
          pipelines: flow.pipelines.map((process) => ({
            ...process,
            worker: {
              input: process.worker.input.map((item) => {
                // Use the type property to determine if it's a dataset or worker
                if (item.type === "dataset") {
                  // This is a dataset input
                  return {
                    ...item,
                    icon: <Database className="text-blue-500" />,
                    showFiles: false,
                    type: "dataset",
                  };
                } else {
                  // This is a worker input
                  return {
                    ...item,
                    icon: <Code className="text-green-500" />,
                    showScripts: false,
                    type: "worker",
                  };
                }
              }),
              output: process.worker.output.map((item) => ({
                ...item,
                icon: <Database className="text-purple-500" />,
                showFiles: false,
                type: "dataset",
              })),
            },
          })),
        }));

        setFlows(flowsWithIcons as FlowWithIcons[]);
        setTags(tagsData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, []);

  // Fetch elements by tag when a tag is selected
  useEffect(() => {
    if (selectedTag) {
      const loadTaggedElements = async () => {
        try {
          const elements = await fetchElementsByTag(selectedTag);

          // If there are flows in the tagged elements, filter the flows
          if (elements.flows.length > 0) {
            const flowIds = new Set(elements.flows.map((flow) => flow.id));
            setFlows((prevFlows) =>
              prevFlows.filter((flow) => flowIds.has(flow.id))
            );
          }

          // If there are pipelines in the tagged elements, filter the pipelines
          if (elements.pipelines.length > 0) {
            const processIds = new Set(
              elements.pipelines.map((process) => process.id)
            );
            setFlows((prevFlows) =>
              prevFlows
                .map((flow) => ({
                  ...flow,
                  pipelines: flow.pipelines.filter((process) =>
                    processIds.has(process.id)
                  ),
                }))
                .filter((flow) => flow.pipelines.length > 0)
            );
          }
        } catch (err) {
          console.error("Error loading tagged elements:", err);
        }
      };

      loadTaggedElements();
    } else {
      fetchFlows()
        .then((flowsData) => {
          const flowsWithIcons = flowsData.map((flow) => ({
            ...flow,
            pipelines: flow.pipelines.map((process) => ({
              ...process,
              worker: {
                input: process.worker.input.map((item) => {
                  // Use the type property to determine if it's a dataset or worker
                  if (item.type === "dataset") {
                    // This is a dataset input
                    return {
                      ...item,
                      icon: <Database className="text-blue-500" />,
                      showFiles: false,
                      type: "dataset",
                    };
                  } else {
                    // This is a worker input
                    return {
                      ...item,
                      icon: <Code className="text-green-500" />,
                      showScripts: false,
                      type: "worker",
                    };
                  }
                }),
                output: process.worker.output.map((item) => ({
                  ...item,
                  icon: <Database className="text-purple-500" />,
                  showFiles: false,
                  type: "dataset",
                })),
              },
            })),
          }));

          setFlows(flowsWithIcons as FlowWithIcons[]);
        })
        .catch((err) => {
          console.error("Error reloading flows:", err);
        });
    }
  }, [selectedTag]);

  const filterFlows = (flows: FlowWithIcons[], filterText: string) => {
    if (!filterText) return flows;
    const searchTerm = filterText.toLowerCase();

    return flows
      .map((flow) => {
        const filteredPipelines = flow.pipelines.filter((process) => {
          // Check process name
          if (process.name.toLowerCase().includes(searchTerm)) {
            return true;
          }

          // Check input and output items
          const hasMatchingItems = [
            ...process.worker.input,
            ...process.worker.output,
          ].some((item) => {
            // Check item name
            if (item.name.toLowerCase().includes(searchTerm)) {
              return true;
            }

            // Check files if it's a dataset
            if (item.type === "dataset") {
              const dataset = item as DatasetWithIcon;
              return dataset.files?.some((file) =>
                (file.name || file.id).toLowerCase().includes(searchTerm)
              );
            }

            // Check scripts if it's a worker
            if (item.type === "worker") {
              const worker = item as WorkerWithIcon;
              return worker.scripts?.some((script) =>
                (script.name || script.id).toLowerCase().includes(searchTerm)
              );
            }

            return false;
          });

          return hasMatchingItems;
        });

        if (
          filteredPipelines.length > 0 ||
          flow.name.toLowerCase().includes(searchTerm)
        ) {
          return {
            ...flow,
            pipelines: filteredPipelines,
          };
        }

        return null;
      })
      .filter((flow): flow is FlowWithIcons => flow !== null);
  };

  const filteredFlows = useMemo(
    () => filterFlows(flows, filterText),
    [flows, filterText]
  );

  const handleFilterByFlow = (flow: Flow) => {
    setFilterText(flow.name);
  };

  const handleFilter = (text: string) => {
    setFilterText(text);
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setFilterText("");
  };

  const toggleFileVisibility = async (datasetId: string) => {
    setFlows((prevFlows) => {
      return prevFlows.map((flow) => ({
        ...flow,
        pipelines: flow.pipelines.map((process) => ({
          ...process,
          worker: {
            input: process.worker.input.map((item) =>
              updateDatasetFiles(item, datasetId)
            ),
            output: process.worker.output.map((item) =>
              updateDatasetFiles(item, datasetId)
            ),
          },
        })),
      }));
    });
  };

  const toggleScriptVisibility = async (workerId: string) => {
    setFlows((prevFlows) => {
      return prevFlows.map((flow) => ({
        ...flow,
        pipelines: flow.pipelines.map((process) => ({
          ...process,
          worker: {
            input: process.worker.input.map((item) =>
              updateWorkerScripts(item, workerId)
            ),
            output: process.worker.output.map((item) =>
              updateWorkerScripts(item, workerId)
            ),
          },
        })),
      }));
    });
  };

  const updateDatasetFiles = (
    item: PipelineItemWithIcon,
    datasetId: string
  ) => {
    if (item.type === "dataset" && item.id === datasetId) {
      const dataset = item as DatasetWithIcon;
      const newShowFiles = !dataset.showFiles;

      if (newShowFiles && (!dataset.files || dataset.files.length === 0)) {
        fetchFilesByDataset(datasetId)
          .then((files) => {
            setFlows((currentFlows) =>
              updateFlowsWithFiles(currentFlows, datasetId, files)
            );
          })
          .catch((err) => {
            console.error("Error fetching files:", err);
          });
      }

      return {
        ...item,
        showFiles: newShowFiles,
      };
    }
    return item;
  };

  const updateWorkerScripts = (
    item: PipelineItemWithIcon,
    workerId: string
  ) => {
    if (item.type === "worker" && item.id === workerId) {
      const worker = item as WorkerWithIcon;
      const newShowScripts = !worker.showScripts;

      if (newShowScripts && (!worker.scripts || worker.scripts.length === 0)) {
        setLoadingScripts((prev) => ({ ...prev, [workerId]: true }));
        fetchScriptsByWorker(workerId)
          .then((scripts) => {
            setFlows((currentFlows) =>
              updateFlowsWithScripts(currentFlows, workerId, scripts)
            );
            setLoadingScripts((prev) => ({ ...prev, [workerId]: false }));
          })
          .catch((err) => {
            console.error("Error fetching scripts:", err);
            setLoadingScripts((prev) => ({ ...prev, [workerId]: false }));
          });
      }

      return {
        ...item,
        showScripts: newShowScripts,
      };
    }
    return item;
  };

  const updateFlowsWithFiles = (
    flows: FlowWithIcons[],
    datasetId: string,
    files: File[]
  ) => {
    return flows.map((flow) => ({
      ...flow,
      pipelines: flow.pipelines.map((process) => ({
        ...process,
        worker: {
          input: process.worker.input.map((item) =>
            item.type === "dataset" && item.id === datasetId
              ? { ...item, files, showFiles: true }
              : item
          ),
          output: process.worker.output.map((item) =>
            item.type === "dataset" && item.id === datasetId
              ? { ...item, files, showFiles: true }
              : item
          ),
        },
      })),
    }));
  };

  const updateFlowsWithScripts = (
    flows: FlowWithIcons[],
    workerId: string,
    scripts: File[]
  ) => {
    return flows.map((flow) => ({
      ...flow,
      pipelines: flow.pipelines.map((process) => ({
        ...process,
        worker: {
          input: process.worker.input.map((item) =>
            item.type === "worker" && item.id === workerId
              ? { ...item, scripts, showScripts: true }
              : item
          ),
          output: process.worker.output.map((item) =>
            item.type === "worker" && item.id === workerId
              ? { ...item, scripts, showScripts: true }
              : item
          ),
        },
      })),
    }));
  };

  // Fix the refreshFlowsWithIcons function
  const refreshFlowsWithIcons = (flowsData: Flow[]) => {
    return flowsData.map((flow) => ({
      ...flow,
      pipelines: flow.pipelines.map((process) => ({
        ...process,
        worker: {
          input: process.worker.input.map((item) => {
            if (item.type === "dataset") {
              return {
                ...item,
                icon: <Database className="text-blue-500" />,
                showFiles: false,
                type: "dataset",
              };
            } else {
              return {
                ...item,
                icon: <Code className="text-green-500" />,
                showScripts: false,
                type: "worker",
              };
            }
          }),
          output: process.worker.output.map((item) => ({
            ...item,
            icon: <Database className="text-purple-500" />,
            showFiles: false,
            type: "dataset",
          })),
        },
      })),
    }));
  };

  // Fix handler functions
  const handleWorkerCreated = () => {
    fetchFlows().then((flowsData) => {
      const flowsWithIcons = refreshFlowsWithIcons(flowsData);
      setFlows(flowsWithIcons as FlowWithIcons[]);
    });
  };

  const handleDatasetCreated = () => {
    fetchFlows().then((flowsData) => {
      const flowsWithIcons = refreshFlowsWithIcons(flowsData);
      setFlows(flowsWithIcons as FlowWithIcons[]);
    });
  };

  const handleFileCreated = () => {
    fetchFlows().then((flowsData) => {
      const flowsWithIcons = refreshFlowsWithIcons(flowsData);
      setFlows(flowsWithIcons as FlowWithIcons[]);
    });
  };

  const handleTransformCreated = () => {
    fetchFlows().then((flowsData) => {
      const flowsWithIcons = refreshFlowsWithIcons(flowsData);
      setFlows(flowsWithIcons as FlowWithIcons[]);
    });
  };

  // Function to render the Zone Toggle Button
  const ZoneToggleButton = ({
    isVisible,
    setIsVisible,
    zoneName,
  }: {
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    zoneName: string;
  }) => {
    const icon =
      zoneName === "Archival" ? (
        <Archive className="h-4 w-4" />
      ) : (
        <Box className="h-4 w-4" />
      );

    return (
      <Button
        variant={isVisible ? "default" : "outline"}
        className="flex items-center gap-2 transition-all duration-200"
        onClick={() => setIsVisible(!isVisible)}
      >
        {icon}
        <span>{zoneName} Zone</span>
        {isVisible ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    );
  };

  const handleExecutePipeline = async (
    flows: Flow[],
    flowId: string,
    pipelineId: string
  ) => {
    console.log("Executing pipeline:", pipelineId);
    try {
      const flow = flows.find((f) => f.id === flowId);
      if (!flow) return;

      const zonesInOrder = ["landing", "raw", "trusted", "refined"];
      const lastZone = flow.pipelines.find((p) => p.id === pipelineId)?.zone;
      if (!lastZone) return;

      console.log("Last zone:", lastZone);
      
      const zonesToExecute = zonesInOrder.slice(
        0,
        zonesInOrder.indexOf(lastZone) + 1
      );

      console.log("Zones to execute:", zonesToExecute);

      const pipelinesInZone = flow.pipelines.filter((p) =>
        zonesToExecute.includes(p.zone)
      );

      for (const pipeline of pipelinesInZone) {
        console.log("Executing pipeline:", pipeline.id);
      }

      await setFlows((prevFlows) => 
        prevFlows.map((f) => ({
          ...f,
          pipelines: f.pipelines.map((p) => ({
            ...p,
            isExecuting: pipelinesInZone.some(pip => pip.id === p.id)
          }))
        }))
      )

      // Execute pipelines in sequence
      while (pipelinesInZone.length >= 0) {
        //TODO CHANGE TO REAL CODE NOT A MOCK
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const pipeline = pipelinesInZone.pop();
        if (!pipeline) break;
        await setFlows((prevFlows) => 
          prevFlows.map((f) => ({
            ...f,
            pipelines: f.pipelines.map((p) => ({
              ...p,
              isExecuting: f.id === flowId && p.id !== pipeline.id && pipelinesInZone.some(pip => pip.id === p.id)
            }))
          }))
        );
      }
    } catch (error) {
      console.error("Error executing pipeline:", error);
      // Reset executing state on error
      setFlows((prevFlows) => 
        prevFlows.map((f) => ({
          ...f,
          pipelines: f.pipelines.map((p) => ({
            ...p,
            isExecuting: false
          }))
        }))
      );
    }
  };
  return (
    <div className="relative min-h-screen bg-gray-50">
      <FlowFilter
        tags={tags}
        selectedTag={selectedTag}
        filterText={filterText}
        onFilterChange={setFilterText}
        onTagSelect={setSelectedTag}
        onClearFilters={clearFilters}
        className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-4"
      />

      {/* Active filters indication */}
      {(selectedTag || filterText) && (
        <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700">Active filters:</span>
          {selectedTag && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              Tag: {selectedTag}
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-1 hover:bg-blue-200 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterText && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              Search: {filterText}
              <button
                onClick={() => setFilterText("")}
                className="ml-1 hover:bg-blue-200 rounded-full p-1"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <div className="p-6 mx-auto">
        {/* Zone toggle buttons - improved layout */}
        <div className="flex gap-4 mb-6">
          <ZoneToggleButton
            isVisible={isArchivalVisible}
            setIsVisible={setIsArchivalVisible}
            zoneName="Archival"
          />
          <ZoneToggleButton
            isVisible={isSandboxVisible}
            setIsVisible={setIsSandboxVisible}
            zoneName="Sandbox"
          />
        </div>

        <div className="flex gap-6">
          {/* Left sidebar - Archival Zone */}
          {isArchivalVisible && (
            <div className="w-1/4 min-w-[250px] flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <ZoneContainer
                  zone="Archival"
                  pipelines={[]}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className={`w-full`}>
            {["Landing", "Raw", "Trusted", "Refined"].map((zone) => {
              const flowsInZone = filteredFlows
                .map((flow) => ({
                  ...flow,
                  pipelines: flow.pipelines.filter(
                    (p) => p.zone.toLowerCase() === zone.toLowerCase()
                  ),
                }))
                .filter((flow) => flow.pipelines.length > 0);

              if (flowsInZone.length === 0) return null;

              return (
                <ZoneContainer
                  key={zone}
                  zone={zone}
                  pipelines={flowsInZone.flatMap((f) => f.pipelines)}
                  className="bg-white rounded-lg shadow p-4"
                >
                  {flowsInZone.map((flow) => (
                    <div key={flow.id} className="mb-6 last:mb-0">
                      <div className="space-y-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-between p-3">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {flow.name}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-200"
                              onClick={() => sendFlowToArchival(flow)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-gray-200"
                              onClick={() => handleFilterByFlow(flow)}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {flow.pipelines.map((pipeline) => (
                          <PipelineComponent
                            style={{
                              marginLeft: "10px",
                            }}
                            key={pipeline.id}
                            isExecuting={(pipeline as any)?.isExecuting || false}
                            pipeline={pipeline as PipelineWithIcons}
                            isExpanded={selectedPipelineId === pipeline.id}
                            onToggle={() =>
                              setSelectedPipelineId((prev) =>
                                prev === pipeline.id ? null : pipeline.id
                              )
                            }
                            onFilter={handleFilter}
                            onToggleFiles={toggleFileVisibility}
                            onToggleScripts={toggleScriptVisibility}
                            onAddWorker={() => {
                              setSelectedPipelineId(pipeline.id);
                              setIsWorkerDialogOpen(true);
                            }}
                            onAddDataset={() => {
                              setSelectedPipelineId(pipeline.id);
                              setIsDatasetDialogOpen(true);
                            }}
                            onAddFile={() => {
                              setSelectedPipelineId(pipeline.id);
                              setIsFileDialogOpen(true);
                            }}
                            onAddTransform={() => {
                              setSelectedPipelineId(pipeline.id);
                              setIsTransformDialogOpen(true);
                            }}
                            onExecutePipeline={() =>
                              handleExecutePipeline(flows, flow.id, pipeline.id)
                            }
                            className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm hover:shadow"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </ZoneContainer>
              );
            })}
          </div>

          {/* Right sidebar - Sandbox Zone */}
          {isSandboxVisible && (
            <div className="w-1/4 min-w-[250px] flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-4 h-full">
                <ZoneContainer
                  zone="Sandbox"
                  pipelines={[]}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <WorkerCreationDialog
        isOpen={isWorkerDialogOpen}
        onClose={() => setIsWorkerDialogOpen(false)}
        onWorkerCreated={handleWorkerCreated}
        pipelineId={selectedPipelineId || ""}
      />

      <DatasetCreationDialog
        isOpen={isDatasetDialogOpen}
        onClose={() => setIsDatasetDialogOpen(false)}
        onDatasetCreated={handleDatasetCreated}
        pipelineId={selectedPipelineId || ""}
      />

      <FileCreationDialog
        isOpen={isFileDialogOpen}
        onClose={() => setIsFileDialogOpen(false)}
        onFileCreated={handleFileCreated}
        datasetId={selectedDatasetId || ""}
      />

      <TransformCreationDialog
        isOpen={isTransformDialogOpen}
        onClose={() => setIsTransformDialogOpen(false)}
        onTransformCreated={handleTransformCreated}
        workerId={selectedPipelineId || ""}
      />
    </div>
  );
}
