import { useState, useId } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { US_STATES } from "@/lib/constants";

const COUNTRIES = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "MX", label: "Mexico" },
];

interface AddressFormSingleProps {
  form: any;
  type: "fromAddress" | "toAddress";
  label?: string;
  onAddressSelected?: () => void;
}

export const AddressFormSingle = ({
  form,
  type,
  label,
  onAddressSelected,
}: AddressFormSingleProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const idPrefix = useId(); // ensures all IDs are unique

  const addresses = [
    {
      id: 1,
      name: "John Smith",
      company: "Acme Corp",
      phone: "(555) 123-4567",
      email: "john@acme.com",
      addressLine1: "123 Main Street",
      addressLine2: "Suite 100",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "US",
      type: "sender",
    },
    {
      id: 2,
      name: "Emily Davis",
      company: "Global Enterprises",
      phone: "(555) 456-7890",
      email: "emily@global.com",
      addressLine1: "321 Elm Street",
      addressLine2: "",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      country: "US",
      type: "recipient",
    },
  ];

  const filtered = addresses.filter((a) => {
    if (type === "fromAddress" && a.type !== "sender") return false;
    if (type === "toAddress" && a.type !== "recipient") return false;
    const s = searchTerm.toLowerCase();
    return (
      a.name.toLowerCase().includes(s) ||
      a.company.toLowerCase().includes(s) ||
      a.city.toLowerCase().includes(s) ||
      a.state.toLowerCase().includes(s) ||
      a.zipCode.includes(searchTerm)
    );
  });

  const handleSavedAddressSelect = async (addressId: string) => {
    const addr = addresses.find((a) => a.id === parseInt(addressId));
    if (!addr) return;
    const fields = [
      "name",
      "company",
      "phone",
      "email",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    for (const f of fields)
      form.setValue(`${type}.${f}`, addr[f as keyof typeof addr] || "");
    form.clearErrors(type);
    const valid = await form.trigger(type);
    if (valid && onAddressSelected) onAddressSelected();
  };

  return (
    <div className="space-y-6">
      {label && <h3 className="text-lg font-semibold">{label}</h3>}

      {/* Saved address selector */}
      <div>
        <FormLabel className="text-sm font-medium mb-1.5 block">
          Select from saved addresses
        </FormLabel>
        <Select onValueChange={handleSavedAddressSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="-- Select a saved address --" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-2 border-b">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") return;
                  e.stopPropagation();
                }}
                className="w-full h-8"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto">
              {filtered.length ? (
                filtered.map((a) => (
                  <SelectItem key={a.id} value={a.id.toString()}>
                    {a.name}, {a.city}, {a.state}
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

      {/* Contact Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id={`${idPrefix}-${type}-company`}
                  autoComplete="organization"
                  placeholder="Optional"
                  value={field.value ?? ""}
                />
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
                <Input
                  {...field}
                  id={`${idPrefix}-${type}-name`}
                  autoComplete="name"
                  placeholder="Full name"
                  value={field.value ?? ""}
                />
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
              <FormLabel>Phone *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id={`${idPrefix}-${type}-tel`}
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${type}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id={`${idPrefix}-${type}-email`}
                  type="email"
                  autoComplete="email"
                  placeholder="email@example.com"
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address Lines */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[220px]">
          <FormField
            control={form.control}
            name={`${type}.addressLine1`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1 *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={`${idPrefix}-${type}-address-line1`}
                    autoComplete="address-line1"
                    placeholder="123 Main St"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex-1 min-w-[220px]">
          <FormField
            control={form.control}
            name={`${type}.addressLine2`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={`${idPrefix}-${type}-address-line2`}
                    autoComplete="address-line2"
                    placeholder="Apt, Suite, etc."
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* City / State / ZIP */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[160px]">
          <FormField
            control={form.control}
            name={`${type}.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={`${idPrefix}-${type}-city`}
                    autoComplete="address-level2"
                    placeholder="City"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* State */}
        <div className="flex-1 min-w-[160px]">
          <FormField
            control={form.control}
            name={`${type}.state`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <div className="relative">
                  <select
                    id={`${idPrefix}-${type}-state-native`}
                    autoComplete="address-level1"
                    aria-label="State"
                    title="State"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="absolute opacity-0 pointer-events-none w-0 h-0"
                    tabIndex={-1}
                  >
                    {US_STATES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <FormField
            control={form.control}
            name={`${type}.zipCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id={`${idPrefix}-${type}-postal-code`}
                    autoComplete="postal-code"
                    placeholder="12345"
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Country */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[220px]">
          <FormField
            control={form.control}
            name={`${type}.country`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <div className="relative">
                  <select
                    id={`${idPrefix}-${type}-country-native`}
                    autoComplete="country"
                    aria-label="Country"
                    title="Country"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="absolute opacity-0 pointer-events-none w-0 h-0"
                    tabIndex={-1}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
