'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type FileNode = {
  name: string
  type: 'folder' | 'file'
  children?: FileNode[]
}

const initialFileStructure: FileNode[] = [
  {
    name: 'Landing',
    type: 'folder',
    children: [
      { name: 'Flujo1', type: 'folder' },
      { name: 'Flujo2', type: 'folder' },
      { name: 'Flujo3', type: 'folder' },
    ],
  },
  {
    name: 'Raw',
    type: 'folder',
    children: [
      { name: 'Flujo1', type: 'folder' },
    ],
  },
  {
    name: 'Trusted',
    type: 'folder',
    children: [
      { name: 'Flujo1', type: 'folder' },
    ],
  },
  {
    name: 'Refined',
    type: 'folder',
    children: [
      { name: 'Flujo1', type: 'folder' },
    ],
  },
  {
    name: 'Sandbox',
    type: 'folder',
    children: [
      { name: 'Flujo2', type: 'folder' },
      { name: 'Tutorials', type: 'file' },
    ],
  },
]

const sampleData = [
  { id: 1, name: 'Item 1', value: 100 },
  { id: 2, name: 'Item 2', value: 200 },
  { id: 3, name: 'Item 3', value: 300 },
]

export function DataLakeExplorerComponent() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const renderFileTree = (nodes: FileNode[], path: string = '') => {
    return nodes.map(node => {
      const currentPath = `${path}/${node.name}`
      const isExpanded = expandedFolders.has(currentPath)

      return (
        <div key={currentPath} className="ml-4">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => node.type === 'folder' ? toggleFolder(currentPath) : setSelectedFile(currentPath)}
          >
            {node.type === 'folder' && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            {node.type === 'folder' ? <Folder size={16} className="mr-1" /> : <File size={16} className="mr-1" />}
            <span className={`ml-1 ${selectedFile === currentPath ? 'font-bold' : ''}`}>{node.name}</span>
          </div>
          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, currentPath)}</div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 border-r p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-4">File Explorer</h2>
        {renderFileTree(initialFileStructure)}
      </div>
      <div className="w-3/4 p-4 overflow-auto">
        <h2 className="text-lg font-bold mb-4">Data View: {selectedFile}</h2>
        {selectedFile && (
          <>
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Metadata</h3>
              <p>File Path: {selectedFile}</p>
              <p>Last Modified: {new Date().toLocaleString()}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Data Preview</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="text-md font-semibold mb-2">Query Data</h3>
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Enter your query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button>Run Query</Button>
              </div>
              <div className="bg-muted p-4 rounded">
                <p>Query results will appear here</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}