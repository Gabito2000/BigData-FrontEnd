import { FileSystemItem } from './types'

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