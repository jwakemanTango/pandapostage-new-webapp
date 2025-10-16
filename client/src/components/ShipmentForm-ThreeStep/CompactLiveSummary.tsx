import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, CheckCircle2, Circle } from "lucide-react";
import { ShipmentFormData } from "@shared/schema";
import { PandaLogo } from "@/components/PandaLogo";

interface CompactLiveSummaryProps {
  formData: ShipmentFormData;
  currentStep?: "shipment" | "selectRate" | "printLabel";
  formErrors?: any;
}

export const CompactLiveSummary = ({ formData, currentStep = "shipment", formErrors }: CompactLiveSummaryProps) => {
  const { fromAddress, toAddress, packages, additionalServices } = formData || {};
  
  const hasFromAddress = fromAddress?.name && fromAddress?.city && fromAddress?.state;
  const hasToAddress = toAddress?.name && toAddress?.city && toAddress?.state;
  const hasPackages = packages && packages.length > 0 && packages[0]?.weightLbs;
  
  const hasFromAddressErrors = formErrors?.fromAddress && Object.keys(formErrors.fromAddress).length > 0;
  const hasToAddressErrors = formErrors?.toAddress && Object.keys(formErrors.toAddress).length > 0;
  
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

  const steps = [
    { id: "shipment", label: "Shipment" },
    { id: "selectRate", label: "Rate" },
    { id: "printLabel", label: "Print" }
  ];

  const stepLabels = {
    shipment: "Shipment Details",
    selectRate: "Select Rate",
    printLabel: "Print Label"
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <Card className="sticky top-6">
      <CardHeader className="py-3.5 px-8 flex flex-col items-center rounded-t-xl" style={{ backgroundColor: '#005392' }}>
        <PandaLogo compact className="h-28 w-full object-contain" />
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        {/* Current Step Header */}
        <div className="text-center pb-2 border-b">
          <h3 className="text-lg font-bold text-primary">{stepLabels[currentStep]}</h3>
        </div>

        {/* Step Progress Indicators */}
        <div className="space-y-2 pb-2 border-b">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center gap-2.5">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                ) : isCurrent ? (
                  <Circle className="h-5 w-5 text-primary fill-primary shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span className={`text-sm ${isCurrent ? 'font-semibold text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className={`${hasFromAddressErrors ? 'border-l-2 border-destructive pl-2 -ml-2' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className={`h-4 w-4 ${hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
              <h4 className={`font-semibold text-sm ${hasFromAddressErrors ? 'text-destructive' : ''}`}>From Address</h4>
            </div>
            {hasFromAddress ? (
              <div className="text-sm space-y-0.5 pl-5">
                <p className="font-medium">{fromAddress?.name}</p>
                {fromAddress?.company && <p className="text-muted-foreground">{fromAddress.company}</p>}
                <p className="text-muted-foreground">
                  {fromAddress?.city}, {fromAddress?.state} {fromAddress?.zipCode}
                </p>
              </div>
            ) : (
              <p className={`text-sm pl-5 ${hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`}>
                {hasFromAddressErrors ? 'Invalid or incomplete' : 'Not entered'}
              </p>
            )}
          </div>

          <div className={`${hasToAddressErrors ? 'border-l-2 border-destructive pl-2 -ml-2' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className={`h-4 w-4 ${hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
              <h4 className={`font-semibold text-sm ${hasToAddressErrors ? 'text-destructive' : ''}`}>To Address</h4>
            </div>
            {hasToAddress ? (
              <div className="text-sm space-y-0.5 pl-5">
                <p className="font-medium">{toAddress?.name}</p>
                {toAddress?.company && <p className="text-muted-foreground">{toAddress.company}</p>}
                <p className="text-muted-foreground">
                  {toAddress?.city}, {toAddress?.state} {toAddress?.zipCode}
                </p>
              </div>
            ) : (
              <p className={`text-sm pl-5 ${hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`}>
                {hasToAddressErrors ? 'Invalid or incomplete' : 'Not entered'}
              </p>
            )}
          </div>

          {hasPackages && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Package Details</h4>
              </div>
              <div className="text-sm space-y-1.5 pl-5">
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
              <h4 className="font-semibold text-sm mb-1.5">Additional Services</h4>
              <div className="flex flex-wrap gap-1 pl-5">
                {selectedServices.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs h-5">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
