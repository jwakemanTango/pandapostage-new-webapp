import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, CheckCircle2, DollarSign } from "lucide-react";
import { ShipmentFormData } from "@shared/schema";

interface LiveSummaryProps {
  formData: ShipmentFormData;
  isComplete?: boolean;
  selectedRate?: string;
}

export const LiveSummary = ({ formData, isComplete = false, selectedRate }: LiveSummaryProps) => {
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
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Shipment Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">From Address</h4>
          </div>
          {hasFromAddress ? (
            <div className="text-sm space-y-0.5 pl-6">
              <p className="font-medium">{fromAddress?.name}</p>
              {fromAddress?.company && <p className="text-muted-foreground">{fromAddress.company}</p>}
              <p className="text-muted-foreground">
                {fromAddress?.addressLine1}
                {fromAddress?.addressLine2 && `, ${fromAddress.addressLine2}`}
              </p>
              <p className="text-muted-foreground">
                {fromAddress?.city}, {fromAddress?.state} {fromAddress?.zipCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pl-6">Not yet entered</p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">To Address</h4>
          </div>
          {hasToAddress ? (
            <div className="text-sm space-y-0.5 pl-6">
              <p className="font-medium">{toAddress?.name}</p>
              {toAddress?.company && <p className="text-muted-foreground">{toAddress.company}</p>}
              <p className="text-muted-foreground">
                {toAddress?.addressLine1}
                {toAddress?.addressLine2 && `, ${toAddress.addressLine2}`}
              </p>
              <p className="text-muted-foreground">
                {toAddress?.city}, {toAddress?.state} {toAddress?.zipCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground pl-6">Not yet entered</p>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-semibold text-sm">Package Details</h4>
          </div>
          {hasPackages ? (
            <div className="text-sm space-y-2 pl-6">
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
          ) : (
            <p className="text-sm text-muted-foreground pl-6">Not yet entered</p>
          )}
        </div>

        {selectedServices.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Additional Services</h4>
            <div className="flex flex-wrap gap-1.5 pl-6">
              {selectedServices.map((service) => (
                <Badge key={service} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedRate && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">Selected Rate</h4>
            </div>
            <p className="text-sm pl-6 font-medium text-primary">{selectedRate}</p>
          </div>
        )}

        {isComplete && hasFromAddress && hasToAddress && hasPackages && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-chart-2">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-medium">Ready to get rates</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
