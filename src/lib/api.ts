import { FileSystemItem } from './types'

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000';

// Types for data lake flow management
export type Process = {
  id: string;
  name: string;
  zone: "Landing" | "Raw" | "Trusted" | "Refined";
  worker: {
    input: ProcessItem[];
    output: ProcessItem[];
  };
};

export type ProcessItem = Dataset | Worker;

export type Dataset = {
  id: string;
  name: string;
  sourceUrl?: string;
};

export type Worker = {
  id: string;
  name: string;
};

export type Flow = {
  id: string;
  name: string;
  processes: Process[];
};

// This is a mock API function to simulate fetching file system data
export const fetchFileSystemData = async (path: string): Promise<FileSystemItem> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Mock data
  const mockData: FileSystemItem = {
    name: path,
    type: 'folder',
    modifiedDate: new Date(),
    children: [
      {
        name: 'New Folder',
        type: 'folder',
        modifiedDate: new Date(),
        children: []
      },
      {
        name: 'New File.txt',
        type: 'file',
        size: 1024,
        modifiedDate: new Date()
      }
    ]
  }

  console.log(`Fetched file system data for path: ${path}`, mockData)
  return mockData
}

// Fetch all flows from the backend
export const fetchFlows = async (): Promise<Flow[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flows`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flows: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
}

// Create a new flow
export const createFlow = async (flowData: { id: string; name: string }): Promise<Flow> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flowData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create flow: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating flow:', error);
    throw error;
  }
}

// Create a new process
export const createProcess = async (processData: {
  id: string;
  name: string;
  flow_id: string;
  zone: string;
}): Promise<Process> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/processes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(processData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create process: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating process:', error);
    throw error;
  }
}

// Create a new dataset
export const createDataset = async (datasetData: {
  id: string;
  name: string;
  process_id: string;
  sourceUrl?: string;
}): Promise<Dataset> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/datasets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datasetData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create dataset: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating dataset:', error);
    throw error;
  }
}

// Create a new worker
export const createWorker = async (workerData: {
  id: string;
  name: string;
  process_id: string;
}): Promise<Worker> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workerData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create worker: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating worker:', error);
    throw error;
  }
}

// Add these types for tag management
export type Tag = {
  id: string;
  count?: number;
};

export type TaggedElements = {
  users: any[];
  zones: any[];
  flows: Flow[];
  processes: any[];
  datasets: any[];
  workers: any[];
  files: any[];
  transformations: any[];
};

// Add these functions to fetch tags and tagged elements
export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const fetchElementsByTag = async (tagId: string): Promise<TaggedElements> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tags/${tagId}/elements`);
    if (!response.ok) {
      throw new Error(`Failed to fetch elements by tag: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching elements by tag:', error);
    throw error;
  }
};