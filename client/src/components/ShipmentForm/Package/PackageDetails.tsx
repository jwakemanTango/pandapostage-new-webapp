import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Printer } from "lucide-react";

interface PackageDetailsProps {
  form: any; // matches PackageBasicInfo signature
}

/**
 * PackageDetails
 * - Horizontal layout: Label | Input | Printer icon (checkbox)
 * - Automatically wraps on smaller screens
 * - Each field has its own "print on label" checkbox with icon
 * - Easy to comment out reference 3–4 without layout issues
 */
export const PackageDetails = ({ form }: PackageDetailsProps) => {
  const { control } = form;

  // Comment out unwanted fields (e.g., [1, 2])
  const references = [1, 2, 3, 4];

  return (
    <div className="flex flex-col gap-3">

      {/* Global print toggle */}
      <FormField
        control={control}
        name="printLabel"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="text-sm font-medium">
              Print label after purchase
            </FormLabel>
          </FormItem>
        )}
      />

        <hr/>

        {/* Reference Fields */}
      {references.map((num) => (
        <FormField
          key={`reference${num}`}
          control={control}
          name={`reference${num}`}
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-wrap items-center gap-2">
                <FormLabel className="w-24 text-sm text-gray-700 whitespace-nowrap">
                  {`Reference #${num}`}
                </FormLabel>
                <FormControl className="flex-1 min-w-[160px]">
                  <Input {...field} placeholder="Optional" />
                </FormControl>

                {/* Print icon checkbox */}
                <FormField
                  control={control}
                  name={`reference${num}Print`}
                  render={({ field: printField }) => (
                    <FormItem title={"Print Reference #" + num + " on label"} className="flex items-center justify-center">
                      <FormControl>
                        <Checkbox
                          checked={!!printField.value}
                          onCheckedChange={printField.onChange}
                          className="peer h-5 w-5"
                        />
                      </FormControl>
                      <Printer
                        className={`h-4 w-4 ml-1 text-gray-400 peer-checked:text-primary transition-colors`}
                      />
                    </FormItem>
                  )}
                />
              </div>
            </FormItem>
          )}
        />
      ))}

    </div>
  );
};
