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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";

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
  const [expandedSections, setExpandedSections] = useState<string[]>(["shipmentDetails"]);
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
      
      if (!expandedSections.includes('rates')) {
        setExpandedSections([...expandedSections, 'rates']);
      }
      
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
            
            if (expandedSections.includes('rates')) {
              setExpandedSections(
                expandedSections
                  .filter(section => section !== 'rates')
                  .concat(['shipmentDetails'])
              );
            }
          }
        } catch (err) {
          console.error("Validation error:", err);
        }
      }, 500);
    };
    
    const subscription = form.watch((value, { name }) => {
      if (name && (
        name.startsWith('fromAddress') || 
        name.startsWith('toAddress') || 
        name.startsWith('packages')
      )) {
        checkFormCompletion();
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(validationTimeout);
    };
  }, [expandedSections, showRatesSection]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form>
            <Accordion 
              type="multiple" 
              value={expandedSections} 
              onValueChange={setExpandedSections}
              className="mb-4"
            >
              <AccordionItem value="shipmentDetails">
                <AccordionTrigger className="text-base font-semibold py-3" data-testid="accordion-shipment-details">
                  Shipment Details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
                      <div className="space-y-6">
                        <AddressForm form={form} type="fromAddress" title="From Address" />
                        <AddressForm form={form} type="toAddress" title="To Address" />
                      </div>
                      
                      <div className="space-y-6">
                        <PackageForm form={form} />
                        <AdditionalServices form={form} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 pt-6 border-t">
                    <Button 
                      type="button" 
                      onClick={handleGetRates}
                      disabled={isLoadingRates}
                      className="gap-2"
                      data-testid="button-get-rates"
                    >
                      {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isLoadingRates ? 'Loading Rates...' : 'Get Rates'}
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {showRatesSection && (
                <AccordionItem value="rates" ref={ratesSectionRef}>
                  <AccordionTrigger className="text-base font-semibold py-3" data-testid="accordion-rates">
                    Select Shipping Rate
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-4">
                      <RatesSelection 
                        rates={rates}
                        isLoading={isLoadingRates}
                        onPurchase={handlePurchase}
                        isPurchasing={isPurchasing}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
