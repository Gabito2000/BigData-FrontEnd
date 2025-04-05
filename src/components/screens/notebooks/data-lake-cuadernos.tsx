"use client";

import React, { useState, useEffect } from "react";
import Iframe from "react-iframe";
import { ChevronRight, ChevronDown, Folder, File, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FileNode = {
  name: string;
  type: "folder" | "file";
  children?: FileNode[];
};

const initialFileStructure: FileNode[] = [
  {
    name: "Notebooks",
    type: "folder",
    children: [
      { name: "data_analysis.ipynb", type: "file" },
      { name: "visualization.ipynb", type: "file" },
      { name: "machine_learning.ipynb", type: "file" },
    ],
  },
  {
    name: "Data",
    type: "folder",
    children: [
      { name: "sample_data.parquet", type: "file" },
      { name: "customers.csv", type: "file" },
    ],
  },
];

export function DataLakeCuadernos() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["Notebooks", "Data"])
  );
  const [jupyterStatus, setJupyterStatus] = useState<"loading" | "running" | "error">("loading");
  const [jupyterUrl, setJupyterUrl] = useState("http://localhost:8888");
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"message" | "iframe">("message");
  
  const openJupyterInNewWindow = () => {
    window.open(jupyterUrl, '_blank', 'noopener,noreferrer');
  };
  
  const openJupyterInSameWindow = () => {
    // Try to use iframe mode first
    setDisplayMode("iframe");
  };
  
  useEffect(() => {
    // Check if Jupyter server is running when component mounts
    checkJupyterStatus();
  }, []);
  
  // Retry connection if status is error, but limit attempts
  useEffect(() => {
    if (jupyterStatus === "error" && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        checkJupyterStatus();
        setConnectionAttempts(prev => prev + 1);
      }, 5000); // Retry every 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [jupyterStatus, connectionAttempts]);
  
  const checkJupyterStatus = async () => {
    setJupyterStatus("loading");
    setErrorMessage(null);
    
    try {
      // First try direct connection to Jupyter
      try {
        const response = await fetch(jupyterUrl, { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: {
            'Pragma': 'no-cache'
          }
        });
        
        // If we get here, the server is likely running
        setJupyterStatus("running");
        return;
      } catch (directError) {
        // Direct connection failed, try through API
        console.log("Direct connection failed, trying through API");
      }
      
      // Try through backend API
      const response = await fetch('http://localhost:5000/api/check-jupyter', {
        cache: 'no-cache',
        headers: {
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.running) {
        setJupyterStatus("running");
        if (data.url) {
          setJupyterUrl(data.url);
        }
      } else {
        setJupyterStatus("error");
        setErrorMessage(data.message || "Jupyter server is not running");
      }
    } catch (error) {
      console.error("Error checking Jupyter status:", error);
      setJupyterStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to connect to Jupyter server");
    }
  };
  
  const startJupyterServer = async () => {
    setJupyterStatus("loading");
    setErrorMessage(null);
    
    try {
      // Update to use a configuration that allows embedding
      const response = await fetch('http://localhost:5000/api/start-jupyter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allowEmbedding: true  // Add this parameter to your API
        })
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Wait a moment for the server to fully start
        setTimeout(async () => {
          await checkJupyterStatus();
        }, 5000); // Increased timeout to 5 seconds for server startup
      } else {
        setJupyterStatus("error");
        setErrorMessage(data.message || "Failed to start Jupyter server");
        console.error("Failed to start Jupyter:", data.message);
      }
    } catch (error) {
      console.error("Error starting Jupyter server:", error);
      setJupyterStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to start Jupyter server");
    }
  };
  
  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };
  
  const renderFileTree = (nodes: FileNode[], path: string = "") => {
    return nodes.map((node) => {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = expandedFolders.has(currentPath);
  
      return (
        <div key={currentPath} className="ml-4">
          <div
            className="flex items-center cursor-pointer py-1"
            onClick={() =>
              node.type === "folder"
                ? toggleFolder(currentPath)
                : setSelectedFile(currentPath)
            }
          >
            {node.type === "folder" && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
            {node.type === "folder" ? (
              <Folder size={16} className="mr-1" />
            ) : (
              <File size={16} className="mr-1" />
            )}
            <span className={`ml-1 ${selectedFile === currentPath ? "font-bold" : ""}`}>
              {node.name}
            </span>
          </div>
          {node.type === "folder" && isExpanded && node.children && (
            <div>{renderFileTree(node.children, currentPath)}</div>
          )}
        </div>
      );
    });
  };
  
  const handleIframeLoad = () => {
    console.log("Jupyter iframe loaded successfully");
  };
  
  const handleIframeError = () => {
    console.error("Failed to load Jupyter iframe");
    setErrorMessage("Browser security may be blocking the iframe. Try opening in a new window instead.");
  };
  
  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-4">Jupyter Files</h2>
        {renderFileTree(initialFileStructure)}
      </div>
      <div className="w-3/4 p-4 overflow-auto">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Jupyter Notebook</h2>
          <div className="flex space-x-2">
            <Button 
              onClick={checkJupyterStatus} 
              variant="outline" 
              size="sm"
              disabled={jupyterStatus === "loading"}
            >
              <RefreshCw size={16} className={`mr-2 ${jupyterStatus === "loading" ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {jupyterStatus === "running" && (
              <>
                <Button
                  onClick={openJupyterInSameWindow}
                  variant="outline"
                  size="sm"
                >
                  Open in Same Window
                </Button>
                <Button
                  onClick={openJupyterInNewWindow}
                  variant="default"
                  size="sm"
                >
                  Open in New Window
                </Button>
              </>
            )}
            {jupyterStatus === "error" && (
              <Button 
                onClick={startJupyterServer} 
                variant="default" 
                size="sm"
                disabled={jupyterStatus === "loading"}
              >
                Start Jupyter Server
              </Button>
            )}
          </div>
        </div>
  
        {jupyterStatus === "loading" ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="animate-spin mb-4">
              <RefreshCw size={48} />
            </div>
            <p className="text-lg">Loading Jupyter Notebook...</p>
          </div>
        ) : jupyterStatus === "error" ? (
          <div className="flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-lg mb-4">Jupyter Notebook server is not running</p>
            {errorMessage && <p className="text-sm text-red-500 mb-4">{errorMessage}</p>}
            <p className="text-sm text-gray-500 mb-4">Click the button above to start the server</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-lg mb-4">Jupyter Notebook is running</p>
            <p className="text-sm text-red-500 mb-4">
              Browser security restrictions prevent embedding Jupyter directly in this application.
            </p>
            <p className="text-sm text-gray-500 mb-4">Please choose one of the following options:</p>
            <div className="flex space-x-4 mt-2">
              <Button onClick={openJupyterInSameWindow} variant="outline">Open in Same Window</Button>
              <Button onClick={openJupyterInNewWindow} variant="default">Open in New Window</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}