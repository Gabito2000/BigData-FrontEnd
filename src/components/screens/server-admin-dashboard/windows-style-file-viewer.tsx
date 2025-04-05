import React, { useState, useRef } from "react";
import {
  Folder,
  File,
  ArrowLeft,
  List,
  Grid,
  Search,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { FileSystemItem } from "@/lib/types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface WindowsStyleFileViewerProps {
  fileSystem: FileSystemItem;
  onRequestData: (path: string) => void;
  onFileClick: (file: FileSystemItem) => void;
}

export const WindowsStyleFileViewer: React.FC<WindowsStyleFileViewerProps> = ({
  fileSystem,
  onRequestData,
  onFileClick,
}) => {
  const [currentPath, setCurrentPath] = useState<FileSystemItem[]>([
    fileSystem,
  ]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const updateFolderContents = (
    root: FileSystemItem,
    path: FileSystemItem[],
    newData: FileSystemItem,
    depth: number
  ): FileSystemItem => {
    if (depth === path.length - 1) {
      // We've reached the target folder, update its contents
      return {
        ...root,
        children: newData.children,
      };
    }

    if (!root.children) {
      return root;
    }

    // Find the next folder in the path and update it recursively
    const nextFolder = path[depth + 1];
    const updatedChildren = root.children.map((child) =>
      child.name === nextFolder.name
        ? updateFolderContents(child, path, newData, depth + 1)
        : child
    );

    return {
      ...root,
      children: updatedChildren,
    };
  };

  const navigateToFolder = async (folder: FileSystemItem) => {
    const newPath = [...currentPath, folder];
    setCurrentPath(newPath);

    try {
      // Request new data for the folder
      await onRequestData(folder.name);

      // The parent component will pass the updated fileSystem prop
      // Update the current path with the new data
      const updatedPath = newPath.map((item, index) => {
        if (index === newPath.length - 1) {
          // Return the updated folder data for the last item
          return {
            ...item,
            children:
              fileSystem.children?.find((child) => child.name === item.name)
                ?.children || [],
          };
        }
        return item;
      });

      setCurrentPath(updatedPath);
    } catch (error) {
      console.error("Error navigating to folder:", error);
    }
  };

  const navigateUp = async () => {
    if (currentPath.length > 1) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      const parentFolder = newPath[newPath.length - 1];
      await onRequestData(parentFolder.name);
    }
  };

  const handleFileClick = (file: FileSystemItem) => {
    if (file.type === "file") {
      onFileClick(file);
    } else {
      navigateToFolder(file);
    }
  };

  const formatFileSize = (size: number | undefined) => {
    if (size === undefined) return "N/A";
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }
    return `${size.toFixed(1)} ${units[index]}`;
  };

  const currentFolder = currentPath[currentPath.length - 1];
  const filteredItems =
    currentFolder.children?.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleContextMenuAction = (action: string, item?: FileSystemItem) => {
    console.log(`Action: ${action}, Item: ${item?.name || "current folder"}`);
    // Implement actions here
  };

  return (
    <div className="border rounded h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateUp}
            disabled={currentPath.length === 1}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="ml-2">
            {currentPath.map((f) => f.name).join(" > ")}
          </span>
        </div>
        <div className="flex items-center">
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button variant="ghost" size="sm" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        <ContextMenu>
          <ContextMenuTrigger className="flex-grow">
            {viewMode === "list" ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Fecha de modificación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.name}
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleFileClick(item)}
                    >
                      <TableCell className="flex items-center">
                        {item.type === "folder" ? (
                          <Folder className="w-4 h-4 mr-2" />
                        ) : (
                          <File className="w-4 h-4 mr-2" />
                        )}
                        {item.name}
                      </TableCell>
                      <TableCell>
                        {item.type === "folder" ? "Carpeta" : "Archivo"}
                      </TableCell>
                      <TableCell>{formatFileSize(item.size)}</TableCell>
                      <TableCell>
                        {item.modifiedDate.toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => handleFileClick(item)}
                  >
                    {item.type === "folder" ? (
                      <Folder className="w-12 h-12" />
                    ) : (
                      <File className="w-12 h-12" />
                    )}
                    <span className="mt-2 text-center text-sm">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => handleContextMenuAction("copy")}>
              Copiar
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleContextMenuAction("cut")}>
              Cortar
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleContextMenuAction("paste")}>
              Pegar
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleContextMenuAction("delete")}>
              Eliminar
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => handleContextMenuAction("rename")}>
              Renombrar
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ScrollArea>
    </div>
  );
};
