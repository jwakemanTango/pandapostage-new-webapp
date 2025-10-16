import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Package, MapPin, CheckCircle2, Circle } from "lucide-react";
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
    { id: "shipment", label: "Shipment" },
    { id: "selectRate", label: "Rate" },
    { id: "printLabel", label: "Print" }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <Card className="sticky top-0 z-20 shadow-md">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Step Progress */}
          <div className="flex items-center gap-3">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center gap-1.5">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : isCurrent ? (
                    <Circle className="h-4 w-4 text-primary fill-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={`text-xs hidden sm:inline ${isCurrent ? 'font-semibold text-foreground' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Shipment Info (when not collapsed) */}
          {!isCollapsed && (
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* From Address */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div className="text-xs truncate">
                  {hasFromAddress ? (
                    <span className="font-medium">{fromAddress?.city}, {fromAddress?.state}</span>
                  ) : (
                    <span className={hasFromAddressErrors ? 'text-destructive' : 'text-muted-foreground'}>From: {hasFromAddressErrors ? 'Invalid' : 'Not set'}</span>
                  )}
                </div>
              </div>

              {/* To Address */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}`} />
                <div className="text-xs truncate">
                  {hasToAddress ? (
                    <span className="font-medium">{toAddress?.city}, {toAddress?.state}</span>
                  ) : (
                    <span className={hasToAddressErrors ? 'text-destructive' : 'text-muted-foreground'}>To: {hasToAddressErrors ? 'Invalid' : 'Not set'}</span>
                  )}
                </div>
              </div>

              {/* Package Info */}
              {hasPackages && (
                <div className="flex items-center gap-2 min-w-0 hidden md:flex">
                  <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="text-xs truncate">
                    <span className="font-medium">{packages?.[0]?.weightLbs} lbs</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapse Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0 h-8 w-8"
            data-testid="button-toggle-banner-summary"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
