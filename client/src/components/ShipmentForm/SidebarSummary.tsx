import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  CheckCircle2,
  DollarSign,
  ChevronRight,
  Lock,
} from "lucide-react";
import { ShipmentFormInput, Rate } from "@/api/schema";
import { cn } from "@/lib/utils";
import { PandaLogo } from "@/components/PandaLogo";

interface LiveSummaryProps {
  formData: ShipmentFormInput;
  currentStep: number;
  completedSteps: number[];
  purchasedLabel?: Rate | null;
  onStepClick: (step: number) => void;
  formErrors?: any;
}

const SummarySection = ({
  icon: Icon,
  title,
  hasErrors,
  hasContent,
  children,
  fallback,
}: {
  icon: any;
  title: string;
  hasErrors?: boolean;
  hasContent?: boolean;
  children?: React.ReactNode;
  fallback?: string;
}) => (
  <div
    className={cn(
      "pt-1",
      hasErrors && "border-l-2 border-destructive pl-1 -ml-1"
    )}
  >
    <div className="flex items-center gap-1 mb-0.5">
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0", hasErrors && "text-destructive")}
      />
      <h4
        className={cn(
          "font-semibold text-[13px] leading-tight",
          hasErrors && "text-destructive"
        )}
      >
        {title}
      </h4>
    </div>

    {hasContent ? (
      <div className="pl-4 text-[13px] space-y-0.5">{children}</div>
    ) : (
      <p
        className={cn(
          "pl-4 text-[13px]",
          hasErrors ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {hasErrors ? "Invalid or incomplete" : fallback || "Not yet entered"}
      </p>
    )}
  </div>
);

export const SidebarSummary = ({
  formData,
  currentStep,
  completedSteps,
  purchasedLabel,
  onStepClick,
  formErrors,
}: LiveSummaryProps) => {
  const { fromAddress, toAddress, packages, additionalServices } = formData || {};

  const hasFrom = fromAddress?.name && fromAddress?.city && fromAddress?.state;
  const hasTo = toAddress?.name && toAddress?.city && toAddress?.state;
  const hasPackages = packages && packages.length > 0 && packages[0]?.weightLbs;

  const hasErr = {
    from:
      !!formErrors?.fromAddress && Object.keys(formErrors.fromAddress).length > 0,
    to: !!formErrors?.toAddress && Object.keys(formErrors.toAddress).length > 0,
    pkg:
      formErrors?.packages &&
      formErrors.packages.some((p: any) => p && Object.keys(p).length > 0),
  };

  const selectedServices = Object.entries(additionalServices || {})
    .filter(([_, v]) => v === true)
    .map(([k]) => {
      const labels: Record<string, string> = {
        saturdayDelivery: "Saturday Delivery",
        requireSignature: "Signature Required",
        expressMailWaiver: "Express Waiver",
        insuranceValue: "Insurance",
        returnLabel: "Return Label",
        weekendService: "Weekend Service",
        additionalHandling: "Additional Handling",
        certifiedMail: "Certified Mail",
      };
      return labels[k] || k;
    });

  const steps = [
    { num: 1, label: "Addresses", icon: MapPin },
    { num: 2, label: "Package & Services", icon: Package },
    { num: 3, label: "Rate Selection", icon: DollarSign },
    { num: 4, label: "Label", icon: CheckCircle2 },
  ];

  return (
    <Card className="sticky top-4 overflow-hidden">
      <CardHeader className="py-4 px-4 flex flex-col items-center bg-primary text-primary-foreground rounded-t-xl">
        <PandaLogo compact className="h-10 w-auto object-contain" />
      </CardHeader>

      <CardContent className="space-y-3 px-3.5 pt-3">
        <h3 className="text-base font-semibold text-center leading-tight">
          Shipment Progress
        </h3>

        <div className="space-y-1">
          {steps.map(({ num, label, icon: Icon }) => {
          const completed = completedSteps.includes(num);
          const current = currentStep === num;
          const locked = num === 3 && !!purchasedLabel;

          const canClick =
            !locked &&
            num <= Math.max(...completedSteps, 0) + 1 &&
            (completed || !current);

            return (
              <button
                key={num}
                disabled={!canClick || locked}
                onClick={() => canClick && !locked && onStepClick(num)}
                className={cn(
                  "w-full flex items-center gap-2 p-1.5 rounded text-left transition-all",
                  current && "bg-primary/10 border border-primary/20",
                  !canClick && "opacity-50 cursor-not-allowed",
                  canClick && !current && "hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-6 w-6 rounded-full shrink-0",
                    completed
                      ? "bg-chart-2 text-white"
                      : current
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : locked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>

                <p
                  className={cn(
                    "text-[13px] font-medium truncate",
                    current
                      ? "text-primary"
                      : completed
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </p>

                {current && (
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-2 space-y-1.5">
          <SummarySection
            icon={MapPin}
            title="From Address"
            hasErrors={hasErr.from}
            hasContent={!!hasFrom}
          >
            {hasFrom && (
              <>
                <p className="font-medium leading-tight">{fromAddress?.name}</p>
                {fromAddress?.company && (
                  <p className="text-muted-foreground text-[12px] truncate">
                    {fromAddress.company}
                  </p>
                )}
                <p className="text-muted-foreground text-[12px] truncate">
                  {fromAddress?.city}, {fromAddress?.state} {fromAddress?.zipCode}
                </p>
              </>
            )}
          </SummarySection>

          <SummarySection
            icon={MapPin}
            title="To Address"
            hasErrors={hasErr.to}
            hasContent={!!hasTo}
          >
            {hasTo && (
              <>
                <p className="font-medium leading-tight">{toAddress?.name}</p>
                {toAddress?.company && (
                  <p className="text-muted-foreground text-[12px] truncate">
                    {toAddress.company}
                  </p>
                )}
                <p className="text-muted-foreground text-[12px] truncate">
                  {toAddress?.city}, {toAddress?.state} {toAddress?.zipCode}
                </p>
              </>
            )}
          </SummarySection>

          <SummarySection
            icon={Package}
            title="Package Details"
            hasErrors={hasErr.pkg}
            hasContent={!!hasPackages}
          >
            {packages?.map((pkg, i) => (
              <div key={i} className="space-y-0.5">
                <p className="font-medium leading-tight">Package {i + 1}</p>
                <p className="text-muted-foreground text-[12px] truncate">
                  Weight: {pkg.weightLbs} lbs {pkg.weightOz || 0} oz
                </p>
                {pkg.length && pkg.width && pkg.height && (
                  <p className="text-muted-foreground text-[12px] truncate">
                    {pkg.length}" × {pkg.width}" × {pkg.height}"
                  </p>
                )}
              </div>
            ))}
          </SummarySection>

          {selectedServices.length > 0 && (
            <div>
              <h4 className="font-semibold text-[13px] mb-0.5 leading-tight">
                Additional Services
              </h4>
              <div className="flex flex-wrap gap-1 pl-4">
                {selectedServices.map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="text-[11px] px-1 py-0.5 truncate"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {purchasedLabel && (
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <h4 className="font-semibold text-[13px] leading-tight">
                  Selected Rate
                </h4>
              </div>
              <div className="pl-4 text-[13px] space-y-0.5">
                <p className="font-medium text-primary leading-tight truncate">
                  {purchasedLabel.carrier} - {purchasedLabel.service}
                </p>
                <p className="text-muted-foreground text-[12px] truncate">
                  {purchasedLabel.rate}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
