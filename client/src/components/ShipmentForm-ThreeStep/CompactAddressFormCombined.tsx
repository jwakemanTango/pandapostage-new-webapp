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
  
  // Check for validation errors and switch to that tab
  useEffect(() => {
    const errors = form.formState.errors;
    if (errors.fromAddress && Object.keys(errors.fromAddress).length > 0) {
      setActiveTab("from");
    } else if (errors.toAddress && Object.keys(errors.toAddress).length > 0) {
      setActiveTab("to");
    }
  }, [form.formState.errors]);
  
  const renderAddressFields = (type: "fromAddress" | "toAddress") => {
    return (
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
    );
  };

  return (
    <Card>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "from" | "to")}>
        <TabsList className="w-full grid grid-cols-2 h-8">
          <TabsTrigger value="from" className="gap-1.5 text-xs h-6" data-testid="tab-ship-from">
            <Truck className="h-3 w-3" />
            Ship From
          </TabsTrigger>
          <TabsTrigger value="to" className="gap-1.5 text-xs h-6" data-testid="tab-ship-to">
            <Package className="h-3 w-3" />
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
