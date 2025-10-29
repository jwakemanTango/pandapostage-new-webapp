
import { useDebug } from "@/lib/debugContext";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { DynamicDebugPanel } from "@/components/Debug/DynamicDebugPanel";

export const DebugBanner = () => {
const { showPanel, togglePanel } = useDebug();

  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePanel}
          className="gap-1.5 text-xs"
        >
          <Settings2 className="h-3.5 w-3.5" />
          DEBUG
        </Button>
      </div>

      {showPanel && (
        <div>
          <p>10-29-25</p>
          <DynamicDebugPanel />
        </div>
      )}
    </div>
  );
};

