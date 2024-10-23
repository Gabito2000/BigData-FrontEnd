'use client'

import React, { useState } from 'react'
import { Folder, File, ChevronRight, ChevronDown, Server, HardDrive, Activity, Plus, ArrowLeft, List, Grid } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

// Tipos (sin cambios)
type FileSystemItem = {
  name: string
  type: 'file' | 'folder'
  size?: number
  modifiedDate: Date
  children?: FileSystemItem[]
}

type Process = {
  id: number
  name: string
  cpu: number
  memory: number
}

type Zone = {
  name: 'landing' | 'raw' | 'trusted' | 'archival' | 'sandbox' | 'refined'
  size: number
  files: number
}

type ServerInfo = {
  name: string
  fileSystem: FileSystemItem
  storage: {
    total: number
    used: number
  }
  processes: Process[]
  zones: Zone[]
}

// Datos de ejemplo (sin cambios)
const initialServersData: ServerInfo[] = [
  {
    name: "Servidor 1",
    fileSystem: {
      name: 'root',
      type: 'folder',
      modifiedDate: new Date('2023-01-01'),
      children: [
        {
          name: 'Documents',
          type: 'folder',
          modifiedDate: new Date('2023-03-15'),
          children: [
            { name: 'report.docx', type: 'file', size: 1024 * 1024, modifiedDate: new Date('2023-03-20') },
            { name: 'data.xlsx', type: 'file', size: 2 * 1024 * 1024, modifiedDate: new Date('2023-03-22') },
          ],
        },
        {
          name: 'Images',
          type: 'folder',
          modifiedDate: new Date('2023-02-10'),
          children: [
            { name: 'photo1.jpg', type: 'file', size: 3 * 1024 * 1024, modifiedDate: new Date('2023-02-15') },
            { name: 'photo2.png', type: 'file', size: 2.5 * 1024 * 1024, modifiedDate: new Date('2023-02-18') },
          ],
        },
        { name: 'notes.txt', type: 'file', size: 256, modifiedDate: new Date('2023-01-05') },
      ],
    },
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
  // ... (mantener el Servidor 2 como estaba)
]

// Componente para mostrar el espacio de almacenamiento
const StorageInfo: React.FC<{ storage: { total: number, used: number } }> = ({ storage }) => {
  const usedPercentage = (storage.used / storage.total) * 100
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Almacenamiento</h3>
      <div className="flex items-center">
        <HardDrive className="w-5 h-5 mr-2" />
        <div className="flex-grow">
          <div className="h-4 bg-gray-200 rounded">
            <div 
              className="h-4 bg-blue-500 rounded" 
              style={{ width: `${usedPercentage}%` }}
            ></div>
          </div>
        </div>
        <span className="ml-2 text-sm">
          {storage.used} GB / {storage.total} GB
        </span>
      </div>
    </div>
  )
}

// Componente para mostrar los procesos
const ProcessList: React.FC<{ processes: Process[] }> = ({ processes }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Procesos</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>CPU (%)</TableHead>
            <TableHead>Memoria (GB)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processes.map((process) => (
            <TableRow key={process.id}>
              <TableCell>{process.id}</TableCell>
              <TableCell>{process.name}</TableCell>
              <TableCell>{process.cpu.toFixed(1)}</TableCell>
              <TableCell>{process.memory.toFixed(1)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Componente para visualizar zonas
const ZoneViewer: React.FC<{ zones: Zone[] }> = ({ zones }) => {
  const totalSize = zones.reduce((acc, zone) => acc + zone.size, 0)

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">Zonas</h3>
      <div className="space-y-2">
        {zones.map((zone) => (
          <div key={zone.name} className="flex items-center">
            <div className="w-24 font-medium">{zone.name}</div>
            <div className="flex-grow mx-2">
              <div className="h-4 bg-gray-200 rounded">
                <div 
                  className="h-4 bg-green-500 rounded" 
                  style={{ width: `${(zone.size / totalSize) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-32 text-sm text-right">{zone.size} GB / {zone.files} archivos</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Componente para la visualización de archivos estilo Windows
const WindowsStyleFileViewer: React.FC<{ fileSystem: FileSystemItem }> = ({ fileSystem }) => {
  const [currentPath, setCurrentPath] = useState<FileSystemItem[]>([fileSystem])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const currentFolder = currentPath[currentPath.length - 1]

  const navigateToFolder = (folder: FileSystemItem) => {
    setCurrentPath([...currentPath, folder])
  }

  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  const formatFileSize = (size: number | undefined) => {
    if (size === undefined) return 'N/A'
    const units = ['B', 'KB', 'MB', 'GB']
    let index = 0
    while (size >= 1024 && index < units.length - 1) {
      size /= 1024
      index++
    }
    return `${size.toFixed(1)} ${units[index]}`
  }

  return (
    <div className="border rounded h-full flex flex-col">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={navigateUp} disabled={currentPath.length === 1}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="ml-2">{currentPath.map(f => f.name).join(' > ')}</span>
        </div>
        <div>
          <Button variant="ghost" size="sm" onClick={() => setViewMode('list')}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewMode('grid')}>
            <Grid className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-grow">
        {viewMode === 'list' ? (
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
              {currentFolder.children?.map((item) => (
                <TableRow key={item.name} className="cursor-pointer hover:bg-gray-100" onClick={() => item.type === 'folder' && navigateToFolder(item)}>
                  <TableCell className="flex items-center">
                    {item.type === 'folder' ? <Folder className="w-4 h-4 mr-2" /> : <File className="w-4 h-4 mr-2" />}
                    {item.name}
                  </TableCell>
                  <TableCell>{item.type === 'folder' ? 'Carpeta' : 'Archivo'}</TableCell>
                  <TableCell>{formatFileSize(item.size)}</TableCell>
                  <TableCell>{item.modifiedDate.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
            {currentFolder.children?.map((item) => (
              <div key={item.name} className="flex flex-col items-center cursor-pointer" onClick={() => item.type === 'folder' && navigateToFolder(item)}>
                {item.type === 'folder' ? <Folder className="w-12 h-12" /> : <File className="w-12 h-12" />}
                <span className="mt-2 text-center text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// Componente principal actualizado
export function FullScreenServerAdminDashboardComponent() {
  const [selectedServer, setSelectedServer] = useState(0)
  const [serversData, setServersData] = useState(initialServersData)
  const [isAddServerDialogOpen, setIsAddServerDialogOpen] = useState(false)
  const [newServerName, setNewServerName] = useState('')

  const addServer = () => {
    if (newServerName.trim() !== '') {
      const newServer: ServerInfo = {
        name: newServerName,
        fileSystem: { 
          name: 'root', 
          type: 'folder', 
          modifiedDate: new Date(),
          children: [] 
        },
        storage: { total: 1000, used: 0 },
        processes: [],
        zones: [
          { name: 'landing', size: 0, files: 0 },
          { name: 'raw', size: 0, files: 0 },
          { name: 'trusted', size: 0, files: 0 },
          { name: 'archival', size: 0, files: 0 },
          { name: 'sandbox', size: 0, files: 0 },
          { name: 'refined', size: 0, files: 0 },
        ]
      }
      setServersData([...serversData, newServer])
      setNewServerName('')
      setIsAddServerDialogOpen(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Panel de Control de Servidores</h2>
        <Dialog open={isAddServerDialogOpen} onOpenChange={setIsAddServerDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Servidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Servidor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={addServer}>Agregar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex border-b overflow-x-auto">
        {serversData.map((server, index) => (
          <button
            key={index}
            className={`px-4  py-2 whitespace-nowrap ${selectedServer === index ? 'bg-white border-b-2 border-blue-500' : 
            'bg-gray-100'}`}
            onClick={() => setSelectedServer(index)}
          >
            <Server className="w-4 h-4 inline-block mr-2" />
            {server.name}
          </button>
        ))}
      </div>
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/3 p-4 border-r overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4">{serversData[selectedServer].name}</h3>
          <StorageInfo storage={serversData[selectedServer].storage} />
          <ZoneViewer zones={serversData[selectedServer].zones} />
          <ProcessList processes={serversData[selectedServer].processes} />
        </div>
        <div className="w-2/3 p-4 overflow-hidden">
          <h3 className="text-lg font-semibold mb-2">Sistema de Archivos</h3>
          <div className="h-[calc(100%-2rem)]">
            <WindowsStyleFileViewer fileSystem={serversData[selectedServer].fileSystem} />
          </div>
        </div>
      </div>
    </div>
  )
}