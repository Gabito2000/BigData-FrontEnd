import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPipeline } from "@/lib/api";

interface PipelineCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPipelineCreated: () => void;
  flowId: string;
}

export function PipelineCreationDialog({ isOpen, onClose, onPipelineCreated, flowId }: PipelineCreationDialogProps) {
  const [name, setName] = useState("");
  const [zone, setZone] = useState<"Landing" | "Raw" | "Trusted" | "Refined">("Landing");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createPipeline({
        id: name,
        name,
        flow_id: flowId,
        zone: zone.toLowerCase()
      });
      onPipelineCreated();
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
          <DialogTitle>Create New Pipeline</DialogTitle>
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
              {isLoading ? "Creating..." : "Create Pipeline"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}