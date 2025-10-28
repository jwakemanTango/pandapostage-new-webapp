import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CreateShipment from "@/pages/CreateShipment";
import NotFound from "@/pages/not-found";
import PackageFormInline from "@/pages/examples/PackageForm-inline";
import { UsbScaleMonitor } from "./components/UsbScaleReader/UsbScaleMontior";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateShipment} />
      <Route path="/scaletest" component={UsbScaleMonitor} />
      <Route path="/examples/package-form" component={PackageFormInline} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
