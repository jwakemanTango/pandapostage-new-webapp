import { Rate } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FaFedex } from "react-icons/fa";
import { SiUsps, SiUps, SiDhl } from "react-icons/si";

interface RatesSelectionProps {
  rates?: Rate[];
  isLoading?: boolean;
  onPurchase?: (rate: Rate) => void;
  isPurchasing?: boolean;
  selectedRateId?: string | null;
  onSelectRate?: (rate: Rate) => void;
}

const RatesSelection = ({
  rates = [],
  isLoading = false,
  onPurchase,
  isPurchasing = false,
  selectedRateId,
  onSelectRate,
}: RatesSelectionProps) => {
  const sortedRates = [...rates].sort((a, b) => {
    const priceA = parseFloat(a.rate.replace(/[^0-9.]/g, ""));
    const priceB = parseFloat(b.rate.replace(/[^0-9.]/g, ""));
    return priceA - priceB;
  });

  const getCarrierLogo = (carrier: string) => {
    const size = 20;
    switch (carrier.toLowerCase()) {
      case "usps":
        return <SiUsps size={size} className="text-blue-600" />;
      case "ups":
        return <SiUps size={size} className="text-amber-700" />;
      case "fedex":
        return <FaFedex size={size} className="text-indigo-600" />;
      case "dhl":
        return <SiDhl size={size} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="text-sm text-muted-foreground mb-3">
        {sortedRates.length > 0 && `${sortedRates.length} services available`}
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-12 text-[13px] uppercase font-semibold text-muted-foreground tracking-wide bg-muted/30 px-4 py-2 border-b border-border/40">
          <div className="col-span-6">Service</div>
          <div className="col-span-3 text-left">Retail</div>
          <div className="col-span-3 text-left">Your Price</div>
        </div>

        {/* Rate Rows */}
        <div>
          {sortedRates.map((rate) => {
            const selected = selectedRateId === rate.id;

            return (
              <div
                key={rate.id}
                onClick={() => onSelectRate?.(rate)}
                className={`grid grid-cols-12 items-center px-4 py-3 cursor-pointer border-b border-border/40 last:border-none transition-all duration-300 ease-out
                  ${
                    selected
                      ? "bg-green-50 ring-2 ring-green-500/40 shadow-sm scale-[1.01]"
                      : "hover:bg-muted/10"
                  }`}
                style={{ transformOrigin: "center" }}
              >
                <div className="col-span-6 flex items-center gap-2">
                  {getCarrierLogo(rate.carrier)}
                  <div>
                    <div className="font-medium text-[15px] leading-tight">
                      {rate.carrier} {rate.service}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {rate.deliveryDays
                        ? `${rate.deliveryDays} days`
                        : rate.deliveryDate && `By ${rate.deliveryDate}`}
                    </div>
                  </div>
                </div>

                <div className="col-span-3 text-left">
                  <span className="text-[15px] font-semibold text-destructive/90">
                    {rate.retailRate}
                  </span>
                </div>

                <div className="col-span-3 text-left">
                  <span
                    className={`text-[18px] sm:text-[20px] font-extrabold leading-none transition-colors duration-300 ${
                      selected ? "text-green-600" : "text-green-600"
                    }`}
                  >
                    {rate.rate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatesSelection;
