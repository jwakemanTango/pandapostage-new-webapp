import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Printer } from "lucide-react";
import { useState } from "react";

interface PackageDetailsProps {
  control: any;
  watch: any;
}

export const PackageDetails = ({ control, watch }: PackageDetailsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-gray-800">Package Details</h3>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {open ? "Hide" : "Show"} <ChevronDown className="h-3 w-3" />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <FormField
            control={control}
            name="reference1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference #1</FormLabel>
                <FormControl><Input {...field} placeholder="Order ID" /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="reference2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference #2</FormLabel>
                <FormControl><Input {...field} placeholder="Optional" /></FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="printLabel"
            render={({ field }) => (
              <FormItem className="col-span-2 flex items-center gap-2 pt-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Print label after purchase
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
