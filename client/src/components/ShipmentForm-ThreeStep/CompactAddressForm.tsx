import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Address } from "@shared/schema";
import { US_STATES } from "@/lib/constants";

interface CompactAddressFormProps {
  form: any;
  type: "fromAddress" | "toAddress";
  title: string;
  icon: React.ReactNode;
  addresses?: Address[];
  onSavedAddressSelect: (addressId: string, type: "fromAddress" | "toAddress") => void;
}

export const CompactAddressForm = ({
  form,
  type,
  title,
  icon,
  addresses,
  onSavedAddressSelect
}: CompactAddressFormProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center gap-2 font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-2">
        <FormField
          control={form.control}
          name={`${type}.dummy` as any}
          render={() => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Saved Address:</FormLabel>
                <Select onValueChange={(value) => onSavedAddressSelect(value, type)}>
                  <SelectTrigger className="h-9 text-sm" data-testid={`select-saved-${type}`}>
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
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Company Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" className="h-9 text-sm" {...field} data-testid={`input-${type}-company`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Contact Name: *</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" className="h-9 text-sm" {...field} data-testid={`input-${type}-name`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.phone`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Phone Number: *</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" className="h-9 text-sm" {...field} data-testid={`input-${type}-phone`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Address Line 1: *</FormLabel>
                <FormControl>
                  <Input placeholder="Street Address" className="h-9 text-sm" {...field} data-testid={`input-${type}-address1`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine2`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Address Line 2:</FormLabel>
                <FormControl>
                  <Input placeholder="Apt, Suite, etc." className="h-9 text-sm" {...field} data-testid={`input-${type}-address2`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.city`}
          render={({ field }) => (
            <FormItem className="space-y-0">
              <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] items-start sm:items-center gap-1 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">City: *</FormLabel>
                <FormControl>
                  <Input placeholder="City" className="h-9 text-sm" {...field} data-testid={`input-${type}-city`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[108px]" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name={`${type}.state`}
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <FormLabel className="text-sm text-right font-medium">State: *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm" data-testid={`select-${type}-state`}>
                        <SelectValue placeholder="--" />
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
                <FormMessage className="text-xs sm:ml-[108px]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${type}.zipCode`}
            render={({ field }) => (
              <FormItem className="space-y-0">
                <div className="grid grid-cols-[80px_1fr] items-center gap-2">
                  <FormLabel className="text-sm text-right font-medium">Zip Code: *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" className="h-9 text-sm" {...field} data-testid={`input-${type}-zip`} />
                  </FormControl>
                </div>
                <FormMessage className="text-xs ml-[88px]" />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
