import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { DebugProvider } from "@/components/Debug/debugContext";
import AppShell from "@/components/Layout/AppShell";
import { appRoutes } from "./AppRoutes";
import NotFoundPage from "@/pages/catch-alls/NotFound";

/**
 * Wrap a page inside AppShell and log its render.
 */
function withAppShell(Component: React.ComponentType, title?: string, name?: string) {
  const Wrapped = () => {
    console.log(
      `%c[Router] Rendering route: ${name || title || "Unnamed Route"}`,
      "color: #268bd2; font-weight: bold;"
    );
    return (
      <AppShell title={title || "PandaPostage"}>
        <Component />
      </AppShell>
    );
  };
  Wrapped.displayName = `WithAppShell(${name || title || "Anonymous"})`;
  return Wrapped;
}

function Router() {
  return (
    <Switch>
      {appRoutes
        .filter((r) => r.path && r.component)
        .map(({ path, component, title, name }) => {
          const Page = withAppShell(component, title, name);
          return (
            <Route key={path} path={path}>
              <Page />
            </Route>
          );
        })}

      {/* --- Catch-All 404 Route --- */}
      <Route>
        {() => (
          <AppShell title="Not Found">
            <NotFoundPage />
          </AppShell>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DebugProvider>
          <Toaster />
          <Router />
        </DebugProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
