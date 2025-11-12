// --------------------------------------------------------------
// App.tsx — Safe dynamic route mounting with dividers ignored
// --------------------------------------------------------------
import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { DebugProvider } from "@/components/Debug/debugContext";
import AppShell from "@/components/Layout/AppShell";
import { appRoutes } from "./AppRoutes";
import NotFoundPage from "@/pages/catch-alls/NotFound";
import NotImplementedPage from "@/pages/catch-alls/NotImplemented";
import { useHashLocation } from "@/hooks/use-hashLocation";

function withAppShell(
  Component: React.ComponentType | undefined,
  title?: string,
  name?: string
) {
  if (!Component) {
    console.error(`[withAppShell] Undefined component for route "${name || title}"`);
    Component = NotImplementedPage;
  }



  const Wrapped = () => (
    <AppShell title={title || "PandaPostage"}>
      <Component />
    </AppShell>
  );

  Wrapped.displayName = `WithAppShell(${name || title || "Anonymous"})`;
  return Wrapped;
}

function App() {
  const isElectron = !!window?.process?.versions?.electron;
  const useHash = isElectron || import.meta.env.PROD;
  
  // Filter out dividers and anything without a path
  const validRoutes = appRoutes.filter(
    (r) => r.path && !r.divider && typeof r.component !== "undefined"
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DebugProvider>
          <Toaster />
          <Router hook={useHash ? useHashLocation : undefined}>
            <Switch>
              {validRoutes.map(({ path, component, title, name }) => {
                const Page = withAppShell(component, title, name);
                return (
                  <Route key={path} path={path}>
                    <Page />
                  </Route>
                );
              })}

              {/* Catch-all route */}
              <Route>
                <AppShell title="Not Found">
                  <NotFoundPage />
                </AppShell>
              </Route>
            </Switch>
          </Router>
        </DebugProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
