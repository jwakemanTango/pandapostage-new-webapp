import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Address } from "@shared/schema";
import { US_STATES } from "@/lib/constants";

interface AddressFormCombinedProps {
  form: any;
  onAddressSelected?: () => void;
}

const AddressFormCombined = ({ form, onAddressSelected }: AddressFormCombinedProps) => {
  const [showFromAddress, setShowFromAddress] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const type = showFromAddress ? "fromAddress" : "toAddress";
  const title = showFromAddress ? "Ship From" : "Ship To";
  
  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });
  
  const filteredAddresses = addresses?.filter(address => {
    const typeMatches = showFromAddress ? address.type === "sender" : address.type === "recipient";
    
    if (!typeMatches) return false;
    
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      address.name.toLowerCase().includes(searchLower) ||
      address.city.toLowerCase().includes(searchLower) ||
      address.state.toLowerCase().includes(searchLower) ||
      address.zipCode.includes(searchTerm) ||
      (address.company && address.company.toLowerCase().includes(searchLower))
    );
  });
  
  const handleSavedAddressSelect = async (addressId: string) => {
    const selectedAddress = addresses?.find(address => address.id === parseInt(addressId));
    
    if (selectedAddress) {
      form.setValue(`${type}.name`, selectedAddress.name);
      form.setValue(`${type}.company`, selectedAddress.company || "");
      form.setValue(`${type}.phone`, selectedAddress.phone);
      form.setValue(`${type}.addressLine1`, selectedAddress.addressLine1);
      form.setValue(`${type}.addressLine2`, selectedAddress.addressLine2 || "");
      form.setValue(`${type}.city`, selectedAddress.city);
      form.setValue(`${type}.state`, selectedAddress.state);
      form.setValue(`${type}.zipCode`, selectedAddress.zipCode);
      form.setValue(`${type}.country`, selectedAddress.country);
      
      // Validate the fields after setting them
      if (type === "fromAddress") {
        const isValid = await form.trigger("fromAddress");
        if (isValid && onAddressSelected) {
          onAddressSelected();
        }
      } else if (onAddressSelected) {
        onAddressSelected();
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="address-toggle" className="text-sm">
            {showFromAddress ? "From" : "To"}
          </Label>
          <Switch
            id="address-toggle"
            checked={!showFromAddress}
            onCheckedChange={(checked) => setShowFromAddress(!checked)}
            data-testid="switch-address-toggle"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <FormLabel className="text-sm font-medium mb-1.5 block">Select from saved addresses</FormLabel>
        
        <Select onValueChange={handleSavedAddressSelect}>
          <SelectTrigger className="w-full" data-testid={`select-saved-address-${type}`}>
            <SelectValue placeholder="-- Select a saved address --" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-2 border-b">
              <Input
                type="text"
                placeholder="Search by name, company, city, state, or zip..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    return;
                  }
                  e.stopPropagation();
                }}
                className="w-full h-8"
                data-testid={`input-search-address-${type}`}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filteredAddresses && filteredAddresses.length > 0 ? (
                filteredAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id.toString()}>
                    {address.name}, {address.city}, {address.state}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No saved addresses found
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} data-testid={`input-${type}-company`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Name *</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} data-testid={`input-${type}-name`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} data-testid={`input-${type}-phone`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address *</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} data-testid={`input-${type}-address1`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.addressLine2`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Apt, Suite, Building (optional)" {...field} data-testid={`input-${type}-address2`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`${type}.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} data-testid={`input-${type}-city`} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`${type}.state`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid={`select-${type}-state`}>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`${type}.zipCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code *</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} data-testid={`input-${type}-zip`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressFormCombined;
