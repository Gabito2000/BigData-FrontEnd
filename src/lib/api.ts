// --- User Permissions API ---
export type UserType = string;
export type FlowPrivilege = string;
export type User = {
  id: number | string;
  name: string;
  email: string;
  userTypes: UserType[];
  flowPrivileges: FlowPrivilege[];
  password?: string; // Optional, only used for creation/edit
};
export type FlowApiType = { id?: string; name?: string } | string;

export async function fetchUsers(): Promise<User[]> {
  // Try both endpoints for compatibility
  let res = await fetch(`${API_BASE_URL}/api/users`);
  if (res.status === 404) {
    res = await fetch(`${API_BASE_URL}/api/get_users`);
  }
  if (!res.ok) throw new Error('Error fetching users');
  return res.json();
}

// Update user permissions (POST /api/users/:id/permissions or /api/update_user_permissions)
export async function updateUserPermissions(
  userId: string | number,
  userTypes: UserType[],
  flowPrivileges: FlowPrivilege[],
  name?: string,
  email?: string,
  password?: string
): Promise<void> {
  let body: any = { userTypes, flowPrivileges };
  if (name !== undefined) body.name = name;
  if (email !== undefined) body.email = email;
  if (password !== undefined && password !== '') body.password = password;
  let res = await fetch(`${API_BASE_URL}/api/users/${userId}/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 404) {
    res = await fetch(`${API_BASE_URL}/api/update_user_permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...body }),
    });
  }
  if (!res.ok) throw new Error('Error updating permissions');
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  let res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  if (res.status === 404) {
    res = await fetch(`${API_BASE_URL}/api/add_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
  }
  if (!res.ok) throw new Error('Error adding user');
  return res.json();
}
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
  // Log the backend pipeline for debugging
  console.log('Backend pipeline received:', pipeline);
  // Use the original dataset objects for both input and output, so a dataset can appear in both
  const inputDatasets = (pipeline.datasets || [])
    .filter((d: any) => d.isInput)
    .map((d: any) => ({
      ...d,
      id: d.id,
      name: d.name || d.id,
      type: 'dataset' as const,
      isInput: true,
      isOutput: !!d.isOutput
    }));
  const outputDatasets = (pipeline.datasets || [])
    .filter((d: any) => d.isOutput)
    .map((d: any) => ({
      ...d,
      id: d.id,
      name: d.name || d.id,
      type: 'dataset' as const,
      isInput: !!d.isInput,
      isOutput: true
    }));
  const element = {
    id: pipeline.id,
    name: pipeline.name || pipeline.id, // Prefer name if available
    zone: pipeline.zone as "Landing" | "Raw" | "Trusted" | "Refined",
    worker: {
      input: [
        ...inputDatasets,
        ...(pipeline.workers ? pipeline.workers.filter((w: any) => w.id !== null).map((w: any) => ({
          id: w.id as string,
          name: w.name || w.id as string, // Prefer name if available
          type: 'worker' as const
        })) : [])
      ],
      output: outputDatasets
    }
  };
  console.log("Frontend pipeline element:", element)
  return element;
}

export const fetchFlows = async (): Promise<Flow[]> => {
  try {
    // 1. Fetch all flows (id, name, description)
    const flowsResponse = await fetch(`${API_BASE_URL}/api/flows`);
    if (!flowsResponse.ok) {
      throw new Error(`Failed to fetch flows: ${flowsResponse.statusText}`);
    }
    const flows: BackendFlow[] = await flowsResponse.json();

    // 2. For each flow, fetch its pipelines (direct children)
    const flowsWithPipelines = await Promise.all(
      flows.map(async (flow) => {
        const flowDetailResponse = await fetch(`${API_BASE_URL}/api/flows/${flow.id}`);
        if (!flowDetailResponse.ok) {
          throw new Error(`Failed to fetch flow details for ${flow.id}: ${flowDetailResponse.statusText}`);
        }
        const flowDetail = await flowDetailResponse.json();
        const pipelines = flowDetail.pipelines || [];

        // 3. For each pipeline, fetch its datasets and workers (direct children)
        const pipelinesWithDetails = await Promise.all(
          pipelines.map(async (pipeline: any) => {
            const pipelineDetailResponse = await fetch(`${API_BASE_URL}/api/pipelines/${pipeline.id}`);
            if (!pipelineDetailResponse.ok) {
              throw new Error(`Failed to fetch pipeline details for ${pipeline.id}: ${pipelineDetailResponse.statusText}`);
            }
            const pipelineDetail = await pipelineDetailResponse.json();
            const datasets = pipelineDetail.datasets || [];
            const workers = pipelineDetail.workers || [];

            // 4. For each dataset, fetch its files (direct children)
            const datasetsWithFiles = await Promise.all(
              datasets.map(async (dataset: any) => {
                const datasetDetailResponse = await fetch(`${API_BASE_URL}/api/datasets/${dataset.id}`);
                if (!datasetDetailResponse.ok) {
                  throw new Error(`Failed to fetch dataset details for ${dataset.id}: ${datasetDetailResponse.statusText}`);
                }
                const datasetDetail = await datasetDetailResponse.json();
                return { ...dataset, files: datasetDetail.files || [] };
              })
            );

            // 5. For each worker, fetch its transformations (direct children)
            const workersWithTransformations = await Promise.all(
              workers.map(async (worker: any) => {
                const workerDetailResponse = await fetch(`${API_BASE_URL}/api/workers/${worker.id}`);
                if (!workerDetailResponse.ok) {
                  throw new Error(`Failed to fetch worker details for ${worker.id}: ${workerDetailResponse.statusText}`);
                }
                const workerDetail = await workerDetailResponse.json();
                return { ...worker, transformations: workerDetail.transformations || [] };
              })
            );

            // Attach datasets and workers to pipeline
            return { ...pipeline, datasets: datasetsWithFiles, workers: workersWithTransformations };
          })
        );

        return {
          ...flow,
          pipelines: pipelinesWithDetails.map(convertBackendPipelineToPipeline),
        };
      })
    );
    return flowsWithPipelines;
  } catch (error) {
    console.error('Error fetching flows:', error);
    throw error;
  }
};


export const fetchFileSystemData = async (path: string): Promise<FileSystemItem> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Pass the path as a query parameter to the backend
  const encodedPath = encodeURIComponent(path);
  const mockData = await fetch(`${API_BASE_URL}/api/filesystem?path=${encodedPath}`).then(res => res.json())

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
    // Updated to use the new endpoint that returns the dataset and its files
    const response = await fetch(`${API_BASE_URL}/api/datasets/${datasetId}`);
    if (!response.ok) {
      throw new Error(`Error fetching files: ${response.statusText}`);
    }
    const dataset = await response.json();
    return dataset.files || [];
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

export async function createWorker(workerData: { id: string; pipeline_id: string, output_dataset_id: string }) {
  console.log("Creating worker with data:", workerData);
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
  pipeline_id: string; 
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

export async function createTransformation(transformationData: { id: string; worker_id: string; file_id: string[]; scriptFile: globalThis.File }) {
  const formData = new FormData();
  formData.append("id", transformationData.id);
  formData.append("worker_id", transformationData.worker_id);
  transformationData.file_id.forEach(fid => formData.append("file_id", fid));
  formData.append("scriptFile", transformationData.scriptFile);

  const response = await fetch(`${API_BASE_URL}/api/transformations`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to create transformation");
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
    // Updated to use the new endpoint that returns the worker and its transformations
    const response = await fetch(`${API_BASE_URL}/api/workers/${workerId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch transformations for worker ${workerId}`);
    }
    const worker = await response.json();
    return worker.transformations || [];
  } catch (error) {
    console.error('Error fetching worker transformations:', error);
    return [];
  }
}

export async function associateWorkerWithPipeline(workerId: string, pipelineId: string, outputDatasetId: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/asociate_worker`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        worker_id: workerId,
        pipeline_id: pipelineId,
        output_dataset_id: outputDatasetId
      })
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
    `${API_BASE_URL}/api/associate_dataset?dataset_id=${encodeURIComponent(datasetId)}&pipeline_id=${encodeURIComponent(processId)}&is_input=${isInput}`,
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

export async function executePipeline(pipelineId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/run_pipeline/${pipelineId}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to execute pipeline');
  }
}

export async function fetchDatasets(zone?: string): Promise<{ id: string; name: string; zone?: string }[]> {
  const response = await fetch(`${API_BASE_URL}/api/datasets`);
  if (!response.ok) {
    throw new Error('Failed to fetch datasets');
  }
  const datasets = await response.json();
  return datasets;
}

// Corrected getFileDownloadUrl function
export function getFileDownloadUrl(path: string): string {
  // Ensure the path is properly encoded for use in a URL query parameter
  const encodedPath = encodeURIComponent(path);
  return `${API_BASE_URL}/api/download/${encodedPath}`;
}

export const sendToArchive = async (elementId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/send_to_archival/${elementId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to send to archive');
  }
  
  return response.json();
};

export async function fetchDatasetsForWorkerPipeline(workerId: string): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/workers/${workerId}/datasets`);
  if (!response.ok) {
    throw new Error('Failed to fetch datasets for worker pipeline');
  }
  return response.json();
}

export const fetchPipelinesByFlow = async (flowId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}/pipelines`);
  if (!response.ok) {
    throw new Error('Failed to fetch pipelines for flow');
  }
  return response.json();
};

export const fetchDatasetsAndWorkersByPipeline = async (pipelineId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/pipelines/${pipelineId}/datasets-workers`);
  if (!response.ok) {
    throw new Error('Failed to fetch datasets and workers for pipeline');
  }
  return response.json();
};