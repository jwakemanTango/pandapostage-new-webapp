import { useState, useEffect } from "react";
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
import { MapPin, Package, DollarSign, Printer, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

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
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [purchasedLabel, setPurchasedLabel] = useState<Rate | null>(null);
  const [ratesAvailable, setRatesAvailable] = useState(false);
  
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
  
  useEffect(() => {
    const subscription = form.watch((value) => {
      setFormValues(value as ShipmentFormData);
      
      if (currentStep === 1 || currentStep === 2) {
        setRatesAvailable(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [currentStep]);

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 1) {
      return await form.trigger(["fromAddress", "toAddress"]);
    } else if (step === 2) {
      return await form.trigger("packages");
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    
    if (!isValid) return;

    if (currentStep === 2) {
      const fromAddress = form.getValues("fromAddress");
      const toAddress = form.getValues("toAddress");
      const packages = form.getValues("packages");
      
      onGetRates?.({
        fromAddress,
        toAddress,
        packages
      });
      
      setRatesAvailable(true);
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step === 3 && purchasedLabel) {
      return;
    }
    
    if (step <= Math.max(...completedSteps, 0) + 1) {
      setCurrentStep(step);
    }
  };

  const handlePurchase = (rate: Rate) => {
    setPurchasedLabel(rate);
    
    const data = form.getValues();
    onPurchaseLabel?.({
      ...data,
      rateSelection: {
        service: rate.service,
        rate: rate.rate,
        carrierId: rate.carrierId
      }
    });
    
    if (!completedSteps.includes(3)) {
      setCompletedSteps([...completedSteps, 3]);
    }
    setCurrentStep(4);
  };

  const handleCreateAnother = () => {
    form.reset();
    setCurrentStep(1);
    setCompletedSteps([]);
    setPurchasedLabel(null);
    setRatesAvailable(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
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
        );

      case 2:
        return (
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
        );

      case 3:
        return (
          <Card className="bg-gradient-to-br from-background to-muted/20">
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
        );

      case 4:
        return (
          <Card className="bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Printer className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Label Purchased</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-2 w-2 rounded-full bg-chart-2" />
                    <p className="text-sm font-medium text-chart-2">Label successfully purchased!</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your shipping label has been created and is ready to download.
                  </p>
                </div>

                {purchasedLabel && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Carrier & Service</p>
                        <p className="font-semibold">{purchasedLabel.carrier} - {purchasedLabel.service}</p>
                      </div>
                      
                      <div className="flex gap-8">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rate</p>
                          <p className="font-semibold text-lg">${purchasedLabel.rate}</p>
                        </div>
                        {purchasedLabel.deliveryDays && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Delivery Time</p>
                            <p className="font-semibold">{purchasedLabel.deliveryDays} business days</p>
                          </div>
                        )}
                      </div>

                      {purchasedLabel.deliveryDate && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                          <p className="font-medium">{purchasedLabel.deliveryDate}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" data-testid="button-download-label">
                        <Printer className="h-4 w-4" />
                        Download Label
                      </Button>
                      <Button variant="outline" className="flex-1" data-testid="button-email-label">
                        Email Label
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <Button 
                    onClick={handleCreateAnother}
                    variant="outline"
                    className="w-full"
                    data-testid="button-create-another"
                  >
                    Create Another Shipment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const renderNavigationButtons = () => {
    if (currentStep === 4) {
      return null;
    }

    return (
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t lg:relative lg:bg-transparent lg:border-0 p-4 lg:p-0 -mx-4 lg:mx-0">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="gap-2"
              size="lg"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoadingRates || (currentStep === 3 && !ratesAvailable)}
            className="flex-1 gap-2"
            size="lg"
            data-testid={currentStep === 2 ? "button-get-rates" : "button-next"}
          >
            {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin" />}
            {currentStep === 2 
              ? (isLoadingRates ? 'Loading Rates...' : 'Get Rates')
              : 'Next'
            }
            {!isLoadingRates && currentStep !== 2 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          {renderStepContent()}
        </div>
        {renderNavigationButtons()}
      </div>

      <div className="hidden lg:block">
        <LiveSummary 
          formData={formValues}
          currentStep={currentStep}
          completedSteps={completedSteps}
          purchasedLabel={purchasedLabel}
          onStepClick={goToStep}
        />
      </div>
    </div>
  );
};
