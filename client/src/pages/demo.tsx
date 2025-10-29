import { useDebugField, useDebugToggle } from "@/lib/debugContext";
import { DebugBanner } from "@/components/Debug/DebugBanner";
import { UsbScaleMonitor } from "@/components/Debug/UsbScaleMonitor";
import { ShipmentForm } from "@/components/ShipmentForm";


export const DebugBannerDemo = () => {

  const showScaleMonitor = useDebugToggle("devices", "showScaleMonitor");
  const showShipmentForm = useDebugToggle("shipping", "showForm");
  const showLabelPreview = useDebugToggle("shipping", "showLabelPreview");
  const showSidebar = useDebugToggle("shipping", "showSidebar");
  const showBanner = useDebugToggle("shipping", "showBanner");
  const showScaleButton = useDebugToggle("shipping", "showScaleButton");

  const apiConfig = {
    baseUrl: useDebugField("api", "apiBaseUrl"),
    ratesEndpoint: useDebugField("api", "ratesEndpoint"),
    buyEndpoint: useDebugField("api", "buyEndpoint"),
    apiKey: useDebugField("api", "apiKey"),
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <DebugBanner />

      {showScaleMonitor && (
        <div className="mt-4">
          <UsbScaleMonitor />
        </div>
      )}

      {showShipmentForm && (
        <ShipmentForm
          showScaleButton={showScaleButton}
          showLabelPreview={showLabelPreview}
          showSidebar={showSidebar}
          showBanner={showBanner} 
          apiConfig={apiConfig}        
          />
      )}

    </div>
  );
};

export default DebugBannerDemo;
