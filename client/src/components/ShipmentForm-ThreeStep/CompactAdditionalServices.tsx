import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompactAdditionalServicesProps {
  form: any;
}

export const CompactAdditionalServices = ({ form }: CompactAdditionalServicesProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base font-semibold">Additional Services</CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2.5">
          <FormField
            control={form.control}
            name="additionalServices.saturdayDelivery"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-saturday-delivery"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Saturday Delivery
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalServices.requireSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-require-signature"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Signature Required
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalServices.insuranceValue"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-insurance"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Insurance
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalServices.returnLabel"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-return-label"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Return Label
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalServices.weekendService"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-weekend-service"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Weekend Service
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="additionalServices.certifiedMail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-certified-mail"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal leading-tight cursor-pointer">
                  Certified Mail
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
