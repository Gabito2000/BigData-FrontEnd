import { FileSystemItem } from './types'

// Base URL for API requests
const API_BASE_URL = 'http://localhost:8000';


import type {
  BackendPipeline,
  Pipeline,
  Flow,
  BackendFlow,
  Tag,
  TaggedElements,
  File,
  FlowCreateData
} from './types';



function convertBackendPipelineToPipeline(pipeline: BackendPipeline): Pipeline {
  const element = {
    id: pipeline.id,
    name: pipeline.id, // Using id as name since name is not provided in backend
    zone: pipeline.zone as "Landing" | "Raw" | "Trusted" | "Refined",
    worker: {
      input: [
        ...pipeline.datasets.filter(d => d.isInput).map(d => ({
          id: d.id,
          name: d.id, // Using id as name since name is not provided
          type: 'dataset' as const,
          is_input: true
        })),
        ...pipeline.workers
          .filter(w => w.id !== null)
          .map(w => ({
            id: w.id as string,
            name: w.id as string, // Using id as name since name is not provided
            type: 'worker' as const
          }))
      ],
      output: pipeline.datasets.filter(d => d.isOutput).map(d => ({
        id: d.id,
        name: d.id, // Using id as name since name is not provided
        type: 'dataset' as const,
        is_input: false
      }))
    }
  };
  console.log("element", element)
  return element;
}

export const fetchFlows = async (): Promise<Flow[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/flows`);
    if (!response.ok) {
      throw new Error(`Failed to fetch flows: ${response.statusText}`);
    }
    const flows: BackendFlow[] = await response.json();
    
    return flows.map((flow) => ({
      id: flow.id,
      name: flow.id, // Using id as name since name is not provided
      pipelines: flow.pipelines.map(pipeline => convertBackendPipelineToPipeline(pipeline))
    }));
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
};


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

export async function fetchFilesByDataset(datasetId: string): Promise<File[]> {
  try {
    // Update the API endpoint to include the base URL
    const response = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}/files`);
    if (!response.ok) {
      throw new Error(`Error fetching files: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}

export async function fetchAllFiles(): Promise<{id: string, name: string}[]> {
  const response = await fetch(`${API_BASE_URL}/api/files`);
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }
  return response.json();
}

export async function createFlow(flowData: FlowCreateData) {
  const response = await fetch(`${API_BASE_URL}/api/flows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(flowData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create flow');
  }

  return response.json();
}

// Modified create functions to match backend expectations
export async function createPipeline(processData: { id: string; name: string; flow_id: string; zone: string }) {
  const pipelineData = {
    id: processData.id,
    name: processData.name,
    flow_id: processData.flow_id,
    zone: processData.zone
  };

  const response = await fetch(`${API_BASE_URL}/api/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pipelineData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create pipeline');
  }
  return response.json();
}

export async function createWorker(workerData: { id: string; name: string; process_id: string }) {
  const response = await fetch(`${API_BASE_URL}/api/workers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workerData),
  });
  if (!response.ok) {
    throw new Error('Failed to create worker');
  }
  return response.json();
}

export async function createDataset(datasetData: { 
  id: string; 
  name: string; 
  process_id: string; 
  sourceUrl?: string;
  is_input: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/api/datasets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datasetData),
  });
  if (!response.ok) {
    throw new Error('Failed to create dataset');
  }
  return response.json();
}

export async function createTransformation(transformationData: { id: string; name: string; worker_id: string; file_id: string[] }) {
  const response = await fetch(`${API_BASE_URL}/api/transformations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformationData),
  });
  if (!response.ok) {
    throw new Error('Failed to create transformation');
  }
  return response.json();
}

export async function createFile(fileData: { id: string; dataset_id: string; fileType: string; file_path?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: fileData.id,
      dataset_id: fileData.dataset_id,
      fileType: fileData.fileType,  // Remove toUpperCase()
      file_path: fileData.file_path || null
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to create file' }));
    throw new Error(error.detail || 'Failed to create file');
  }
  return response.json();
}

export async function fetchScriptsByWorker(workerId: string): Promise<File[]> {
  try {
    // Fixed endpoint to use plural 'transformations' instead of singular
    const response = await fetch(`${API_BASE_URL}/api/workers/${workerId}/transformations`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transformations for worker ${workerId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching worker transformations:', error);
    return [];
  }
}

export async function associateWorkerWithPipeline(workerId: string, processId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/asociate_worker?worker_id=${encodeURIComponent(workerId)}&process_id=${encodeURIComponent(processId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to associate worker with process');
  }
  return response.json();
}

export async function associateDatasetWithPipeline(datasetId: string, processId: string, isInput: boolean) {
  const response = await fetch(
    `${API_BASE_URL}/api/associate_dataset?dataset_id=${encodeURIComponent(datasetId)}&process_id=${encodeURIComponent(processId)}&is_input=${isInput}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to associate dataset with process');
  }
  return response.json();
}

export async function associateFileToDataset(fileId: string, datasetId: string) {
  const response = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}/files/${fileId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to associate file' }));
    throw new Error(error.detail || 'Failed to associate file');
  }
  return response.json();
}
