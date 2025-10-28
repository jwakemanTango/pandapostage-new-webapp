import { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createShipmentSchema, ShipmentFormData, Rate } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import AddressFormCombined from "./AddressFormCombined";
import RatesSelection from "../RatesSelection";
import AdditionalServices from "./AdditionalServices";
import { LiveSummary } from "./LiveSummary";
import { LabelSummary } from "../LabelSummary";
import { BannerLiveSummary } from "../BannerLiveSummary";
import {
  MapPin,
  Package,
  DollarSign,
  Printer,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import PackageForm from "./PackageForm-Inline";

interface ShipmentFormProps {
  onGetRates?: (data: any) => void;
  onPurchaseLabel?: (data: any) => Promise<any> | any | void;
  rates?: Rate[];
  isLoadingRates?: boolean;
  isPurchasing?: boolean;
  useCompactAddresses?: boolean;
  showLiveSummary?: boolean;
  showLabelPreview?: boolean;
  showBannerSummary?: boolean;
}

export const ShipmentFormLatest = ({
  onGetRates,
  onPurchaseLabel,
  rates = [],
  isLoadingRates = false,
  isPurchasing = false,
  useCompactAddresses = false,
  showLiveSummary = true,
  showLabelPreview = true,
  showBannerSummary = false,
}: ShipmentFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [purchasedLabel, setPurchasedLabel] = useState<any | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    mode: "onChange",
    defaultValues: {
      fromAddress: { country: "US" },
      toAddress: { country: "US" },
      packages: [{ packageType: "parcel", carrier: "any" }],
    },
  });

  const handleNext = async () => {
    const valid =
      currentStep === 1
        ? await form.trigger(["fromAddress", "toAddress"])
        : currentStep === 2
        ? await form.trigger("packages")
        : true;
    if (!valid) return;

    if (currentStep === 2) {
      onGetRates?.({
        fromAddress: form.getValues("fromAddress"),
        toAddress: form.getValues("toAddress"),
        packages: form.getValues("packages"),
        additionalServices: form.getValues("additionalServices"),
      });
    }

    if (!completedSteps.includes(currentStep))
      setCompletedSteps([...completedSteps, currentStep]);
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePurchase = async (rate: Rate) => {
    try {
      const purchasePayload = {
        provider: rate.provider || rate.carrier || "unknown",
        shipmentId: rate.shipmentId,
        rateId: rate.id || rate.rateId,
      };

      if (!purchasePayload.provider || !purchasePayload.shipmentId || !purchasePayload.rateId) {
        console.error("Missing required purchase fields:", purchasePayload);
        throw new Error("Missing required fields for purchase");
      }

      const result = await onPurchaseLabel?.(purchasePayload);

      if (result) {
        setPurchasedLabel(result);
        setCompletedSteps([...completedSteps, 3]);
        setCurrentStep(4);
      }
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const handleResetForm = () => {
    form.reset({
      fromAddress: { country: "US" },
      toAddress: { country: "US" },
      packages: [{ packageType: "parcel", carrier: "any" }],
      additionalServices: {},
    });

    setCurrentStep(1);
    setCompletedSteps([]);
    setPurchasedLabel(null);
    setSelectedRate(null);
    window.scrollTo(0, 0);
  };

  const renderStep = () => {
    const baseFooterClasses =
      "sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-4";
    const footerInner = "w-full flex flex-col sm:flex-row gap-3";

    switch (currentStep) {
      case 1:
        return (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Shipping Addresses
                </h3>
                <AddressFormCombined form={form} />
              </CardContent>
            </Card>

            <div className={baseFooterClasses}>
              <div className={footerInner}>
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" /> Package & Services
                </h3>
                <PackageForm form={form} />
                <div className="border-t pt-5">
                  <AdditionalServices form={form} />
                </div>
              </CardContent>
            </Card>

            <div className={baseFooterClasses}>
              <div className={footerInner}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-full sm:w-auto flex-1 gap-2 h-11"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoadingRates}
                  className="w-full sm:w-auto flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
                >
                  {isLoadingRates ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading Rates...
                    </>
                  ) : (
                    <>
                      Get Rates
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> Select Shipping Rate
                </h3>
                <RatesSelection
                  rates={rates}
                  isLoading={isLoadingRates}
                  onSelectRate={setSelectedRate}
                  selectedRateId={selectedRate?.id}
                />
              </CardContent>
            </Card>

            <div className={baseFooterClasses}>
              <div className={footerInner}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="w-full sm:w-auto flex-1 gap-2 h-11"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={() => handlePurchase(selectedRate!)}
                  disabled={!selectedRate || isPurchasing}
                  className="w-full sm:w-auto flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Purchasing...
                    </>
                  ) : (
                    "Buy Label"
                  )}
                </Button>
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-primary" /> Label Purchased
                </h3>
                {purchasedLabel && (
                  <LabelSummary
                    purchasedLabel={purchasedLabel}
                    formData={form.getValues()}
                    showLabelPreview={showLabelPreview}
                  />
                )}
              </CardContent>
            </Card>

            {/* Sticky footer – Create Another Shipment only */}
            {purchasedLabel && (
              <div className={baseFooterClasses}>
                <div className="w-full">
                  <Button
                    onClick={handleResetForm}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-medium h-11"
                  >
                    <Plus className="h-4 w-4" />
                    Create Another Shipment
                  </Button>
                </div>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const shouldShowLiveSummary = showLiveSummary && currentStep !== 4;

  return (
    <>
      {showBannerSummary && (
        <BannerLiveSummary
          formData={form.getValues()}
          currentStep={
            currentStep === 1
              ? "addresses"
              : currentStep === 2
              ? "packages"
              : currentStep === 3
              ? "rates"
              : "label"
          }
          formErrors={form.formState.errors}
          workflow="4-step"
        />
      )}

      <Form {...form}>
        <div
          className={`grid grid-cols-1 gap-6 ${
            shouldShowLiveSummary ? "md:grid-cols-[1fr_380px]" : ""
          } pt-4`}
        >
          <div className="space-y-6">{renderStep()}</div>

          {shouldShowLiveSummary && (
            <div className="hidden md:block">
              <LiveSummary
                formData={form.getValues()}
                currentStep={currentStep}
                completedSteps={completedSteps}
                purchasedLabel={purchasedLabel}
                onStepClick={(s) => setCurrentStep(s)}
                formErrors={form.formState.errors}
              />
            </div>
          )}
        </div>
      </Form>
    </>
  );
};
