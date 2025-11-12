import { useDebugField, useDebugSelect, useDebugToggle } from "@/components/Debug/debugContext";
import { ShipmentForm } from "@/components/ShipmentForm";

export default function NewShipmentPage(){

    // DEBUG: config
    const showLabelPreview = useDebugToggle("shipping", "showLabelPreview");
    const showSidebar = useDebugToggle("shipping", "showSidebar");
    const showBanner = useDebugToggle("shipping", "showBanner");
    const showScaleButton = useDebugToggle("shipping", "showScaleButton");

    const shipmentFormLayout = useDebugSelect("shipping", "shipmentFormLayout");
    const addressFormLayout = useDebugSelect("shipping", "addressFormLayout");

    // Debug API Config
    const apiConfig = {
        baseUrl: useDebugField("api", "apiBaseUrl"),
        ratesEndpoint: useDebugField("api", "ratesEndpoint"),
        buyEndpoint: useDebugField("api", "buyEndpoint"),
        apiKey: useDebugField("api", "apiKey"),
    };

    return (
        <ShipmentForm
            showScaleButton={showScaleButton}
            showLabelPreview={showLabelPreview}
            showSidebar={showSidebar}
            showBanner={showBanner}
            shipmentFormLayout={shipmentFormLayout}
            addressFormLayout={addressFormLayout}

            apiConfig={apiConfig}
        />
    );
};
