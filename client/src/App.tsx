import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { DebugProvider } from "./lib/debugContext";
import demo from "@/pages/demo";

function Router() {
  return (
    <Switch>
      <Route path="/" component={demo} />
      <Route component={NotFound} />
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
