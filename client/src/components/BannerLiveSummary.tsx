import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  MapPin,
  Truck,
  DollarSign,
  Printer,
} from "lucide-react";
import { ShipmentFormData } from "@shared/schema";

interface BannerLiveSummaryProps {
  formData: ShipmentFormData;
  currentStep?:
    | "shipment"
    | "selectRate"
    | "printLabel"
    | "addresses"
    | "packages"
    | "rates"
    | "label";
  formErrors?: any;
  workflow?: "3-step" | "4-step";
}

export const BannerLiveSummary = ({
  formData,
  currentStep = "shipment",
  formErrors,
  workflow = "3-step",
}: BannerLiveSummaryProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { fromAddress, toAddress, packages } = formData || {};

  const hasFromAddress =
    fromAddress?.name && fromAddress?.city && fromAddress?.state;
  const hasToAddress =
    toAddress?.name && toAddress?.city && toAddress?.state;
  const hasPackages =
    packages && packages.length > 0 && packages[0]?.weightLbs;

  const hasFromAddressErrors =
    formErrors?.fromAddress &&
    Object.keys(formErrors.fromAddress).length > 0;
  const hasToAddressErrors =
    formErrors?.toAddress &&
    Object.keys(formErrors.toAddress).length > 0;
  const hasPackageErrors =
    formErrors?.packages &&
    formErrors.packages.length > 0 &&
    formErrors.packages.some(
      (pkg: any) => pkg && Object.keys(pkg).length > 0
    );

  const steps =
    workflow === "4-step"
      ? [
          { id: "addresses", label: "Addresses", icon: MapPin },
          { id: "packages", label: "Packages", icon: Package },
          { id: "rates", label: "Rates", icon: DollarSign },
          { id: "label", label: "Label", icon: Printer },
        ]
      : [
          { id: "shipment", label: "Shipment", icon: Truck },
          { id: "selectRate", label: "Rate", icon: DollarSign },
          { id: "printLabel", label: "Print", icon: Printer },
        ];

  const currentStepIndex = steps.findIndex(
    (s) => s.id === currentStep
  );

  const getFromDisplay = () =>
    hasFromAddress
      ? fromAddress?.company ||
        `${fromAddress?.city}, ${fromAddress?.state}`
      : null;

  const getToDisplay = () =>
    hasToAddress
      ? toAddress?.company || `${toAddress?.city}, ${toAddress?.state}`
      : null;

  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-neutral-900/85 border-b shadow-sm transition-all">
      <div className="container mx-auto px-3 sm:px-5 max-w-[1400px]">
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-3 px-4 text-left cursor-pointer hover:bg-accent/40 transition-colors relative"
        >
          <div className="relative space-y-2">
            {/* Steps row */}
            <div className="flex items-center justify-center gap-6">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full border text-sm transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary"
                          : isCompleted
                          ? "bg-primary/15 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-transparent"
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-xs whitespace-nowrap ${
                        isCurrent
                          ? "font-semibold text-foreground"
                          : isCompleted
                          ? "text-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chevron */}
            <div className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center text-muted-foreground">
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>

            {/* Expanded details */}
            <div
              className={`transition-all duration-300 overflow-hidden ${
                isCollapsed ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
              }`}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-4 justify-center flex-wrap text-xs text-muted-foreground mt-2">
                  {/* From */}
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin
                      className={`h-3.5 w-3.5 shrink-0 ${
                        hasFromAddressErrors
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`truncate ${
                        hasFromAddressErrors
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {hasFromAddress
                        ? getFromDisplay()
                        : "From: Not set"}
                    </span>
                  </div>

                  <span>→</span>

                  {/* To */}
                  <div className="flex items-center gap-1 min-w-0">
                    <MapPin
                      className={`h-3.5 w-3.5 shrink-0 ${
                        hasToAddressErrors
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`truncate ${
                        hasToAddressErrors
                          ? "text-destructive"
                          : "text-foreground"
                      }`}
                    >
                      {hasToAddress
                        ? getToDisplay()
                        : "To: Not set"}
                    </span>
                  </div>

                  {/* Package info */}
                  {(packages?.length || hasPackageErrors) && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1 min-w-0">
                        <Package
                          className={`h-3.5 w-3.5 shrink-0 ${
                            hasPackageErrors
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span
                          className={`truncate ${
                            hasPackageErrors
                              ? "text-destructive"
                              : "text-foreground"
                          }`}
                        >
                          {hasPackages
                            ? `${packages.length} ${
                                packages.length === 1
                                  ? "package"
                                  : "packages"
                              }`
                            : "Package: Not set"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
