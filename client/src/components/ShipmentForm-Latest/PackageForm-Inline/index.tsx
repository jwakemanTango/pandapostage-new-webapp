import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Scale, Loader2, Trash2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUsbScale } from "@/hooks/use-UsbScale";
import {
  PACKAGE_TYPES,
  CARRIERS,
  CARRIER_PACKAGE_TYPES,
} from "@/lib/constants";
import { packageSchema } from "@shared/schema";

/* ------------------------------
   Schema
-------------------------------- */

const formSchema = z.object({
  carrier: z.string().min(1, "Carrier required"),
  packageType: z.string().min(1, "Package type required"),
  shipDate: z.string().min(1, "Ship date required"),
  reference1: z.string().optional(),
  reference1Print: z.boolean().optional().default(false),
  reference2: z.string().optional(),
  reference2Print: z.boolean().optional().default(false),
  reference3: z.string().optional(),
  reference4: z.string().optional(),
  packages: z.array(packageSchema).min(1).max(10, "Max 10 packages"),
});

type FormValues = z.infer<typeof formSchema>;

const defaultPackage = {
  weightLbs: "",
  weightOz: "0",
  length: "",
  width: "",
  height: "",
};

const PRESET_DIMENSIONS: Record<
  string,
  { length: string; width: string; height: string }
> = {
  "flat-rate-box": { length: "12.25", width: "12.25", height: "6" },
  "flat-rate-envelope": { length: "12.5", width: "9.5", height: "0.5" },
};

/* ------------------------------
   Unit Input Helper
-------------------------------- */
const UnitInput = ({ field, unit, ...props }: any) => (
  <div className="relative">
    <Input
      type="number"
      className="w-16 h-8 text-sm text-right pr-6"
      {...field}
      {...props}
    />
    <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
      {unit}
    </span>
  </div>
);

/* ------------------------------
   Component
-------------------------------- */
export default function PackageFormTableInline() {
  const [showRefs, setShowRefs] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carrier: "any",
      packageType: "parcel",
      shipDate: new Date().toISOString().slice(0, 10),
      reference1: "",
      reference1Print: true,
      reference2: "",
      reference2Print: false,
      reference3: "",
      reference4: "",
      packages: [defaultPackage],
    },
    mode: "onBlur",
  });

  const { control, watch, setValue } = form;
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "packages",
  });

  const carrier = watch("carrier");
  const packageType = watch("packageType");
  const typeLocked = packageType !== "parcel";
  const pkgCount = fields.length;

  const {
    supported,
    connectedDevice,
    isConnecting,
    connect,
    getCurrentWeight,
    weight,
  } = useUsbScale();

  useEffect(() => {
    if (supported && !connectedDevice) {
      (async () => {
        try {
          const devices = await (navigator as any).hid.getDevices();
          if (devices?.length > 0) await connect(devices[0]);
        } catch {
          /* silent */
        }
      })();
    }
  }, [supported, connectedDevice, connect]);

  const handleFetchWeight = async (index: number) => {
    if (!connectedDevice) {
      await connect();
      return;
    }
    const result = await getCurrentWeight();
    if (result) {
      const totalOz = result.ounces;
      const lbs = Math.floor(totalOz / 16);
      const oz = Math.round(totalOz % 16);
      update(index, { ...fields[index], weightLbs: String(lbs), weightOz: String(oz) });
    }
  };

  const handleAdd = () => {
    if (fields.length < 10) append(defaultPackage);
  };

  const handleRemove = (i: number) => {
    if (fields.length > 1) remove(i);
  };

  const allowedTypes =
    CARRIER_PACKAGE_TYPES[carrier] || CARRIER_PACKAGE_TYPES.any;
  const filteredTypes = PACKAGE_TYPES.filter((t) =>
    allowedTypes.includes(t.value)
  );

  /* ------------------------------ */
  return (
    <Form {...form}>
      <form className="max-w-5xl mx-auto p-4 space-y-4">
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight">
                Package Details
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {pkgCount} {pkgCount === 1 ? "package" : "packages"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {/* Carrier / Type / Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-muted/30 rounded-md p-3">
              <FormField
                control={control}
                name="carrier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-muted-foreground">
                      Carrier
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        if (!CARRIER_PACKAGE_TYPES[v]?.includes(packageType)) {
                          setValue(
                            "packageType",
                            (CARRIER_PACKAGE_TYPES[v] ||
                              CARRIER_PACKAGE_TYPES.any)[0]
                          );
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select carrier" />
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
                name="packageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-muted-foreground">
                      Package Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="shipDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[13px] font-medium text-muted-foreground">
                      Ship Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="h-8 text-sm" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Collapsible Reference Info */}
            <div>
              <button
                type="button"
                onClick={() => setShowRefs(!showRefs)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-1"
              >
                {showRefs ? (
                  <>
                    Reference Info <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Reference Info <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>

              <AnimatePresence initial={false}>
                {showRefs && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-md border bg-muted/20 p-3 mt-2 space-y-2"
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Reference Information
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      {[
                        { name: "reference1", label: "Ref 1", printName: "reference1Print" },
                        { name: "reference2", label: "Ref 2", printName: "reference2Print" },
                        { name: "reference3", label: "Ref 3" },
                        { name: "reference4", label: "Ref 4" },
                      ].map((ref) => (
                        <div key={ref.name} className="flex flex-col space-y-1">
                          <FormField
                            control={control}
                            name={ref.name as any}
                            render={({ field }) => (
                              <FormControl>
                                <Input
                                  placeholder={ref.label}
                                  className="h-8 text-xs"
                                  {...field}
                                />
                              </FormControl>
                            )}
                          />
                          {ref.printName && (
                            <Controller
                              control={control}
                              name={ref.printName as any}
                              render={({ field }) => (
                                <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    className="scale-90"
                                  />
                                  Print on Label
                                </label>
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Single vs Multi */}
            <AnimatePresence mode="wait" initial={false}>
              {pkgCount === 1 ? (
                <motion.div
                  key="single"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 rounded-md border bg-muted/10 p-3 space-y-2"
                >
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Package Size & Weight
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Weight */}
                    <div className="flex items-center gap-1">
                      <FormField
                        control={control}
                        name={`packages.0.weightLbs`}
                        render={({ field }) => (
                          <FormControl>
                            <UnitInput field={field} unit="lb" />
                          </FormControl>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`packages.0.weightOz`}
                        render={({ field }) => (
                          <FormControl>
                            <UnitInput field={field} unit="oz" />
                          </FormControl>
                        )}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            className={`h-8 w-8 ${
                              connectedDevice
                                ? "border-green-500/60 text-green-700 bg-green-50 hover:bg-green-100"
                                : ""
                            }`}
                            onClick={() => handleFetchWeight(0)}
                            disabled={isConnecting || !supported}
                          >
                            {isConnecting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Scale className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{connectedDevice ? "Read from Scale" : "Connect Scale"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Dimensions */}
                    <div className="flex items-center gap-1">
                      {["length", "width", "height"].map((dim) => (
                        <FormField
                          key={dim}
                          control={control}
                          name={`packages.0.${dim}`}
                          render={({ field }) => (
                            <FormControl>
                              <UnitInput
                                field={field}
                                unit="in"
                                disabled={typeLocked}
                                value={
                                  typeLocked
                                    ? PRESET_DIMENSIONS[packageType]?.[dim] || ""
                                    : field.value
                                }
                                onChange={field.onChange}
                              />
                            </FormControl>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-sm text-muted-foreground hover:text-foreground p-0"
                      onClick={handleAdd}
                      disabled={pkgCount >= 10}
                    >
                      + Add another package
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="multi"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px] text-xs">#</TableHead>
                        <TableHead className="text-xs">Weight</TableHead>
                        <TableHead className="text-xs">Dimensions</TableHead>
                        <TableHead className="w-[60px] text-xs text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      <AnimatePresence initial={false}>
                        {fields.map((pkg, i) => (
                          <motion.tr
                            key={pkg.id}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="text-sm hover:bg-muted/40 transition-colors"
                          >
                            <TableCell className="text-muted-foreground text-xs bg-muted/20">
                              {i + 1}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-1">
                                <FormField
                                  control={control}
                                  name={`packages.${i}.weightLbs`}
                                  render={({ field }) => (
                                    <FormControl>
                                      <UnitInput field={field} unit="lb" />
                                    </FormControl>
                                  )}
                                />
                                <FormField
                                  control={control}
                                  name={`packages.${i}.weightOz`}
                                  render={({ field }) => (
                                    <FormControl>
                                      <UnitInput field={field} unit="oz" />
                                    </FormControl>
                                  )}
                                />
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="outline"
                                      className={`h-7 w-7 ml-1 ${
                                        connectedDevice
                                          ? "border-green-500/60 text-green-700 bg-green-50 hover:bg-green-100"
                                          : ""
                                      }`}
                                      onClick={() => handleFetchWeight(i)}
                                      disabled={isConnecting || !supported}
                                    >
                                      {isConnecting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Scale className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {connectedDevice
                                        ? "Read from Scale"
                                        : "Connect Scale"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex gap-1">
                                {["length", "width", "height"].map((dim) => (
                                  <FormField
                                    key={dim}
                                    control={control}
                                    name={`packages.${i}.${dim}`}
                                    render={({ field }) => (
                                      <FormControl>
                                        <UnitInput
                                          field={field}
                                          unit="in"
                                          disabled={typeLocked}
                                          value={
                                            typeLocked
                                              ? PRESET_DIMENSIONS[packageType]?.[dim] || ""
                                              : field.value
                                          }
                                          onChange={field.onChange}
                                        />
                                      </FormControl>
                                    )}
                                  />
                                ))}
                              </div>
                            </TableCell>

                            <TableCell className="text-right">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRemove(i)}
                                className="h-7 w-7"
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>

                  <div className="flex justify-end pt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleAdd}
                          disabled={pkgCount >= 10}
                          className="gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add Package
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add another package (max 10)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="border-t pt-2">
            <div className="flex items-center justify-center w-full gap-2 text-xs text-muted-foreground">
              {connectedDevice && weight ? (
                <span className="flex items-center gap-1 text-green-700">
                  <Scale className="h-3 w-3 animate-pulse text-green-600" />
                  Connected — {Math.floor(weight.ounces / 16)} lb {Math.round(weight.ounces % 16)} oz
                </span>
              ) : (
                <span className="flex items-center gap-1 opacity-70">
                  <Scale className="h-3 w-3 text-muted-foreground" />
                  Not connected
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
