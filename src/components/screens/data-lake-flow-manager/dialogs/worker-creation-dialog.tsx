import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWorker, associateWorkerWithPipeline, fetchFlows } from "@/lib/api";
import { Label } from "@/components/ui/label";

interface WorkerCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkerCreated: () => void;
  processId: string;
}

export function WorkerCreationDialog({ isOpen, onClose, onWorkerCreated, processId }: WorkerCreationDialogProps) {
  const [id, setId] = useState("");
  const [isNewWorker, setIsNewWorker] = useState(true);
  const [existingWorkerId, setExistingWorkerId] = useState("");
  const [availableWorkers, setAvailableWorkers] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchFlows().then((flows) => {
        const workers: {id: string, name: string}[] = [];
        flows.forEach(flow => {
          flow.pipelines.forEach(process => {
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
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isNewWorker) {
        await createWorker({
          id: id,
          name: id,
          process_id: processId
        });
      } else {
        // Instead of creating a new worker, create a relationship
        await associateWorkerWithPipeline(existingWorkerId, processId);
      }
      onWorkerCreated();
      onClose();
      setId("");
      setExistingWorkerId("");
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
            <Button type="submit" disabled={isLoading || (!isNewWorker && !existingWorkerId)}>
              {isLoading ? "Adding..." : "Add Worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}