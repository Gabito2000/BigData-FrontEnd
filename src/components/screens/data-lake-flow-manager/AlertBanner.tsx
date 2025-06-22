import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

type AlertState = {
  visible: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
};

interface AlertBannerProps {
  alertState: AlertState;
  onClose: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alertState, onClose }) => {
  if (!alertState.visible) return null;
  return (
    <div className="p-4">
      <Alert variant={alertState.type === 'error' ? 'destructive' : 'default'}>
        {alertState.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
        <AlertTitle>
          {alertState.type.charAt(0).toUpperCase() + alertState.type.slice(1)}
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription>{alertState.message}</AlertDescription>
      </Alert>
    </div>
  );
};
