import { useState } from "react";
import { Link } from "wouter";
import { ShipmentForm } from "@/components/ShipmentForm-Steps";
import { PandaLogo } from "@/components/PandaLogo";
import { Rate } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CreateShipment = () => {
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
          carrierId: 1
        },
        {
          id: '2',
          carrier: 'USPS',
          service: 'First Class',
          rate: '$5.20',
          retailRate: '$6.50',
          deliveryDays: 5,
          carrierId: 1
        },
        {
          id: '3',
          carrier: 'UPS',
          service: 'Ground',
          rate: '$12.75',
          retailRate: '$15.30',
          deliveryDays: 4,
          carrierId: 2
        },
        {
          id: '4',
          carrier: 'FedEx',
          service: '2Day',
          rate: '$18.99',
          retailRate: '$24.50',
          deliveryDays: 2,
          carrierId: 3
        },
        {
          id: '5',
          carrier: 'UPS',
          service: '3 Day Select',
          rate: '$14.25',
          retailRate: '$17.80',
          deliveryDays: 3,
          carrierId: 2
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
      <main className="container mx-auto px-5 py-8 max-w-[1400px]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1.5">Create Shipment</h1>
            <p className="text-sm text-muted-foreground">
              Compare rates from multiple carriers and purchase shipping labels
            </p>
          </div>
          <Link href="/full">
            <Button variant="outline" size="sm" className="gap-2" data-testid="link-full-view">
              Single Page View
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <ShipmentForm 
          onGetRates={handleGetRates}
          onPurchaseLabel={handlePurchaseLabel}
          rates={rates}
          isLoadingRates={isLoadingRates}
          isPurchasing={isPurchasing}
        />
      </main>
    </div>
  );
};

export default CreateShipment;
