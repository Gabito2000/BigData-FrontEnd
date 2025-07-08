'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, File, Database } from 'lucide-react' // Added Database icon
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator" // Assuming you have a Separator component or can add one

// Define the type for a file or folder node in the explorer
type FileNode = {
  name: string
  type: 'folder' | 'file'
  children?: FileNode[]
}

// Initial structure for the file explorer
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
      { name: 'Tutorials.md', type: 'file' }, // Changed to .md for better file representation
    ],
  },
]

// Sample data to display in the data preview table
const sampleData = [
  { id: 1, name: 'Sample Item A', value: 100 },
  { id: 2, name: 'Sample Item B', value: 200 },
  { id: 3, name: 'Sample Item C', value: 300 },
  { id: 4, name: 'Sample Item D', value: 400 },
]

export function DataLakeExplorerComponent() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [queryResult, setQueryResult] = useState<string | null>(null) // To display query results

  // Toggles the expansion state of a folder
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

  // Handles running a query (placeholder for actual query logic)
  const handleRunQuery = () => {
    if (query.trim()) {
      setQueryResult(`Executing query: "${query}". Results would appear here.`)
    } else {
      setQueryResult('Please enter a query to run.')
    }
  }

  // Recursively renders the file tree
  const renderFileTree = (nodes: FileNode[], path: string = '') => {
    return nodes.map(node => {
      const currentPath = `${path}/${node.name}`
      const isExpanded = expandedFolders.has(currentPath)
      const isSelected = selectedFile === currentPath

      return (
        <div key={currentPath} className="ml-4">
          <div
            className={`flex items-center py-1 cursor-pointer rounded-md transition-colors duration-200 ${
              isSelected ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-100'
            }`}
            onClick={() => node.type === 'folder' ? toggleFolder(currentPath) : setSelectedFile(currentPath)}
          >
            {node.type === 'folder' ? (
              isExpanded ? (
                <ChevronDown size={18} className="mr-1 text-gray-500" />
              ) : (
                <ChevronRight size={18} className="mr-1 text-gray-500" />
              )
            ) : (
              <span className="w-[18px] h-[18px] inline-block mr-1"></span> // Placeholder for alignment
            )}
            {node.type === 'folder' ? (
              <Folder size={18} className="mr-2 text-yellow-600" />
            ) : (
              <File size={18} className="mr-2 text-blue-500" />
            )}
            <span className="text-sm">{node.name}</span>
          </div>
          {node.type === 'folder' && isExpanded && node.children && (
            <div>{renderFileTree(node.children, currentPath)}</div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* File Explorer Pane */}
      <div className="w-1/4 border-r bg-white p-4 overflow-auto shadow-md">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
          <Folder size={24} className="mr-2 text-gray-600" /> File Explorer
        </h2>
        <Separator className="mb-4" />
        {renderFileTree(initialFileStructure)}
      </div>

      {/* Data View Pane */}
      <div className="w-3/4 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <Database size={28} className="mr-3 text-blue-600" /> Data View
          {selectedFile && <span className="ml-3 text-blue-700 text-xl italic">{selectedFile}</span>}
        </h2>

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center h-2/3 text-gray-500">
            <File size={64} className="mb-4" />
            <p className="text-lg">Select a file from the explorer to view its data.</p>
          </div>
        ) : (
          <>
            {/* Metadata Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">File Path:</span> {selectedFile}
                </p>
                <p>
                  <span className="font-medium">Last Modified:</span> {new Date().toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">File Type:</span> {selectedFile.split('.').pop() || 'Folder'}
                </p>
                <p>
                  <span className="font-medium">Size:</span> {(Math.random() * 10 + 0.5).toFixed(2)} MB{' '}
                  {/* Random size for demo */}
                </p>
              </div>
            </div>

            {/* Data Preview Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Data Preview</h3>
              <div className="max-h-80 overflow-auto border rounded-md">
                <Table>
                  <TableHeader className="bg-gray-50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleData.map(item => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-gray-500 mt-3">Showing first {sampleData.length} rows.</p>
            </div>

            {/* Query Data Section */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Query Data</h3>
              <div className="flex gap-3 mb-4">
                <Input
                  type="text"
                  placeholder="Enter your SQL query (e.g., SELECT * FROM table WHERE value > 150)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-grow text-sm p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={handleRunQuery} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                  Run Query
                </Button>
              </div>
              <div className="bg-gray-100 p-4 rounded-md text-gray-700 font-mono text-sm border border-gray-200">
                {queryResult ? <p>{queryResult}</p> : <p className="text-gray-500">Query results will appear here.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}