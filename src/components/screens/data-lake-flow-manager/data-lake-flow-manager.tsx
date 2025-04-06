import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Code, Database, Search } from "lucide-react";
import {
  fetchFlows,
  fetchTags,
  fetchElementsByTag,
  fetchFilesByDataset,
  fetchScriptsByWorker,
} from "@/lib/api";
import {
  Flow,
  Pipeline,
  PipelineItem,
  Dataset,
  Worker,
  File,
} from "@/lib/types";
import { DatasetItem } from "@/components/screens/data-lake-flow-manager/dataset-item";
import { TransactionItem } from "@/components/screens/data-lake-flow-manager/transaction-item";
import { FlowCreationDialog } from "./dialogs/flow-creation-dialog";
import { PipelineCreationDialog } from "./dialogs/pipeline-creation-dialog";
import { WorkerCreationDialog } from "./dialogs/worker-creation-dialog";
import { DatasetCreationDialog } from "./dialogs/dataset-creation-dialog";

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
type PipelineWithIcons = Omit<Pipeline, "worker"> & {
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

export default function DataLakeFlowManager() {
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);
  const [isDatasetDialogOpen, setIsDatasetDialogOpen] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );

  // Add handler for dataset creation
  // Update the handleDatasetCreated function
  const handleDatasetCreated = async () => {
    try {
      const flowsData = await fetchFlows();
      const flowsWithIcons = flowsData.map((flow) => ({
        ...flow,
        pipelines: flow.pipelines.map((process) => ({
          ...process,
          worker: {
            input: process.worker.input.map((item) => ({
              ...item,
              icon:
                item.type === "dataset" ? (
                  <Database className="text-blue-500" />
                ) : (
                  <Code className="text-green-500" />
                ),
              showFiles: false,
              showScripts: false,
              type: item.type,
            })),
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const handlePipelineCreated = () => {
    fetchFlows()
      .then((flowsData) => {
        const flowsWithIcons = flowsData.map((flow) => ({
          ...flow,
          pipelines: flow.pipelines.map((process) => ({
            ...process,
            worker: {
              input: process.worker.input.map((item) => ({
                ...item,
                icon:
                  item.type === "dataset" ? (
                    <Database className="text-blue-500" />
                  ) : (
                    <Code className="text-green-500" />
                  ),
                showFiles: false,
                showScripts: false,
              })),
              output: process.worker.output.map((item) => ({
                ...item,
                icon: <Database className="text-purple-500" />,
                showFiles: false,
              })),
            },
          })),
        }));
        setFlows(flowsWithIcons);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      });
  };
  const handleWorkerCreated = async () => {
    try {
      const flowsData = await fetchFlows();
      const flowsWithIcons = flowsData.map((flow) => ({
        ...flow,
        pipelines: flow.pipelines.map((process) => ({
          ...process,
          worker: {
            input: process.worker.input.map((item) => ({
              ...item,
              icon:
                item.type === "dataset" ? (
                  <Database className="text-blue-500" />
                ) : (
                  <Code className="text-green-500" />
                ),
              showFiles: false,
              showScripts: false,
              type: item.type,
            })),
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };
  const [flows, setFlows] = useState<FlowWithIcons[]>([]);
  const [tags, setTags] = useState<{ id: string; count?: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const [loadingScripts, setLoadingScripts] = useState<Record<string, boolean>>(
    {}
  );

  // Fetch flows and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
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
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch elements by tag when a tag is selected
  useEffect(() => {
    if (selectedTag) {
      const loadTaggedElements = async () => {
        setIsLoading(true);
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
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
          console.error("Error loading tagged elements:", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadTaggedElements();
    } else {
      // If no tag is selected, reload all flows
      fetchFlows()
        .then((flowsData) => {
          // Add icons to the datasets and workers
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
          setError(
            err instanceof Error ? err.message : "An unknown error occurred"
          );
          console.error("Error reloading flows:", err);
        });
    }
  }, [selectedTag]);

  const SearchButton = ({
    text,
    size = "icon",
    className = "h-4 w-4 p-0 ml-auto",
    iconSize = "h-3 w-3",
    onClick,
  }: {
    text: string;
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    iconSize?: string;
    onClick: (e: React.MouseEvent) => void;
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

  const handleFilterByItem = (item: PipelineItem) => {
    setFilterText(item.name);
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

  const reloadDatasetFiles = async (datasetId: string) => {
    // add dataset files to dataset
    const files = await fetchFilesByDataset(datasetId);
    setFlows((currentFlows) =>
      updateFlowsWithFiles(currentFlows, datasetId, files)
    );
  };

  const updateDatasetFiles = (
    item: PipelineItemWithIcon,
    datasetId: string
  ) => {
    if (item.type === "dataset" && item.id === datasetId) {
      const dataset = item as DatasetWithIcon;
      const newShowFiles = !dataset.showFiles;

      if (newShowFiles && (!dataset.files || dataset.files.length === 0)) {
        setLoadingFiles((prev) => ({ ...prev, [datasetId]: true }));
        fetchFilesByDataset(datasetId)
          .then((files) => {
            setFlows((currentFlows) =>
              updateFlowsWithFiles(currentFlows, datasetId, files)
            );
            setLoadingFiles((prev) => ({ ...prev, [datasetId]: false }));
          })
          .catch((err) => {
            console.error("Error fetching files:", err);
            setLoadingFiles((prev) => ({ ...prev, [datasetId]: false }));
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

  const renderDatasetItem = (item: PipelineItemWithIcon) => {
    if (item.type === "worker") {
      const worker = item as WorkerWithIcon;
      const isLoading = loadingScripts[worker.id] || false;

      return (
        <TransactionItem
          key={worker.id} // Add unique key
          worker={worker}
          isLoading={isLoading}
          onToggleScripts={toggleScriptVisibility}
          onSearch={setFilterText}
        />
      );
    }

    const dataset = item as DatasetWithIcon;
    const isLoading = loadingFiles[dataset.id] || false;

    return (
      <DatasetItem
        key={dataset.id} // Add unique key
        dataset={dataset}
        isLoading={isLoading}
        onToggleFiles={toggleFileVisibility}
        onSearch={setFilterText}
        reloadDatasetFiles={reloadDatasetFiles}
      />
    );
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
      />
      <div className="p-4 space-y-2 max-w-7xl mx-auto">
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
            >
              {flowsInZone.map((flow) => (
                <div
                  key={flow.id}
                  className="mb-2 bg-white p-1 rounded-lg shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <h3 className="text-base font-medium text-gray-800">
                        {flow.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 py-1"
                        onClick={() => handleFilterByFlow(flow)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {flow.pipelines.map((pipeline) => (
                      <PipelineComponent
                        key={pipeline.id}
                        pipeline={pipeline as PipelineWithIcons}
                        isExpanded={selectedPipelineId === pipeline.id}
                        onToggle={() =>
                          setSelectedPipelineId((prev) =>
                            prev === pipeline.id ? null : pipeline.id
                          )
                        }
                        onFilter={() => handleFilter(pipeline.id)}
                        onToggleFiles={toggleFileVisibility}
                        onToggleScripts={toggleScriptVisibility}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </ZoneContainer>
          );
        })}

        {/* Dialog components remain unchanged */}
      </div>
    </div>
  );
}
