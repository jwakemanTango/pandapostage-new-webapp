import { MapPin, DollarSign, Printer } from "lucide-react";
import { ShipmentFormInput } from "@/api/schema";

interface BannerSummaryProps {
  formData: ShipmentFormInput;
  currentStep?: "shipment" | "rates" | "label" | "addresses" | "packages";
  formErrors?: any;
}

export const BannerSummary = ({
  formData,
  currentStep = "shipment",
  formErrors,
}: BannerSummaryProps) => {
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

  // --- Step configuration ---
  // Supports both old 4-step and new 3-step flows
  const isThreeStep = ["shipment", "rates", "label"].includes(currentStep);

  const steps = isThreeStep
    ? [
        { id: "shipment", label: "Shipment Details", icon: MapPin },
        { id: "rates", label: "Rates", icon: DollarSign },
        { id: "label", label: "Label", icon: Printer },
      ]
    : [
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "packages", label: "Packages", icon: MapPin },
        { id: "rates", label: "Rates", icon: DollarSign },
        { id: "label", label: "Label", icon: Printer },
      ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

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
    <div className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-neutral-900/85 border-b shadow-sm">
      <div className="container mx-auto px-3 sm:px-5 max-w-[1400px] py-3">
        {/* Steps Row */}
        <div className="flex items-center justify-center gap-6">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center gap-2 min-w-0">
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

        {/* Optional summary below steps - DEBUG: hidden for now (likely permanent)*/}
        {(getFromDisplay() || getToDisplay()) && (
          <div className="hidden flex justify-center gap-6 mt-2 text-xs text-muted-foreground">
            {getFromDisplay() && (
              <span
                className={`${
                  hasFromAddressErrors ? "text-destructive font-medium" : ""
                }`}
              >
                From: {getFromDisplay()}
              </span>
            )}
            {getToDisplay() && (
              <span
                className={`${
                  hasToAddressErrors ? "text-destructive font-medium" : ""
                }`}
              >
                To: {getToDisplay()}
              </span>
            )}
            {hasPackages && (
              <span
                className={`${
                  hasPackageErrors ? "text-destructive font-medium" : ""
                }`}
              >
                {packages?.length} package{packages.length !== 1 && "s"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
