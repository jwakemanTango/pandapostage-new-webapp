import { useDebug } from "@/components/Debug/debugContext";
import { Button } from "@/components/ui/button";
import { Menu, Bell, HelpCircle, Settings2 } from "lucide-react";
import { DynamicDebugPanel } from "@/components/Debug/DynamicDebugPanel";
import { FundsBalance } from "@/components/FundsBalance";

type TopBarProps = {
  title: string;
  onMenuClick: () => void;
};

export const TopBar = ({ title, onMenuClick }: TopBarProps) => {
  const { showPanel, togglePanel } = useDebug();

  return (
    <header className="bg-white shadow-sm flex flex-col">
      {/* Top Row */}
      <div className="h-16 flex items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="md:hidden mr-4 text-primary"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-primary">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/*
          <Button
            variant="ghost"
            size="icon"
            className="text-primary"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary"
            title="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          */}

          {/* User Funds Balance */}
          <FundsBalance />

          {/* Debug Button */}
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
        <div className="border-t">
          <DynamicDebugPanel />
        </div>
      )}
    </header>
  );
};

export default TopBar;
