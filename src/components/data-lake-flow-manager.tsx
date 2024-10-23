import { useState, useEffect, useRef } from "react";
import {
  Plus,
  ArrowRight,
  Link as LinkIcon,
  File,
  Terminal,
  Eye,
  GripVertical,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import autoAnimate from "@formkit/auto-animate";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUp, ArrowDown } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

type Action = {
  id: string;
  type: "file" | "command";
  name: string;
  details: {
    filePath?: string;
    executionCommand?: string;
    command?: string;
  };
};

type Flow = {
  id: string;
  name: string;
  source: string;
  zone: "Landing" | "Raw" | "Trusted" | "Refined";
  linkedTo?: string;
  actions: Action[];
};

function ActionItem({
  action,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  action: Action;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const parentRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, [parentRef]);

  return (
    <li
      className="flex items-center justify-between p-2 bg-secondary rounded"
      key={action.id}
      ref={parentRef}
    >
      <div className="flex items-center space-x-2">
        <span>
          {action.type === "file" ? (
            <File className="h-4 w-4" />
          ) : (
            <Terminal className="h-4 w-4" />
          )}
        </span>
        <div className="flex flex-col">
          <span className="font-medium">{action.name}</span>
          <span className="text-sm text-muted-foreground">
            {action.type === "file"
              ? `${action.details.filePath} (${action.details.executionCommand})`
              : action.details.command}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveUp(action.id)}
          disabled={isFirst}
          className="h-8 w-8"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMoveDown(action.id)}
          disabled={isLast}
          className="h-8 w-8"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(action.id)}
          className="h-8 w-8 text-red-500 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function ActionList({
  actions,
  setActions,
}: {
  actions: Action[];
  setActions: (actions: Action[]) => void;
}) {
  const [newAction, setNewAction] = useState<Partial<Action>>({
    type: "file",
    details: {},
  });
  const [actionsOpen, setActionsOpen] = useState(false);
  const parentRef = useRef<HTMLUListElement>(null);

  // Enable auto-animate for the list
  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, [parentRef]);

  const handleAddAction = () => {
    if (newAction.type === "file") {
      if (
        newAction.name &&
        newAction.details?.filePath &&
        newAction.details?.executionCommand
      ) {
        const action: Action = {
          id: `action-${Date.now()}`,
          type: "file",
          name: newAction.name,
          details: {
            filePath: newAction.details.filePath,
            executionCommand: newAction.details.executionCommand,
          },
        };
        setActions([...actions, action]);
        setNewAction({ type: "file", details: {} });
      }
    } else if (newAction.type === "command") {
      if (newAction.name && newAction.details?.command) {
        const action: Action = {
          id: `action-${Date.now()}`,
          type: "command",
          name: newAction.name,
          details: {
            command: newAction.details.command,
          },
        };
        setActions([...actions, action]);
        setNewAction({ type: "command", details: {} });
      }
    }
  };

  const handleRemoveAction = (id: string) => {
    setActions(actions.filter((action) => action.id !== id));
  };

  const handleMoveUp = (id: string) => {
    const index = actions.findIndex((action) => action.id === id);
    if (index > 0) {
      const newActions = [...actions];
      [newActions[index - 1], newActions[index]] = [
        newActions[index],
        newActions[index - 1],
      ];
      setActions(newActions);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = actions.findIndex((action) => action.id === id);
    if (index < actions.length - 1) {
      const newActions = [...actions];
      [newActions[index], newActions[index + 1]] = [
        newActions[index + 1],
        newActions[index],
      ];
      setActions(newActions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button onClick={() => setActionsOpen(!actionsOpen)}>
          {actionsOpen ? "Close" : "Add Action"}
        </Button>
      </div>
      {actionsOpen && (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Select
              value={newAction.type}
              onValueChange={(value: "file" | "command") =>
                setNewAction({ ...newAction, type: value, details: {} })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="command">Command</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Action name"
              value={newAction.name || ""}
              onChange={(e) =>
                setNewAction({ ...newAction, name: e.target.value })
              }
            />
          </div>

          {newAction.type === "file" ? (
            <>
              <Input
                placeholder="File path"
                value={newAction.details?.filePath || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    details: { ...newAction.details, filePath: e.target.value },
                  })
                }
              />
              <Input
                placeholder="Execution command"
                value={newAction.details?.executionCommand || ""}
                onChange={(e) =>
                  setNewAction({
                    ...newAction,
                    details: {
                      ...newAction.details,
                      executionCommand: e.target.value,
                    },
                  })
                }
              />
            </>
          ) : (
            <Input
              placeholder="Command"
              value={newAction.details?.command || ""}
              onChange={(e) =>
                setNewAction({
                  ...newAction,
                  details: { ...newAction.details, command: e.target.value },
                })
              }
            />
          )}
          <Button onClick={handleAddAction}>Add Action</Button>
        </div>
      )}

      <ul className="space-y-2" ref={parentRef}>
        {actions.map((action, index) => (
          <ActionItem
            key={action.id}
            action={action}
            onRemove={handleRemoveAction}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={index === 0}
            isLast={index === actions.length - 1}
          />
        ))}
      </ul>
    </div>
  );
}

function FlowDialog({
  isOpen,
  onOpenChange,
  flow = { actions: [] },
  onSave,
  flows,
  isEditing,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  flow?: Partial<Flow>;
  onSave: (flow: Flow) => void;
  flows: Flow[];
  isEditing?: boolean;
}) {
  const [currentFlow, setCurrentFlow] = useState(flow);
  const zones: Flow["zone"][] = ["Landing", "Raw", "Trusted", "Refined"];

  useEffect(() => {
    setCurrentFlow(flow);
  }, [flow]);

  const handleSave = () => {
    if (currentFlow.name && currentFlow.source && currentFlow.zone) {
      onSave(currentFlow as Flow);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Flow Details: ${flow.name}` : "Add New Flow"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={currentFlow.name || ""}
              onChange={(e) =>
                setCurrentFlow({ ...currentFlow, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={currentFlow.source || ""}
              onChange={(e) =>
                setCurrentFlow({ ...currentFlow, source: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="zone">Zone</Label>
            <Select
              value={currentFlow.zone}
              onValueChange={(value) =>
                setCurrentFlow({ ...currentFlow, zone: value as Flow["zone"] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="linkedTo">Link to Existing Flow</Label>

            <Select
              value={currentFlow.linkedTo}
              onValueChange={(value) =>
                setCurrentFlow({ ...currentFlow, linkedTo: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select flow to link" />
              </SelectTrigger>
              <SelectContent>
                {flows.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} ({f.zone})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ActionList
            actions={currentFlow.actions}
            setActions={(actions) =>
              setCurrentFlow({ ...currentFlow, actions })
            }
          />
          <Button onClick={handleSave}>
            {isEditing ? "Save Changes" : "Add Flow"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortableActionItem({
  action,
  onRemove,
}: {
  action: Action;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: action.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-2 bg-secondary rounded"
    >
      <div className="flex items-center space-x-2">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 cursor-grab" />
        </div>
        <span>
          {action.type === "file" ? (
            <File className="h-4 w-4" />
          ) : (
            <Terminal className="h-4 w-4" />
          )}
        </span>
        <div className="flex flex-col">
          <span className="font-medium">{action.name}</span>
          <span className="text-sm text-muted-foreground">
            {action.type === "file"
              ? `${action.details.filePath} (${action.details.executionCommand})`
              : action.details.command}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onRemove(action.id)}>
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}

export function DataLakeFlowManagerComponent() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveFlow = (flow: Flow) => {
    if (flow.id) {
      // Editing existing flow
      setFlows(flows.map((f) => (f.id === flow.id ? flow : f)));
    } else {
      // Adding new flow
      setFlows([...flows, { ...flow, id: String(flows.length + 1) }]);
    }
  };

  const getZoneColor = (zone: Flow["zone"]) => {
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Data Lake Flow Manager</h1>
      {["Landing", "Raw", "Trusted", "Refined"].map((zone) => (
        <div
          key={zone}
          className="border rounded-lg p-4"
          style={{ backgroundColor: getZoneColor(zone as Flow["zone"]) }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{zone}</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedFlow(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {flows
              .filter((flow) => flow.zone === zone)
              .map((flow) => (
                <div
                  key={flow.id}
                  className="flex items-center justify-between p-2 rounded"
                  style={{ backgroundColor: getZoneColor(flow.zone) }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{flow.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {flow.source}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">{flow.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {flow.zone}
                      </span>
                    </div>
                    {flow.linkedTo && (
                      <LinkIcon
                        className="h-4 w-4 text-blue-500"
                        title={`Linked to ${flows.find((f) => f.id === flow.linkedTo)?.name}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      <File className="inline h-4 w-4 mr-1" />
                      {flow.actions.filter((a) => a.type === "file").length}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      <Terminal className="inline h-4 w-4 mr-1" />
                      {flow.actions.filter((a) => a.type === "command").length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedFlow(flow);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
      <FlowDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        flow={selectedFlow || { actions: [] }}
        onSave={handleSaveFlow}
        flows={flows}
        isEditing={!!selectedFlow}
      />
    </div>
  );
}
