import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  createShipmentSchema,
  ShipmentFormData,
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
} from "lucide-react";

import AddressFormCombined from "./AddressFormCombined";
import PackageForm from "./PackageForm";
import AdditionalServices from "./AdditionalServices";
import RatesSelection from "./RatesSelection";
import { LabelSummary } from "./LabelSummary";
import { SidebarSummary } from "./SidebarSummary";
import { BannerSummary } from "./BannerSummary";

// ---- Step configuration ----
const stepConfig = [
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
] as const;

const defaultShipmentValues: ShipmentFormInput = {
  fromAddress: {
    country: "US",
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: ""
  },
  toAddress: {
    country: "US",
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zipCode: ""
  },
  packages: [{
    packageType: "parcel", carrier: "any",
    length: "",
    weightLbs: "",
    weightOz: "",
    width: "",
    height: ""
  }],
  additionalServices: {
    saturdayDelivery: false,
    requireSignature: false,
    expressMailWaiver: false,
    insuranceValue: false,
    returnLabel: false,
    weekendService: false,
    additionalHandling: false,
    certifiedMail: false
  },
  rateSelection: { service: "", rate: "" }
};

// ---- Shared footer component ----
const StepFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4">
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
  showScaleButton = true
}: {
  apiConfig: any;
  onRatesLoaded?: (rates: Rate[]) => void;
  onLabelPurchased?: (result: any) => void;
  showSidebar?: boolean;
  showLabelPreview?: boolean;
  showBanner?: boolean;
  showScaleButton?: boolean;
}) => {
  const { toast } = useToast();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [purchasedLabel, setPurchasedLabel] = useState<any | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);

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
    window.scrollTo(0, 0);
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
      toast({ title: "Rates Available", description: `${list.length} option${list.length !== 1 ? "s" : ""} found.` });
      advanceStep();
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
    console.log("Handling next for step:", step.key);

    // ---- Step 1: Addresses ----
    if (step.key === "addresses") {
      const valid = await form.trigger(["fromAddress", "toAddress"]);
      if (!valid) {
        console.log("Address validation failed — staying on addresses step");
        return;
      }
      advanceStep();
      return;
    }

    // ---- Step 2: Packages ----
    if (step.key === "packages") {
      const valid = await form.trigger("packages", { shouldFocus: true });
      if (!valid) {
        console.log("❌ Package validation failed — not requesting rates");
        return;
      }

      console.log("✅ Package validation passed — requesting rates...");

      // Request rates
      getRatesMutation.mutate({
        fromAddress: form.getValues("fromAddress"),
        toAddress: form.getValues("toAddress"),
        packages: form.getValues("packages"),
        additionalServices: form.getValues("additionalServices"),
      });

      // Do NOT call advanceStep() here — the mutation's onSuccess will do that.
      return;
    }

    // ---- Step 3: Rates ----
    if (step.key === "rates") {
      if (!selectedRate) {
        showError("No Rate Selected", "Please select a rate before continuing.");
        return;
      }
      handlePurchase(selectedRate);
      return;
    }

    // ---- Step 4: Label ----
    if (step.key === "label") {
      handleReset();
    }
  };


  const handleBack = () => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
  };

  const handlePurchase = (rate: Rate) => {
    if (!rate) return;

    const payload = {
      provider: rate.provider,
      carrier: rate.carrier,
      service: rate.service,
      shipmentId: (rate as any).shipmentId,
      rateId: (rate as any).id || (rate as any).rateId,
    };

    if (!payload.provider || !payload.shipmentId || !payload.rateId) {
      return showError("Invalid Selection", "This rate is missing required fields.");
    }

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

  const isBusy =
    getRatesMutation.isPending || purchaseLabelMutation.isPending;

  // ---- Step content map ----
  const stepContent = useMemo(() => {
    switch (step.key) {
      case "addresses":
        return <AddressFormCombined form={form} />;
      case "packages":
        return (
          <>
            <PackageForm
              showScaleButton={showScaleButton}
             form={form} 
             />
            <div className="border-t pt-5">
              <AdditionalServices form={form} />
            </div>
          </>
        );
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
  ]);

  const shouldShowSidebar = showSidebar && step.key !== "label";

  // ---- Render ----
  return (
    <>
      {showBanner && (
        <BannerSummary
          formData={form.getValues()}
          currentStep={step.key}
          formErrors={form.formState.errors}
          workflow="4-step"
        />
      )}

      <Form {...form}>
        <div
          className={`grid grid-cols-1 gap-6 ${shouldShowSidebar ? "md:grid-cols-[1fr_380px]" : ""
            } pt-4`}
        >
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {step.icon} {step.title}
                </h3>
                {stepContent}
              </CardContent>
            </Card>

            {/* Footer */}
            <StepFooter>
              {currentStepIndex > 0 && step.key != "label" && (
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

          {shouldShowSidebar && (
            <div className="hidden md:block">
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
