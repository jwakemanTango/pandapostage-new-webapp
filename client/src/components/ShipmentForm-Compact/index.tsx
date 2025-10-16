import { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createShipmentSchema, ShipmentFormData, Rate, Address } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CompactAddressForm } from "./CompactAddressForm";
import { CompactPackageForm } from "./CompactPackageForm";
import { CompactAdditionalServices } from "./CompactAdditionalServices";
import { CompactLiveSummary } from "./CompactLiveSummary";
import { LabelSummary } from "./LabelSummary";
import RatesSelection from "../ShipmentForm-Steps/RatesSelection";

interface ShipmentFormFullProps {
  onGetRates?: (data: any) => void;
  onPurchaseLabel?: (data: any) => void;
  rates?: Rate[];
  isLoadingRates?: boolean;
  isPurchasing?: boolean;
}

type ViewState = "form" | "summary" | "label";

export const ShipmentFormFull = ({
  onGetRates,
  onPurchaseLabel,
  rates = [],
  isLoadingRates = false,
  isPurchasing = false
}: ShipmentFormFullProps) => {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [purchasedLabel, setPurchasedLabel] = useState<Rate | null>(null);

  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
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

  const handleGetRates = async () => {
    const isValid = await form.trigger(["fromAddress", "toAddress", "packages"]);
    
    if (!isValid) {
      return;
    }

    const fromAddress = form.getValues("fromAddress");
    const toAddress = form.getValues("toAddress");
    const packages = form.getValues("packages");
    
    onGetRates?.({
      fromAddress,
      toAddress,
      packages
    });
    
    setViewState("summary");
  };

  const handlePurchaseLabel = (rate: Rate) => {
    setPurchasedLabel(rate);
    setViewState("label");
    onPurchaseLabel?.(rate);
  };

  const handleGoBack = () => {
    setViewState("form");
  };

  const handleCreateAnother = () => {
    setPurchasedLabel(null);
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
    }
  };

  if (viewState === "label" && purchasedLabel) {
    return (
      <LabelSummary 
        purchasedLabel={purchasedLabel}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  if (viewState === "summary") {
    return (
      <div className="space-y-3">
        <div className="flex justify-start">
          <Button
            type="button"
            onClick={handleGoBack}
            variant="outline"
            className="gap-2 h-8 text-xs"
            data-testid="button-go-back"
          >
            <ArrowLeft className="h-3 w-3" />
            Go Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <CompactLiveSummary formData={form.getValues()} />
          
          <Card>
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm">Available Shipping Rates</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <RatesSelection
                rates={rates}
                isLoading={isLoadingRates}
                onPurchase={handlePurchaseLabel}
                isPurchasing={isPurchasing}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <CompactAddressForm
            form={form}
            type="fromAddress"
            title="Ship From"
            icon={<MapPin className="h-3.5 w-3.5" />}
            addresses={addresses}
            onSavedAddressSelect={handleSavedAddressSelect}
          />
          
          <CompactAddressForm
            form={form}
            type="toAddress"
            title="Ship To"
            icon={<MapPin className="h-3.5 w-3.5" />}
            addresses={addresses}
            onSavedAddressSelect={handleSavedAddressSelect}
          />
          
          <div className="space-y-3">
            <CompactPackageForm form={form} />
            <CompactAdditionalServices form={form} />
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            type="button"
            onClick={handleGetRates}
            disabled={isLoadingRates}
            className="w-full lg:w-auto min-w-[200px] h-9 text-sm"
            data-testid="button-get-rates"
          >
            {isLoadingRates && <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />}
            {isLoadingRates ? 'Loading Rates...' : 'Get Rates'}
          </Button>
        </div>
      </div>
    </Form>
  );
};
