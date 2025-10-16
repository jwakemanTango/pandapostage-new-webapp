import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Address } from "@shared/schema";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

interface AddressFormProps {
  form: any;
  type: "fromAddress" | "toAddress";
  title: string;
}

const AddressForm = ({ form, type, title }: AddressFormProps) => {
  const { data: addresses } = useQuery<Address[]>({
    queryKey: ["/api/addresses"],
  });
  
  const filteredAddresses = addresses?.filter(address => {
    return type === "fromAddress" ? address.type === "sender" : address.type === "recipient";
  });
  
  const handleSavedAddressSelect = (addressId: string) => {
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
    }
  };
  
  return (
    <div>
      <h3 className="text-base font-semibold mb-3">{title}</h3>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <FormLabel className="text-sm">Select from saved addresses</FormLabel>
          <Button 
            type="button" 
            variant="link" 
            size="sm" 
            className="text-primary h-auto p-0 text-xs"
            data-testid={`button-manage-addresses-${type}`}
          >
            <Search className="h-3.5 w-3.5 mr-1" />
            <span>Manage</span>
          </Button>
        </div>
        <Select onValueChange={handleSavedAddressSelect}>
          <SelectTrigger className="w-full" data-testid={`select-saved-address-${type}`}>
            <SelectValue placeholder="-- Select a saved address --" />
          </SelectTrigger>
          <SelectContent>
            {filteredAddresses?.map((address) => (
              <SelectItem key={address.id} value={address.id.toString()}>
                {address.name}, {address.city}, {address.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FormField
          control={form.control}
          name={`${type}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} data-testid={`input-${type}-name`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Company <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Company" {...field} data-testid={`input-${type}-company`} />
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
              <FormLabel className="text-sm">Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 555-5555" {...field} data-testid={`input-${type}-phone`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <FormField
          control={form.control}
          name={`${type}.addressLine1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Address Line 1</FormLabel>
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
              <FormLabel className="text-sm">Address Line 2 <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Apt, suite, unit, building" {...field} data-testid={`input-${type}-address2`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <FormField
          control={form.control}
          name={`${type}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">City</FormLabel>
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
              <FormLabel className="text-sm">State</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel className="text-sm">ZIP Code</FormLabel>
              <FormControl>
                <Input {...field} data-testid={`input-${type}-zip`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressForm;
