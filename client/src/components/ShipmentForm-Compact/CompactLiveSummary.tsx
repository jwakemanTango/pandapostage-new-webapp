import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin } from "lucide-react";
import { ShipmentFormData } from "@shared/schema";

interface CompactLiveSummaryProps {
  formData: ShipmentFormData;
}

export const CompactLiveSummary = ({ formData }: CompactLiveSummaryProps) => {
  const { fromAddress, toAddress, packages, additionalServices } = formData || {};
  
  const hasFromAddress = fromAddress?.name && fromAddress?.city && fromAddress?.state;
  const hasToAddress = toAddress?.name && toAddress?.city && toAddress?.state;
  const hasPackages = packages && packages.length > 0 && packages[0]?.weightLbs;
  
  const selectedServices = Object.entries(additionalServices || {})
    .filter(([_, value]) => value === true)
    .map(([key]) => {
      const serviceLabels: Record<string, string> = {
        saturdayDelivery: "Saturday Delivery",
        requireSignature: "Signature Required",
        expressMailWaiver: "Express Waiver",
        insuranceValue: "Insurance",
        returnLabel: "Return Label",
        weekendService: "Weekend Service",
        additionalHandling: "Additional Handling",
        certifiedMail: "Certified Mail"
      };
      return serviceLabels[key] || key;
    });

  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-3.5 w-3.5" />
          Shipment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <h4 className="font-semibold text-xs">From Address</h4>
          </div>
          {hasFromAddress ? (
            <div className="text-xs space-y-0.5 pl-5">
              <p className="font-medium">{fromAddress?.name}</p>
              {fromAddress?.company && <p className="text-muted-foreground">{fromAddress.company}</p>}
              <p className="text-muted-foreground">
                {fromAddress?.city}, {fromAddress?.state} {fromAddress?.zipCode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pl-5">Not entered</p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <h4 className="font-semibold text-xs">To Address</h4>
          </div>
          {hasToAddress ? (
            <div className="text-xs space-y-0.5 pl-5">
              <p className="font-medium">{toAddress?.name}</p>
              {toAddress?.company && <p className="text-muted-foreground">{toAddress.company}</p>}
              <p className="text-muted-foreground">
                {toAddress?.city}, {toAddress?.state} {toAddress?.zipCode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pl-5">Not entered</p>
          )}
        </div>

        {hasPackages && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Package className="h-3 w-3 text-muted-foreground" />
              <h4 className="font-semibold text-xs">Package Details</h4>
            </div>
            <div className="text-xs space-y-1.5 pl-5">
              {packages?.map((pkg, index) => (
                <div key={index} className="space-y-0.5">
                  <p className="font-medium">Package {index + 1}</p>
                  <p className="text-muted-foreground">
                    Weight: {pkg.weightLbs} lbs {pkg.weightOz || 0} oz
                  </p>
                  {pkg.length && pkg.width && pkg.height && (
                    <p className="text-muted-foreground">
                      Dimensions: {pkg.length}" × {pkg.width}" × {pkg.height}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedServices.length > 0 && (
          <div>
            <h4 className="font-semibold text-xs mb-1">Additional Services</h4>
            <div className="flex flex-wrap gap-1 pl-5">
              {selectedServices.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs h-5">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
