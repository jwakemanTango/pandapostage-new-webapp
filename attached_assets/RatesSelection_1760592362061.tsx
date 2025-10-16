import { useState, useEffect } from "react";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FaFedex } from "react-icons/fa";
import { SiUsps, SiUps, SiDhl } from "react-icons/si";
import { useLocation } from "wouter";

interface RatesSelectionProps {
  form: any;
  rates?: Rate[];
}

type Rate = {
  id: string;
  carrierId?: number;
  service: string;
  carrier: string;
  rate: string;
  retailRate?: string;
  deliveryDays?: number;
  deliveryDate?: string;
};

const RatesSelection = ({ form, rates: propRates }: RatesSelectionProps) => {
  const [localRates, setLocalRates] = useState<Rate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Function to calculate total weight from lbs and oz
  const calculateWeight = (lbs: string, oz: string) => {
    const lbsNum = parseInt(lbs) || 0;
    const ozNum = parseInt(oz) || 0;
    return (lbsNum + (ozNum / 16)).toFixed(2);
  };
  
  // When propRates changes, update localRates and enhance them with retail rates
  useEffect(() => {
    if (propRates && propRates.length > 0) {
      // Add retail rates (typically 10-30% higher than our rates)
      const enhancedRates = propRates.map((rate: Rate) => {
        const rateValue = parseFloat(rate.rate.replace('$', ''));
        // Generate a higher retail rate (between 10-30% higher)
        const multiplier = 1 + (Math.random() * 0.2 + 0.1); // Between 1.1 and 1.3
        const retailRateValue = (rateValue * multiplier).toFixed(2);
        
        return {
          ...rate,
          retailRate: `$${retailRateValue}`
        };
      });
      
      setLocalRates(enhancedRates);
      setIsLoading(false);
    } else {
      // Clear rates if propRates is empty
      setLocalRates([]);
    }
  }, [propRates]);
  
  // Mutation for purchasing a shipping label
  const purchaseLabelMutation = useMutation({
    mutationFn: async (selectedRate: Rate) => {
      const fromAddress = form.getValues("fromAddress");
      const toAddress = form.getValues("toAddress");
      const packages = form.getValues("packages");
      const additionalServices = form.getValues("additionalServices");
      
      // Prepare the shipment data
      const data = {
        fromAddress,
        toAddress,
        packages,
        additionalServices,
        rateSelection: {
          service: selectedRate.service,
          rate: selectedRate.rate,
          carrierId: selectedRate.carrierId
        }
      };
      
      const response = await apiRequest("POST", "/api/shipments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shipment created",
        description: "Your shipping label has been purchased successfully.",
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Navigate to home/history
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error creating shipment",
        description: `There was an error purchasing your shipping label: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsPurchasing(false);
    }
  });
  
  // Only fetch rates if no rates were provided from parent
  const getRatesMutation = useMutation({
    mutationFn: async () => {
      const fromAddress = form.getValues("fromAddress");
      const toAddress = form.getValues("toAddress");
      const packages = form.getValues("packages");
      
      // Calculate weight for each package
      const processedPackages = packages?.map((pkg: any) => ({
        ...pkg,
        weight: calculateWeight(pkg.weightLbs, pkg.weightOz || "0")
      }));
      
      // Prepare the data for the rates request
      const data = {
        fromAddress,
        toAddress,
        packages: processedPackages
      };
      
      const response = await apiRequest("POST", "/api/shipments/rates", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Add retail rates to each rate
      const ratesWithRetail = (data.rates || []).map((rate: Rate) => {
        const rateValue = parseFloat(rate.rate.replace('$', ''));
        // Generate a higher retail rate (between 10-30% higher)
        const multiplier = 1 + (Math.random() * 0.2 + 0.1); // Between 1.1 and 1.3
        const retailRateValue = (rateValue * multiplier).toFixed(2);
        
        return {
          ...rate,
          retailRate: `$${retailRateValue}`
        };
      });
      
      setLocalRates(ratesWithRetail);
    },
    onError: (error) => {
      toast({
        title: "Error getting rates",
        description: `Unable to retrieve shipping rates: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  // Only fetch rates if none were provided via props
  useEffect(() => {
    if (!propRates || propRates.length === 0) {
      setIsLoading(true);
      getRatesMutation.mutate();
    }
  }, []);
  
  const handlePurchase = (rate: Rate) => {
    setIsPurchasing(true);
    purchaseLabelMutation.mutate(rate);
  };
  
  // Helper function to get carrier logo
  const getCarrierLogo = (carrier: string) => {
    const size = 24;
    
    switch(carrier.toLowerCase()) {
      case 'usps':
        return <SiUsps size={size} className="text-blue-600" />;
      case 'ups':
        return <SiUps size={size} className="text-amber-700" />;
      case 'fedex':
        return <FaFedex size={size} className="text-indigo-600" />;
      case 'dhl':
        return <SiDhl size={size} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between mb-6">
          <h3 className="text-lg font-semibold">Available Rates</h3>
          <div className="text-sm text-neutral-500">Estimated delivery times</div>
        </div>
        
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 border-b pb-2 mb-4 font-semibold">
          <div className="col-span-5">Service</div>
          <div className="col-span-3 text-right text-red-500">Retail</div>
          <div className="col-span-3 text-right text-green-600">Your Price</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 border-b">
              <div className="col-span-5 space-y-1">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <div className="col-span-3 text-right">
                <Skeleton className="h-5 w-[60px] ml-auto" />
              </div>
              <div className="col-span-3 text-right">
                <Skeleton className="h-5 w-[60px] ml-auto" />
              </div>
              <div className="col-span-1 text-right">
                <Skeleton className="h-10 w-[90px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-end mb-6">
        <div className="text-sm text-neutral-500">Estimated delivery times</div>
      </div>
      
      <table className="w-full min-w-full table-auto">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-2 font-semibold w-5/12">Service</th>
            <th className="text-right pb-2 font-semibold text-red-500 w-2/12">Retail</th>
            <th className="text-right pb-2 font-semibold text-green-600 w-2/12">Your Price</th>
            <th className="text-right pb-2 font-semibold w-3/12"></th>
          </tr>
        </thead>
        <tbody>
          {localRates.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-muted-foreground">
                No rates available for this shipment
              </td>
            </tr>
          ) : (
            localRates.map((rate) => (
              <tr
                key={rate.id}
                className="border-b hover:bg-neutral-50"
              >
                <td className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getCarrierLogo(rate.carrier)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {rate.carrier} {rate.service}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {rate.deliveryDays && `Estimated delivery: ${rate.deliveryDays} days`}
                        {rate.deliveryDate && !rate.deliveryDays && `Estimated delivery by: ${rate.deliveryDate}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-right text-red-500 font-medium py-3">
                  {rate.retailRate}
                </td>
                <td className="text-right text-green-600 font-medium py-3">
                  {rate.rate}
                </td>
                <td className="text-right py-3">
                  <Button 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    disabled={isPurchasing}
                    onClick={() => handlePurchase(rate)}
                  >
                    Process Label
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RatesSelection;
