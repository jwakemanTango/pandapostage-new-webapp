import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, CheckCircle2, DollarSign, ChevronRight, Lock } from "lucide-react";
import { ShipmentFormData, Rate } from "@shared/schema";
import { cn } from "@/lib/utils";
import { PandaLogo } from "./PandaLogo";

interface LiveSummaryProps {
  formData: ShipmentFormData;
  currentStep: number;
  completedSteps: number[];
  purchasedLabel?: Rate | null;
  onStepClick: (step: number) => void;
}

export const LiveSummary = ({ 
  formData, 
  currentStep, 
  completedSteps,
  purchasedLabel,
  onStepClick 
}: LiveSummaryProps) => {
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

  const steps = [
    { 
      number: 1, 
      label: "Addresses", 
      icon: MapPin,
      canClick: true
    },
    { 
      number: 2, 
      label: "Package & Services", 
      icon: Package,
      canClick: completedSteps.includes(1)
    },
    { 
      number: 3, 
      label: "Rate Selection", 
      icon: DollarSign,
      canClick: completedSteps.includes(2) && !purchasedLabel
    },
    { 
      number: 4, 
      label: "Label", 
      icon: CheckCircle2,
      canClick: completedSteps.includes(3)
    },
  ];

  const isStepCompleted = (step: number) => completedSteps.includes(step);
  const isStepCurrent = (step: number) => currentStep === step;

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4 flex flex-col items-center" style={{ backgroundColor: '#005392' }}>
        <PandaLogo compact className="h-8 mb-3" />
        <CardTitle className="text-lg text-white">Shipment Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {steps.map((step) => {
            const StepIcon = step.icon;
            const completed = isStepCompleted(step.number);
            const current = isStepCurrent(step.number);
            const canClick = step.canClick && (completed || step.number <= Math.max(...completedSteps, 0) + 1);
            const isLocked = step.number === 3 && purchasedLabel;
            
            return (
              <button
                key={step.number}
                onClick={() => canClick && !isLocked && onStepClick(step.number)}
                disabled={!canClick || !!isLocked}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  current && "bg-primary/10 border border-primary/20",
                  completed && !current && "hover-elevate",
                  !canClick && "opacity-50 cursor-not-allowed",
                  canClick && !current && !isLocked && "cursor-pointer"
                )}
                data-testid={`step-${step.number}`}
              >
                <div className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full",
                  completed ? "bg-chart-2 text-white" : 
                  current ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                )}>
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    current && "text-primary",
                    completed && !current && "text-foreground",
                    !completed && !current && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                </div>

                {current && !completed && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-4 space-y-4">
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
                  {fromAddress?.city}, {fromAddress?.state} {fromAddress?.zipCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-6">Not yet entered</p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-semibold text-sm">To Address</h4>
            </div>
            {hasToAddress ? (
              <div className="text-sm space-y-0.5 pl-6">
                <p className="font-medium">{toAddress?.name}</p>
                {toAddress?.company && <p className="text-muted-foreground">{toAddress.company}</p>}
                <p className="text-muted-foreground">
                  {toAddress?.city}, {toAddress?.state} {toAddress?.zipCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-6">Not yet entered</p>
            )}
          </div>

          {hasPackages && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Package Details</h4>
              </div>
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
            </div>
          )}

          {selectedServices.length > 0 && (
            <div>
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

          {purchasedLabel && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">Selected Rate</h4>
              </div>
              <div className="text-sm pl-6 space-y-1">
                <p className="font-medium text-primary">{purchasedLabel.carrier} - {purchasedLabel.service}</p>
                <p className="text-muted-foreground">${purchasedLabel.rate}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
