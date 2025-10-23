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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Box, PlugZap } from "lucide-react";
import { SiUsps, SiUps, SiFedex } from "react-icons/si";
import { useFieldArray } from "react-hook-form";
import {
  PACKAGE_TYPES,
  CARRIERS,
  CARRIER_PACKAGE_TYPES,
} from "@/lib/constants";
import { useUsbScale } from "@/hooks/useUsbScale";

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

const PACKAGE_PRESETS = [
  {
    name: "Small Box",
    carrier: "any",
    packageType: "parcel",
    weightLbs: "1",
    weightOz: "0",
    dimensions: { length: "8", width: "6", height: "4" },
  },
  {
    name: "Medium Box",
    carrier: "any",
    packageType: "parcel",
    weightLbs: "5",
    weightOz: "0",
    dimensions: { length: "12", width: "10", height: "8" },
  },
  {
    name: "Large Box",
    carrier: "any",
    packageType: "large_box",
    weightLbs: "10",
    weightOz: "0",
    dimensions: { length: "18", width: "14", height: "12" },
  },
  {
    name: "USPS-Letter",
    carrier: "usps",
    packageType: "letter",
    weightLbs: "0",
    weightOz: "1",
    dimensions: { length: "12", width: "12", height: "1" },
  },
  {
    name: "UPS Parcel",
    carrier: "ups",
    packageType: "parcel",
    weightLbs: "1",
    weightOz: "0",
    dimensions: { length: "8", width: "8", height: "4" },
  },
];

const defaultPackage: PackageItem = {
  packageType: "parcel",
  weightLbs: "",
  weightOz: "0",
  length: "",
  width: "",
  height: "",
  carrier: "any",
};

const getPresetIcon = (carrier: string) => {
  const iconSize = 14;
  switch (carrier.toLowerCase()) {
    case "usps":
      return <SiUsps size={iconSize} />;
    case "ups":
      return <SiUps size={iconSize} />;
    case "fedex":
      return <SiFedex size={iconSize} />;
    default:
      return <Box className="h-3.5 w-3.5" />;
  }
};

const PackageForm = ({ form, showErrors = false }: PackageFormProps) => {
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showMultiPackage, setShowMultiPackage] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
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
    if (fields.length === 0) {
      append(defaultPackage);
    }

    if (fields.length > 1) {
      setShowMultiPackage(true);
    }
  }, [fields.length, append]);

  const getPackageTypeLabel = (value: string) => {
    const packageType = PACKAGE_TYPES.find((type) => type.value === value);
    return packageType ? packageType.label : value;
  };

  const handlePresetSelect = (preset: typeof PACKAGE_PRESETS[0]) => {
    form.setValue("packages.0.carrier", preset.carrier);
    form.setValue("packages.0.packageType", preset.packageType);
    form.setValue("packages.0.weightLbs", preset.weightLbs);
    form.setValue("packages.0.weightOz", preset.weightOz);
    form.setValue("packages.0.length", preset.dimensions.length);
    form.setValue("packages.0.width", preset.dimensions.width);
    form.setValue("packages.0.height", preset.dimensions.height);

    form.clearErrors("packages");
  };

  const handleAddPackage = () => append(defaultPackage);

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

  const handleDeletePackage = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      if (fields.length === 2) setShowMultiPackage(false);
    }
  };

  const handleSavePackage = () => {
    if (editingPackage) {
      update(editingPackage.index, editingPackage.data);
      setEditingPackage(null);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPackage(null);
    setIsEditing(false);
  };

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

  const enableMultiPackage = () => {
    setShowMultiPackage(true);
    append(defaultPackage);
  };

  // -----------------------------
  // USB SCALE INTEGRATION
  // -----------------------------
  const { supported, connectedDevice, isConnecting, getCurrentWeight } =
    useUsbScale();

  // Auto connect on render if supported
  useEffect(() => {
    if (supported && !connectedDevice) {
      getCurrentWeight();
    }
  }, [supported]);

  const handleFetchWeight = async () => {
    const result = await getCurrentWeight();
    if (result) {
      const roundedOz = Math.round(result.oz); // whole ounces only
      form.setValue("packages.0.weightLbs", result.lbs.toString());
      form.setValue("packages.0.weightOz", roundedOz.toString());
    }
  };

  // -----------------------------

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Package Details</h3>
          {showErrors &&
            fields.some((pkg) => {
              const typedPkg = pkg as unknown as PackageItem;
              return !typedPkg.packageType || !typedPkg.weightLbs;
            }) && (
              <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
                Missing information
              </Badge>
            )}
        </div>
        {showMultiPackage && (
          <Badge
            variant="outline"
            className="px-1.5 py-0.5 text-xs"
            data-testid="badge-package-count"
          >
            {fields.length} {fields.length === 1 ? "package" : "packages"}
          </Badge>
        )}
      </div>

      {!showMultiPackage && !isEditing && (
        <>
          <div className="mb-4 pb-4 border-b">
            <FormLabel className="text-sm font-medium mb-2 block">
              Custom Packages
            </FormLabel>
            <div className="flex flex-wrap gap-2">
              {PACKAGE_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="gap-1.5"
                >
                  {getPresetIcon(preset.carrier)}
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
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
                        const currentPackageType =
                          form.getValues("packages.0.packageType");
                        const newAvailableTypes =
                          CARRIER_PACKAGE_TYPES[value] ||
                          CARRIER_PACKAGE_TYPES.any;
                        if (
                          currentPackageType &&
                          !newAvailableTypes.includes(currentPackageType)
                        ) {
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

            <div className="border-t my-4"></div>

            {/* Weight Section */}
            <div>
              <FormLabel className="text-sm font-medium flex items-center justify-between">
                <span>Weight</span>

                {supported && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-1 px-2 text-xs transition ${
                      isConnecting
                        ? "border-blue-500 text-blue-600 hover:bg-blue-50"
                        : connectedDevice
                        ? "border-green-500 text-green-600 hover:bg-green-50"
                        : "border-gray-400 text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={handleFetchWeight}
                    disabled={isConnecting}
                  >
                    <PlugZap size={12} />
                    {isConnecting
                      ? "Connecting..."
                      : connectedDevice
                      ? "Fetch Weight"
                      : "Connect Scale"}
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
                        <span className="text-sm text-muted-foreground">
                          lbs
                        </span>
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
            </div>

            {/* Dimensions Section */}
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

          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={enableMultiPackage}
            >
              <Plus className="h-4 w-4" />
              Add Multiple Packages
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default PackageForm;
