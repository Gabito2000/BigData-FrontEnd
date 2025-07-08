import React, { useState, useEffect, useCallback } from "react";
import { ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock, Globe, Code2, BookOpen, Database, Upload, List } from "lucide-react";

interface JupyterStatus {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  responseTime: number | null;
  lastChecked: Date | null;
}

interface JupyterRedirectProps {
  customUrl?: string;
  autoCheck?: boolean;
  checkInterval?: number;
}

const JupyterRedirect: React.FC<JupyterRedirectProps> = ({
  customUrl = "http://localhost:8888",
  autoCheck = true,
  checkInterval = 30000,
}) => {
  const [status, setStatus] = useState<JupyterStatus>({
    isOnline: false,
    isLoading: true,
    error: null,
    responseTime: null,
    lastChecked: null
  });
  
  const [jupyterUrl] = useState(customUrl);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Health check function
  const checkJupyterHealth = useCallback(async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = Date.now();
    
    try {
      // Try multiple endpoints to check if Jupyter is running
      const endpoints = ['/api/status', '/api/kernelspecs', '/tree', '/lab'];
      let isReachable = false;
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${jupyterUrl}${endpoint}`, {
            method: 'GET',
            signal: controller.signal,
            mode: 'no-cors'
          });
          
          clearTimeout(timeoutId);
          isReachable = true;
          break;
        } catch (err) {
          continue;
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      if (isReachable) {
        setStatus({
          isOnline: true,
          isLoading: false,
          error: null,
          responseTime,
          lastChecked: new Date()
        });
      } else {
        throw new Error("All endpoints unreachable");
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = "Connection failed";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Connection timeout (5s)";
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = "Server unreachable - is Jupyter running?";
        } else {
          errorMessage = error.message;
        }
      }
      
      setStatus({
        isOnline: false,
        isLoading: false,
        error: errorMessage,
        responseTime,
        lastChecked: new Date()
      });
    }
  }, [jupyterUrl]);

  // Auto health check
  useEffect(() => {
    checkJupyterHealth();
    
    if (!autoCheck) return;
    
    const interval = setInterval(checkJupyterHealth, checkInterval);
    return () => clearInterval(interval);
  }, [checkJupyterHealth, autoCheck, checkInterval]);

  // Redirect to Jupyter
  const redirectToJupyter = useCallback(() => {
    setIsRedirecting(true);
    
    setTimeout(() => {
      window.open(jupyterUrl, '_blank', 'noopener,noreferrer');
      setIsRedirecting(false);
    }, 300);
  }, [jupyterUrl]);

  // Apply URL changes
  const applyUrlChange = () => {
    setJupyterUrl(tempUrl);
    setShowSettings(false);
  };

  // Status indicator component
  const StatusIndicator = () => {
    if (status.isLoading) {
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 bg-amber-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="font-medium text-amber-600">Checking connection...</span>
        </div>
      );
    }

    if (status.isOnline) {
      return (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-emerald-600">Online</span>
            {status.responseTime && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-mono">
                {status.responseTime}ms
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="font-medium text-red-600">Offline</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl shadow-md">📊</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Jupyter Notebooks
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Interactive data science environment powered by Jupyter
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={redirectToJupyter}
            disabled={!status.isOnline || isRedirecting}
            className={`group bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-orange-300 flex items-center justify-between w-full ${
              status.isOnline && !isRedirecting
                ? ''
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                Open Jupyter Lab
              </h3>
              <p className="text-sm text-gray-600 mt-1">Launch the Jupyter interface</p>
            </div>
            {isRedirecting ? (
              <div className="w-5 h-5 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
            ) : (
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            )}
          </button>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Jupyter Status</h3>
              <div className="flex items-center gap-2 mt-1">
                {status.isOnline ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </>
                ) : status.isLoading ? (
                  <>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-amber-600">Checking...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-600">Offline</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={checkJupyterHealth}
              className="group p-2 hover:bg-white/80 rounded-lg transition-all duration-200"
              disabled={status.isLoading}
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors ${status.isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">API Quickstart</h3>
              <p className="text-sm text-gray-600 mt-1">See code examples below</p>
            </div>
            <Code2 className="w-5 h-5 text-purple-500" />
          </div>
        </div>
        {/* DataLake Guide */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">DataLake Fing - Quick Start Guide</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold text-blue-900">1. Upload Files</h3>
              </div>
              <p className="text-sm text-blue-800">Files are stored in your user directory in the sandbox for analysis</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-green-900">2. Process Data</h3>
              </div>
              <p className="text-sm text-green-800">Create notebooks to analyze, transform, and visualize your data</p>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-purple-600" />
                <h3 className="font-semibold text-purple-900">3. Save Results</h3>
              </div>
              <p className="text-sm text-purple-800">Upload processed files to backend using the API endpoint</p>
            </div>
          </div>

          {/* API Examples */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <List className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">List Available Datasets</h3>
              </div>
              <pre className="bg-gray-800 text-green-400 text-xs p-3 rounded-lg overflow-x-auto">
{`import requests

# Get all available datasets
response = requests.get("http://localhost:8000/api/datasets_landing")
datasets = response.json()

for ds in datasets:
    print(f"ID: {ds['id']}, Name: {ds['name']}")`}
              </pre>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Upload File to Backend</h3>
              </div>
              <pre className="bg-gray-800 text-green-400 text-xs p-3 rounded-lg overflow-x-auto">
{`import requests

def upload_file(file_path, file_id, dataset_id, file_type="unstructured"):
    url = "http://localhost:8000/api/files/upload"
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {
            'id': file_id,
            'dataset_id': dataset_id,
            'fileType': file_type  # structured, semi_structured, unstructured
        }
        response = requests.post(url, files=files, data=data)
    
    return response.status_code == 200

# Example usage
upload_file('processed_data.csv', 'my_analysis', 'dataset_landing', 'structured')`}
              </pre>
            </div>
          </div>
        </div>

        {/* What is Jupyter */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-200">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-indigo-900">What is Jupyter?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-indigo-800 mb-4">
                Jupyter Notebooks are interactive documents that combine code, visualizations, and documentation in a single file. Perfect for data science, machine learning, and research workflows.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-indigo-700">Execute code interactively</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-indigo-700">Rich text with Markdown</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-indigo-700">Data visualizations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-indigo-700">Easy sharing & collaboration</span>
                </div>
              </div>
            </div>
            <div className="bg-white/50 rounded-xl p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">File Structure</h3>
              <div className="space-y-1 text-sm text-indigo-700">
                <div>📝 <strong>Cell 1:</strong> Markdown (documentation)</div>
                <div>🐍 <strong>Cell 2:</strong> Python code</div>
                <div>📊 <strong>Cell 3:</strong> Visualization output</div>
                <div>📝 <strong>Cell 4:</strong> Analysis notes</div>
              </div>
              <div className="mt-3 text-xs text-indigo-600">
                Save as <code className="bg-indigo-100 px-1 rounded">.ipynb</code> files
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
      

        
       
};

export default JupyterRedirect;