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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlugZap, Loader2, CheckCircle } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import {
  PACKAGE_TYPES,
  CARRIERS,
  CARRIER_PACKAGE_TYPES,
} from "@/lib/constants";
import { useUsbScale } from "@/hooks/use-UsbScale";

interface PackageFormProps {
  form: any;
  showErrors?: boolean;
}

type PackageItem = {
  packageType: string;
  weightLbs: string;
  weightOz: string;
  length: string;
  width: string;
  height: string;
  carrier?: string;
};

const defaultPackage: PackageItem = {
  packageType: "parcel",
  weightLbs: "",
  weightOz: "0",
  length: "",
  width: "",
  height: "",
  carrier: "any",
};

const PackageForm = ({ form, showErrors = false }: PackageFormProps) => {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  const selectedCarrier = form.watch("packages.0.carrier") || "any";
  const availablePackageTypes =
    CARRIER_PACKAGE_TYPES[selectedCarrier] || CARRIER_PACKAGE_TYPES.any;
  const filteredPackageTypes = PACKAGE_TYPES.filter((type) =>
    availablePackageTypes.includes(type.value)
  );

  useEffect(() => {
    if (fields.length === 0) append(defaultPackage);
  }, [fields.length, append]);

  // -----------------------------
  // USB SCALE INTEGRATION
  // -----------------------------
  const {
    supported,
    connectedDevice,
    isConnecting,
    connect,
    disconnect,
    getCurrentWeight,
    weight,
  } = useUsbScale();

  // Auto-connect on mount (if device authorized)
  useEffect(() => {
    if (supported && !connectedDevice) {
      (async () => {
        try {
          const devices = await (navigator as any).hid.getDevices();
          if (devices?.length > 0) await connect(devices[0]);
        } catch {
          // ignore silent connect attempt
        }
      })();
    }
  }, [supported]);

  const handleFetchWeight = async () => {
    if (!connectedDevice) {
      await connect();
      return;
    }
    const result = await getCurrentWeight();
    if (result) {
      const totalOz = result.ounces;
      const pounds = Math.floor(totalOz / 16);
      const ounces = Math.round(totalOz % 16);
      form.setValue("packages.0.weightLbs", pounds.toString());
      form.setValue("packages.0.weightOz", ounces.toString());
    }
  };

  // -----------------------------

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold">Package Details</h3>
        {showErrors &&
          fields.some((pkg) => !pkg.packageType || !pkg.weightLbs) && (
            <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
              Missing info
            </Badge>
          )}
      </div>

      <div className="space-y-2">
        {/* Carrier + Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`packages.0.carrier`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Preferred Carrier
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    const pkgType = form.getValues("packages.0.packageType");
                    const newAvailable =
                      CARRIER_PACKAGE_TYPES[value] || CARRIER_PACKAGE_TYPES.any;
                    if (pkgType && !newAvailable.includes(pkgType)) {
                      form.setValue("packages.0.packageType", "");
                    }
                  }}
                  value={field.value || "any"}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-carrier">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CARRIERS.map((carrier) => (
                      <SelectItem key={carrier.value} value={carrier.value}>
                        {carrier.label}
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
            name={`packages.0.packageType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Package Type
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-package-type">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredPackageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Weight Section */}
        <div className="border-t mt-4 pt-4">
          <FormLabel className="text-sm font-medium flex justify-between items-center">
            <span>Weight</span>

            {supported && (
              <Button
                type="button"
                variant={connectedDevice ? "outline" : "default"}
                size="sm"
                onClick={handleFetchWeight}
                disabled={isConnecting}
                className="flex items-center gap-1 text-xs px-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Connecting...
                  </>
                ) : connectedDevice ? (
                  <>
                    <PlugZap size={12} />
                    Fetch Weight
                  </>
                ) : (
                  <>
                    <PlugZap size={12} />
                    Connect Scale
                  </>
                )}
              </Button>
            )}
          </FormLabel>

          <div className="flex gap-4 mt-1.5">
            <FormField
              control={form.control}
              name={`packages.0.weightLbs`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">lbs</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`packages.0.weightOz`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        step="1"
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.replace(/[^0-9]/g, ""))
                        }
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">oz</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {weight && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <CheckCircle size={12} className="text-green-500" />
              Scale reading: {weight.grams.toFixed(0)} g /{" "}
              {weight.ounces.toFixed(1)} oz
            </p>
          )}
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {["length", "width", "height"].map((dim) => (
            <FormField
              key={dim}
              control={form.control}
              name={`packages.0.${dim}`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium capitalize">
                    {dim} (in)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="0"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/[^0-9.]/g, ""))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageForm;
