import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShipmentSchema } from "@shared/schema";
import PackageForm from "../PackageForm";

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
        }
      ],
    },
  });

  return (
    <Form {...form}>
      <div className="p-6 max-w-3xl">
        <PackageForm form={form} />
      </div>
    </Form>
  );
}
