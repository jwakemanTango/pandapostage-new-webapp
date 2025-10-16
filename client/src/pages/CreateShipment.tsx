import { useState } from "react";
import { ShipmentForm } from "@/components/ShipmentForm-FourStep";
import { ShipmentFormFull } from "@/components/ShipmentForm-ThreeStep";
import { Rate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import labelPreviewUrl from "@assets/label_1760604447339.png";

type FormView = "four-step" | "three-step";

const CreateShipment = () => {
  const [formView, setFormView] = useState<FormView>("three-step");
  const [useCompactAddresses, setUseCompactAddresses] = useState(true);
  const [showLiveSummary, setShowLiveSummary] = useState(true);
  const [showLabelPreview, setShowLabelPreview] = useState(false);
  const [showBannerSummary, setShowBannerSummary] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  // TODO: remove mock functionality
  const handleGetRates = (data: any) => {
    console.log('Getting rates for:', data);
    setIsLoadingRates(true);
    
    // Mock API call
    setTimeout(() => {
      const mockRates: Rate[] = [
        {
          id: '1',
          carrier: 'USPS',
          service: 'Priority Mail',
          rate: '$8.50',
          retailRate: '$10.20',
          deliveryDays: 3,
          carrierId: 1,
          labelUrl: labelPreviewUrl,
          labelFormat: 'png'
        },
        {
          id: '2',
          carrier: 'USPS',
          service: 'First Class',
          rate: '$5.20',
          retailRate: '$6.50',
          deliveryDays: 5,
          carrierId: 1,
          labelUrl: labelPreviewUrl,
          labelFormat: 'png'
        },
        {
          id: '3',
          carrier: 'UPS',
          service: 'Ground',
          rate: '$12.75',
          retailRate: '$15.30',
          deliveryDays: 4,
          carrierId: 2,
          labelUrl: labelPreviewUrl,
          labelFormat: 'png'
        },
        {
          id: '4',
          carrier: 'FedEx',
          service: '2Day',
          rate: '$18.99',
          retailRate: '$24.50',
          deliveryDays: 2,
          carrierId: 3,
          labelUrl: labelPreviewUrl,
          labelFormat: 'png'
        },
        {
          id: '5',
          carrier: 'UPS',
          service: '3 Day Select',
          rate: '$14.25',
          retailRate: '$17.80',
          deliveryDays: 3,
          carrierId: 2,
          labelUrl: labelPreviewUrl,
          labelFormat: 'png'
        }
      ];
      
      setRates(mockRates);
      setIsLoadingRates(false);
      
      toast({
        title: "Rates Available",
        description: `Found ${mockRates.length} shipping rate options`,
      });
    }, 1500);
  };

  // TODO: remove mock functionality
  const handlePurchaseLabel = (data: any) => {
    console.log('Purchasing label:', data);
    setIsPurchasing(true);
    
    // Mock API call
    setTimeout(() => {
      setIsPurchasing(false);
      
      toast({
        title: "Label Purchased Successfully",
        description: "Your shipping label has been created and is ready to print.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-3 sm:px-5 py-4 sm:py-8 max-w-[1400px]">
        <div className="mb-4 sm:mb-6">
          <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold mb-1.5">Create Shipment</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Compare rates from multiple carriers and purchase shipping labels
              </p>
            </div>
            
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
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 p-3 bg-muted/30 rounded-lg border mb-3 sm:mb-4">
            <div className="flex items-center gap-3" data-testid="view-toggle">
              <Label htmlFor="view-toggle" className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {formView === "four-step" ? "4-Step Flow" : "3-Step Flow"}
              </Label>
              <Switch
                id="view-toggle"
                checked={formView === "three-step"}
                onCheckedChange={(checked) => setFormView(checked ? "three-step" : "four-step")}
                data-testid="switch-view-toggle"
              />
            </div>
            
            <div className="hidden sm:block h-5 w-px bg-border" />
            
            <div className="flex items-center gap-2">
              <Label htmlFor="compact-addresses-toggle" className="text-xs sm:text-sm whitespace-nowrap">
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
              <Label htmlFor="show-summary-toggle" className="text-xs sm:text-sm whitespace-nowrap">
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
              <Label htmlFor="banner-summary-toggle" className="text-xs sm:text-sm whitespace-nowrap">
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
              <Label htmlFor="label-preview-toggle" className="text-xs sm:text-sm whitespace-nowrap">
                Show Label Preview
              </Label>
              <Switch
                id="label-preview-toggle"
                checked={showLabelPreview}
                onCheckedChange={setShowLabelPreview}
                data-testid="switch-label-preview-global"
              />
            </div>
          </div>
          )}
        </div>
        
        {formView === "four-step" ? (
          <ShipmentForm 
            onGetRates={handleGetRates}
            onPurchaseLabel={handlePurchaseLabel}
            rates={rates}
            isLoadingRates={isLoadingRates}
            isPurchasing={isPurchasing}
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
            isLoadingRates={isLoadingRates}
            isPurchasing={isPurchasing}
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
