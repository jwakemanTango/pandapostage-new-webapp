import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createShipmentSchema,
  Rate,
  ShipmentFormInput,
} from "@shared/schema";
import { getShippingRates, purchaseShippingLabel } from "@/lib/directApiClient";
import { useToast } from "@/hooks/use-toast";

import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Package,
  DollarSign,
  Printer,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  MapIcon,
} from "lucide-react";

import RatesSelection from "./RatesSelection";
import { LabelSummary } from "./LabelSummary";
import { SidebarSummary } from "./SidebarSummary";
import { BannerSummary } from "./BannerSummary";
import { AddressSection } from "./Address/AddressSection";
import { PackageSection } from "./Package/PackageSection";

// ---- Default Values ----
const defaultShipmentValues: ShipmentFormInput = {
  fromAddress: {
    country: "US",
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
  },
  toAddress: {
    country: "US",
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: "",
  },
  packages: [
    {
      packageType: "parcel",
      carrier: "any",
      length: "",
      weightLbs: "",
      weightOz: "",
      width: "",
      height: "",
    },
  ],
  additionalServices: {
    saturdayDelivery: false,
    requireSignature: false,
    expressMailWaiver: false,
    insuranceValue: false,
    returnLabel: false,
    weekendService: false,
    additionalHandling: false,
    certifiedMail: false,
  },
  rateSelection: { service: "", rate: "" },
};

// ---- Shared footer component ----
const StepFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="sticky bottom-0 z-50 backdrop-blur-md bg-white/70 dark:bg-neutral-900/75 border-t shadow-sm p-4 rounded-b-none">
    <div className="w-full flex flex-col sm:flex-row gap-3">{children}</div>
  </div>
);

// ---- Main form ----
export const ShipmentForm = ({
  apiConfig,
  onRatesLoaded,
  onLabelPurchased,
  showSidebar = true,
  showLabelPreview = true,
  showBanner = false,
  showScaleButton = true,
  addressFormLayout = "side-by-side",
  shipmentFormLayout = "3-step",
}: {
  apiConfig: any;
  onRatesLoaded?: (rates: Rate[]) => void;
  onLabelPurchased?: (result: any) => void;
  showSidebar?: boolean;
  showLabelPreview?: boolean;
  showBanner?: boolean;
  showScaleButton?: boolean;
  addressFormLayout?: string;
  shipmentFormLayout?: string;
}) => {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [purchasedLabel, setPurchasedLabel] = useState<any | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);

  const SIDEBAR_BREAKPOINT = 1280;
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${SIDEBAR_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsNarrow("matches" in e ? e.matches : (e as MediaQueryList).matches);
    // Init and subscribe
    setIsNarrow(mql.matches);
    mql.addEventListener?.("change", onChange);
    return () => {
      mql.removeEventListener?.("change", onChange);
    };
  }, []);

  // ---- Dynamic step configuration ----
  const stepConfig =
    shipmentFormLayout === "3-step" || shipmentFormLayout === "3-step-2"
      ? [
          {
            key: "shipment", // Combined address & packages
            title: "Shipment Information",
            icon: <MapPin className="h-5 w-5 text-primary" />,
            validate: ["fromAddress", "toAddress", "packages"],
          },
          {
            key: "rates",
            title: "Select Shipping Rate",
            icon: <DollarSign className="h-5 w-5 text-primary" />,
          },
          {
            key: "label",
            title: "Label Purchased",
            icon: <Printer className="h-5 w-5 text-primary" />,
          },
        ]
      : [
          {
            key: "addresses",
            title: "Shipping Addresses",
            icon: <MapPin className="h-5 w-5 text-primary" />,
            validate: ["fromAddress", "toAddress"],
          },
          {
            key: "packages",
            title: "Package & Services",
            icon: <Package className="h-5 w-5 text-primary" />,
            validate: ["packages"],
          },
          {
            key: "rates",
            title: "Select Shipping Rate",
            icon: <DollarSign className="h-5 w-5 text-primary" />,
          },
          {
            key: "label",
            title: "Label Purchased",
            icon: <Printer className="h-5 w-5 text-primary" />,
          },
        ];

  const form = useForm<ShipmentFormInput>({
    resolver: zodResolver(createShipmentSchema),
    mode: "onChange",
    defaultValues: defaultShipmentValues,
  });

  const step = stepConfig[currentStepIndex];
  const isLastStep = currentStepIndex === stepConfig.length - 1;

  const advanceStep = () => {
    if (!completedSteps.includes(currentStepIndex))
      setCompletedSteps((s) => [...s, currentStepIndex]);
    setCurrentStepIndex((i) => Math.min(i + 1, stepConfig.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showError = (title: string, msg: string) =>
    toast({ title, description: msg, variant: "destructive" });

  // ---- API mutations ----
  const getRatesMutation = useMutation({
    mutationFn: (payload: any) => getShippingRates(apiConfig, payload),
    onSuccess: (data) => {
      const list = data?.rates || [];
      setRates(list);
      onRatesLoaded?.(list);
      toast({
        title: "Rates Available",
        description: `${list.length} option${list.length !== 1 ? "s" : ""} found.`,
      });
      // Always advance to rates step after fetching
      setTimeout(advanceStep, 200);
    },
    onError: (err: any) =>
      showError("Error Getting Rates", err?.message || "Failed to retrieve rates."),
  });

  const purchaseLabelMutation = useMutation({
    mutationFn: (payload: any) => purchaseShippingLabel(apiConfig, payload),
    onSuccess: (result: any) => {
      setPurchasedLabel(result);
      onLabelPurchased?.(result);
      toast({
        title: "Label Purchased Successfully",
        description: "Your shipping label is ready to print.",
      });
      advanceStep();
    },
    onError: (err: any) =>
      showError("Error Purchasing Label", err?.message || "Failed to purchase label."),
  });

  const handleNext = async () => {
    if (step.key === "shipment" || step.key === "addresses" || step.key === "packages") {
      const fieldsToValidate =
        step.key === "shipment"
          ? ["fromAddress", "toAddress", "packages"]
          : step.validate || [];

      const valid = await form.trigger(fieldsToValidate as (keyof ShipmentFormInput)[]);
      if (!valid) return;

      // Fetch rates in 3-step or after packages in 4-step
      if (step.key === "shipment" || step.key === "packages") {
        getRatesMutation.mutate({
          fromAddress: form.getValues("fromAddress"),
          toAddress: form.getValues("toAddress"),
          packages: form.getValues("packages"),
          additionalServices: form.getValues("additionalServices"),
        });
        return;
      }

      if (step.key === "addresses") {
        advanceStep();
        return;
      }
    }

    if (step.key === "rates") {
      if (!selectedRate) {
        showError("No Rate Selected", "Please select a rate before continuing.");
        return;
      }
      handlePurchase(selectedRate);
      return;
    }

    if (step.key === "label") handleReset();
  };

  const handleBack = () => setCurrentStepIndex((i) => Math.max(i - 1, 0));

  const handlePurchase = (rate: Rate) => {
    const payload = {
      provider: rate.provider,
      carrier: rate.carrier,
      service: rate.service,
      shipmentId: (rate as any).shipmentId,
      rateId: (rate as any).id || (rate as any).rateId,
    };

    if (!payload.provider || !payload.shipmentId || !payload.rateId)
      return showError("Invalid Selection", "This rate is missing required fields.");

    purchaseLabelMutation.mutate(payload);
  };

  const handleReset = () => {
    form.reset(defaultShipmentValues);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setSelectedRate(null);
    setPurchasedLabel(null);
    setRates([]);
  };

  const isBusy = getRatesMutation.isPending || purchaseLabelMutation.isPending;

  // ---- Step content ----
  const stepContent = useMemo(() => {
    switch (step.key) {
      case "shipment": // 3-step combined address + package
        if (shipmentFormLayout === "3-step") {
          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Address Section */}
              <div>
                <Card className="border border-border">
                  <CardContent className="p-5">
                    <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                      <MapIcon className="h-4 w-4 text-primary" />
                      Address
                    </h4>
                    <AddressSection layout={addressFormLayout} form={form} />
                  </CardContent>
                </Card>
              </div>

              {/* Right: Package + Services */}
              <PackageSection form={form} showScaleButton={showScaleButton} />
            </div>
          );
        } else if (shipmentFormLayout === "3-step-2") {
          // Addresses above packages, both stacked in the same column
          return (
            <div className="flex flex-col gap-8">
              <Card className="border border-border">
                <CardContent className="p-5">
                  <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                    <MapIcon className="h-4 w-4 text-primary" />
                    Addresses
                  </h4>
                  <AddressSection layout={addressFormLayout} form={form} />
                </CardContent>
              </Card>

              <PackageSection form={form} showScaleButton={showScaleButton} />
            </div>
          );
        }
        break;

      case "addresses":
        return <AddressSection layout={addressFormLayout} form={form} />;

      case "packages":
        return <PackageSection form={form} />;

      case "rates":
        return (
          <RatesSelection
            rates={rates}
            isLoading={getRatesMutation.isPending}
            onSelectRate={setSelectedRate}
            selectedRateId={selectedRate?.id}
          />
        );

      case "label":
        return (
          purchasedLabel && (
            <LabelSummary
              purchasedLabel={purchasedLabel}
              formData={form.getValues()}
              showLabelPreview={showLabelPreview}
            />
          )
        );
    }
  }, [
    step.key,
    form,
    rates,
    selectedRate,
    purchasedLabel,
    showLabelPreview,
    showScaleButton,
    getRatesMutation.isPending,
    addressFormLayout,
    shipmentFormLayout,
  ]);

  // Only show sidebar when allowed by props, not on the label step, and not on narrow screens
  const shouldShowSidebar = showSidebar && step.key !== "label" && !isNarrow;

  return (
    <>
      {showBanner && (
        <BannerSummary
          formData={form.getValues()}
          currentStep={
            step.key as "shipment" | "addresses" | "packages" | "rates" | "label"
          }
          formErrors={form.formState.errors}
        />
      )}

      <Form {...form}>
        <div
          className={`grid gap-6 pt-4 p-6 ${
            shouldShowSidebar ? "grid-cols-[1fr_minmax(260px,320px)]" : "grid-cols-1"
          }`}
        >
          {/* Left / Main column (auto-fills when sidebar hidden) */}
          <div>
            <Card className="rounded-b-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {step.icon} {step.title}
                </h3>
                {stepContent}
              </CardContent>
            </Card>

            <StepFooter>
              {currentStepIndex > 0 && step.key !== "label" && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="w-full sm:w-auto flex-1 gap-2 h-11"
                  disabled={isBusy}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              )}

              {step.key === "rates" ? (
                <Button
                  onClick={() => handlePurchase(selectedRate!)}
                  disabled={!selectedRate || isBusy}
                  className="w-full sm:w-auto flex-1 gap-2 bg-primary text-primary-foreground font-medium h-11"
                >
                  {purchaseLabelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Purchasing...
                    </>
                  ) : (
                    "Buy Label"
                  )}
                </Button>
              ) : step.key === "label" ? (
                purchasedLabel && (
                  <Button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-medium h-11"
                  >
                    <Plus className="h-4 w-4" />
                    Create Another Shipment
                  </Button>
                )
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isBusy}
                  className="w-full sm:w-auto flex-1 gap-2 bg-primary text-primary-foreground font-medium h-11"
                >
                  {getRatesMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading Rates...
                    </>
                  ) : (
                    <>
                      Next <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </StepFooter>
          </div>

          {/* Right / Sidebar column (hidden under 1028px) */}
          {shouldShowSidebar && (
            <div className="block">
              <SidebarSummary
                formData={form.getValues()}
                currentStep={currentStepIndex + 1}
                completedSteps={completedSteps}
                purchasedLabel={purchasedLabel}
                onStepClick={setCurrentStepIndex}
                formErrors={form.formState.errors}
              />
            </div>
          )}
        </div>
      </Form>
    </>
  );
};
