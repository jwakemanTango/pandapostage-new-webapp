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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, Plus, Package as PackageIcon, PlugZap, Loader2, CheckCircle } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import {
  PACKAGE_TYPES,
  CARRIERS,
  CARRIER_PACKAGE_TYPES,
} from "@/lib/constants";
import { useUsbScale } from "@/lib/usbScale-React/use-scale";

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

type EditingPackage = {
  index: number;
  data: PackageItem;
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
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMultiPackage, setShowMultiPackage] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  // Initialize the packages array with one package if it's empty
  useEffect(() => {
    if (fields.length === 0) {
      append(defaultPackage);
    }

    // Set multi-package mode if we have more than one package
    if (fields.length > 1) {
      setShowMultiPackage(true);
    }
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
  }, [supported, connectedDevice, connect]);

  const handleFetchWeight = async (packageIndex: number) => {
    if (!connectedDevice) {
      await connect();
      return;
    }
    const result = await getCurrentWeight();
    if (result) {
      const totalOz = result.ounces;
      const pounds = Math.floor(totalOz / 16);
      const ounces = Math.round(totalOz % 16);

      // Get the current package data
      const currentPackage = fields[packageIndex] as unknown as PackageItem;

      // Update the field array immediately so the table and form stay in sync
      update(packageIndex, {
        ...currentPackage,
        weightLbs: pounds.toString(),
        weightOz: ounces.toString(),
      });

      // Also update editing package state if in edit mode for immediate UI feedback
      if (editingPackage && editingPackage.index === packageIndex) {
        setEditingPackage({
          ...editingPackage,
          data: {
            ...editingPackage.data,
            weightLbs: pounds.toString(),
            weightOz: ounces.toString(),
          },
        });
      }
    }
  };

  // Get the package type label from the value
  const getPackageTypeLabel = (value: string) => {
    const packageType = PACKAGE_TYPES.find((type) => type.value === value);
    return packageType ? packageType.label : value;
  };

  // Handle adding a new package
  const handleAddPackage = () => {
    append(defaultPackage);
  };

  // Handle editing a package
  const handleEditPackage = (index: number) => {
    const pkg = fields[index] as unknown as PackageItem;
    setEditingPackage({
      index,
      data: {
        packageType: pkg.packageType || "parcel",
        weightLbs: pkg.weightLbs || "",
        weightOz: pkg.weightOz || "0",
        length: pkg.length || "",
        width: pkg.width || "",
        height: pkg.height || "",
        carrier: pkg.carrier || "any",
      },
    });
    setIsEditing(true);
  };

  // Handle deleting a package
  const handleDeletePackage = (index: number) => {
    if (fields.length > 1) {
      remove(index);

      // If we're down to one package, hide the multi-package interface
      if (fields.length === 2) {
        // Will be 1 after removal
        setShowMultiPackage(false);
      }
    }
  };

  // Handle saving the edited package
  const handleSavePackage = () => {
    if (editingPackage) {
      update(editingPackage.index, editingPackage.data);
      setEditingPackage(null);
      setIsEditing(false);
    }
  };

  // Handle canceling the package edit
  const handleCancelEdit = () => {
    setEditingPackage(null);
    setIsEditing(false);
  };

  // Update a field in the editing package
  const updatePackageField = (field: keyof PackageItem, value: string) => {
    if (editingPackage) {
      setEditingPackage({
        ...editingPackage,
        data: {
          ...editingPackage.data,
          [field]: value,
        },
      });
    }
  };

  // Enable multi-package mode and add a new package
  const enableMultiPackage = () => {
    setShowMultiPackage(true);
    append(defaultPackage);
  };

  // Get filtered package types based on carrier
  const getFilteredPackageTypes = (carrier: string) => {
    const availablePackageTypes =
      CARRIER_PACKAGE_TYPES[carrier] || CARRIER_PACKAGE_TYPES.any;
    return PACKAGE_TYPES.filter((type) =>
      availablePackageTypes.includes(type.value)
    );
  };

  const selectedCarrier = form.watch("packages.0.carrier") || "any";
  const filteredPackageTypes = getFilteredPackageTypes(selectedCarrier);

  // Read current packages synchronously from the form so validation reflects latest values
  const currentPackages = form.getValues("packages") as PackageItem[] | undefined;
  const packagesForValidation = currentPackages && currentPackages.length > 0
    ? currentPackages
    : fields.map((f) => ({
      packageType: (f as any).packageType,
      weightLbs: (f as any).weightLbs,
    })) as PackageItem[];

  // Determine which package indexes have validation errors (missing type or weight)
  const invalidPackageIndexes = packagesForValidation
    .map((pkg, idx) => ({ pkg, idx }))
    .filter(({ pkg }) => !pkg || !pkg.packageType || !pkg.weightLbs)
    .map(({ idx }) => idx);

  const hasPackageErrors = invalidPackageIndexes.length > 0;

  // When validation errors are shown, scroll the first invalid package into view
  useEffect(() => {
    if (!showErrors || invalidPackageIndexes.length === 0) return;
    const first = invalidPackageIndexes[0];
    // Use the data-testid that table rows already include
    const selector = `[data-testid="row-package-${first}"]`;
    const el = document.querySelector(selector) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === "function") {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Try to focus for accessibility; may not be focusable, but attempt
        (el as HTMLElement).focus?.();
      } catch (err) {
        // ignore scrolling errors
      }
    }
  }, [showErrors, invalidPackageIndexes]);

  // Build per-package error messages for display
  const packageErrorMessages: (string[] | null)[] = packagesForValidation.map((pkg) => {
    if (!pkg) return ["Missing package"];
    const errs: string[] = [];
    if (!pkg.packageType) errs.push("Missing package type");
    if (!pkg.weightLbs) errs.push("Missing weight");
    return errs.length > 0 ? errs : null;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Package Details</h3>
          {showErrors && hasPackageErrors && (
            <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
              {invalidPackageIndexes.length} missing
            </Badge>
          )}
        </div>
        {showMultiPackage && (
          <Badge variant="outline" className="px-2 py-1">
            {fields.length} {fields.length === 1 ? "package" : "packages"}
          </Badge>
        )}
      </div>

      {/* Single Package Mode */}
      {!showMultiPackage && !isEditing && (
        <>
          <div className="space-y-2">
            {/* Carrier + Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="packages.0.carrier"
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
                name="packages.0.packageType"
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

                {supported ? (
                  <Button
                    type="button"
                    variant={connectedDevice ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFetchWeight(0)}
                    disabled={isConnecting}
                    className="flex items-center gap-1 text-xs px-2"
                    data-testid="button-fetch-weight"
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
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center gap-1 text-xs px-2"
                          data-testid="button-fetch-weight-disabled"
                        >
                          <PlugZap size={12} />
                          Connect Scale
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">USB HID not supported in this browser</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </FormLabel>

              <div className="flex gap-4 mt-1.5">
                <FormField
                  control={form.control}
                  name="packages.0.weightLbs"
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
                            data-testid="input-weight-lbs"
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
                  name="packages.0.weightOz"
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
                            data-testid="input-weight-oz"
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
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1" data-testid="text-scale-reading">
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
                          data-testid={`input-${dim}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={enableMultiPackage}
              data-testid="button-add-multiple-packages"
            >
              <Plus className="h-4 w-4" />
              Add Multiple Packages
            </Button>
          </div>
        </>
      )}

      {/* Multi-Package Mode */}
      {showMultiPackage && !isEditing && (
        <>
          <div className="mb-4 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Weight</TableHead>
                  <TableHead className="text-right">Dimensions</TableHead>
                  <TableHead className="text-right w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((pkg, index) => {
                  const typedPkg = (packagesForValidation[index] as PackageItem) || (pkg as unknown as PackageItem);
                  const isInvalid = showErrors && invalidPackageIndexes.includes(index);
                  return (
                    <>
                      <TableRow
                        key={pkg.id}
                        data-invalid={isInvalid ? "true" : undefined}
                        tabIndex={isInvalid ? 0 : undefined}
                        onClick={() => handleEditPackage(index)}
                        data-testid={`row-package-${index}`}
                        className={`
    cursor-pointer transition-colors relative
    hover:bg-muted/50

    /* Invalid row base */
    data-[invalid=true]:!bg-destructive/15
    data-[invalid=true]:dark:!bg-destructive/30
    data-[invalid=true]:!border-l-4
    data-[invalid=true]:!border-destructive

    /* Prevent hover-elevate or hover:bg-muted from overriding */
    data-[invalid=true]:hover:!bg-destructive/25
    data-[invalid=true]:before:absolute
    data-[invalid=true]:before:inset-0
    data-[invalid=true]:before:!bg-destructive/15
    data-[invalid=true]:before:content-['']
    data-[invalid=true]:before:pointer-events-none
  `}
                      >
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          {typedPkg?.packageType
                            ? getPackageTypeLabel(typedPkg.packageType)
                            : "Parcel/Package"}
                        </TableCell>
                        <TableCell className="text-right">
                          {typedPkg?.weightLbs
                            ? typedPkg.weightOz && parseInt(typedPkg.weightOz) > 0
                              ? `${typedPkg.weightLbs} lbs ${typedPkg.weightOz} oz`
                              : `${typedPkg.weightLbs} lbs`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {typedPkg?.length && typedPkg?.width && typedPkg?.height
                            ? `${typedPkg.length}" × ${typedPkg.width}" × ${typedPkg.height}"`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePackage(index);
                            }}
                            disabled={fields.length <= 1}
                            data-testid={`button-delete-package-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isInvalid && packageErrorMessages[index] && (
                        <TableRow key={`${pkg.id}-error`} className="bg-destructive/5">
                          <TableCell />
                          <TableCell colSpan={4} className="text-destructive text-sm px-4 py-2">
                            {packageErrorMessages[index]!.map((m, i) => (
                              <div key={i}>{m}</div>
                            ))}
                          </TableCell>
                        </TableRow>
                      )}


                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleAddPackage}
              data-testid="button-add-package"
            >
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
          </div>
        </>
      )}

      {/* Package Edit Form */}
      {isEditing && editingPackage && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageIcon className="h-5 w-5" />
              <span>
                {showMultiPackage || fields.length > 1
                  ? `Package ${editingPackage.index + 1}`
                  : "Package Details"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Carrier + Package Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel className="text-sm font-medium">Preferred Carrier</FormLabel>
                  <Select
                    value={editingPackage.data.carrier || "any"}
                    onValueChange={(value) => {
                      updatePackageField("carrier", value);
                      const pkgType = editingPackage.data.packageType;
                      const newAvailable =
                        CARRIER_PACKAGE_TYPES[value] || CARRIER_PACKAGE_TYPES.any;
                      if (pkgType && !newAvailable.includes(pkgType)) {
                        updatePackageField("packageType", "");
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-carrier-edit">
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIERS.map((carrier) => (
                        <SelectItem key={carrier.value} value={carrier.value}>
                          {carrier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <FormLabel className="text-sm font-medium">Package Type</FormLabel>
                  <Select
                    value={editingPackage.data.packageType}
                    onValueChange={(value) => updatePackageField("packageType", value)}
                  >
                    <SelectTrigger data-testid="select-package-type-edit">
                      <SelectValue placeholder="Select package type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFilteredPackageTypes(
                        editingPackage.data.carrier || "any"
                      ).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Weight Section with Scale */}
              <div className="border-t pt-4">
                <FormLabel className="text-sm font-medium flex justify-between items-center">
                  <span>Weight</span>

                  {supported ? (
                    <Button
                      type="button"
                      variant={connectedDevice ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFetchWeight(editingPackage.index)}
                      disabled={isConnecting}
                      className="flex items-center gap-1 text-xs px-2"
                      data-testid="button-fetch-weight-edit"
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
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled
                            className="flex items-center gap-1 text-xs px-2"
                            data-testid="button-fetch-weight-edit-disabled"
                          >
                            <PlugZap size={12} />
                            Connect Scale
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">USB HID not supported in this browser</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </FormLabel>

                <div className="flex gap-4 mt-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        value={editingPackage.data.weightLbs}
                        onChange={(e) =>
                          updatePackageField(
                            "weightLbs",
                            e.target.value.replace(/[^0-9]/g, "")
                          )
                        }
                        data-testid="input-weight-lbs-edit"
                      />
                      <span className="text-sm text-muted-foreground">lbs</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        step="1"
                        placeholder="0"
                        value={editingPackage.data.weightOz}
                        onChange={(e) =>
                          updatePackageField(
                            "weightOz",
                            e.target.value.replace(/[^0-9]/g, "")
                          )
                        }
                        data-testid="input-weight-oz-edit"
                      />
                      <span className="text-sm text-muted-foreground">oz</span>
                    </div>
                  </div>
                </div>

                {weight && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1" data-testid="text-scale-reading-edit">
                    <CheckCircle size={12} className="text-green-500" />
                    Scale reading: {weight.grams.toFixed(0)} g /{" "}
                    {weight.ounces.toFixed(1)} oz
                  </p>
                )}
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FormLabel className="text-sm font-medium">Length (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="0"
                    value={editingPackage.data.length}
                    onChange={(e) =>
                      updatePackageField("length", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    data-testid="input-length-edit"
                  />
                </div>
                <div>
                  <FormLabel className="text-sm font-medium">Width (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="0"
                    value={editingPackage.data.width}
                    onChange={(e) =>
                      updatePackageField("width", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    data-testid="input-width-edit"
                  />
                </div>
                <div>
                  <FormLabel className="text-sm font-medium">Height (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="0"
                    value={editingPackage.data.height}
                    onChange={(e) =>
                      updatePackageField("height", e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    data-testid="input-height-edit"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSavePackage}
              data-testid="button-save-package"
            >
              Save Package
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PackageForm;
