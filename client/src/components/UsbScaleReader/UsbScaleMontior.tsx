import { ScaleProvider } from "@/lib/usbScale/scale-react";
import { UsbScaleMonitorInner } from "./UsbScaleMonitor-inner";

export const UsbScaleMonitor = () => (
  <ScaleProvider>
    <UsbScaleMonitorInner />
  </ScaleProvider>
);
