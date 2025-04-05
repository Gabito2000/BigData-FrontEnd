import React from 'react'
import { HardDrive } from 'lucide-react'

export const StorageInfo: React.FC<{ storage: { total: number, used: number } }> = ({ storage }) => {
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