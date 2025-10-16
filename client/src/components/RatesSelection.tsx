import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFedex } from "react-icons/fa";
import { SiUsps, SiUps, SiDhl } from "react-icons/si";
import { Rate } from "@shared/schema";

interface RatesSelectionProps {
  rates?: Rate[];
  isLoading?: boolean;
  onPurchase?: (rate: Rate) => void;
  isPurchasing?: boolean;
}

const RatesSelection = ({ rates = [], isLoading = false, onPurchase, isPurchasing = false }: RatesSelectionProps) => {
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
          <div className="text-sm text-muted-foreground">Estimated delivery times</div>
        </div>
        
        <div className="grid grid-cols-12 gap-4 border-b pb-2 mb-4 font-semibold">
          <div className="col-span-5">Service</div>
          <div className="col-span-3 text-right text-destructive">Retail</div>
          <div className="col-span-3 text-right text-chart-2">Your Price</div>
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
        <div className="text-sm text-muted-foreground">Estimated delivery times</div>
      </div>
      
      <table className="w-full min-w-full table-auto">
        <thead>
          <tr className="border-b">
            <th className="text-left pb-2 font-semibold w-5/12">Service</th>
            <th className="text-right pb-2 font-semibold text-destructive w-2/12">Retail</th>
            <th className="text-right pb-2 font-semibold text-chart-2 w-2/12">Your Price</th>
            <th className="text-right pb-2 font-semibold w-3/12"></th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-muted-foreground">
                No rates available for this shipment
              </td>
            </tr>
          ) : (
            rates.map((rate) => (
              <tr
                key={rate.id}
                className="border-b hover-elevate"
                data-testid={`row-rate-${rate.id}`}
              >
                <td className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getCarrierLogo(rate.carrier)}
                    </div>
                    <div>
                      <div className="font-medium" data-testid={`text-rate-service-${rate.id}`}>
                        {rate.carrier} {rate.service}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {rate.deliveryDays && `Estimated delivery: ${rate.deliveryDays} days`}
                        {rate.deliveryDate && !rate.deliveryDays && `Estimated delivery by: ${rate.deliveryDate}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-right text-destructive font-medium font-mono py-3" data-testid={`text-retail-rate-${rate.id}`}>
                  {rate.retailRate}
                </td>
                <td className="text-right text-chart-2 font-semibold font-mono py-3" data-testid={`text-your-rate-${rate.id}`}>
                  {rate.rate}
                </td>
                <td className="text-right py-3">
                  <Button 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                    disabled={isPurchasing}
                    onClick={() => onPurchase?.(rate)}
                    data-testid={`button-process-label-${rate.id}`}
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
