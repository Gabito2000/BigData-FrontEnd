import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Code,
  Database,
  Globe,
  Link as LinkIcon,
  Search,
  Tag as TagIcon,
  X,
  File as FileIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  fetchFlows,
  fetchTags,
  fetchElementsByTag,
  fetchFilesByDataset,
  fetchScriptsByWorker,
  Flow,
  Process,
  ProcessItem,
  Dataset,
  Worker,
  File,
} from "@/lib/api";
import { DatasetItem } from "@/components/dataset-item";
import { TransactionItem } from "@/components/transaction-item";
import { FlowCreationDialog } from "./flow-creation-dialog";
import { ProcessCreationDialog } from "./process-creation-dialog";
import { DatasetCreationDialog } from "./dataset-creation-dialog";
import { WorkerCreationDialog } from "./worker-creation-dialog";

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
type ProcessItemWithIcon = DatasetWithIcon | WorkerWithIcon;

// Extended flow types
type ProcessWithIcons = Omit<Process, "worker"> & {
  worker: {
    input: ProcessItemWithIcon[];
    output: ProcessItemWithIcon[];
  };
};

type FlowWithIcons = Omit<Flow, "processes"> & {
  processes: ProcessWithIcons[];
};

export default function DataLakeFlowManager() {
  const [isWorkerDialogOpen, setIsWorkerDialogOpen] = useState(false);
  const [isDatasetDialogOpen, setIsDatasetDialogOpen] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(
    null
  );

  // Add handler for dataset creation
  // Update the handleDatasetCreated function
  const handleDatasetCreated = async () => {
    try {
      const flowsData = await fetchFlows();
      const flowsWithIcons = flowsData.map(flow => ({
        ...flow,
        processes: flow.processes.map(process => ({
          ...process,
          worker: {
            input: process.worker.input
              .map(item => ({
                ...item,
                icon: item.type === 'dataset' 
                  ? <Database className="text-blue-500" />
                  : <Code className="text-green-500" />,
                showFiles: false,
                showScripts: false,
                type: item.type
              })),
            output: process.worker.output
              .map(item => ({
                ...item,
                icon: <Database className="text-purple-500" />,
                showFiles: false,
                type: 'dataset'
              }))
          }
        }))
      }));
      setFlows(flowsWithIcons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);

  const handleProcessCreated = () => {
    fetchFlows()
      .then((flowsData) => {
        const flowsWithIcons = flowsData.map((flow) => ({
          ...flow,
          processes: flow.processes.map((process) => ({
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
      const flowsWithIcons = flowsData.map(flow => ({
        ...flow,
        processes: flow.processes.map(process => ({
          ...process,
          worker: {
            input: process.worker.input
              .map(item => ({
                ...item,
                icon: item.type === 'dataset' 
                  ? <Database className="text-blue-500" />
                  : <Code className="text-green-500" />,
                showFiles: false,
                showScripts: false,
                type: item.type
              })),
            output: process.worker.output
              .map(item => ({
                ...item,
                icon: <Database className="text-purple-500" />,
                showFiles: false,
                type: 'dataset'
              }))
          }
        }))
      }));
      setFlows(flowsWithIcons);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
          processes: flow.processes.map((process) => ({
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

          // If there are processes in the tagged elements, filter the processes
          if (elements.processes.length > 0) {
            const processIds = new Set(
              elements.processes.map((process) => process.id)
            );
            setFlows((prevFlows) =>
              prevFlows
                .map((flow) => ({
                  ...flow,
                  processes: flow.processes.filter((process) =>
                    processIds.has(process.id)
                  ),
                }))
                .filter((flow) => flow.processes.length > 0)
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
            processes: flow.processes.map((process) => ({
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

  useEffect(() => {
    validateFlows();
  }, [flows]);

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

  const validateFlows = () => {
    // No validation needed for sourceUrl as it's now optional
    // You can add other validations here if needed in the future
    // Uncomment the code below if you want to keep track of datasets without sourceUrl
    // flows.forEach((flow) => {
    //   flow.processes.forEach((process) => {
    //     process.worker.input.forEach((item) => {
    //       if (item.type === 'dataset' && !('sourceUrl' in item)) {
    //         console.info(`Dataset "${item.name}" in ${process.zone} zone has no sourceUrl.`);
    //       }
    //     });
    //   });
    // });
  };

  const getZoneColor = (zone: Process["zone"]) => {
    switch (zone) {
      case "Landing":
        return "rgba(173, 216, 230, 0.3)";
      case "Raw":
        return "rgba(255, 228, 196, 0.3)";
      case "Trusted":
        return "rgba(255, 182, 193, 0.3)";
      case "Refined":
        return "rgba(144, 238, 144, 0.3)";
      default:
        return "rgba(255, 255, 255, 0.3)";
    }
  };

  const filterFlows = (flows: FlowWithIcons[], filterText: string) => {
    if (!filterText) return flows;

    return flows
      .map((flow) => {
        const filteredProcesses = flow.processes
          .filter((process) => {
            // Check if any files in input or output datasets match the filter
            const hasMatchingFiles = [
              ...process.worker.input,
              ...process.worker.output,
            ].some((item) => {
              if (item.type === "dataset" && (item as DatasetWithIcon).files) {
                return (item as DatasetWithIcon).files?.some((file) =>
                  (file.name || file.id)
                    .toLowerCase()
                    .includes(filterText.toLowerCase())
                );
              }
              return false;
            });

            if (hasMatchingFiles) {
              return true;
            }

            const filteredItems = [
              ...process.worker.input,
              ...process.worker.output,
            ].filter((item) =>
              item.name.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filteredItems.length > 0) {
              return {
                ...process,
                worker: {
                  input: process.worker.input.filter((item) =>
                    item.name.toLowerCase().includes(filterText.toLowerCase())
                  ),
                  output: process.worker.output.filter((item) =>
                    item.name.toLowerCase().includes(filterText.toLowerCase())
                  ),
                },
              };
            }

            return process.name.toLowerCase().includes(filterText.toLowerCase())
              ? process
              : null;
          })
          .filter((process): process is ProcessWithIcons => process !== null);

        if (filteredProcesses.length > 0) {
          return {
            ...flow,
            processes: filteredProcesses,
          };
        }

        return flow.name.toLowerCase().includes(filterText.toLowerCase())
          ? flow
          : null;
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

  const handleFilterByProcess = (process: Process) => {
    setFilterText(process.name);
  };

  const handleFilterByItem = (item: ProcessItem) => {
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
        processes: flow.processes.map((process) => ({
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
        processes: flow.processes.map((process) => ({
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

  const updateDatasetFiles = (item: ProcessItemWithIcon, datasetId: string) => {
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

  const updateWorkerScripts = (item: ProcessItemWithIcon, workerId: string) => {
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
      processes: flow.processes.map((process) => ({
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
      processes: flow.processes.map((process) => ({
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

  const renderDatasetItem = (item: ProcessItemWithIcon) => {
    if (item.type === "worker") {
      // This is a worker
      const worker = item as WorkerWithIcon;
      const isLoading = loadingScripts[worker.id] || false;

      return (
        <TransactionItem
          worker={worker}
          isLoading={isLoading}
          onToggleScripts={toggleScriptVisibility}
          onSearch={setFilterText}
        />
      );
    }

    // This is a dataset
    const dataset = item as DatasetWithIcon;
    const isLoading = loadingFiles[dataset.id] || false;

    return (
      <DatasetItem
        dataset={dataset}
        isLoading={isLoading}
        onToggleFiles={toggleFileVisibility}
        onSearch={setFilterText}
      />
    );
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Data Lake Flow Manager</h1>

      {/* Add search input */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search flows, processes, datasets..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="flex-1 outline-none border-none bg-transparent"
        />
        {filterText && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
// Remove setSearchQuery since it's not defined and not needed
              setFilterText("");
            }}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Add FlowCreationDialog */}
      <FlowCreationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onFlowCreated={() => {
          // Refresh flows after creation
          fetchFlows().then((flowsData) => {
            const flowsWithIcons = flowsData.map((flow) => ({
              ...flow,
              processes: flow.processes.map((process) => ({
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
          });
        }}
      />

      {filteredFlows.length === 0 && (
        <div className="border rounded-lg p-8 text-center bg-white shadow-sm">
          <p className="text-gray-500 mb-4">
            No flows match the current filters
          </p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
      <ProcessCreationDialog
        isOpen={isProcessDialogOpen}
        onClose={() => setIsProcessDialogOpen(false)}
        onProcessCreated={handleProcessCreated}
        flowId={selectedFlowId || ""}
      />
      <DatasetCreationDialog
        isOpen={isDatasetDialogOpen}
        onClose={() => setIsDatasetDialogOpen(false)}
        onDatasetCreated={handleDatasetCreated}
        processId={selectedProcessId || ""}
      />
      <WorkerCreationDialog
        isOpen={isWorkerDialogOpen}
        onClose={() => setIsWorkerDialogOpen(false)}
        onWorkerCreated={handleWorkerCreated}
        processId={selectedProcessId || ""}
      />
      {["Landing", "Raw", "Trusted", "Refined"].map((zone) => {
        const hasProcessesInZone = filteredFlows.some((flow) =>
          flow.processes.some((process) => process.zone === zone)
        );

        if (!hasProcessesInZone) return null;

        return (
          <div
            key={zone}
            className="border rounded-lg p-4 bg-white shadow-sm mb-4"
            style={{ backgroundColor: getZoneColor(zone as Process["zone"]) }}
          >
            <div className="flex justify-between items-center mb-3 pb-2 border-b">
              <h2 className="text-xl font-semibold">{zone}</h2>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {filteredFlows.map(
                (flow) =>
                  flow.processes.some((process) => process.zone === zone) && (
                    <div
                      key={flow.id}
                      className="border rounded-lg p-4 bg-white shadow-sm mb-4"
                    >
                      
                      <div key={flow.id} className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-700">
                            {flow.name}
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setSelectedFlowId(flow.id);
                                setIsProcessDialogOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            
                          <SearchButton
                            text={flow.name}
                            size="icon"
                            iconSize="h-4 w-4"
                            onClick={() => handleFilterByFlow(flow)}
                          />
                          </div>
                        </div>
                        {flow.processes
                          .filter((process) => process.zone === zone)
                          .map((process) => (
                            <div
                              key={process.id}
                              className="border rounded-lg p-3 mb-2 bg-white shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                                <h4 className="font-medium text-sm">
                                  {process.name}
                                </h4>
                                <div className="flex gap-2">
                                  
                                  <SearchButton
                                    text={process.name}
                                    size="icon"
                                    iconSize="h-4 w-4"
                                    onClick={() =>
                                      handleFilterByProcess(process)
                                    }
                                  />
                                </div>
                              </div>

                              <div className="flex flex-row items-center gap-1">
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-gray-500">Input</div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setSelectedProcessId(process.id);
                                        setIsDatasetDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setSelectedProcessId(process.id);
                                        setIsWorkerDialogOpen(true);
                                      }}
                                    >
                                      <Code className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {process.worker.input.map((item) => (
                                      <div key={item.id} className="w-full">
                                        {renderDatasetItem(
                                          item as ProcessItemWithIcon
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center justify-center px-1 text-gray-400">
                                  <div className="text-sm">→</div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="text-xs text-gray-500">Output</div>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setSelectedProcessId(process.id);
                                        setIsDatasetDialogOpen(true);
                                      }}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setSelectedProcessId(process.id);
                                        setIsWorkerDialogOpen(true);
                                      }}
                                    >
                                      <Code className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {process.worker.output.map((item) => (
                                      <div key={item.id} className="w-full">
                                        {renderDatasetItem(
                                          item as ProcessItemWithIcon
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
