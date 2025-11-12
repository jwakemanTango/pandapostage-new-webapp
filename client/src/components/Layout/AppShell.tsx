import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useIsMobile } from "@/hooks/use-mobile";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export const AppShell = ({ children, title }: AppShellProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={closeMobileSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={title} onMenuClick={toggleSidebar} />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
