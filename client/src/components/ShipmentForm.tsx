import { useState, useEffect, useRef } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createShipmentSchema, ShipmentFormData, Rate } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import AddressForm from "./AddressForm";
import PackageForm from "./PackageForm";
import RatesSelection from "./RatesSelection";
import AdditionalServices from "./AdditionalServices";
import { LiveSummary } from "./LiveSummary";
import { MapPin, Package, Zap, DollarSign, Loader2 } from "lucide-react";

interface ShipmentFormProps {
  onGetRates?: (data: any) => void;
  onPurchaseLabel?: (data: any) => void;
  rates?: Rate[];
  isLoadingRates?: boolean;
  isPurchasing?: boolean;
}

export const ShipmentForm = ({ 
  onGetRates, 
  onPurchaseLabel,
  rates = [],
  isLoadingRates = false,
  isPurchasing = false
}: ShipmentFormProps) => {
  const [shipmentDetailsComplete, setShipmentDetailsComplete] = useState(false);
  const [showRatesSection, setShowRatesSection] = useState(false);
  const ratesSectionRef = useRef<HTMLDivElement>(null);
  
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
  
  const validateShipmentDetails = async () => {
    const addressesValid = await form.trigger(["fromAddress", "toAddress"]);
    const packagesValid = await form.trigger("packages");
    const result = addressesValid && packagesValid;
    setShipmentDetailsComplete(result);
    return result;
  };
  
  const handleGetRates = async () => {
    const isValid = await validateShipmentDetails();
    
    if (isValid) {
      const fromAddress = form.getValues("fromAddress");
      const toAddress = form.getValues("toAddress");
      const packages = form.getValues("packages");
      
      onGetRates?.({
        fromAddress,
        toAddress,
        packages
      });
      
      setShowRatesSection(true);
      
      setTimeout(() => {
        ratesSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  const handlePurchase = (rate: Rate) => {
    const data = form.getValues();
    onPurchaseLabel?.({
      ...data,
      rateSelection: {
        service: rate.service,
        rate: rate.rate,
        carrierId: rate.carrierId
      }
    });
  };

  useEffect(() => {
    let validationTimeout: NodeJS.Timeout;
    
    const checkFormCompletion = () => {
      clearTimeout(validationTimeout);
      
      validationTimeout = setTimeout(async () => {
        try {
          await validateShipmentDetails();
          
          if (showRatesSection) {
            setShowRatesSection(false);
          }
        } catch (err) {
          console.error("Validation error:", err);
        }
      }, 500);
    };
    
    const subscription = form.watch((value) => {
      setFormValues(value as ShipmentFormData);
      checkFormCompletion();
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(validationTimeout);
    };
  }, [showRatesSection]);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Shipping Addresses</h3>
            </div>
            
            <Form {...form}>
              <form className="space-y-6">
                <AddressForm form={form} type="fromAddress" title="From Address" />
                <div className="border-t pt-6">
                  <AddressForm form={form} type="toAddress" title="To Address" />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Package & Services</h3>
            </div>
            
            <Form {...form}>
              <form className="space-y-6">
                <PackageForm form={form} />
                <div className="border-t pt-6">
                  <AdditionalServices form={form} />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t lg:relative lg:bg-transparent lg:border-0 p-4 lg:p-0 -mx-4 lg:mx-0">
          <Button 
            type="button" 
            onClick={handleGetRates}
            disabled={isLoadingRates}
            className="w-full gap-2"
            size="lg"
            data-testid="button-get-rates"
          >
            {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoadingRates ? 'Loading Rates...' : 'Get Rates'}
          </Button>
        </div>

        {showRatesSection && (
          <Card className="bg-gradient-to-br from-background to-muted/20" ref={ratesSectionRef}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Select Shipping Rate</h3>
              </div>
              <RatesSelection 
                rates={rates}
                isLoading={isLoadingRates}
                onPurchase={handlePurchase}
                isPurchasing={isPurchasing}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="hidden lg:block">
        <LiveSummary 
          formData={formValues} 
          isComplete={shipmentDetailsComplete}
        />
      </div>
    </div>
  );
};
