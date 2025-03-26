import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { createDataset } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';

interface DatasetCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetCreated: () => void;
  processId: string;
}

export function DatasetCreationDialog({ isOpen, onClose, onDatasetCreated, processId }: DatasetCreationDialogProps) {
  const [name, setName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInput, setIsInput] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      await createDataset({
        id: name,
        name,
        process_id: processId,
        sourceUrl: sourceUrl || undefined,
        is_input: isInput
      });
      
      onDatasetCreated();
      onClose();
      setName("");
      setSourceUrl("");
      setIsInput(true);
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
          <DialogTitle>Create New Dataset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter dataset name"
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Dataset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}