import React, { useState, useEffect } from "react";
import { Route, Routes, Link, useLocation, useNavigate } from "react-router-dom";
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
  Sparkles,
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
                "w-full justify-start gap-2 hover:bg-blue-50 hover:text-blue-700 h-9 rounded-lg transition-all duration-200 group",
                isCollapsed && "justify-center px-2",
                openFolders.includes(itemPath) && "bg-blue-50 text-blue-700"
              )}
              onClick={() => toggleFolder(item)}
            >
              <div className="flex items-center gap-2 w-full">
                <FolderIcon className="h-4 w-4 shrink-0 text-amber-500 group-hover:text-amber-600 transition-colors" />
                {!isCollapsed && (
                  <>
                    <span className="truncate text-sm font-medium flex-1">{item.name}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 text-slate-400",
                        openFolders.includes(itemPath) ? "rotate-0" : "-rotate-90"
                      )}
                    />
                  </>
                )}
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="transition-all duration-200">
            {item.children && (
              <div className="ml-2 border-l border-slate-200 pl-2 mt-1">
                <FileExplorer
                  items={item.children}
                  isCollapsed={isCollapsed}
                  level={level + 1}
                  onFolderOpen={onFolderOpen}
                  onFileSelect={onFileSelect}
                  currentPath={itemPath}
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 hover:bg-green-50 hover:text-green-700 h-9 rounded-lg transition-all duration-200 group",
          isCollapsed && "justify-center px-2"
        )}
        onClick={() => handleFileClick(item)}
      >
        <FileIcon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-green-600 transition-colors" />
        {!isCollapsed && (
          <div className="flex flex-1 items-center justify-between">
            <span className="truncate text-sm font-medium">{item.name}</span>
            {item.size && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {formatFileSize(item.size)}
              </span>
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
        "border-r border-slate-200/60 bg-gradient-to-b from-slate-50 to-white shadow-xl transition-all duration-300 ease-in-out relative flex flex-col h-screen backdrop-blur-sm",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-8 h-9 w-9 rounded-full border border-slate-200 bg-white shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all duration-200 z-10 group"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
        )}
      </Button>

      <div className="p-6 border-b border-slate-200/60 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "flex items-center gap-3",
              isCollapsed ? "justify-center" : "justify-start w-full"
            )}
          >
            <div className="relative">
              <LayoutDashboard className="h-7 w-7 text-white drop-shadow-sm" />
              <Sparkles className="h-3 w-3 text-blue-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-xl text-white tracking-wide drop-shadow-sm">
                Data Explorer
              </span>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-2">
            {MENU_ITEMS.map((item, index) => (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 rounded-xl font-medium transition-all duration-200 group relative overflow-hidden",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl"
                    : "hover:bg-slate-100 hover:shadow-md text-slate-700 hover:text-slate-900",
                  isCollapsed && "justify-center px-2"
                )}
                asChild
              >
                <Link to={item.path}>
                  <div className="relative z-10 flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                      location.pathname === item.path ? "text-white" : "text-slate-600"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate text-sm font-medium">{item.label}</span>
                    )}
                  </div>
                  {location.pathname === item.path && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 animate-pulse" />
                  )}
                </Link>
              </Button>
            ))}
          </div>

          <div className="my-6">
            <Separator className="bg-slate-200" />
            {!isCollapsed && (
              <div className="my-3 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Archivos del Sistema
              </div>
            )}
          </div>

          {fileStructure.children && (
            <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-200/60">
              <FileExplorer
                items={fileStructure.children}
                isCollapsed={isCollapsed}
                onFolderOpen={handleFolderOpen}
                onFileSelect={handleFileSelect}
              />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * Component to render the content for each routed page.
 */

// ...existing code...

const PageContent = ({ title, component }: { title: string; component: React.ComponentType | null }) => {
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setUsername(token ? "Usuario" : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent tracking-tight">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {username && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium text-sm">{username}</span>
            </div>
          )}
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 min-h-[calc(100vh-12rem)]">
          <div className="mb-6">
            <p className="text-slate-600 text-lg leading-relaxed">
              Bienvenido al módulo de{" "}
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {title}
              </span>
            </p>
            <Separator className="mt-4 bg-gradient-to-r from-blue-200 to-indigo-200" />
          </div>
          <div className="relative">
            {component && React.createElement(component)}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main component for the sidebar navigation and routing.
 */
export function SidebarNav() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden">
      <SidebarContent />
      <div className="flex-1 overflow-auto h-screen">
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
  );
}