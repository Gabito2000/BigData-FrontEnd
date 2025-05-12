import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createFile, associateFileToDataset } from "@/lib/api";
import { fetchAllFiles } from "@/lib/api";
import { useRef } from "react";

interface FileCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileCreated: () => void;
  datasetId: string;
  datasetZone: string; // Add dataset zone prop
}

export function FileCreationDialog({ 
  isOpen, 
  onClose, 
  onFileCreated, 
  datasetId,
  datasetZone // Destructure new prop
}: FileCreationDialogProps) {
  const [id, setId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [fileType, setFileType] = useState("structured");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingFile, setIsExistingFile] = useState(false);
  const [existingFileId, setExistingFileId] = useState("");
  const [availableFiles, setAvailableFiles] = useState<{id: string, name: string}[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isOpen) {
      fetchAllFiles().then(files => {
        setAvailableFiles(files);
      });
      checkAndSetExistingFile();
    }
  }, [isOpen]);

  const checkAndSetExistingFile = () => {
    const isLandingZone = datasetZone.toLowerCase() === 'landing';
    setIsExistingFile(!isLandingZone);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setId(e.dataTransfer.files[0].name);
      setFilePath(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setId(e.target.files[0].name);
      setFilePath(e.target.files[0].name);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (isExistingFile) {
        result = await associateFileToDataset(existingFileId, datasetId);
      } else {
        if (datasetZone.toLowerCase() !== 'landing') {
          throw new Error('New files can only be created in Landing zone');
        }
        if (!selectedFile) {
          throw new Error('Please select or drop a file to upload');
        }
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("id", id);
        formData.append("dataset_id", datasetId);
        formData.append("fileType", fileType.toLowerCase());

        const response = await fetch("http://localhost:8000/api/files/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to upload file");
        }
        result = await response.json();
      }

      onFileCreated();
      onClose();
      setId("");
      setFilePath("");
      setFileType("structured");
      setExistingFileId("");
      setSelectedFile(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create/associate file");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add File to Dataset: {datasetId}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {datasetZone.toLowerCase() === 'landing' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">File Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={!isExistingFile}
                      onChange={() => setIsExistingFile(false)}
                    />
                    <span>New File</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={isExistingFile}
                      onChange={() => setIsExistingFile(true)}
                    />
                    <span>Existing File</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Only existing files can be added to {datasetZone} zone
              </div>
            )}

            {isExistingFile ? (
              <div className="space-y-2">
                <label htmlFor="existingFile" className="text-sm font-medium">
                  Select Existing File
                </label>
                <Select value={existingFileId} onValueChange={setExistingFileId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a file" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFiles.map((file) => (
                      <SelectItem key={file.id} value={file.id}>
                        {file.name || file.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div
                  className="border-dashed border-2 border-gray-300 rounded p-4 text-center cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: selectedFile ? "#f0f0f0" : undefined }}
                >
                  {selectedFile ? (
                    <span>Selected file: {selectedFile.name}</span>
                  ) : (
                    <span>Drag and drop a file here, or click to select</span>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fileType" className="text-sm font-medium">
                    File Type
                  </label>
                  <Select 
                    value={fileType} 
                    onValueChange={setFileType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="structured">Structured</SelectItem>
                      <SelectItem value="semi_structured">Semi-structured</SelectItem>
                      <SelectItem value="unstructured">Unstructured</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
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
            <Button 
              type="submit" 
              disabled={isLoading || (isExistingFile && !existingFileId)}
            >
              {isLoading ? "Adding..." : "Add File"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}