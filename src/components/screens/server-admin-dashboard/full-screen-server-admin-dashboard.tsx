import React, { useState } from "react";
import { Plus, Server, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ServerSidebar } from "./server-sidebar";
import { WindowsStyleFileViewer } from "./windows-style-file-viewer";
import {
  ServerInfo,
  initialServersData,
  FileSystemItem,
  FileSystemItemHandler,
} from "@/lib/types";

export function FullScreenServerAdminDashboardComponent() {
  const [selectedServer, setSelectedServer] = useState(0);
  const [serversData, setServersData] = useState(initialServersData);
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false);
  const [newServerName, setNewServerName] = useState("");
  const [newServerURL, setNewServerURL] = useState("");
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);

  const addServer = () => {
    if (newServerName.trim() !== "") {
      const newServer: ServerInfo = {
        name: newServerName,
        url: newServerURL,
        fileSystem: {
          name: "root",
          type: "folder",
          modifiedDate: new Date(),
          children: [],
        },
        storage: { total: 1000, used: 0 },
        pipelines: [],
        zones: [
          { name: "landing", size: 0, files: 0 },
          { name: "raw", size: 0, files: 0 },
          { name: "trusted", size: 0, files: 0 },
          { name: "archival", size: 0, files: 0 },
          { name: "sandbox", size: 0, files: 0 },
          { name: "refined", size: 0, files: 0 },
        ],
      };
      setServersData([...serversData, newServer]);
      setNewServerName("");
      setIsAddServerDialogOpen(false);
    }
  };

  const handleFileSystemRequest = async (path: string) => {
    try {
      const updatedServersData = [...serversData];

      const fileSystemHandler = new FileSystemItemHandler(
        updatedServersData[selectedServer].fileSystem,
        path
      );

      await fileSystemHandler.update(path);

      setServersData(updatedServersData);
    } catch (error) {
      console.error("Error fetching file system data:", error);
    }
  };

  const handleFileClick = (file: FileSystemItem) => {
    setSelectedFile(file);
  };

  const handleBackToFileSystem = () => {
    setSelectedFile(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Server Administration Dashboard
        </h2>
        <Dialog
          open={isAddServerDialogOpen}
          onOpenChange={setIsAddServerDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Server
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Server</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  URL
                </Label>
                <Input
                  id="name"
                  value={newServerName}
                  onChange={(e) => setNewServerURL(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={addServer}>Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex border-b overflow-x-auto">
        {serversData.map((server, index) => (
          <button
            key={index}
            className={`px-4 py-2 whitespace-nowrap ${
              selectedServer === index
                ? "bg-white border-b-2 border-blue-500"
                : "bg-gray-100"
            }`}
            onClick={() => setSelectedServer(index)}
          >
            <Server className="w-4 h-4 inline-block mr-2" />
            {server.name}
          </button>
        ))}
      </div>
      <div className="flex-grow flex overflow-hidden">
        <ServerSidebar serverInfo={serversData[selectedServer]} />
        <div className="w-2/3 p-4 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-2">File Sistem</h3>

          <div
            className="flex-grow flex flex-col"
            // Hide the file viewer when a file is selected
            style={{ display: selectedFile !== null ? "block" : "none" }}
          >
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToFileSystem}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h3 className="text-md font-semibold mb-2">
                {selectedFile?.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold">Type</h4>
                  <p>
                    {selectedFile?.type === "folder" ? "Carpeta" : "Archivo"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Size</h4>
                  <p>{selectedFile?.size} bytes</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">Modified Date</h4>
                  <p>{selectedFile?.modifiedDate.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="h-[calc(100%-2rem)]"
            style={{ display: selectedFile === null ? "block" : "none" }}
          >
            <WindowsStyleFileViewer
              fileSystem={serversData[selectedServer].fileSystem}
              onRequestData={()=> handleFileSystemRequest("")}
              onFileClick={handleFileClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
