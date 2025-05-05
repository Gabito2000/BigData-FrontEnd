import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorker, associateWorkerWithPipeline, fetchFlows, fetchDatasets } from "@/lib/api";
import { Label } from "@/components/ui/label";

interface WorkerCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerCreated: () => void;
  pipelineId: string;
}

const ZONE_ORDER = ["Landing", "Raw", "Trusted", "Refined"];

export function WorkerCreationDialog({ isOpen, onClose, onWorkerCreated, pipelineId }: WorkerCreationDialogProps) {
  const [id, setId] = useState("");
  const [isNewWorker, setIsNewWorker] = useState(true);
  const [existingWorkerId, setExistingWorkerId] = useState("");
  const [availableWorkers, setAvailableWorkers] = useState<{id: string, name: string}[]>([]);
  const [outputDatasetId, setOutputDatasetId] = useState("");
  const [availableDatasets, setAvailableDatasets] = useState<{id: string, name: string, zone?: string}[]>([]);
  const [pipelineZone, setPipelineZone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFlows().then((flows) => {
        const workers: {id: string, name: string}[] = [];
        let currentZone: string | null = null;
        flows.forEach(flow => {
          flow.pipelines.forEach(process => {
            if (process.id === pipelineId) {
              currentZone = process.zone;
            }
            if (process.worker && process.worker.input) {
              process.worker.input.forEach(item => {
                if (item.type === 'worker') {
                  workers.push({ id: item.id, name: item.name || item.id });
                }
              });
            }
          });
        });
        setAvailableWorkers(workers);
        setPipelineZone(currentZone);
        // Fetch datasets for the next zone
        if (currentZone) {
          const nextZoneIndex = ZONE_ORDER.indexOf(currentZone) + 1;
          const nextZone = ZONE_ORDER[nextZoneIndex] || null;
          if (nextZone) {
            fetchDatasets(nextZone).then((datasets) => {
              console.log("Fetched datasets:", datasets); // Add this line for debugging
              // Defensive: ensure datasets is an array
              const safeDatasets = Array.isArray(datasets) ? datasets : [];
              setAvailableDatasets(
                safeDatasets
                  .filter((ds: any) => ds && ds.id)
                  .map((ds: any) => ({
                    id: ds.id,
                    name: ds.name || ds.id,
                  }))
              );
            }).catch(() => {
              setAvailableDatasets([]);
            });
          } else {
            setAvailableDatasets([]);
          }
        }
      });
    }
  }, [isOpen, pipelineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isNewWorker) {
        await createWorker({
          id: id,
          pipeline_id: pipelineId,
          output_dataset_id: outputDatasetId,
        });
      } else {
        // Instead of creating a new worker, create a relationship
        await associateWorkerWithPipeline(existingWorkerId, pipelineId, outputDatasetId);
      }
      onWorkerCreated();
      onClose();
      setId("");
      setExistingWorkerId("");
      setOutputDatasetId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add worker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={isNewWorker ? "default" : "outline"}
                onClick={() => setIsNewWorker(true)}
              >
                New Worker
              </Button>
              <Button
                type="button"
                variant={!isNewWorker ? "default" : "outline"}
                onClick={() => setIsNewWorker(false)}
              >
                Existing Worker
              </Button>
            </div>

            {isNewWorker ? (
              <div className="space-y-2">
                <Label htmlFor="id">Worker ID</Label>
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="Enter new worker ID"
                  required
                />
                <Label htmlFor="dataset">Output Dataset</Label>
                <Select value={outputDatasetId} onValueChange={setOutputDatasetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDatasets.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="existing-worker">Select Existing Worker</Label>
                <Select value={existingWorkerId} onValueChange={setExistingWorkerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a worker" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Label htmlFor="dataset">Output Dataset</Label>
                <Select value={outputDatasetId} onValueChange={setOutputDatasetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDatasets.map((ds) => (
                      <SelectItem key={ds.id} value={ds.id}>
                        {ds.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || (!isNewWorker && !existingWorkerId) || (isNewWorker && !outputDatasetId)}>
              {isLoading ? "Adding..." : "Add Worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}