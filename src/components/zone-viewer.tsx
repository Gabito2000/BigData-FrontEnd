import React from "react";
import { Zone } from "../lib/types";

export const ZoneViewer: React.FC<{ zones: Zone[] }> = ({ zones }) => {
  const totalSize = zones.reduce((acc, zone) => acc + zone.size, 0);

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
            <div className="w-32 text-sm text-right">
              {zone.size} GB / {zone.files} archivos
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
