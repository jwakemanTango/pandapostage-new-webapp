import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShipmentSchema } from "@shared/schema";
import PackageForm from "@/components/ShipmentForm-Latest/PackageForm-Inline";

export default function PackageFormExample() {

  const form = useForm({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      packages: [
        {
          packageType: "parcel",
          weightLbs: "",
          weightOz: "0",
          length: "",
          width: "",
          height: "",
          carrier: "any",
        },
      ],
    },
    mode: "onChange", // immediate validation feedback
  });


  return (
    <Form {...form}>
          <PackageForm {...({ form, showErrors: true } as any)} />
    </Form>
  );
}
