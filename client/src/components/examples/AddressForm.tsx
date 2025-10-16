import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShipmentSchema } from "@shared/schema";
import AddressForm from "../AddressForm";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
});

export default function AddressFormExample() {
  const form = useForm({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      fromAddress: {
        name: "",
        company: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "US",
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Form {...form}>
        <div className="p-6 max-w-3xl">
          <AddressForm form={form} type="fromAddress" title="From Address" />
        </div>
      </Form>
    </QueryClientProvider>
  );
}
