import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { PackageBasicInfo } from "./PackageBasicInfo";
import { PackageDetails } from "./PackageDetails";
import { ScaleProvider } from "@/lib/usbScale";
import type { ShipmentFormInput } from "@shared/schema";

interface PackageFormInlineProps {
  form: UseFormReturn<ShipmentFormInput>;
  showScaleButton?: boolean;
}

export const PackageFormInline = ({ form, showScaleButton }: PackageFormInlineProps) => {
  const { control, watch, setValue } = form;

  // manage packages array
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "packages",
  });

  const watchedPackages = watch("packages") || [];

  return (
    <div className="space-y-5">
      <ScaleProvider>
        <PackageBasicInfo
          form={form}
          showScaleButton={showScaleButton}
        />
      </ScaleProvider>

      <Separator className="my-4" />

      {/*<PackageDetails control={control} watch={watch} />*/}
    </div>
  );
};

export default PackageFormInline;
