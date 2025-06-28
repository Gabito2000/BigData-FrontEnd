import React from "react";
import { Button } from "@/components/ui/button";

const HEADER_HEIGHT = 88; // px, ajusta según el header real de PageContent

export interface FullScreenIframeProps {
  url: string;
  title: string;
}

const FullScreenIframe: React.FC<FullScreenIframeProps> = ({ url, title }) => {
  const openInNewWindow = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex w-full min-h-0 flex-1" style={{ height: `calc(90vh - ${HEADER_HEIGHT}px)` }}>
      <div className="w-full h-full flex flex-col items-center justify-start relative bg-gray-100 dark:bg-gray-800 rounded-lg min-h-0">
        <div className="w-full flex justify-end mb-2">
          <Button
            onClick={openInNewWindow}
            variant="default"
            size="icon"
            className="h-7 w-7 p-0 text-xs"
          >
            <span title={`Abrir ${title} en nueva ventana`}>↗</span>
          </Button>
        </div>
        <div className="w-full flex-1 min-h-0" style={{height: `calc(100vh - ${HEADER_HEIGHT}px - 2rem)`}}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            title={title}
            className="w-full h-full border-0 rounded-b-lg"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default FullScreenIframe;
