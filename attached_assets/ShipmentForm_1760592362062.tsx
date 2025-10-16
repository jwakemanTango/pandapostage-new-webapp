import { useState, useEffect } from "react";
import { 
  Form,
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { createShipmentSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AddressForm from "./AddressForm";
import PackageForm from "./PackageForm";
import RatesSelection from "./RatesSelection";
import AdditionalServices from "./AdditionalServices";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

// Define Rate interface based on the schema in shared/schema.ts
interface Rate {
  id: string;
  carrierId?: number;
  service: string;
  carrier: string;
  rate: string;
  deliveryDays?: number;
  deliveryDate?: string;
}

type ShipmentFormData = z.infer<typeof createShipmentSchema>;

export const ShipmentForm = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["shipmentDetails"]);
  const [shipmentDetailsComplete, setShipmentDetailsComplete] = useState(false);
  const [showRatesSection, setShowRatesSection] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
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
      packageDetails: {
        weight: "", // Will be calculated from weightLbs and weightOz
        weightLbs: "",
        weightOz: "0",
        length: "",
        width: "",
        height: "",
        packageType: "",
      },
      // New field for multiple packages
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
  
  const createShipmentMutation = useMutation({
    mutationFn: async (data: ShipmentFormData) => {
      const response = await apiRequest("POST", "/api/shipments", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Shipment created",
        description: "Your shipment has been created successfully.",
      });
      // Invalidate both the full shipments list and recent shipments
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/shipments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      // Add option to view in history
      toast({
        title: "View shipment history",
        description: "View your new shipment in the history page",
        action: (
          <ToastAction altText="View History" onClick={() => navigate("/history")}>
            View History
          </ToastAction>
        ),
      });
      
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error creating shipment",
        description: `There was an error creating your shipment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const validateShipmentDetails = async () => {
    const addressesValid = await form.trigger(["fromAddress", "toAddress"]);
    
    // Validate packages array (this is the primary validation)
    const packagesValid = await form.trigger("packages");
    const result = addressesValid && packagesValid;
    setShipmentDetailsComplete(result);
    return result;
  };
  
  const validateRates = async () => {
    return await form.trigger("rateSelection");
  };
  
  // Function to fetch rates when the "Get Rates" button is clicked
  const getRatesMutation = useMutation({
    mutationFn: async () => {
      const fromAddress = form.getValues("fromAddress");
      const toAddress = form.getValues("toAddress");
      const packages = form.getValues("packages");
      
      // Ensure we always have a packages array
      let packagesArray = packages && packages.length > 0 ? packages : [];
      
      // If no packages, create one from packageDetails as fallback
      if (packagesArray.length === 0) {
        const packageDetails = form.getValues("packageDetails");
        if (packageDetails && packageDetails.packageType) {
          packagesArray = [packageDetails];
        }
      }
      
      // Convert packages to include calculated weight
      const processedPackages = packagesArray.map(pkg => ({
        ...pkg,
        weight: calculateWeight(pkg.weightLbs, pkg.weightOz || "0")
      }));
      
      // Prepare the data for the rates request - always send packages array
      const data = {
        fromAddress,
        toAddress,
        packages: processedPackages
      };
      
      const response = await apiRequest("POST", "/api/shipments/rates", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRates(data.rates || []);
      
      // If we have rates, show the rates section and expand it
      if (data.rates && data.rates.length > 0) {
        // Show the rates section
        setShowRatesSection(true);
        
        // Only add rates to expanded sections if it's not there already
        if (!expandedSections.includes('rates')) {
          setExpandedSections([...expandedSections, 'rates']);
        }
        
        toast({
          title: "Rates Available",
          description: `Found ${data.rates.length} shipping rate options`,
        });
      } else {
        toast({
          title: "No Rates Found",
          description: "No shipping rates were found for this shipment. Please check your shipment details.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error Getting Rates",
        description: `Unable to retrieve shipping rates: ${error.message}`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoadingRates(false);
    }
  });
  
  // Function to calculate total weight from lbs and oz
  const calculateWeight = (lbs: string, oz: string) => {
    const lbsNum = parseInt(lbs) || 0;
    const ozNum = parseInt(oz) || 0;
    return (lbsNum + (ozNum / 16)).toFixed(2);
  };

  // Check form completion on specific field changes and reset rates when shipment details change
  useEffect(() => {
    // Create a debounced validation function
    let validationTimeout: NodeJS.Timeout;
    
    const checkFormCompletion = () => {
      // Clear any pending validation
      clearTimeout(validationTimeout);
      
      // Set a timeout to avoid validating on every keystroke
      validationTimeout = setTimeout(async () => {
        try {
          // No need to sync to packageDetails anymore - we use packages array directly
          
          const detailsValid = await validateShipmentDetails();
          
          // Reset rates when shipment details change
          setRates([]);
          
          // Hide rates section completely when shipment details change
          setShowRatesSection(false);
          
          // If the rates section is open, close it since the data is now invalid
          if (expandedSections.includes('rates')) {
            setExpandedSections(
              expandedSections
                .filter(section => section !== 'rates')
                .concat(['shipmentDetails'])
            );
          }
        } catch (err) {
          console.error("Validation error:", err);
        }
      }, 500);
    };
    
    // Form subscription for specific fields we care about
    const subscription = form.watch((value, { name }) => {
      // Only run validation if we're changing a relevant field
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
  }, [expandedSections]);
  
  const handleAccordionValueChange = (value: string[]) => {
    // Just update the expanded sections as normal - the rates section's visibility 
    // is completely controlled by the showRatesSection state
    setExpandedSections(value);
  };

  const onSubmit = async (data: ShipmentFormData) => {
    // Make sure all sections are valid
    const detailsValid = await validateShipmentDetails();
    const ratesValid = await validateRates();
    
    if (detailsValid && ratesValid) {
      // Make a copy of the data to avoid mutating the form values
      const shipmentData = {...data};
      
      // Ensure packages array is always populated and valid
      if (!shipmentData.packages || shipmentData.packages.length === 0) {
        // If no packages array, create one from packageDetails
        if (shipmentData.packageDetails?.packageType) {
          shipmentData.packages = [{
            packageType: shipmentData.packageDetails.packageType,
            weightLbs: shipmentData.packageDetails.weightLbs,
            weightOz: shipmentData.packageDetails.weightOz || "0",
            length: shipmentData.packageDetails.length || "",
            width: shipmentData.packageDetails.width || "",
            height: shipmentData.packageDetails.height || ""
          }];
        } else {
          toast({
            title: "Package Information Missing",
            description: "Please complete the package details before submitting.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Clean up the packages array - ensure all required fields are present
        shipmentData.packages = shipmentData.packages.map(pkg => ({
          packageType: pkg.packageType || "parcel",
          weightLbs: pkg.weightLbs || "",
          weightOz: pkg.weightOz || "0",
          length: pkg.length || "",
          width: pkg.width || "",
          height: pkg.height || ""
        })).filter(pkg => pkg.packageType && pkg.weightLbs); // Only include packages with required data
        
        // Ensure we have at least one valid package
        if (shipmentData.packages.length === 0) {
          toast({
            title: "No Valid Packages",
            description: "Please ensure at least one package has package type and weight specified.",
            variant: "destructive",
          });
          return;
        }
      }
      
      console.log("Submitting shipment data:", shipmentData);
      createShipmentMutation.mutate(shipmentData);
    } else {
      // Open the invalid sections
      const sections = [];
      
      if (!detailsValid) sections.push("shipmentDetails");
      if (!ratesValid) sections.push("rates");
      
      setExpandedSections(sections);
      
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted errors in the form.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Accordion 
                type="multiple" 
                value={expandedSections} 
                onValueChange={handleAccordionValueChange}
                className="mb-6"
              >
                {/* Section 1: Shipment Details */}
                <AccordionItem value="shipmentDetails" className="border-b">
                  <AccordionTrigger className="py-5 font-semibold text-lg bg-orange-50 px-4 rounded-t-md text-orange-700">
                    Shipment Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-8 py-2">
                      {/* Addresses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="border rounded-md p-6 shadow-sm">
                          <AddressForm 
                            form={form} 
                            type="fromAddress" 
                            title="Sender Address" 
                          />
                        </div>
                        <div className="border rounded-md p-6 shadow-sm">
                          <AddressForm 
                            form={form} 
                            type="toAddress" 
                            title="Recipient Address" 
                          />
                        </div>
                      </div>
                      
                      {/* Package & Services */}
                      <div className="grid grid-cols-1 gap-12">
                        <div className="border rounded-md p-6 shadow-sm">
                          <PackageForm 
                            form={form} 
                            showErrors={showValidationErrors} 
                          />
                        </div>
                        <div className="border rounded-md p-6 shadow-sm">
                          <AdditionalServices form={form} />
                        </div>
                      </div>
                      
                      {/* Get Rates Button */}
                      <div className="flex justify-end mt-4">
                        <Button 
                          type="button"
                          onClick={async () => {
                            // Always show validation errors when "Get Rates" is clicked
                            setShowValidationErrors(true);
                            
                            const isValid = await validateShipmentDetails();
                            if (isValid) {
                              setIsLoadingRates(true);
                              getRatesMutation.mutate();
                              
                              // Show and expand the Rates section, collapse Shipment Details
                              setShowRatesSection(true);
                              setExpandedSections(['rates']);
                            } else {
                              toast({
                                title: "Incomplete Information",
                                description: "Please complete all required shipment details before getting rates.",
                                variant: "destructive",
                              });
                            }
                          }}
                          disabled={isLoadingRates}
                        >
                          {isLoadingRates ? "Loading Rates..." : "Get Rates"}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Section 2: Rates - Only show after clicking Get Rates */}
                {showRatesSection && (
                  <AccordionItem value="rates" className="border-b">
                    <AccordionTrigger className="py-5 font-semibold text-lg bg-orange-50 px-4 rounded-t-md text-orange-700">
                      Shipping Rates
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="py-2">
                        <RatesSelection form={form} rates={rates} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              
              {/* Purchase flow now handled directly in the rates section */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShipmentForm;
