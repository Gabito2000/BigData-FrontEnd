import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Code,
  Database,
  Globe,
  Link as LinkIcon,
  Search,
} from "lucide-react";

type Port = {
  id: string;
  name: string;
  zone: "Landing" | "Raw" | "Trusted" | "Refined";
  process: {
    input: PortItem[];
    output: PortItem[];
  };
};

type PortItem = Dataset | Process;

type Dataset = {
  id: string;
  name: string;
  sourceUrl: string;
  icon: React.ReactNode;
};

type Process = {
  id: string;
  name: string;
  icon: React.ReactNode;
};

type Flow = {
  id: string;
  name: string;
  ports: Port[];
};

export default function DataLakeFlowManager() {
  const [flows, setFlows] = useState<Flow[]>([
    {
      id: "flow1",
      name: "Customer Data Pipeline",
      ports: [
        {
          id: "port1",
          name: "Customer Import",
          zone: "Landing",
          process: {
            input: [
              {
                id: "dataset1",
                name: "Customer Data",
                sourceUrl: "https://api.example.com/customers",
                icon: <Database />,
              },
              //process
              {
                id: "process5",
                name: "Data Normalization",
                icon: <Code />,
              },
            ],
            output: [
              {
                id: "dataset2",
                name: "Raw Customers",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port2",
          name: "Customer Cleaning",
          zone: "Raw",
          process: {
            input: [
              {
                id: "dataset2",
                name: "Raw Customers",
                icon: <Database />,
              },
            ],
            output: [
              {
                id: "dataset3",
                name: "Trusted Customers",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port3",
          name: "Customer Aggregation",
          zone: "Trusted",
          process: {
            input: [
              {
                id: "dataset3",
                name: "Trusted Customers",
                icon: <Database />,
              },
            ],
            output: [
              {
                id: "dataset4",
                name: "Refined Customers",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port4",
          name: "Customer Summary",
          zone: "Refined",
          process: {
            input: [
              {
                id: "dataset4",
                name: "Refined Customers",
                icon: <Database />,
              },
            ],
            output: [],
          },
        },
      ],
    },
    {
      id: "flow2",
      name: "Sales Data Pipeline",
      ports: [
        {
          id: "port5",
          name: "Sales Import",
          zone: "Landing",
          process: {
            input: [
              {
                id: "dataset5",
                name: "Sales Data",
                sourceUrl: "https://api.example.com/sales",
                icon: <Database />,
              },
            ],
            output: [
              {
                id: "dataset6",
                name: "Raw Sales",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port6",
          name: "Sales Cleaning",
          zone: "Raw",
          process: {
            input: [
              {
                id: "dataset6",
                name: "Raw Sales",
                icon: <Database />,
              },
            ],
            output: [
              {
                id: "dataset7",
                name: "Trusted Sales",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port7",
          name: "Sales Aggregation",
          zone: "Trusted",
          process: {
            input: [
              {
                id: "dataset7",
                name: "Trusted Sales",
                icon: <Database />,
              },
            ],
            output: [
              {
                id: "dataset8",
                name: "Refined Sales",
                icon: <Database />,
              },
            ],
          },
        },
        {
          id: "port8",
          name: "Sales Summary",
          zone: "Refined",
          process: {
            input: [
              {
                id: "dataset8",
                name: "Refined Sales",
                icon: <Database />,
              },
            ],
            output: [],
          },
        },
      ],
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    validateFlows();
  }, [flows]);

  // Ensure "Landing" elements have a sourceUrl and others do not.
  const validateFlows = () => {
    flows.forEach((flow) => {
      flow.ports.forEach((port) => {
        if (port.zone === "Landing") {
          port.process.input.forEach((item) => {
            if (!item.sourceUrl) {
              console.warn(
                `Landing zone item "${item.name}" is missing a required sourceUrl.`
              );
            }
          });
        } else {
          port.process.input.forEach((item) => {
            if (item.sourceUrl) {
              console.warn(
                `"${port.zone}" zone item "${item.name}" should not have a sourceUrl.`
              );
            }
          });
        }
      });
    });
  };

  const getZoneColor = (zone: Port["zone"]) => {
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

  const getSourcesDisplay = (port: Port) => {
    const landingInput = port.process.input.find(
      (item) => port.zone === "Landing" && item.sourceUrl
    );
    return landingInput ? (
      <div className="flex items-center">
        <Globe className="h-4 w-4 text-blue-500 mr-1" />
        <span className="text-sm text-muted-foreground">
          {landingInput.sourceUrl}
        </span>
      </div>
    ) : null;
  };

  const filterFlows = (flows, filterText) => {
    return flows
      .map((flow) => {
        const filteredPorts = flow.ports
          .filter((port) => {
            const filteredInputItems = port.process.input.filter((item) => {
              if (item.name.toLowerCase().includes(filterText.toLowerCase())) {
                return true;
              }
              return false;
            });
            const filteredOutputItems = port.process.output.filter((item) => {
              if (item.name.toLowerCase().includes(filterText.toLowerCase())) {
                return true;
              }
              return false;
            });

            if (
              filteredInputItems.length > 0 ||
              filteredOutputItems.length > 0
            ) {
              return {
                ...port,
                process: {
                  input: filteredInputItems,
                  output: filteredOutputItems,
                },
              };
            }

            if (port.name.toLowerCase().includes(filterText.toLowerCase())) {
              return port;
            }

            return null;
          })
          .filter((port) => port !== null);

        if (filteredPorts.length > 0) {
          return {
            ...flow,
            ports: filteredPorts,
          };
        }

        if (flow.name.toLowerCase().includes(filterText.toLowerCase())) {
          return flow;
        }

        return null;
      })
      .filter((flow) => flow !== null);
  };

  // Use the filter function in your component
  const filteredFlows = useMemo(
    () => filterFlows(flows, filterText),
    [flows, filterText]
  );

  const handleFilterByFlow = (flow: Flow) => {
    setFilterText(flow.name);
  };

  const handleFilterByPort = (port: Port) => {
    setFilterText(port.name);
  };

  const handleFilterByItem = (item: PortItem) => {
    setFilterText(item.name);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data Lake Flow Manager</h1>
      <div className="mb-4">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full"
          placeholder="Filter flows..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
      </div>
      {["Landing", "Raw", "Trusted", "Refined"].map((zone) => (
        <div
          key={zone}
          className="border rounded-lg p-4"
          style={{ backgroundColor: getZoneColor(zone as Port["zone"]) }}
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
                flow.ports.some((port) => port.zone === zone) && (
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
                    {flow.ports
                      .filter((port) => port.zone === zone)
                      .map((port) => (
                        <div key={port.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{port.name}</h4>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleFilterByPort(port)}
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>
                          {getSourcesDisplay(port)}
                          <div className="flex space-x-2">
                            {port.process.input.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                              >
                                {item.icon}
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
                            {port.process.output.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded"
                              >
                                {item.icon}
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
      ))}
    </div>
  );
}
