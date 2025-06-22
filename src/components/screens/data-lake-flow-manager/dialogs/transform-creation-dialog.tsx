import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTransformation } from "@/lib/api";
import { useEffect } from "react";
import { fetchDatasetsForWorkerPipeline } from "@/lib/api";

interface TransformCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Renamed from onTransformCreated
  workerId: string;
}

export function TransformCreationDialog({
  isOpen,
  onClose,
  onSuccess,
  workerId,
}: TransformCreationDialogProps) {
  const [id, setId] = useState("");
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableFiles, setAvailableFiles] = useState<{ id: string; name: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!selectedFile) {
        throw new Error('Please select a transformation script file to upload');
      }
      await createTransformation({
        id,
        worker_id: workerId,
        file_id: fileIds,
        scriptFile: selectedFile
      });

      onSuccess(); // Only call after backend success
      onClose();
      setSelectedFile(null);
      setId("");
      setFileIds([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create transformation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && workerId) {
      fetchDatasetsForWorkerPipeline(workerId).then((datasets) => {
        const files = datasets.flatMap((ds: any) =>
          (ds.files || []).map((file: any) => ({
            id: file.id,
            name: file.name || file.id,
          }))
        );
        setAvailableFiles(files);
      });
    }
  }, [isOpen, workerId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Transformation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id">Transformation ID</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Enter transformation ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="files">Select Files from Datasets</Label>
              <Select
                defaultValue={fileIds[0] || ""}
                onValueChange={(value) => {
                  setFileIds(prev => {
                    if (prev.includes(value)) {
                      return prev.filter(id => id !== value);
                    }
                    return [...prev, value];
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select files">
                    {fileIds.length > 0 ? `${fileIds.length} files selected` : "Select files"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {availableFiles.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={fileIds.includes(file.id)}
                          className="mr-2"
                          readOnly
                        />
                        {file.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scriptFile">Transformation Script</Label>
              <Input
                id="scriptFile"
                type="file"
                accept=".py,.js,.sh"
                onChange={handleFileChange}
                required
              />
              {selectedFile && <span>Selected: {selectedFile.name}</span>}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
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
              {isLoading ? "Creating..." : "Create Transformation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}