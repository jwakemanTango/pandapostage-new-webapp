import { useState, useEffect } from "react";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Truck, MapPinned } from "lucide-react";
import { US_STATES } from "@/lib/constants";
import { useFormState } from "react-hook-form";

interface AddressFormFlexibleProps {
  form: any;
  layout?: "tabs" | "accordion" | "compact";
  onAddressSelected?: () => void;
}

export const AddressFormFlexible = ({
  form,
  layout = "tabs",
  onAddressSelected,
}: AddressFormFlexibleProps) => {
  const [activeTab, setActiveTab] = useState<"from" | "to">("from");
  const [searchTermFrom, setSearchTermFrom] = useState("");
  const [searchTermTo, setSearchTermTo] = useState("");
  const { errors } = useFormState({ control: form.control });

  const addresses = [
    {
      id: 1,
      name: "John Smith",
      company: "Acme Corp",
      phone: "(555) 123-4567",
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
      addressLine1: "321 Elm Street",
      addressLine2: "",
      city: "Houston",
      state: "TX",
      zipCode: "77001",
      country: "US",
      type: "recipient",
    },
  ];

  // Auto-switch tab when validation errors appear
  useEffect(() => {
    const fromErrors = errors?.fromAddress;
    const toErrors = errors?.toAddress;
    if (fromErrors && Object.keys(fromErrors).length > 0) setActiveTab("from");
    else if (toErrors && Object.keys(toErrors).length > 0) setActiveTab("to");
  }, [errors?.fromAddress, errors?.toAddress]);

  const getFilteredAddresses = (
    type: "from" | "to",
    searchTerm: string
  ) => {
    return addresses.filter((a) => {
      const matchType = type === "from" ? a.type === "sender" : a.type === "recipient";
      if (!matchType) return false;
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return (
        a.name.toLowerCase().includes(s) ||
        a.company.toLowerCase().includes(s) ||
        a.city.toLowerCase().includes(s) ||
        a.state.toLowerCase().includes(s) ||
        a.zipCode.includes(searchTerm)
      );
    });
  };

  const handleSavedAddressSelect = async (
    addressId: string,
    type: "fromAddress" | "toAddress"
  ) => {
    const addr = addresses.find((a) => a.id === parseInt(addressId));
    if (!addr) return;
    const fields = [
      "name",
      "company",
      "phone",
      "addressLine1",
      "addressLine2",
      "city",
      "state",
      "zipCode",
      "country",
    ];
    for (const f of fields) form.setValue(`${type}.${f}`, addr[f as keyof typeof addr] || "");
    form.clearErrors(type);
    const valid = await form.trigger(type);
    if (valid && onAddressSelected) onAddressSelected();
  };

  const renderAddressFields = (
    type: "fromAddress" | "toAddress",
    searchTerm: string,
    setSearchTerm: (v: string) => void
  ) => {
    const filtered = getFilteredAddresses(
      type === "fromAddress" ? "from" : "to",
      searchTerm
    );

    return (
      <div className="space-y-4">
        {/* Saved address selector */}
        <div>
          <FormLabel className="text-sm font-medium mb-1.5 block">
            Select from saved addresses
          </FormLabel>
          <Select onValueChange={(v) => handleSavedAddressSelect(v, type)}>
            <SelectTrigger className="w-full">
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

        {/* Full address fields */}
        <FormField
          control={form.control}
          name={`${type}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} value={field.value ?? ""} />
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
                <Input placeholder="Full name" {...field} value={field.value ?? ""} />
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
                <Input placeholder="(555) 123-4567" {...field} value={field.value ?? ""} />
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
              <FormLabel>Address Line 1 *</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" {...field} value={field.value ?? ""} />
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
                <Input placeholder="Apt, Suite, etc." {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`${type}.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} value={field.value ?? ""} />
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${type}.zipCode`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP *</FormLabel>
                <FormControl>
                  <Input placeholder="12345" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  const renderCompactSummary = (type: "fromAddress" | "toAddress", title: string) => {
    const data = form.getValues()[type];
    return (
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {type === "fromAddress" ? <Truck className="h-4 w-4" /> : <MapPinned className="h-4 w-4" />}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div>{data?.company}</div>
          <div>{data?.name}</div>
          <div>{data?.phone}</div>
          <div>{data?.addressLine1}</div>
          {data?.addressLine2 && <div>{data.addressLine2}</div>}
          <div>
            {data?.city}, {data?.state} {data?.zipCode}
          </div>
          <div>{data?.country}</div>
        </CardContent>
      </Card>
    );
  };

  if (layout === "accordion") {
    return (
      <Accordion type="single" collapsible defaultValue="from">
        <AccordionItem value="from">
          <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4" /> Ship From
          </AccordionTrigger>
          <AccordionContent>
            {renderAddressFields("fromAddress", searchTermFrom, setSearchTermFrom)}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="to">
          <AccordionTrigger className="text-base font-semibold flex items-center gap-2">
            <MapPinned className="h-4 w-4" /> Ship To
          </AccordionTrigger>
          <AccordionContent>
            {renderAddressFields("toAddress", searchTermTo, setSearchTermTo)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  if (layout === "compact") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderCompactSummary("fromAddress", "Ship From")}
        {renderCompactSummary("toAddress", "Ship To")}
      </div>
    );
  }

  // Default: Tabs
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "from" | "to")}>
      <TabsList className="w-full grid grid-cols-2 h-12 bg-muted p-1">
        <TabsTrigger
          value="from"
          className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <Truck className="h-5 w-5" /> Ship From
        </TabsTrigger>
        <TabsTrigger
          value="to"
          className="gap-2 text-base font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <MapPinned className="h-5 w-5" /> Ship To
        </TabsTrigger>
      </TabsList>
      <TabsContent value="from" className="mt-4">
        {renderAddressFields("fromAddress", searchTermFrom, setSearchTermFrom)}
      </TabsContent>
      <TabsContent value="to" className="mt-4">
        {renderAddressFields("toAddress", searchTermTo, setSearchTermTo)}
      </TabsContent>
    </Tabs>
  );
};
