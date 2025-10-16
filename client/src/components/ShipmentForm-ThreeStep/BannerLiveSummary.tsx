import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, MapPin, CheckCircle2, Circle, Truck, DollarSign, Printer } from "lucide-react";
import { ShipmentFormData } from "@shared/schema";

interface BannerLiveSummaryProps {
  formData: ShipmentFormData;
  currentStep?: "shipment" | "selectRate" | "printLabel";
  formErrors?: any;
}

export const BannerLiveSummary = ({ formData, currentStep = "shipment", formErrors }: BannerLiveSummaryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { fromAddress, toAddress, packages } = formData || {};
  
  const hasFromAddress = fromAddress?.name && fromAddress?.city && fromAddress?.state;
  const hasToAddress = toAddress?.name && toAddress?.city && toAddress?.state;
  const hasPackages = packages && packages.length > 0 && packages[0]?.weightLbs;
  
  const hasFromAddressErrors = formErrors?.fromAddress && Object.keys(formErrors.fromAddress).length > 0;
  const hasToAddressErrors = formErrors?.toAddress && Object.keys(formErrors.toAddress).length > 0;

  const steps = [
    { id: "shipment", label: "Shipment", icon: Truck },
    { id: "selectRate", label: "Rate", icon: DollarSign },
    { id: "printLabel", label: "Print", icon: Printer }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  
  // Get display value for addresses (company or city, state)
  const getFromDisplay = () => {
    if (!hasFromAddress) return null;
    return fromAddress?.company || `${fromAddress?.city}, ${fromAddress?.state}`;
  };
  
  const getToDisplay = () => {
    if (!hasToAddress) return null;
    return toAddress?.company || `${toAddress?.city}, ${toAddress?.state}`;
  };

  return (
    <Card className="sticky top-0 z-20 shadow-md">
      <CardContent className="py-3 px-4">
        <div className="space-y-2">
          {/* Step Progress - Centered */}
          <div className="flex items-center justify-center gap-6">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-full ${isCurrent ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <StepIcon className="h-4 w-4 shrink-0" />
                  </div>
                  <span className={`text-xs hidden md:inline ${isCurrent ? 'font-semibold text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
            
            {/* Collapse Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0 h-8 w-8 ml-auto"
              data-testid="button-toggle-banner-summary"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Shipment Info (when not collapsed) */}
          {!isCollapsed && (
            <div className="flex items-center gap-4 justify-center flex-wrap">
              {/* From Address */}
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div className="text-xs truncate">
                  {hasFromAddress ? (
                    <span className="font-medium">{getFromDisplay()}</span>
                  ) : (
                    <span className={hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}>From: {hasFromAddressErrors ? 'Invalid' : 'Not set'}</span>
                  )}
                </div>
              </div>

              <div className="text-muted-foreground">→</div>

              {/* To Address */}
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div className="text-xs truncate">
                  {hasToAddress ? (
                    <span className="font-medium">{getToDisplay()}</span>
                  ) : (
                    <span className={hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}>To: {hasToAddressErrors ? 'Invalid' : 'Not set'}</span>
                  )}
                </div>
              </div>

              {/* Package Info */}
              {packages && packages.length > 0 && (
                <div className="flex items-center gap-2 min-w-0">
                  <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="text-xs truncate">
                    <span className="font-medium">{packages.length} {packages.length === 1 ? 'package' : 'packages'}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
