export type FileSystemItem = {
  name: string
  type: 'file' | 'folder'
  size?: number
  modifiedDate: Date
  children?: FileSystemItem[]
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
  fileSystem: FileSystemItem
  storage: {
    total: number
    used: number
  }
  processes: Process[]
  zones: Zone[]
}


import { fetchFileSystemData } from './api'
export const initialServersData: ServerInfo[] = [
  {
    name: "Servidor 1",
    fileSystem: await fetchFileSystemData('root'),
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