import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package as PackageIcon } from "lucide-react";
import { PACKAGE_TYPES, CARRIERS } from "@/lib/constants";

interface CompactPackageFormProps {
  form: any;
}

export const CompactPackageForm = ({ form }: CompactPackageFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center gap-2 font-semibold">
          <PackageIcon className="h-4 w-4" />
          Package Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <FormField
          control={form.control}
          name="packages.0.packageType"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right font-medium">Package Type: *</FormLabel>
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
              </div>
              <FormMessage className="text-xs ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="packages.0.carrier"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right font-medium">Carrier:</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "any"}>
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm" data-testid="select-carrier">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CARRIERS.map((carrier) => (
                      <SelectItem key={carrier.value} value={carrier.value}>
                        {carrier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormMessage className="text-xs ml-[128px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="packages.0.weightLbs"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                  <FormLabel className="text-xs text-right font-medium">Weight (lbs): *</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-weight-lbs" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[128px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.weightOz"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <FormLabel className="text-xs text-right font-medium">Weight (oz):</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-weight-oz" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[88px]" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="packages.0.length"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <FormLabel className="text-xs text-right font-medium">Length (in):</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-length" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[88px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.width"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[70px_1fr] items-center gap-2">
                  <FormLabel className="text-xs text-right font-medium">Width (in):</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-width" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[78px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.height"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[70px_1fr] items-center gap-2">
                  <FormLabel className="text-xs text-right font-medium">Height (in):</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="0" className="h-8 text-sm" {...field} data-testid="input-height" />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[78px]" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
