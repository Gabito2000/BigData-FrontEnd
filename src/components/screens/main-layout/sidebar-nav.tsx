import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronLeft,
  ChevronRight,
  FolderIcon,
  FileIcon,
  ChevronDown,
  LayoutDashboard,
  BarChart2,
  BookOpen,
  FileText,
  Database,
  Activity,
  List,
  Key,
  HardDrive,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Screen Components
import DataLakeFlowManagerComponent from "@/components/screens/data-lake-flow-manager/data-lake-flow-manager";
import { DataLakeNeo4j } from "@/components/screens/metadatos/neo4j";
import UserPermissions from "@/components/screens/user-permissions/user-permissions";
import { FullScreenServerAdminDashboardComponent } from "@/components/screens/server-admin-dashboard/full-screen-server-admin-dashboard";
import JupyterCuadernos from "@/components/screens/jupyter-cuadernos/jupyter-cuadernos.tsx";
import { PrefectIframe } from "@/components/screens/main-layout/prefect-iframe";
import { FileViewer } from "@/components/screens/file-viewer/FileViewer";

// Utilities/Helpers
import { FileSystemItemHandler } from "@/lib/types";

// Type Definitions
export type FileSystemItem = {
  name: string;
  type: "file" | "folder";
  size?: number;
  modifiedDate: Date;
  children?: FileSystemItem[];
};

// Constants
const MENU_ITEMS = [
  {
    icon: BarChart2,
    label: "Business Intelligence",
    path: "/business-intelligence",
    component: null, // No component for this item, assume external handling or a placeholder
  },
  {
    icon: BookOpen,
    label: "Cuadernos",
    path: "/cuadernos",
    component: JupyterCuadernos,
  },
  {
    icon: FileText,
    label: "Vista de archivos",
    path: "/archivos",
    component: FileViewer,
  },
  {
    icon: Database,
    label: "Flujo de datos",
    path: "/datos",
    component: DataLakeFlowManagerComponent,
  },
  {
    icon: List,
    label: "Vista de procesos",
    path: "/processs",
    component: PrefectIframe,
  },
  {
    icon: Activity,
    label: "Metadatos",
    path: "/metadatos",
    component: DataLakeNeo4j,
  },
  {
    icon: Key,
    label: "Permisos",
    path: "/permisos",
    component: UserPermissions,
  },
  {
    icon: HardDrive,
    label: "Almacenamiento",
    path: "/almacenamiento",
    component: FullScreenServerAdminDashboardComponent,
  },
  {
    icon: Terminal,
    label: "Consola",
    path: "/consola",
    component: null, // Assuming WasmTerminalComponent is still commented out or handled elsewhere
  },
];

/**
 * Formats a file size in bytes to a human-readable string (e.g., "1.5 MB").
 * @param bytes The size in bytes.
 * @returns A formatted string.
 */
function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Renders a recursive file explorer for displaying file system items.
 * Allows opening folders and selecting files.
 */
function FileExplorer({
  items,
  isCollapsed,
  level = 0,
  onFolderOpen,
  onFileSelect,
  currentPath = "",
}: {
  items: FileSystemItem[];
  isCollapsed: boolean;
  level?: number;
  onFolderOpen?: (path: string) => void;
  onFileSelect?: (path: string) => void;
  currentPath?: string;
}) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  const toggleFolder = (item: FileSystemItem) => {
    const folderPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    setOpenFolders((prev) =>
      prev.includes(folderPath) ? prev.filter((p) => p !== folderPath) : [...prev, folderPath]
    );

    if (item.type === "folder" && onFolderOpen) {
      onFolderOpen(folderPath);
    }
  };

  const handleFileClick = (item: FileSystemItem) => {
    if (item.type === "file" && onFileSelect) {
      onFileSelect(`${currentPath}/${item.name}`);
    }
  };

  const renderItem = (item: FileSystemItem) => {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;

    if (item.type === "folder") {
      return (
        <Collapsible open={openFolders.includes(itemPath)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 hover:bg-accent hover:text-accent-foreground h-8",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => toggleFolder(item)}
            >
              <div className="flex items-center gap-2">
                <FolderIcon className="h-4 w-4 shrink-0 text-primary" />
                {!isCollapsed && (
                  <>
                    <span className="truncate">{item.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200",
                        openFolders.includes(itemPath) ? "rotate-0" : "-rotate-90" // Corrected rotation for closed state
                      )}
                    />
                  </>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {item.children && (
              <FileExplorer
                items={item.children}
                isCollapsed={isCollapsed}
                level={level + 1}
                onFolderOpen={onFolderOpen}
                onFileSelect={onFileSelect}
                currentPath={itemPath}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 hover:bg-accent hover:text-accent-foreground h-8",
          isCollapsed && "justify-center px-2"
        )}
        onClick={() => handleFileClick(item)}
      >
        <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between">
            <span className="truncate">{item.name}</span>
            {item.size && (
              <span className="text-xs text-muted-foreground">{formatFileSize(item.size)}</span>
            )}
          </div>
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div
          key={`${currentPath}/${item.name}`}
          style={{ paddingLeft: isCollapsed ? 0 : `${level * 12}px` }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the main sidebar content, including navigation and a file explorer.
 */
function SidebarContent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [fileSystemHandler, setFileSystemHandler] = useState<FileSystemItemHandler | null>(null);
  const [fileStructure, setFileStructure] = useState<FileSystemItem>({
    name: "root",
    type: "folder",
    modifiedDate: new Date(),
    children: [],
  });

  useEffect(() => {
    const initFileSystem = async () => {
      const handler = new FileSystemItemHandler(fileStructure, "");
      await handler.update(""); // Initialize with root content
      setFileSystemHandler(handler);
    };

    initFileSystem();
  }, []); // Empty dependency array means this runs once on mount

  const handleFolderOpen = async (path: string) => {
    if (fileSystemHandler) {
      if (path === fileSystemHandler.path) {
        // If the path is already open, navigate to its route (if applicable)
        navigate(`/files/${encodeURIComponent(path)}`);
        return;
      }
      const updatedData = await fileSystemHandler.update(path);
      setFileStructure({ ...updatedData });
    }
  };

  const handleFileSelect = (path: string) => {
    const urlPath = `/archivos?file=${encodeURIComponent(path)}`;
    navigate(urlPath, {
      state: {
        originalPath: path,
      },
    });
  };

  return (
    <div
      className={cn(
        "border-r border-border bg-background transition-all duration-300 ease-in-out relative flex flex-col h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 h-8 w-8 rounded-full border border-border bg-background z-10" // Added z-10 to ensure it's on top
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center" : "justify-start w-full"
            )}
          >
            <LayoutDashboard className="h-6 w-6 text-primary" />
            {!isCollapsed && <span className="font-bold text-lg text-primary">Explorer</span>}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 hover:bg-accent hover:text-accent-foreground",
                  location.pathname === item.path && "bg-accent text-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </Button>
            ))}
          </div>

          <div className="my-4">
            <Separator />
            {!isCollapsed && (
              <div className="my-2 px-2 text-xs text-muted-foreground">FILES</div>
            )}
          </div>

          {fileStructure.children && (
            <FileExplorer
              items={fileStructure.children}
              isCollapsed={isCollapsed}
              onFolderOpen={handleFolderOpen}
              onFileSelect={handleFileSelect}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * Component to render the content for each routed page.
 */
const PageContent = ({ title, component }: { title: string; component: React.ComponentType | null }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4 text-foreground">{title}</h1>
    <p className="text-muted-foreground">Content for {title}</p>
    <Separator />
    <div className="m-1">{component && React.createElement(component)}</div>
  </div>
);

/**
 * Main component for the sidebar navigation and routing.
 */
export function SidebarNav() {
  return (
    <Router>
      <div className="flex h-screen bg-background">
        <SidebarContent />
        <div className="flex-1 p-0 overflow-auto h-screen">
          <Routes>
            {MENU_ITEMS.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={<PageContent title={item.label} component={item.component} />}
              />
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
}