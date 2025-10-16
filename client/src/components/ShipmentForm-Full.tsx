import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createShipmentSchema, ShipmentFormData, Rate, Address } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MapPin, Package as PackageIcon } from "lucide-react";
import RatesSelection from "./RatesSelection";
import { useQuery } from "@tanstack/react-query";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const PACKAGE_TYPES = [
  { value: "letter", label: "Letter/Envelope" },
  { value: "parcel", label: "Parcel/Package" },
  { value: "large_box", label: "Large Box" },
  { value: "flat_rate_envelope", label: "Flat Rate Envelope" },
  { value: "flat_rate_box_small", label: "Small Flat Rate Box" },
  { value: "flat_rate_box_medium", label: "Medium Flat Rate Box" },
  { value: "flat_rate_box_large", label: "Large Flat Rate Box" },
  { value: "regional_box_a", label: "Regional Box A" },
  { value: "regional_box_b", label: "Regional Box B" },
  { value: "custom", label: "Custom Package" },
];

interface ShipmentFormFullProps {
  onGetRates?: (data: any) => void;
  onPurchaseLabel?: (data: any) => void;
  rates?: Rate[];
  isLoadingRates?: boolean;
  isPurchasing?: boolean;
}

export const ShipmentFormFull = ({
  onGetRates,
  onPurchaseLabel,
  rates = [],
  isLoadingRates = false,
  isPurchasing = false
}: ShipmentFormFullProps) => {
  const [ratesAvailable, setRatesAvailable] = useState(false);

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
    
    setRatesAvailable(true);
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

  const renderAddressSection = (type: "fromAddress" | "toAddress", title: string, icon: React.ReactNode) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormField
          control={form.control}
          name={`${type}.dummy` as any}
          render={() => (
            <FormItem>
              <FormLabel className="text-xs">Select Saved Address</FormLabel>
              <Select onValueChange={(value) => handleSavedAddressSelect(value, type)}>
                <SelectTrigger className="h-8 text-sm" data-testid={`select-saved-${type}`}>
                  <SelectValue placeholder="-- Select --" />
                </SelectTrigger>
                <SelectContent>
                  {addresses && addresses.length > 0 ? (
                    addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id.toString()}>
                        {address.name}, {address.city}, {address.state}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No saved addresses
                    </div>
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name={`${type}.company`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Company</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" className="h-8 text-sm" {...field} data-testid={`input-${type}-company`} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${type}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Contact Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" className="h-8 text-sm" {...field} data-testid={`input-${type}-name`} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Street Address" className="h-8 text-sm" {...field} data-testid={`input-${type}-address1`} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine2`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Apt, Suite, etc." className="h-8 text-sm" {...field} data-testid={`input-${type}-address2`} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name={`${type}.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">City</FormLabel>
                <FormControl>
                  <Input placeholder="City" className="h-8 text-sm" {...field} data-testid={`input-${type}-city`} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${type}.state`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">State</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm" data-testid={`select-${type}-state`}>
                      <SelectValue placeholder="-- Select --" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name={`${type}.zipCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Zip Code</FormLabel>
                <FormControl>
                  <Input placeholder="12345" className="h-8 text-sm" {...field} data-testid={`input-${type}-zip`} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${type}.phone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" className="h-8 text-sm" {...field} data-testid={`input-${type}-phone`} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {renderAddressSection("fromAddress", "Ship From", <MapPin className="h-4 w-4" />)}
          {renderAddressSection("toAddress", "Ship To", <MapPin className="h-4 w-4" />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <PackageIcon className="h-4 w-4" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <FormField
                control={form.control}
                name="packages.0.packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Package Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm" data-testid="select-package-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PACKAGE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="packages.0.weightLbs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Weight (lbs)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-weight-lbs" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packages.0.weightOz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Weight (oz)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-weight-oz" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <FormField
                  control={form.control}
                  name="packages.0.length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Length (in)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-length" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packages.0.width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Width (in)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-width" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="packages.0.height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Height (in)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-height" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <FormField
                control={form.control}
                name="additionalServices.saturdayDelivery"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-saturday-delivery"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Saturday Delivery
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalServices.requireSignature"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-require-signature"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Signature Required
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalServices.insuranceValue"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-insurance"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Insurance
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalServices.returnLabel"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-return-label"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Return Label
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalServices.weekendService"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-weekend-service"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Weekend Service
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalServices.certifiedMail"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-certified-mail"
                      />
                    </FormControl>
                    <FormLabel className="text-xs font-normal leading-tight">
                      Certified Mail
                    </FormLabel>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleGetRates}
            disabled={isLoadingRates}
            size="lg"
            className="w-full lg:w-auto min-w-[200px]"
            data-testid="button-get-rates"
          >
            {isLoadingRates && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isLoadingRates ? 'Loading Rates...' : 'Get Rates'}
          </Button>
        </div>

        {ratesAvailable && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Shipping Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <RatesSelection
                rates={rates}
                isLoading={isLoadingRates}
                onPurchase={onPurchaseLabel}
                isPurchasing={isPurchasing}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </Form>
  );
};
