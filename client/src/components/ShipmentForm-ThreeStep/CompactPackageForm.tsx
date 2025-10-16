import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package as PackageIcon, Box } from "lucide-react";
import { PACKAGE_TYPES, CARRIERS, CARRIER_PACKAGE_TYPES } from "@/lib/constants";

interface CompactPackageFormProps {
  form: any;
}

const PACKAGE_PRESETS = [
  { name: "Small Box", carrier: "any", packageType: "parcel", weight: "1", dimensions: { length: "8", width: "6", height: "4" } },
  { name: "Medium Box", carrier: "any", packageType: "parcel", weight: "5", dimensions: { length: "12", width: "10", height: "8" } },
  { name: "Large Box", carrier: "any", packageType: "large_box", weight: "10", dimensions: { length: "18", width: "14", height: "12" } },
];

export const CompactPackageForm = ({ form }: CompactPackageFormProps) => {
  const selectedCarrier = form.watch("packages.0.carrier") || "any";
  const availablePackageTypes = CARRIER_PACKAGE_TYPES[selectedCarrier] || CARRIER_PACKAGE_TYPES.any;
  const filteredPackageTypes = PACKAGE_TYPES.filter(type => availablePackageTypes.includes(type.value));

  const handlePresetSelect = (preset: typeof PACKAGE_PRESETS[0]) => {
    form.setValue("packages.0.carrier", preset.carrier);
    form.setValue("packages.0.packageType", preset.packageType);
    form.setValue("packages.0.weightLbs", preset.weight);
    form.setValue("packages.0.length", preset.dimensions.length);
    form.setValue("packages.0.width", preset.dimensions.width);
    form.setValue("packages.0.height", preset.dimensions.height);
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base flex items-center gap-2 font-semibold">
          <PackageIcon className="h-4 w-4" />
          Package Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-3">
        <div>
          <FormLabel className="text-sm font-medium mb-2 block">Custom Packages</FormLabel>
          <div className="flex flex-col sm:flex-row gap-2">
            {PACKAGE_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect(preset)}
                className="gap-1.5 flex-1 h-9 text-sm"
                data-testid={`button-preset-${preset.name.toLowerCase().replace(' ', '-')}`}
              >
                <Box className="h-4 w-4" />
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
        <FormField
          control={form.control}
          name="packages.0.carrier"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-medium">Preferred Carrier:</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset package type if it's not available for the new carrier
                  const currentPackageType = form.getValues("packages.0.packageType");
                  const newAvailableTypes = CARRIER_PACKAGE_TYPES[value] || CARRIER_PACKAGE_TYPES.any;
                  if (currentPackageType && !newAvailableTypes.includes(currentPackageType)) {
                    form.setValue("packages.0.packageType", "");
                  }
                }} 
                value={field.value || "any"}
              >
                <FormControl>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-carrier">
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
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="packages.0.packageType"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-sm font-medium">Package Type: *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9 text-sm" data-testid="select-package-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredPackageTypes.map((type) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
          <FormField
            control={form.control}
            name="packages.0.weightLbs"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium">Weight (lbs): *</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="0" className="h-9 text-sm" {...field} data-testid="input-weight-lbs" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.weightOz"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium">Weight (oz):</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="0" className="h-9 text-sm" {...field} data-testid="input-weight-oz" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2">
          <FormField
            control={form.control}
            name="packages.0.length"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium">Length (in):</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="0" className="h-9 text-sm" {...field} data-testid="input-length" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.width"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium">Width (in):</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="0" className="h-9 text-sm" {...field} data-testid="input-width" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="packages.0.height"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium">Height (in):</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="0" className="h-9 text-sm" {...field} data-testid="input-height" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
