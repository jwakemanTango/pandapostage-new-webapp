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
import UsbScaleMonitor from "./components/UsbScaleReader/UsgScaleDiagnostic";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CreateShipment} />
      <Route path="/scale" component={UsbScaleReader} />
      <Route path="/scaletest" component={UsbScaleMonitor} />
       <Route path="/scale2" component={UsbScaleReader2} />
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
