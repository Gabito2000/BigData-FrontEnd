import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Code,
  Database,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Archive,
  Box,
} from "lucide-react";
import {
  fetchFlows,
  fetchElementsByTag,
} from "@/lib/api";
import { Flow, Pipeline, Dataset, Worker, File } from "@/lib/types";
import { sendToArchive } from "@/lib/api";
import { AlertBanner } from "./AlertBanner";
import { FlowList } from "./FlowList";
import { FlowFilter } from "@/components/screens/data-lake-flow-manager/FlowFilter";
import { ZoneContainer } from "@/components/screens/data-lake-flow-manager/ZoneContainer";
import { Loader2 } from "lucide-react";

// Extended types with icon property
type AlertState = {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
};
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

export default function DataLakeFlowManager() {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(
    null
  );
  const [flows, setFlows] = useState<FlowWithIcons[]>([]);
  const [tags, setTags] = useState<{ id: string; count?: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");

  const [isSandboxVisible, setIsSandboxVisible] = useState(true);
  const [isArchivalVisible, setIsArchivalVisible] = useState(false);

  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    message: "",
    type: "info",
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchFlows().then((flowsData) => {
      setFlows(flowsData.map(flow => ({ ...flow, pipelines: [] })) as FlowWithIcons[]);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedTag) {
      const loadTaggedElements = async () => {
        setIsLoading(true);
        try {
          const elements = await fetchElementsByTag(selectedTag);
          if (elements.flows.length > 0) {
            const flowIds = new Set(elements.flows.map((flow) => flow.id));
            setFlows((prevFlows) => prevFlows.filter((flow) => flowIds.has(flow.id)));
          }
          if (elements.pipelines.length > 0) {
            const processIds = new Set(elements.pipelines.map((process) => process.id));
            setFlows((prevFlows) =>
              prevFlows
                .map((flow) => ({
                  ...flow,
                  pipelines: flow.pipelines.filter((process) => processIds.has(process.id)),
                }))
                .filter((flow) => flow.pipelines.length > 0)
            );
          }
        } catch (err) {
          console.error("Error loading tagged elements:", err);
        } finally {
          setIsLoading(false);
        }
      };
      loadTaggedElements();
    } else {
      setIsLoading(true);
      fetchFlows()
        .then((flowsData) => {
          const flowsWithIcons = flowsData.map((flow) => ({
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
          setFlows(flowsWithIcons as FlowWithIcons[]);
        })
        .catch((err) => {
          console.error("Error reloading flows:", err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedTag]);

  const filteredFlows = useMemo(() => {
    let baseFlows = flows;
    if (!filterText) return baseFlows;
    const searchTerm = filterText.toLowerCase();
    return flows
      .map((flow) => {
        const filteredPipelines = flow.pipelines.filter((process) => {
          if (process.name.toLowerCase().includes(searchTerm)) return true;
          const hasMatchingItems = [...process.worker.input, ...process.worker.output].some((item) => {
            if (item.name.toLowerCase().includes(searchTerm)) return true;
            if (item.type === "dataset") {
              const dataset = item as DatasetWithIcon;
              return dataset.files?.some((file) => (file.name || file.id).toLowerCase().includes(searchTerm));
            }
            if (item.type === "worker") {
              const worker = item as WorkerWithIcon;
              return worker.scripts?.some((script) => (script.name || script.id).toLowerCase().includes(searchTerm));
            }
            return false;
          });
          return hasMatchingItems;
        });
        if (filteredPipelines.length > 0 || flow.name.toLowerCase().includes(searchTerm)) {
          return { ...flow, pipelines: filteredPipelines };
        }
        return null;
      })
      .filter((flow): flow is FlowWithIcons => flow !== null);
  }, [flows, filterText]);

  const handleSendToArchive = async (elementId: string) => {
    try {
      const response = await sendToArchive(elementId);
      setFlows(prevFlows =>
        prevFlows.map(flow => ({
          ...flow,
          pipelines: flow.pipelines.filter(pipeline => pipeline.id !== elementId)
        })).filter(flow => flow.pipelines.length > 0)
      );
      setAlertState({
        visible: true,
        message: `Element ${elementId} archived successfully.`,
        type: "success",
      });
    } catch (error) {
      setAlertState({
        visible: true,
        message: `Failed to archive element ${elementId}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: "error",
      });
    }
  };
  const clearFilters = () => {
    setSelectedTag(null);
    setFilterText("");
  };
  const closeAlert = () => {
    setAlertState({ visible: false, message: "", type: "info" });
  };

  // Add this function to refresh flows globally
  const refreshFlows = async () => {
    const flowsData = await fetchFlows();
    const flowsWithIcons = flowsData.map((flow) => ({
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
    setFlows(flowsWithIcons as FlowWithIcons[]);
  };

  // Zone Toggle Button
  const ZoneToggleButton = ({ isVisible, setIsVisible, zoneName }: { isVisible: boolean; setIsVisible: (value: boolean) => void; zoneName: string; }) => {
    const icon = zoneName === "Archival" ? <Archive className="h-4 w-4" /> : <Box className="h-4 w-4" />;
    return (
      <Button
        variant={isVisible ? "default" : "outline"}
        className="flex items-center gap-2 transition-all duration-200"
        onClick={() => setIsVisible(!isVisible)}
      >
        {icon}
        <span>{zoneName} Zone</span>
        {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Data Lake Flow Manager</h1>
        </header>
        <AlertBanner alertState={alertState} onClose={closeAlert} />
        <FlowFilter
          tags={tags}
          selectedTag={selectedTag}
          filterText={filterText}
          onFilterChange={setFilterText}
          onTagSelect={setSelectedTag}
          onClearFilters={clearFilters}
        />
        {(selectedTag || filterText) && (
          <div className="bg-blue-50 px-4 py-2 flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">Active filters:</span>
            {selectedTag && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                Tag: {selectedTag}
                <button onClick={() => setSelectedTag(null)} className="ml-1 hover:bg-blue-200 rounded-full p-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterText && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                Search: {filterText}
                <button onClick={() => setFilterText("")} className="ml-1 hover:bg-blue-200 rounded-full p-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-blue-600">Loading zones...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex gap-4 mb-6">
              <ZoneToggleButton isVisible={isArchivalVisible} setIsVisible={setIsArchivalVisible} zoneName="Archival" />
              <ZoneToggleButton isVisible={isSandboxVisible} setIsVisible={setIsSandboxVisible} zoneName="Sandbox" />
            </div>
            <div className="flex gap-6">
              {isArchivalVisible && (
                <div className="w-1/4 min-w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-lg shadow p-4 h-full">
                    <ZoneContainer zone="Archival" pipelines={[]} />
                  </div>
                </div>
              )}
              <div className={`w-full`}>
                {(["Landing", "Raw", "Trusted", "Refined"] as const).map((zone) => {
                  const flowsInZone = filteredFlows
                    .map((flow) => ({
                      ...flow,
                      pipelines: flow.pipelines.filter((p) => p.zone.toLowerCase() === zone.toLowerCase()),
                    }))
                    .filter((flow) => flow.pipelines.length > 0);
                  if (flowsInZone.length === 0) return null;
                  return (
                    <ZoneContainer key={zone} zone={zone} pipelines={flowsInZone.flatMap((f) => f.pipelines)}>
                      <FlowList
                        flows={flowsInZone}
                        selectedPipelineId={selectedPipelineId}
                        onSendToArchive={handleSendToArchive}
                        onFilterByFlow={(flow) => setFilterText(flow.name)}
                        onFilter={setFilterText}
                        onToggleFiles={() => {}}
                        onToggleScripts={() => {}}
                        setSelectedPipelineId={setSelectedPipelineId}
                        handleExecutePipeline={() => {}}
                        flowsData={flows}
                        refreshFlows={refreshFlows} // Pass down
                      />
                    </ZoneContainer>
                  );
                })}
              </div>
              {isSandboxVisible && (
                <div className="w-1/4 min-w-[250px] flex-shrink-0">
                  <div className="bg-white rounded-lg shadow p-4 h-full">
                    <ZoneContainer zone="Sandbox" pipelines={[]} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
