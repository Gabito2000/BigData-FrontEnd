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
} from "lucide-react";
import { fetchFlows, fetchTags, fetchElementsByTag, Flow, Process, ProcessItem, Dataset, Worker } from "@/lib/api";

// Extended types with icon property
type DatasetWithIcon = Dataset & { icon: React.ReactNode };
type WorkerWithIcon = Worker & { icon: React.ReactNode };
type ProcessItemWithIcon = DatasetWithIcon | WorkerWithIcon;

// Extended flow types
type ProcessWithIcons = Omit<Process, 'worker'> & {
  worker: {
    input: ProcessItemWithIcon[];
    output: ProcessItemWithIcon[];
  };
};

type FlowWithIcons = Omit<Flow, 'processes'> & {
  processes: ProcessWithIcons[];
};

export default function DataLakeFlowManager() {
  const [flows, setFlows] = useState<FlowWithIcons[]>([]);
  const [tags, setTags] = useState<{ id: string; count?: number }[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch flows and tags on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [flowsData, tagsData] = await Promise.all([
          fetchFlows(),
          fetchTags()
        ]);
        
        // Add icons to the datasets and workers
        const flowsWithIcons = flowsData.map(flow => ({
          ...flow,
          processes: flow.processes.map(process => ({
            ...process,
            worker: {
              input: process.worker.input.map(item => ({
                ...item,
                icon: 'sourceUrl' in item ? <Database /> : <Code />
              })),
              output: process.worker.output.map(item => ({
                ...item,
                icon: <Database />
              }))
            }
          }))
        }));
        
        setFlows(flowsWithIcons);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error loading data:', err);
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
            const flowIds = new Set(elements.flows.map(flow => flow.id));
            setFlows(prevFlows => 
              prevFlows.filter(flow => flowIds.has(flow.id))
            );
          }
          
          // If there are processes in the tagged elements, filter the processes
          if (elements.processes.length > 0) {
            const processIds = new Set(elements.processes.map(process => process.id));
            setFlows(prevFlows => 
              prevFlows.map(flow => ({
                ...flow,
                processes: flow.processes.filter(process => processIds.has(process.id))
              })).filter(flow => flow.processes.length > 0)
            );
          }
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error loading tagged elements:', err);
        } finally {
          setIsLoading(false);
        }
      };

      loadTaggedElements();
    } else {
      // If no tag is selected, reload all flows
      fetchFlows()
        .then(flowsData => {
          // Add icons to the datasets and workers
          const flowsWithIcons = flowsData.map(flow => ({
            ...flow,
            processes: flow.processes.map(process => ({
              ...process,
              worker: {
                input: process.worker.input.map(item => ({
                  ...item,
                  icon: 'sourceUrl' in item ? <Database /> : <Code />
                })),
                output: process.worker.output.map(item => ({
                  ...item,
                  icon: <Database />
                }))
              }
            }))
          }));
          
          setFlows(flowsWithIcons);
        })
        .catch(err => {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          console.error('Error reloading flows:', err);
        });
    }
  }, [selectedTag]);

  useEffect(() => {
    validateFlows();
  }, [flows]);

  const validateFlows = () => {
    flows.forEach((flow) => {
      flow.processes.forEach((process) => {
        if (process.zone === "Landing") {
          process.worker.input.forEach((item) => {
            if ('sourceUrl' in item && !item.sourceUrl) {
              console.warn(
                `Landing zone item "${item.name}" is missing a required sourceUrl.`
              );
            }
          });
        } else {
          process.worker.input.forEach((item) => {
            if ('sourceUrl' in item && item.sourceUrl) {
              console.warn(
                `"${process.zone}" zone item "${item.name}" should not have a sourceUrl.`
              );
            }
          });
        }
      });
    });
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

  const getSourcesDisplay = (process: Process) => {
    const landingInput = process.worker.input.find(
      (item) => process.zone === "Landing" && 'sourceUrl' in item && item.sourceUrl
    );
    return landingInput && 'sourceUrl' in landingInput ? (
      <div className="flex items-center">
        <Globe className="h-4 w-4 text-blue-500 mr-1" />
        <span className="text-sm text-muted-foreground">
          {landingInput.sourceUrl}
        </span>
      </div>
    ) : null;
  };

  const filterFlows = (flows: Flow[], filterText: string) => {
    if (!filterText) return flows;
    
    return flows
      .map((flow) => {
        const filteredProcesses = flow.processes
          .filter((process) => {
            const filteredInputItems = process.worker.input.filter((item) =>
              item.name.toLowerCase().includes(filterText.toLowerCase())
            );
            const filteredOutputItems = process.worker.output.filter((item) =>
              item.name.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filteredInputItems.length > 0 || filteredOutputItems.length > 0) {
              return {
                ...process,
                worker: {
                  input: filteredInputItems,
                  output: filteredOutputItems,
                },
              };
            }

            return process.name.toLowerCase().includes(filterText.toLowerCase())
              ? process
              : null;
          })
          .filter((process): process is Process => process !== null);

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
      .filter((flow): flow is Flow => flow !== null);
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

  const handleTagSelect = (tagId: string) => {
    if (selectedTag === tagId) {
      // If clicking the same tag, deselect it
      setSelectedTag(null);
    } else {
      // Select the new tag
      setSelectedTag(tagId);
    }
    // Clear text filter when changing tags
    setFilterText("");
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setFilterText("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data Lake Flow Manager</h1>
      
      {/* Tags filter section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Filter by Tags</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map(tag => (
            <Button
              key={tag.id}
              variant={selectedTag === tag.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagSelect(tag.id)}
              className="flex items-center gap-1"
            >
              <TagIcon className="h-3 w-3" />
              {tag.id}
              {tag.count && <span className="text-xs ml-1">({tag.count})</span>}
            </Button>
          ))}
          {(selectedTag || filterText) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600"
            >
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          )}
        </div>
        
        {/* Text filter */}
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Filter flows..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      
      {/* Show message when no flows match filters */}
      {filteredFlows.length === 0 && (
        <div className="border rounded-lg p-8 text-center bg-gray-50">
          <p className="text-gray-500 mb-4">No flows match the current filters</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      )}
      
      {/* Zones and flows display */}
      {["Landing", "Raw", "Trusted", "Refined"].map((zone) => {
        // Only show zones that have processes after filtering
        const hasProcessesInZone = filteredFlows.some(flow => 
          flow.processes.some(process => process.zone === zone)
        );
        
        if (!hasProcessesInZone) return null;
        
        return (
          <div
            key={zone}
            className="border rounded-lg p-4"
            style={{ backgroundColor: getZoneColor(zone as Process["zone"]) }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{zone}</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {filteredFlows.map(
                (flow) =>
                  flow.processes.some((process) => process.zone === zone) && (
                    <div key={flow.id}>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{flow.name}</h3>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleFilterByFlow(flow)}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      {flow.processes
                        .filter((process) => process.zone === zone)
                        .map((process) => (
                          <div key={process.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">{process.name}</h4>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleFilterByProcess(process)}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                            {getSourcesDisplay(process)}
                            <div className="flex space-x-2">
                              {process.worker.input.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                                >
                                  {(item as ProcessItemWithIcon).icon}
                                  <span className="text-sm">{item.name}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFilterByItem(item)}
                                  >
                                    <Search className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              {process.worker.output.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                                >
                                  {(item as ProcessItemWithIcon).icon}
                                  <span className="text-sm">{item.name}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleFilterByItem(item)}
                                  >
                                    <Search className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
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
