import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CreateShipment from "@/pages/CreateShipment";
import LabelSummaryExample from "@/pages/examples/LabelSummary";
import NotFound from "@/pages/not-found";
import UsbScaleReader from "./components/UsbScaleReader/UsbScaleExample";
import UsbScaleReader2 from "./components/UsbScaleReader/UsbScaleExample2";
import { UsbScaleMonitor } from "./components/UsbScaleReader/UsbScaleMonitor";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateShipment} />
      <Route path="/scaletest" component={UsbScaleMonitor} />
      <Route path="/examples/label-summary" component={LabelSummaryExample} />
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
