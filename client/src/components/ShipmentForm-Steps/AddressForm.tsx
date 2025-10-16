import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Address } from "@shared/schema";
import { US_STATES } from "@/lib/constants";

interface AddressFormProps {
  form: any;
  type: "fromAddress" | "toAddress";
  title: string;
  onAddressSelected?: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const AddressForm = ({ form, type, title, onAddressSelected, isOpen, onOpenChange }: AddressFormProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });
  
  const filteredAddresses = addresses?.filter(address => {
    const typeMatches = type === "fromAddress" ? address.type === "sender" : address.type === "recipient";
    
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
        // Only notify parent if valid
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
                    // Allow Tab to move focus to dropdown items
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
                  No addresses found
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Name</FormLabel>
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
              <FormLabel className="text-sm font-medium">Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 555-5555" {...field} data-testid={`input-${type}-phone`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="mt-4">
        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Company <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Company" {...field} data-testid={`input-${type}-company`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Street address, P.O. box" {...field} data-testid={`input-${type}-address1`} />
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
              <FormLabel className="text-sm font-medium">Address Line 2 <span className="text-muted-foreground font-normal text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Apt, suite, unit" {...field} data-testid={`input-${type}-address2`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <FormField
          control={form.control}
          name={`${type}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">City</FormLabel>
              <FormControl>
                <Input {...field} data-testid={`input-${type}-city`} />
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
              <FormLabel className="text-sm font-medium">State</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid={`select-${type}-state`}>
                    <SelectValue placeholder="Select state" />
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
        <FormField
          control={form.control}
          name={`${type}.zipCode`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">ZIP Code</FormLabel>
              <FormControl>
                <Input {...field} data-testid={`input-${type}-zip`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {type === "fromAddress" && (
        <div className="mt-4 flex items-center space-x-2">
          <Checkbox 
            id="make-default" 
            data-testid="checkbox-make-default"
          />
          <label
            htmlFor="make-default"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Make this my default
          </label>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
