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
  // Sort rates by price (low to high)
  const sortedRates = [...rates].sort((a, b) => {
    const priceA = parseFloat(a.rate.replace(/[^0-9.]/g, ''));
    const priceB = parseFloat(b.rate.replace(/[^0-9.]/g, ''));
    return priceA - priceB;
  });

  const getCarrierLogo = (carrier: string) => {
    const size = 20;
    
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
        <div className="flex justify-end mb-4">
          <div className="text-sm text-muted-foreground">Estimated delivery times</div>
        </div>
        
        <div className="grid grid-cols-12 gap-3 border-b pb-2 mb-3 font-semibold text-sm">
          <div className="col-span-5">Service</div>
          <div className="col-span-3 text-right text-destructive">Retail</div>
          <div className="col-span-3 text-right text-chart-2">Your Price</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center py-2.5 border-b">
              <div className="col-span-5 space-y-1">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-3 w-[130px]" />
              </div>
              <div className="col-span-3 text-right">
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
              <div className="col-span-3 text-right">
                <Skeleton className="h-4 w-[50px] ml-auto" />
              </div>
              <div className="col-span-1 text-right">
                <Skeleton className="h-9 w-[80px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <div className="text-sm text-muted-foreground">Estimated delivery times</div>
      </div>
      
      {/* Mobile Layout - Stacked Cards */}
      <div className="lg:hidden space-y-3">
        {sortedRates.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No rates available for this shipment
          </div>
        ) : (
          sortedRates.map((rate) => (
            <div
              key={rate.id}
              className="border rounded-md p-3 space-y-3 hover-elevate"
              data-testid={`row-rate-${rate.id}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  {getCarrierLogo(rate.carrier)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" data-testid={`text-rate-service-${rate.id}`}>
                    {rate.carrier} {rate.service}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rate.deliveryDays && `${rate.deliveryDays} days`}
                    {rate.deliveryDate && !rate.deliveryDays && `By ${rate.deliveryDate}`}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Retail</div>
                  <div className="text-destructive font-medium font-mono text-sm" data-testid={`text-retail-rate-${rate.id}`}>
                    {rate.retailRate}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Your Price</div>
                  <div className="text-chart-2 font-semibold font-mono text-sm" data-testid={`text-your-rate-${rate.id}`}>
                    {rate.rate}
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm"
                className="bg-primary hover:bg-primary/90 w-full"
                disabled={isPurchasing}
                onClick={() => onPurchase?.(rate)}
                data-testid={`button-buy-label-${rate.id}`}
              >
                Buy Label
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Desktop Layout - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-2 font-semibold text-sm w-5/12">Service</th>
              <th className="text-right pb-2 font-semibold text-sm text-destructive w-2/12">Retail</th>
              <th className="text-right pb-2 font-semibold text-sm text-chart-2 w-2/12">Your Price</th>
              <th className="text-right pb-2 font-semibold text-sm w-3/12"></th>
            </tr>
          </thead>
          <tbody>
            {sortedRates.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                  No rates available for this shipment
                </td>
              </tr>
            ) : (
              sortedRates.map((rate) => (
                <tr
                  key={rate.id}
                  className="border-b hover-elevate"
                  data-testid={`row-rate-${rate.id}`}
                >
                  <td className="py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="flex-shrink-0 mt-0.5">
                        {getCarrierLogo(rate.carrier)}
                      </div>
                      <div>
                        <div className="font-medium text-sm" data-testid={`text-rate-service-${rate.id}`}>
                          {rate.carrier} {rate.service}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rate.deliveryDays && `${rate.deliveryDays} days`}
                          {rate.deliveryDate && !rate.deliveryDays && `By ${rate.deliveryDate}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right text-destructive font-medium font-mono py-2.5 text-sm" data-testid={`text-retail-rate-${rate.id}`}>
                    {rate.retailRate}
                  </td>
                  <td className="text-right text-chart-2 font-semibold font-mono py-2.5 text-sm" data-testid={`text-your-rate-${rate.id}`}>
                    {rate.rate}
                  </td>
                  <td className="text-right py-2.5">
                    <Button 
                      size="sm"
                      className="bg-primary hover:bg-primary/90 whitespace-nowrap"
                      disabled={isPurchasing}
                      onClick={() => onPurchase?.(rate)}
                      data-testid={`button-buy-label-${rate.id}`}
                    >
                      Buy Label
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RatesSelection;
