import { useState, useEffect, useRef } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createShipmentSchema, ShipmentFormData, Rate, Address } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, ArrowLeft, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CompactAddressForm } from "./CompactAddressForm";
import { CompactAddressFormCombined } from "./CompactAddressFormCombined";
import { CompactPackageForm } from "./CompactPackageForm";
import { CompactAdditionalServices } from "./CompactAdditionalServices";
import { CompactLiveSummary } from "./CompactLiveSummary";
import { BannerLiveSummary } from "../BannerLiveSummary";
import { LabelSummary } from "../LabelSummary";
import RatesSelection from "../RatesSelection";

interface ShipmentFormFullProps {
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

type ViewState = "form" | "summary" | "label";

export const ShipmentFormFull = ({
  onGetRates,
  onPurchaseLabel,
  rates = [],
  isLoadingRates = false,
  isPurchasing = false,
  useCompactAddresses = false,
  showLiveSummary = true,
  showLabelPreview = true,
  showBannerSummary = false
}: ShipmentFormFullProps) => {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [purchasedLabel, setPurchasedLabel] = useState<any | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const packageSectionRef = useRef<HTMLDivElement>(null);

  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fromAddress: {
        name: "",
        company: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      toAddress: {
        name: "",
        company: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
      packages: [
        {
          packageType: "parcel",
          weightLbs: "",
          weightOz: "0",
          length: "",
          width: "",
          height: "",
          carrier: "any",
        }
      ],
      rateSelection: {
        service: "",
        rate: "",
        carrierId: undefined,
      },
      additionalServices: {
        saturdayDelivery: false,
        requireSignature: false,
        expressMailWaiver: false,
        insuranceValue: false,
        returnLabel: false,
        weekendService: false,
        additionalHandling: false,
        certifiedMail: false,
      }
    },
  });

  const [formValues, setFormValues] = useState<ShipmentFormData>(form.getValues());

  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value as ShipmentFormData);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleGetRates = async () => {
    const isValid = await form.trigger(["fromAddress", "toAddress", "packages"]);
    if (!isValid) {
      const packageErrors = form.formState.errors?.packages;
      if (packageErrors && packageSectionRef.current) {
        packageSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const fromAddress = form.getValues("fromAddress");
    const toAddress = form.getValues("toAddress");
    const packages = form.getValues("packages");
    const additionalServices = form.getValues("additionalServices");

    onGetRates?.({ fromAddress, toAddress, packages, additionalServices });
    setViewState("summary");
    window.scrollTo(0, 0);
  };

  const handlePurchaseLabel = async (rate: Rate) => {
    try {
      const purchasePayload = {
        provider: rate.provider || rate.carrier || "unknown",
        shipmentId: rate.shipmentId,
        rateId: rate.id || rate.rateId,
        //reference: form.getValues()?.reference,
      };

      if (!purchasePayload.provider || !purchasePayload.shipmentId || !purchasePayload.rateId) {
        throw new Error("Missing required fields for purchase (provider, shipmentId, rateId)");
      }

      const result = await onPurchaseLabel?.(purchasePayload);

      if (result && typeof (result as any).then === "function") {
        const purchased = await result;
        if (purchased) setPurchasedLabel(purchased);
      } else if (result && typeof result === "object") {
        setPurchasedLabel(result);
      }

      setViewState("label");
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const handleGoBack = () => {
    setViewState("form");
    setSelectedRate(null);
  };

  const handleCreateAnother = () => {
    setPurchasedLabel(null);
    setSelectedRate(null);
    setViewState("form");
    form.reset();
  };

  const handleStartOver = () => {
    setPurchasedLabel(null);
    setSelectedRate(null);
    setViewState("form");
    form.reset();
  };

  const handleSavedAddressSelect = (addressId: string, type: "fromAddress" | "toAddress") => {
    const address = addresses?.find(a => a.id.toString() === addressId);
    if (address) {
      form.setValue(`${type}.name`, address.name);
      form.setValue(`${type}.company`, address.company || "");
      form.setValue(`${type}.phone`, address.phone);
      form.setValue(`${type}.addressLine1`, address.addressLine1);
      form.setValue(`${type}.addressLine2`, address.addressLine2 || "");
      form.setValue(`${type}.city`, address.city);
      form.setValue(`${type}.state`, address.state);
      form.setValue(`${type}.zipCode`, address.zipCode);
      form.setValue(`${type}.country`, address.country);
      form.clearErrors(type);
    }
  };

  // ------------------------------
  // LABEL VIEW
  // ------------------------------
  if (viewState === "label" && purchasedLabel) {
    return (
      <>
        {showBannerSummary && (
          <BannerLiveSummary
            formData={form.getValues()}
            currentStep="printLabel"
            formErrors={form.formState.errors}
            workflow="3-step"
          />
        )}
        <div className="space-y-3 lg:space-y-4 pt-4">
          <div className="flex items-center justify-between gap-3 pb-2 border-b">
            <h2 className="text-xl font-semibold">Print Label</h2>
            <Button
              type="button"
              onClick={handleStartOver}
              variant="outline"
              size="sm"
              className="gap-2"
              data-testid="button-start-over"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start Over
            </Button>
          </div>

          <div className={`grid grid-cols-1 gap-4 ${showLiveSummary ? "lg:grid-cols-[1fr_320px]" : ""}`}>
            <div>
              <LabelSummary
                purchasedLabel={purchasedLabel}
                onCreateAnother={handleCreateAnother}
                showLabelPreview={showLabelPreview}
              />
            </div>

            {showLiveSummary && (
              <div className="hidden lg:block sticky top-0 self-start">
                <CompactLiveSummary
                  formData={form.getValues()}
                  currentStep="printLabel"
                  formErrors={form.formState.errors}
                />
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // ------------------------------
  // SUMMARY / RATE SELECTION VIEW
  // ------------------------------
  if (viewState === "summary") {
    return (
      <div className="flex flex-col h-full lg:h-auto">
        {showBannerSummary && (
          <BannerLiveSummary
            formData={form.getValues()}
            currentStep="selectRate"
            formErrors={form.formState.errors}
            workflow="3-step"
          />
        )}

        <div className={`grid grid-cols-1 gap-6 ${showLiveSummary ? "lg:grid-cols-[1fr_320px]" : ""} pt-4`}>
          {/* Left column: rate list + buttons */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b">
              <h2 className="text-xl font-semibold">Select Rate</h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={handleStartOver}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Start Over</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleGoBack}
                  variant="outline"
                  size="sm"
                  className="gap-2 hidden lg:flex"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Go Back
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base font-semibold">Available Shipping Rates</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <RatesSelection
                  rates={rates}
                  isLoading={isLoadingRates}
                  selectedRateId={selectedRate?.id || null}
                  onSelectRate={setSelectedRate}
                />
              </CardContent>
            </Card>

            {/* Full-width footer buttons (desktop + mobile) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-2">
              <Button
                type="button"
                onClick={handleGoBack}
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                type="button"
                disabled={!selectedRate || isPurchasing}
                onClick={() => selectedRate && handlePurchaseLabel(selectedRate)}
                size="lg"
                className="flex-1 gap-2"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Purchasing...
                  </>
                ) : (
                  "Buy Label"
                )}
              </Button>
            </div>
          </div>

          {/* Right column: summary */}
          {showLiveSummary && (
            <div className="hidden lg:block sticky top-0 self-start">
              <CompactLiveSummary
                formData={form.getValues()}
                currentStep="selectRate"
                formErrors={form.formState.errors}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------
  // SHIPMENT FORM VIEW
  // ------------------------------
  return (
    <Form {...form}>
      <div className="flex flex-col h-full lg:h-auto">
        {showBannerSummary && (
          <BannerLiveSummary
            formData={formValues}
            currentStep="shipment"
            formErrors={form.formState.errors}
            workflow="3-step"
          />
        )}
        <div className="flex-1 lg:flex-none overflow-y-auto lg:overflow-visible pb-24 lg:pb-0 pt-4">
          <div className="space-y-3 lg:space-y-4">
            <div className="flex items-center justify-between gap-3 pb-2 border-b">
              <h2 className="text-xl font-semibold">Shipment Details</h2>
              <Button
                type="button"
                onClick={handleStartOver}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Start Over</span>
              </Button>
            </div>

            <div className={`grid grid-cols-1 gap-4 ${showLiveSummary ? "lg:grid-cols-[1fr_320px]" : ""}`}>
              <div className="space-y-4">
                {useCompactAddresses ? (
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    <CompactAddressFormCombined
                      form={form}
                      addresses={addresses}
                      onSavedAddressSelect={handleSavedAddressSelect}
                    />
                    <div className="space-y-3" ref={packageSectionRef}>
                      <CompactPackageForm form={form} />
                      <CompactAdditionalServices form={form} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                      <CompactAddressForm
                        form={form}
                        type="fromAddress"
                        title="Ship From"
                        icon={<MapPin className="h-4 w-4" />}
                        addresses={addresses}
                        onSavedAddressSelect={handleSavedAddressSelect}
                      />
                      <CompactAddressForm
                        form={form}
                        type="toAddress"
                        title="Ship To"
                        icon={<MapPin className="h-4 w-4" />}
                        addresses={addresses}
                        onSavedAddressSelect={handleSavedAddressSelect}
                      />
                    </div>
                    <div className="grid gap-3 grid-cols-1 lg:grid-cols-2" ref={packageSectionRef}>
                      <CompactPackageForm form={form} />
                      <CompactAdditionalServices form={form} />
                    </div>
                  </>
                )}

                <div className="hidden lg:block pt-2">
                  <Button
                    type="button"
                    onClick={handleGetRates}
                    disabled={isLoadingRates}
                    className="w-full gap-2"
                  >
                    {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoadingRates ? "Loading..." : "Get Rates"}
                  </Button>
                </div>
              </div>

              {showLiveSummary && (
                <div className="hidden lg:block sticky top-0 self-start">
                  <CompactLiveSummary
                    formData={formValues}
                    currentStep="shipment"
                    formErrors={form.formState.errors}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t lg:hidden z-10">
          <Button
            type="button"
            onClick={handleGetRates}
            disabled={isLoadingRates}
            className="w-full h-11 text-sm"
          >
            {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isLoadingRates ? "Loading Rates..." : "Get Rates"}
          </Button>
        </div>
      </div>
    </Form>
  );
};
