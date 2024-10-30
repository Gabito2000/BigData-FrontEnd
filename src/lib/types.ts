import { fetchFileSystemData } from './api';

export type FileSystemItem = {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedDate: Date;
  children?: FileSystemItem[];
};


export class FileSystemItemHandler {
  data: FileSystemItem;
  path: string;

  constructor(data: FileSystemItem, path: string) {
    this.data = data;
    this.path = path;
  }

  public async update(path: string) {

    console.log(`Updating file system data for path: ${path}`);
    this.path = path;
    const newData = await fetchFileSystemData(path);

    // If it's the root path, update the root level
    if (path === "root" || path === "/") {
      this.data.children =
        newData.children;
      return this.data;
    }

    // Navigate to the correct folder in the hierarchy
    const pathParts = path
      .split("/")
      .filter((part) => part !== "" && part !== "root");
    let pathNode = this.data;

    // Navigate through the path to find the target folder
    for (const folderName of pathParts) {
      if (!pathNode.children) {
        pathNode.children = [];
      }

      let nextNode = pathNode.children.find(
        (child) => child.name === folderName
      );

      if (!nextNode) {
        // Create new folder if it doesn't exist
        nextNode = {
          name: folderName,
          type: "folder",
          modifiedDate: new Date(),
          children: [],
        };
        pathNode.children.push(nextNode);
      }

      pathNode = nextNode;
    }

    // Replace the contents of the target folder with the new data
    pathNode.children = newData.children;

    return this.data;
  }
}






export type Process = {
  id: number
  name: string
  cpu: number
  memory: number
}

export type Zone = {
  name: 'landing' | 'raw' | 'trusted' | 'archival' | 'sandbox' | 'refined'
  size: number
  files: number
}

export type ServerInfo = {
  name: string
  url: string
  fileSystem: FileSystemItem
  storage: {
    total: number
    used: number
  }
  processes: Process[]
  zones: Zone[]
}




export const initialServersData: ServerInfo[] = [
  {
    name: "Servidor 1",
    fileSystem: await fetchFileSystemData('root'),
    url: "http://localhost:3001",
    storage: {
      total: 1000,
      used: 400
    },
    processes: [
      { id: 1, name: "nginx", cpu: 0.5, memory: 1.2 },
      { id: 2, name: "mysql", cpu: 1.5, memory: 3.7 },
    ],
    zones: [
      { name: 'landing', size: 100, files: 1000 },
      { name: 'raw', size: 200, files: 2000 },
      { name: 'trusted', size: 150, files: 1500 },
      { name: 'archival', size: 300, files: 3000 },
      { name: 'sandbox', size: 50, files: 500 },
      { name: 'refined', size: 100, files: 1000 },
    ]
  },
  // Add more servers as needed
]