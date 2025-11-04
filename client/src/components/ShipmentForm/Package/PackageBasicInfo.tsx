import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Scale,
  Loader2,
} from "lucide-react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { useScale, ScaleProvider } from "@/lib/usbScale";
import { CARRIERS, PACKAGE_TYPES } from "@/lib/constants";
import type { PackageFieldKey, ShipmentFormInput } from "@shared/schema";

interface PackageBasicInfoProps {
  form: UseFormReturn<ShipmentFormInput>;
  showScaleButton?: boolean;
}

/**
 * Automatically wraps itself with <ScaleProvider>,
 * so parent components don’t need to.
 */
export const PackageBasicInfo = ({ form, showScaleButton }: PackageBasicInfoProps) => {
  return (
    <ScaleProvider>
      <PackageBasicInfoInner form={form} showScaleButton={showScaleButton} />
    </ScaleProvider>
  );
};

// --- Inner implementation (isolated for clarity) ---
const PackageBasicInfoInner = ({
  form,
  showScaleButton,
}: PackageBasicInfoProps) => {
  const { control, watch, setValue } = form;
  const { device, weight, isConnecting, supported, connect, getCurrentWeight } = useScale();
  const isConnected = !!device;

  const { fields, append, remove } = useFieldArray({ control, name: "packages" });
  const packages = watch("packages") || [];
  const pkgCount = packages.length || 1;

  const [isReading, setIsReading] = useState(false);

  const handleReadWeight = async (index = 0) => {
    try {
      setIsReading(true);
      if (!device) await connect();
      const w = await getCurrentWeight();
      if (w) {
        const totalOz = w.ounces;
        const lbs = Math.floor(totalOz / 16);
        const oz = Math.ceil(totalOz % 16);
        setValue(`packages.${index}.weightLbs`, lbs);
        setValue(`packages.${index}.weightOz`, oz);
      }
    } catch (err) {
      console.error("[Scale] Error reading weight:", err);
    } finally {
      setIsReading(false);
    }
  };

  const handleAddPackage = () =>
    append({
      packageType: "parcel",
      carrier: "any",
      weightLbs: "",
      weightOz: "",
      length: "",
      width: "",
      height: "",
    });

  const liveOunces = weight?.ounces ?? 0;
  const liveLbs = Math.floor(liveOunces / 16);
  const liveOz = (liveOunces % 16).toFixed(1);

  const integerOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D+/g, "");
  };

  const getUnitLabel = (key: string) => {
    if (key.includes("Lbs")) return "lb";
    if (key.includes("Oz")) return "oz";
    if (["length", "width", "height"].includes(key)) return "in";
    return "";
  };

  const getErrorFor = (i: number, key: PackageFieldKey) =>
    !!form.formState.errors?.packages?.[i]?.[key];

  return (
    <div className="space-y-4">
      {/* Errors */}
      {form.formState.errors.packages && (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-sm px-3 py-2">
          Please correct all package fields before continuing.
        </div>
      )}

      {/* Carrier + Package Type */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="packages.0.carrier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Carrier</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "any"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Carrier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CARRIERS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="packages.0.packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "parcel"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Parcel/Package" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PACKAGE_TYPES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Packages Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] text-center">#</TableHead>
                <TableHead className="w-[120px] text-center">
                  {isConnected && showScaleButton ? (
                    <div className="flex items-center justify-center text-green-700 text-sm">
                      <Scale className="h-4 w-4 mr-1 text-green-600" />
                      {`${liveLbs} lb ${Math.round(Number(liveOz))} oz`}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-center text-gray-400 text-sm transition-opacity ${
                        showScaleButton ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Scale className="h-4 w-4 mr-1 text-gray-400" />
                      {supported ? "No Scale" : "—"}
                    </div>
                  )}
                </TableHead>
                <TableHead className="text-center font-medium" colSpan={2}>
                  Weight
                </TableHead>
                <TableHead className="text-center font-medium" colSpan={3}>
                  Dimensions
                </TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, i) => (
                <TableRow key={field.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell className="text-center">
                    {showScaleButton ? (
                      <Button
                        type="button"
                        onClick={() => handleReadWeight(i)}
                        disabled={isReading || isConnecting || !supported}
                        className={`h-9 w-9 border transition-all ${
                          isConnected
                            ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                            : "bg-muted text-gray-500 border-gray-300"
                        }`}
                      >
                        {isReading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Scale className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <div className="h-9" />
                    )}
                  </TableCell>

                  {/* Weight Fields */}
                  <TableCell colSpan={2}>
                    <div className="flex gap-1 justify-center w-full max-w-[240px] mx-auto">
                      {(["weightLbs", "weightOz"] as PackageFieldKey[]).map(
                        (dim, j) => {
                          const hasError = getErrorFor(i, dim);
                          const isLast = j === 1;
                          return (
                            <FormField
                              key={dim}
                              control={control}
                              name={`packages.${i}.${dim}` as const}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="relative h-full">
                                      <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={field.value === 0 ? "" : field.value}
                                        onChange={(e) => {
                                          integerOnly(e);
                                          const val = e.target.value;
                                          field.onChange(val === "" ? "" : Number(val));
                                        }}
                                        className={`h-full pr-8 text-right rounded-none ${
                                          isLast
                                            ? "rounded-r-md"
                                            : "rounded-l-md"
                                        } ${
                                          hasError
                                            ? "border-2 border-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                        {getUnitLabel(dim)}
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          );
                        }
                      )}
                    </div>
                  </TableCell>

                  {/* Dimensions */}
                  <TableCell colSpan={3}>
                    <div className="flex justify-center gap-2 w-full max-w-[400px] mx-auto">
                      {(["length", "width", "height"] as PackageFieldKey[]).map(
                        (dim) => {
                          const hasError = getErrorFor(i, dim);
                          return (
                            <FormField
                              key={dim}
                              control={control}
                              name={`packages.${i}.${dim}` as const}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        value={field.value === 0 ? "" : field.value}
                                        onChange={(e) => {
                                          integerOnly(e);
                                          const val = e.target.value;
                                          field.onChange(val === "" ? "" : Number(val));
                                        }}
                                        className={`pr-8 text-right ${
                                          hasError
                                            ? "border-2 border-destructive focus-visible:ring-2 focus-visible:ring-destructive"
                                            : ""
                                        }`}
                                      />
                                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                        {getUnitLabel(dim)}
                                      </span>
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          );
                        }
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(i)}
                      disabled={pkgCount === 1}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add Package */}
      <div className="flex justify-end items-center gap-2 mt-2">
        <Badge variant="outline" className="text-xs px-2 py-0.5">
          {pkgCount === 1 ? "1 package" : `${pkgCount} packages`}
        </Badge>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddPackage}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Package
        </Button>
      </div>
    </div>
  );
};
