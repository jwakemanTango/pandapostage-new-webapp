import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";

interface AdditionalServicesProps {
  form: any;
}

const AdditionalServices = ({ form }: AdditionalServicesProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Additional Services</h3>
      
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="additionalServices.saturdayDelivery"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-saturday-delivery"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Saturday Delivery
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.requireSignature"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-require-signature"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Require Signature Confirmation
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.expressMailWaiver"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-express-waiver"
                />
              </FormControl>
              <FormLabel className="font-normal">
                USPS Express Mail - Waiver of Signature
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.insuranceValue"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-insurance"
                />
              </FormControl>
              <FormLabel className="font-normal">
                USPS Insurance/UPS Declared Value
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.returnLabel"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-return-label"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Create A Return Label
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.weekendService"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-weekend-service"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Weekend Service
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.additionalHandling"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-additional-handling"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Additional Handling
              </FormLabel>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="additionalServices.certifiedMail"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="checkbox-certified-mail"
                />
              </FormControl>
              <FormLabel className="font-normal">
                Certified Mail
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AdditionalServices;
