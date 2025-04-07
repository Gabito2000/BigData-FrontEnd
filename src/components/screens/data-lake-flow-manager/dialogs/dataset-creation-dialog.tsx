import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createDataset, fetchFlows, associateDatasetWithPipeline } from "@/lib/api";

interface DatasetCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: () => void;
  pipelineId: string;
}

export function DatasetCreationDialog({ isOpen, onClose, onDatasetCreated, pipelineId }: DatasetCreationDialogProps) {
  const [id, setId] = useState("");
  const [isNewDataset, setIsNewDataset] = useState(true);
  const [existingDatasetId, setExistingDatasetId] = useState("");
  const [availableDatasets, setAvailableDatasets] = useState<{id: string, name: string}[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInput, setIsInput] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFlows().then((flows) => {
        const datasets: {id: string, name: string}[] = [];
        flows.forEach(flow => {
          flow.pipelines.forEach(process => {
            process.worker.input.forEach(item => {
              if (item.type === 'dataset') {
                datasets.push({ id: item.id, name: item.name });
              }
            });
            process.worker.output.forEach(item => {
              if (item.type === 'dataset') {
                datasets.push({ id: item.id, name: item.name });
              }
            });
          });
        });
        setAvailableDatasets(datasets);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      if (isNewDataset) {
        await createDataset({
          id,
          name: id,
          process_id: pipelineId,
          sourceUrl: sourceUrl || undefined,
          is_input: isInput
        });
      } else {
        // Here you would add logic to associate existing dataset
        await associateDatasetWithPipeline(existingDatasetId, pipelineId, isInput);
      }
      
      onDatasetCreated();
      onClose();
      setId("");
      setSourceUrl("");
      setIsInput(true);
      setExistingDatasetId("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create dataset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Dataset to Pipeline</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={isNewDataset}
                    onChange={() => setIsNewDataset(true)}
                  />
                  <span>New Dataset</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!isNewDataset}
                    onChange={() => setIsNewDataset(false)}
                  />
                  <span>Existing Dataset</span>
                </label>
              </div>
            </div>

            {isNewDataset ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="id" className="text-sm font-medium">
                    Dataset ID
                  </label>
                  <Input
                    id="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Enter dataset ID"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sourceUrl" className="text-sm font-medium">
                    Source URL (Optional)
                  </label>
                  <Input
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Enter source URL"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label htmlFor="existingDataset" className="text-sm font-medium">
                  Select Existing Dataset
                </label>
                <Select
                  value={existingDatasetId}
                  onValueChange={setExistingDatasetId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDatasets.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Dataset Role</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={isInput}
                    onChange={() => setIsInput(true)}
                  />
                  <span>Input Dataset</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!isInput}
                    onChange={() => setIsInput(false)}
                  />
                  <span>Output Dataset</span>
                </label>
              </div>
            </div>

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
            <Button type="submit" disabled={isLoading || (!isNewDataset && !existingDatasetId)}>
              {isLoading ? "Adding..." : "Add Dataset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}