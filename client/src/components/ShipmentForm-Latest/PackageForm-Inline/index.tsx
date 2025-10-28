import { useFieldArray } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { PackageBasicInfo } from "./PackageBasicInfo";
import { PackageDetails } from "./PackageDetails";

interface PackageFormInlineProps {
  form: any;
}

export const PackageFormInline = ({ form }: PackageFormInlineProps) => {
  const { control } = form;

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "packages",
  });

  const watchedPackages = form.watch("packages") || [];

  return (
    <div className="space-y-5">
      <PackageBasicInfo
        control={control}
        fields={watchedPackages}
        append={() => append({})}
        remove={remove}
        update={update}
        watch={form.watch}
        setValue={form.setValue}
      />
      <Separator className="my-4" />
      <PackageDetails control={control} watch={form.watch} />
    </div>
  );
};

export default PackageFormInline;
