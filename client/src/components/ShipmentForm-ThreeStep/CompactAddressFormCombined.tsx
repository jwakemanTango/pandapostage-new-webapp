import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Address } from "@shared/schema";
import { US_STATES } from "@/lib/constants";
import { Truck, Package } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"from" | "to">("from");
  
  // Watch for validation errors and auto-switch tabs
  const fromErrors = form.formState.errors?.fromAddress;
  const toErrors = form.formState.errors?.toAddress;
  
  useEffect(() => {
    // If fromAddress has errors, switch to "from" tab
    if (fromErrors && Object.keys(fromErrors).length > 0) {
      setActiveTab("from");
    } 
    // If only toAddress has errors (and fromAddress is valid), switch to "to" tab
    else if (toErrors && Object.keys(toErrors).length > 0) {
      setActiveTab("to");
    }
  }, [fromErrors, toErrors]);
  
  const renderAddressFields = (type: "fromAddress" | "toAddress") => {
    return (
      <CardContent className="space-y-3 pt-3" key={type}>
        <FormField
          control={form.control}
          name={`${type}.dummy` as any}
          render={() => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
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
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Company Name:</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" className="h-9 text-sm" {...field} data-testid={`input-${type}-company`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Contact Name: *</FormLabel>
                <FormControl>
                  <Input placeholder="Full Name" className="h-9 text-sm" {...field} data-testid={`input-${type}-name`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.phone`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Phone Number: *</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" className="h-9 text-sm" {...field} data-testid={`input-${type}-phone`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Address Line 1: *</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" className="h-9 text-sm" {...field} data-testid={`input-${type}-address1`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine2`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">Address Line 2:</FormLabel>
                <FormControl>
                  <Input placeholder="Apt, Suite" className="h-9 text-sm" {...field} data-testid={`input-${type}-address2`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.city`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">City: *</FormLabel>
                <FormControl>
                  <Input placeholder="City" className="h-9 text-sm" {...field} data-testid={`input-${type}-city`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.state`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">State: *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm" data-testid={`select-${type}-state`}>
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
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.zipCode`}
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-start sm:items-center gap-1.5 sm:gap-2">
                <FormLabel className="text-sm sm:text-right font-medium">ZIP Code: *</FormLabel>
                <FormControl>
                  <Input placeholder="12345" className="h-9 text-sm" {...field} data-testid={`input-${type}-zip`} />
                </FormControl>
              </div>
              <FormMessage className="text-xs sm:ml-[128px]" />
            </FormItem>
          )}
        />
      </CardContent>
    );
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "from" | "to")}>
        <TabsList className="w-full grid grid-cols-2 h-11 bg-muted p-1">
          <TabsTrigger value="from" className="gap-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-ship-from">
            <Truck className="h-4 w-4" />
            Ship From
          </TabsTrigger>
          <TabsTrigger value="to" className="gap-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" data-testid="tab-ship-to">
            <Package className="h-4 w-4" />
            Ship To
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="from" className="mt-0">
          {renderAddressFields("fromAddress")}
        </TabsContent>
        
        <TabsContent value="to" className="mt-0">
          {renderAddressFields("toAddress")}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
