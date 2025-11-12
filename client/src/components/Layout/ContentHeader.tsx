import { useDebug } from "@/components/Debug/debugContext";
import { Button } from "@/components/ui/button";
import { Menu, Settings2 } from "lucide-react";
import { DynamicDebugPanel } from "@/components/Debug/DynamicDebugPanel";
import { FundsBalance } from "@/components/FundsBalance";
import { useIsMobile } from "@/hooks/use-mobile";
import PandaLogo from "@/components/PandaLogo";

type TopBarProps = {
  title: string;
  onMenuClick?: () => void;
};

export const ContentHeader = ({ title, onMenuClick }: TopBarProps) => {
  const { showPanel, togglePanel } = useDebug();
  const isMobile = useIsMobile();

  return (
    <header className="bg-white shadow-sm flex flex-col border-b border-[hsl(var(--sidebar-border))]">
      {/* Main top bar row */}
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center">
          {isMobile && onMenuClick && (
            <Button
              variant="ghost"
              className="mr-4 text-primary"
              onClick={onMenuClick}
              title="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <h1 className="text-xl font-bold text-primary truncate">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <FundsBalance />

          <Button
            variant="ghost"
            size="sm"
            onClick={togglePanel}
            className="gap-1.5 text-xs text-primary"
            title="Toggle Debug Panel"
          >
            <Settings2 className="h-4 w-4" />
            DEBUG
          </Button>
        </div>
      </div>

      {/* Debug Panel (collapsible below top bar) */}
      {showPanel && (
        <div className="border-t border-[hsl(var(--sidebar-border))] bg-amber-50/40">
          <DynamicDebugPanel />
        </div>
      )}
    </header>
  );
};

export default ContentHeader;
