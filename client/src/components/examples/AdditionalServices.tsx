import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShipmentSchema } from "@shared/schema";
import AdditionalServices from "../AdditionalServices";

export default function AdditionalServicesExample() {
  const form = useForm({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      additionalServices: {
        saturdayDelivery: false,
        requireSignature: false,
        expressMailWaiver: false,
        insuranceValue: false,
        returnLabel: false,
        weekendService: false,
        additionalHandling: false,
        certifiedMail: false,
      }
    },
  });

  return (
    <Form {...form}>
      <div className="p-6 max-w-3xl">
        <AdditionalServices form={form} />
      </div>
    </Form>
  );
}
