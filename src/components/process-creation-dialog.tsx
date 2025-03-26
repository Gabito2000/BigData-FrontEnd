import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { createProcess } from "@/lib/api";
import { v4 as uuidv4 } from 'uuid';

interface ProcessCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessCreated: () => void;
  flowId: string;
}

export function ProcessCreationDialog({ isOpen, onClose, onProcessCreated, flowId }: ProcessCreationDialogProps) {
  const [name, setName] = useState("");
  const [zone, setZone] = useState<"Landing" | "Raw" | "Trusted" | "Refined">("Landing");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createProcess({
        id: name,
        name,
        flow_id: flowId,
        zone: zone.toLowerCase()
      });
      onProcessCreated();
      onClose();
      setName("");
      setZone("Landing");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Process</DialogTitle>
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
                placeholder="Enter process name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="zone" className="text-sm font-medium">
                Zone
              </label>
              <Select value={zone} onValueChange={(value) => setZone(value as typeof zone)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Landing">Landing</SelectItem>
                  <SelectItem value="Raw">Raw</SelectItem>
                  <SelectItem value="Trusted">Trusted</SelectItem>
                  <SelectItem value="Refined">Refined</SelectItem>
                </SelectContent>
              </Select>
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
              {isLoading ? "Creating..." : "Create Process"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}