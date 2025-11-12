import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { Card, CardContent } from "../../ui/card";
import { MapPin, Truck } from "lucide-react";

import { AddressFormSingle } from "./AddressFormSingle";
import { AddressesFormModals } from "./AddressesFormModals";

interface AddressSectionProps {
  form: any;
  layout: string;
}

export const AddressSection = ({ form, layout }: AddressSectionProps) => {
  // Set a default "Ship From" when using single mode
  useEffect(() => {
    if (layout === "single") {
      form.setValue("fromAddress", {
        country: "US",
        name: "Default Address",
        company: "PandaPostage",
        phone: "555-555-5555",
        email: "default-address@pandapostage.com",
        addressLine1: "123 Main St",
        addressLine2: "",
        city: "Syracuse",
        state: "NY",
        zipCode: "13202",
      });
    }
  }, [layout, form]);

  // -----------------------
  // Layout: MODAL
  // -----------------------
  if (layout === "modal") {
    return <AddressesFormModals form={form} />;
  }

  // -----------------------
  // Layout: SINGLE (Ship To only)
  // -----------------------
  if (layout === "single") {
    return (
      <div className="mx-auto">
        <AddressFormSingle form={form} type="toAddress" label="Ship To" />
      </div>
    );
  }

  // -----------------------
  // Layout: TABS
  // -----------------------
  if (layout === "tabs") {
    return (
      <Tabs defaultValue="to">
        <TabsList className="w-full grid grid-cols-2 mb-4 h-12 bg-muted p-1">
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
            <MapPin className="h-5 w-5" /> Ship To
          </TabsTrigger>
        </TabsList>

        <TabsContent value="from">
          <AddressFormSingle form={form} type="fromAddress" />
        </TabsContent>

        <TabsContent value="to">
          <AddressFormSingle form={form} type="toAddress" />
        </TabsContent>
      </Tabs>
    );
  }

  // -----------------------
  // Layout: ACCORDION
  // -----------------------
  if (layout === "accordion") {
    return (
      <Accordion type="single" collapsible defaultValue="to">
        <AccordionItem value="from">
          <AccordionTrigger className="flex items-center gap-2 font-semibold bg-muted px-4 py-3 rounded-md data-[state=open]:bg-primary data-[state=open]:text-primary-foreground">
            <Truck className="h-4 w-4" /> Ship From
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-4">
              <AddressFormSingle form={form} type="fromAddress" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="to">
          <AccordionTrigger className="flex items-center gap-2 font-semibold bg-muted px-4 py-3 rounded-md data-[state=open]:bg-primary data-[state=open]:text-primary-foreground">
            <MapPin className="h-4 w-4" /> Ship To
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-4">
              <AddressFormSingle form={form} type="toAddress" />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  // -----------------------
  // Default: Side-by-Side
  // -----------------------
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border border-border">
        <CardContent className="p-5">
          <AddressFormSingle form={form} type="fromAddress" label="Ship From" />
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardContent className="p-5">
          <AddressFormSingle form={form} type="toAddress" label="Ship To" />
        </CardContent>
      </Card>
    </div>
  );
};
