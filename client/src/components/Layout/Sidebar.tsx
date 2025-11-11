import { Link, useLocation } from "wouter";
import PandaLogo from "@/components/PandaLogo";
import { LogOut, User, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { appRoutes } from "@/AppRoutes";

type SidebarProps = {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
};

const Sidebar = ({ isMobileOpen, onCloseMobile }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();

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

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-20 w-64 h-full flex flex-col
    bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]
    shadow-md transform transition duration-200 ease-in-out
    md:relative md:translate-x-0
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
  `;

  const userPermissions = user?.permissions ?? [];
  const userRole = user?.role ?? null;

  const navItems = appRoutes.filter((item) => {
    // Always allow dividers
    if (item.divider) return true;

    // Must be marked to show in sidebar
    if (!item.showInSidebar) return false;

    // Permission-based visibility
    const hasPermission =
      !item.permissions || item.permissions.some((p:string) => userPermissions.includes(p));

    // Role-based visibility (single role)
    const hasRole =
      !item.roles || item.roles.includes(userRole);

    // Only include item if user meets both conditions
    return hasPermission && hasRole;
  });

  
  const activeClasses =
    "bg-[hsl(var(--sidebar-primary)/0.25)] text-white font-semibold border-l-4 border-[hsl(var(--sidebar-primary))]";
  const inactiveClasses =
    "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent)/0.2)] hover:text-[hsl(var(--sidebar-primary))]";

  return (
    <aside className={sidebarClasses}>
      {/* Logo */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-center">
        <PandaLogo className="h-12 w-auto" />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] flex items-center">
        <div className="w-10 h-10 rounded-full bg-[hsl(var(--sidebar-accent))] flex items-center justify-center">
          <User className="h-5 w-5 text-[hsl(var(--sidebar-foreground))]" />
        </div>
        <div className="ml-3">
          <p className="font-semibold text-sm text-[hsl(var(--sidebar-foreground))]">
            {user?.name || "Demo User"}
          </p>
          <p className="text-xs opacity-80">{user?.role || "superAdmin"}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {navItems.map((item, idx) => {

            // Divider line (from JSON)
            if (item.divider) {
              return (
                <li key={`divider-${idx}`}>
                  <hr className="my-3 border-[hsl(var(--sidebar-border))]" />
                </li>
              );
            }

            // Nav item
            const isActive = location === item.path;

            return (
              <li key={item.path}>
                <Link href={item.path} title="Under construction">
                  <div
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 ${
                      isActive ? activeClasses : inactiveClasses
                    }`}
                  >
                    {/* Left side: Icon + Label */}
                    <div className="flex items-center">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>

                    {/* Under Construction indicator */}
                    {item.underConstruction && <Wrench className="h-4 w-4 ml-2 text-amber-400" />}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[hsl(var(--sidebar-border))]">
        <button
          onClick={handleLogout}
          className="flex items-center transition-colors duration-150
                     text-[hsl(var(--sidebar-foreground))] hover:text-[hsl(var(--sidebar-primary))]"
        >
          <LogOut className="mr-2 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
