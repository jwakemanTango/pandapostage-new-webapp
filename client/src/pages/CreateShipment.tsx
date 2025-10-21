import { useState } from "react";
import { ShipmentForm } from "@/components/ShipmentForm-FourStep";
import { ShipmentFormFull } from "@/components/ShipmentForm-ThreeStep";
import { Rate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ApiConfigPanel, useApiConfig } from "@/components/ApiConfig";
import { getShippingRates, purchaseShippingLabel } from "@/lib/directApiClient";

type FormView = "four-step" | "three-step";

const CreateShipment = () => {
  const [formView, setFormView] = useState<FormView>("four-step");
  const [useCompactAddresses, setUseCompactAddresses] = useState(true);
  const [showLiveSummary, setShowLiveSummary] = useState(true);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [showBannerSummary, setShowBannerSummary] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const { toast } = useToast();
  const { config: apiConfig, saveConfig: saveApiConfig, resetConfig: resetApiConfig } = useApiConfig();

  const getRatesMutation = useMutation({
    mutationFn: async (data: any) => {
      // Call external API directly using configured endpoints
      return await getShippingRates(apiConfig, data);
    },
    onSuccess: (data) => {
      setRates(data.rates || []);
      toast({
        title: "Rates Available",
        description: `Found ${data.rates?.length || 0} shipping rate options`,
      });
    },
    onError: (error: any) => {
      console.error("Error getting rates:", error);
      toast({
        title: "Error Getting Rates",
        description: error.message || "Failed to get shipping rates. Please try again.",
        variant: "destructive",
      });
    },
  });

  const purchaseLabelMutation = useMutation({
    mutationFn: async (data: any) => {
      // Call external API directly using configured endpoints
      return await purchaseShippingLabel(apiConfig, data);
    },
    onSuccess: () => {
      toast({
        title: "Label Purchased Successfully",
        description: "Your shipping label has been created and is ready to print.",
      });
    },
    onError: (error: any) => {
      console.error("Error purchasing label:", error);
      toast({
        title: "Error Purchasing Label",
        description: error.message || "Failed to purchase shipping label. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGetRates = (data: any) => {
    console.log("Getting rates for:", data);
    getRatesMutation.mutate(data);
  };

  const handlePurchaseLabel = (data: any) => {
    console.log("Purchasing label:", data);
    
    // Build the purchase request - data should have provider/shipmentId/rateId at top level
    const purchaseRequest = {
      provider: data.provider,
      shipmentId: data.shipmentId,
      rateId: data.rateId,
      reference: data.reference,
    };
    
    purchaseLabelMutation.mutate(purchaseRequest);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 max-w-[1400px]">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start justify-end gap-4 mb-3 sm:mb-4">
            {/* DEBUG Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="gap-1.5 text-xs"
              data-testid="button-debug-toggle"
            >
              <Settings2 className="h-3.5 w-3.5" />
              DEBUG
            </Button>
          </div>

          {showDebugPanel && (
            <div className="space-y-3 mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 p-3 bg-muted/30 rounded-lg border">
                <div
                  className="flex items-center gap-3"
                  data-testid="view-toggle"
                >
                  <Label
                    htmlFor="view-toggle"
                    className="text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    {formView === "four-step" ? "4-Step Flow" : "Compact 3-step flow"}
                  </Label>
                  <Switch
                    id="view-toggle"
                    checked={formView === "three-step"}
                    onCheckedChange={(checked) =>
                      setFormView(checked ? "three-step" : "four-step")
                    }
                    data-testid="switch-view-toggle"
                  />
                </div>

                <div className="hidden sm:block h-5 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="compact-addresses-toggle"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Combine Address Forms
                  </Label>
                  <Switch
                    id="compact-addresses-toggle"
                    checked={useCompactAddresses}
                    onCheckedChange={setUseCompactAddresses}
                    data-testid="switch-compact-addresses-global"
                  />
                </div>

                <div className="hidden sm:block h-5 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="show-summary-toggle"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Show Sidebar Summary
                  </Label>
                  <Switch
                    id="show-summary-toggle"
                    checked={showLiveSummary}
                    onCheckedChange={setShowLiveSummary}
                    data-testid="switch-show-summary-global"
                  />
                </div>

                <div className="hidden sm:block h-5 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="banner-summary-toggle"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Show Banner Summary
                  </Label>
                  <Switch
                    id="banner-summary-toggle"
                    checked={showBannerSummary}
                    onCheckedChange={setShowBannerSummary}
                    data-testid="switch-banner-summary-global"
                  />
                </div>

                <div className="hidden sm:block h-5 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="label-preview-toggle"
                    className="text-xs sm:text-sm whitespace-nowrap"
                  >
                    Show Label Preview (Last step)
                  </Label>
                  <Switch
                    id="label-preview-toggle"
                    checked={showLabelPreview}
                    onCheckedChange={setShowLabelPreview}
                    data-testid="switch-label-preview-global"
                  />
                </div>
              </div>

              <ApiConfigPanel
                config={apiConfig}
                onSave={saveApiConfig}
                onReset={resetApiConfig}
              />
            </div>
          )}
        </div>

        {formView === "four-step" ? (
          <ShipmentForm
            onGetRates={handleGetRates}
            onPurchaseLabel={handlePurchaseLabel}
            rates={rates}
            isLoadingRates={getRatesMutation.isPending}
            isPurchasing={purchaseLabelMutation.isPending}
            useCompactAddresses={useCompactAddresses}
            showLiveSummary={showLiveSummary}
            showLabelPreview={showLabelPreview}
            showBannerSummary={showBannerSummary}
          />
        ) : (
          <ShipmentFormFull
            onGetRates={handleGetRates}
            onPurchaseLabel={handlePurchaseLabel}
            rates={rates}
            isLoadingRates={getRatesMutation.isPending}
            isPurchasing={purchaseLabelMutation.isPending}
            useCompactAddresses={useCompactAddresses}
            showLiveSummary={showLiveSummary}
            showLabelPreview={showLabelPreview}
            showBannerSummary={showBannerSummary}
          />
        )}
      </main>
    </div>
  );
};

export default CreateShipment;
