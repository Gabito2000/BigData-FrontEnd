import React from "react";
import { ServerInfo } from "@/lib/types";
import { StorageInfo } from "@/components/screens/main-layout/storage-info";
import { ZoneViewer } from "@/components/screens/main-layout/zone-viewer";
import { ProcessList } from "@/components/screens/main-layout/process-list";

export const ServerSidebar: React.FC<{ serverInfo: ServerInfo }> = ({
  serverInfo,
}) => {
  return (
    <div className="w-1/3 p-4 border-r overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">{serverInfo.name}</h3>

      <StorageInfo storage={serverInfo.storage} />
      <ZoneViewer zones={serverInfo.zones} />
      <ProcessList pipelines={serverInfo.pipelines} />
    </div>
  );
};
