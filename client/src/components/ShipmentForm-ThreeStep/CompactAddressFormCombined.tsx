import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import { Address } from "@shared/schema";
import { US_STATES } from "@/lib/constants";

interface CompactAddressFormCombinedProps {
  form: any;
  addresses?: Address[];
  onSavedAddressSelect: (addressId: string, type: "fromAddress" | "toAddress") => void;
}

export const CompactAddressFormCombined = ({
  form,
  addresses,
  onSavedAddressSelect
}: CompactAddressFormCombinedProps) => {
  const [showFromAddress, setShowFromAddress] = useState(true);
  
  const type = showFromAddress ? "fromAddress" : "toAddress";
  const title = showFromAddress ? "Ship From" : "Ship To";

  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="compact-address-toggle" className="text-xs">
              {showFromAddress ? "From" : "To"}
            </Label>
            <Switch
              id="compact-address-toggle"
              checked={!showFromAddress}
              onCheckedChange={(checked) => setShowFromAddress(!checked)}
              data-testid="switch-compact-address-toggle"
              className="scale-75"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-2" key={type}>
        <FormField
          control={form.control}
          name={`${type}.dummy` as any}
          render={() => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Saved Address:</FormLabel>
                <Select onValueChange={(value) => onSavedAddressSelect(value, type)}>
                  <SelectTrigger className="h-7 text-xs" data-testid={`select-saved-${type}`}>
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
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">
                        No saved addresses
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Company Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" className="h-7 text-xs" {...field} data-testid={`input-${type}-company`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Contact Name: *</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" className="h-7 text-xs" {...field} data-testid={`input-${type}-name`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.phone`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Phone Number: *</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" className="h-7 text-xs" {...field} data-testid={`input-${type}-phone`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Street Address: *</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" className="h-7 text-xs" {...field} data-testid={`input-${type}-address1`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine2`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">Address Line 2:</FormLabel>
                <FormControl>
                  <Input placeholder="Apt, Suite" className="h-7 text-xs" {...field} data-testid={`input-${type}-address2`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.city`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">City: *</FormLabel>
                <FormControl>
                  <Input placeholder="City" className="h-7 text-xs" {...field} data-testid={`input-${type}-city`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.state`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">State: *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-7 text-xs" data-testid={`select-${type}-state`}>
                      <SelectValue placeholder="Select" />
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
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.zipCode`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                <FormLabel className="text-xs text-right">ZIP Code: *</FormLabel>
                <FormControl>
                  <Input placeholder="12345" className="h-7 text-xs" {...field} data-testid={`input-${type}-zip`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs ml-[108px]" />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
