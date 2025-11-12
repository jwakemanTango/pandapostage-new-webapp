import { useState } from "react";
import { Link, useLocation } from "wouter";
import PandaLogo from "@/components/PandaLogo";
import {
  LogOut,
  User,
  Wrench,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { appRoutes } from "@/AppRoutes";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been logged out of your account.",
        });
        window.location.href = "/auth";
      },
    });
  };

  const toggleCollapse = () => {
    if (!isMobile) setCollapsed((prev) => !prev);
  };

  // --- Dynamic classes ---
  const sidebarWidth = isMobile ? "w-64" : collapsed ? "w-16" : "w-64";
  const sidebarVisibility =
    isMobile && !isMobileOpen ? "-translate-x-full" : "translate-x-0";

  const sidebarClasses = `
    fixed inset-y-0 left-0 flex flex-col h-full
    bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
    shadow-xl transition-all duration-300 ease-in-out transform-gpu
    will-change-[width,transform] overscroll-none
    z-[200]
    ${sidebarWidth} ${sidebarVisibility}
    ${isMobile ? "" : "relative translate-x-0"}
    overflow-x-clip overflow-y-hidden
  `;

  const overlayClasses = `
    fixed inset-0 bg-black/40 transition-all duration-300 ease-in-out
    ${isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"}
    z-[150]
  `;

  const userPermissions = user?.permissions ?? [];
  const userRole = user?.role ?? null;

  const navItems = appRoutes.filter((item) => {
    if (item.divider) return true;
    if (!item.showInSidebar) return false;

    const hasPermission =
      !item.permissions ||
      item.permissions.some((p: string) => userPermissions.includes(p));
    const hasRole = !item.roles || item.roles.includes(userRole);

    return hasPermission && hasRole;
  });

  const activeClasses =
    "bg-[hsl(var(--sidebar-primary)/0.25)] text-white font-semibold border-l-4 border-[hsl(var(--sidebar-primary))]";
  const inactiveClasses =
    "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent)/0.2)] hover:text-[hsl(var(--sidebar-primary))]";

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className={overlayClasses}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header: Logo + Collapse/Close */}
        <div className="relative flex items-center border-b border-[hsl(var(--sidebar-border))] px-4 py-3 flex-none">
          <div className="flex items-center w-full justify-between gap-2">
            <div className="flex-none overflow-hidden">
              {!collapsed && (
                <PandaLogo className="max-h-10 w-auto block object-contain pointer-events-none select-none" />
              )}
            </div>

            <button
              onClick={isMobile ? onCloseMobile : toggleCollapse}
              className="
                bg-[hsl(var(--sidebar-accent)/0.1)]
                border border-[hsl(var(--sidebar-border))]
                rounded-md p-1.5
                hover:bg-[hsl(var(--sidebar-accent)/0.2)]
                hover:text-[hsl(var(--sidebar-primary))]
                transition-all duration-200
                flex items-center justify-center
              "
            >
              {isMobile ? (
                <X className="h-4 w-4" />
              ) : collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="p-4 border-b border-[hsl(var(--sidebar-border))] flex items-center flex-none">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center flex-none">
              <User className="h-5 w-5 text-[hsl(var(--sidebar-foreground))]" />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="font-semibold text-sm text-[hsl(var(--sidebar-foreground))] truncate">
                {user?.name || "Demo User"}
              </p>
              <p className="text-xs opacity-80 truncate">
                {user?.role || "superAdmin"}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul>
            {navItems.map((item, idx) => {
              if (item.divider) {
                return (
                  <li key={`divider-${idx}`}>
                    <hr className="my-3 border-[hsl(var(--sidebar-border))]" />
                  </li>
                );
              }

              const isActive = location === item.path;

              return (
                <li key={item.path}>
                  <Link href={item.path} title={item.title}>
                    <div
                      onClick={() => {
                        if (isMobile) onCloseMobile();
                      }}
                      className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 ${
                        collapsed && !isMobile
                          ? "justify-center"
                          : "justify-between"
                      } ${isActive ? activeClasses : inactiveClasses}`}
                    >
                      <div className="flex items-center gap-3 flex-none">
                        {item.icon}
                        {!collapsed && (
                          <span className="whitespace-nowrap">{item.name}</span>
                        )}
                      </div>
                      {!collapsed && item.underConstruction && (
                        <Wrench className="h-4 w-4 ml-2 text-amber-400 flex-none" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div
          className={`p-4 border-t border-[hsl(var(--sidebar-border))] flex-none ${
            collapsed && !isMobile ? "flex justify-center" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            className="flex items-center flex-none transition-colors duration-150
                       text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))]"
          >
            <LogOut className="mr-2 h-5 w-5 flex-none" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
