import { useState } from "react";
import Sidebar from "./Sidebar";
import ContentHeader from "./ContentHeader";
import AppHeader from "./AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebugToggle } from "../Debug/debugContext";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export const AppShell = ({ children, title }: AppShellProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsMobileOpen((prev) => !prev);
  const closeMobileSidebar = () => setIsMobileOpen(false);

  const showTopBar = useDebugToggle("app", "showTopBar");

  return (
    <div className="flex flex-col h-screen">
      {/* Global app header */}
      {showTopBar && (
        <AppHeader />
      )}
      

      {/* Main layout area */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={closeMobileSidebar} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <ContentHeader title={title} onMenuClick={toggleSidebar} />
          <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
