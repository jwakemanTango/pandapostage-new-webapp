import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Box } from "lucide-react";
import { SiUsps, SiUps, SiFedex } from "react-icons/si";
import { useFieldArray } from "react-hook-form";
import { PACKAGE_TYPES, CARRIERS, CARRIER_PACKAGE_TYPES } from "@/lib/constants";

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
}

type EditingPackage = {
  index: number;
  data: PackageItem;
}

const PACKAGE_PRESETS = [
  { name: "Small Box", carrier: "any", packageType: "parcel", weightLbs: "1", weightOz: "0", dimensions: { length: "8", width: "6", height: "4" } },
  { name: "Medium Box", carrier: "any", packageType: "parcel", weightLbs: "5", weightOz: "0", dimensions: { length: "12", width: "10", height: "8" } },
  { name: "Large Box", carrier: "any", packageType: "large_box", weightLbs: "10", weightOz: "0", dimensions: { length: "18", width: "14", height: "12" } },
  { name: "USPS-Letter", carrier: "usps", packageType: "letter", weightLbs: "0", weightOz: "1", dimensions: { length: "12", width: "12", height: "1" } },
  { name: "UPS Parcel", carrier: "ups", packageType: "parcel", weightLbs: "1", weightOz: "0", dimensions: { length: "8", width: "8", height: "4" } },
];

const defaultPackage: PackageItem = {
  packageType: "parcel",
  weightLbs: "",
  weightOz: "0",
  length: "",
  width: "",
  height: "",
  carrier: "any"
};

const getPresetIcon = (carrier: string) => {
  const iconSize = 14;
  switch (carrier.toLowerCase()) {
    case 'usps':
      return <SiUsps size={iconSize} />;
    case 'ups':
      return <SiUps size={iconSize} />;
    case 'fedex':
      return <SiFedex size={iconSize} />;
    default:
      return <Box className="h-3.5 w-3.5" />;
  }
};

const PackageForm = ({ form, showErrors = false }: PackageFormProps) => {
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMultiPackage, setShowMultiPackage] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "packages"
  });

  const selectedCarrier = form.watch("packages.0.carrier") || "any";
  const availablePackageTypes = CARRIER_PACKAGE_TYPES[selectedCarrier] || CARRIER_PACKAGE_TYPES.any;
  const filteredPackageTypes = PACKAGE_TYPES.filter(type => availablePackageTypes.includes(type.value));

  useEffect(() => {
    if (fields.length === 0) {
      append(defaultPackage);
    }
    
    if (fields.length > 1) {
      setShowMultiPackage(true);
    }
  }, [fields.length, append]);

  const getPackageTypeLabel = (value: string) => {
    const packageType = PACKAGE_TYPES.find(type => type.value === value);
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
    
    // Clear validation errors for package section
    form.clearErrors("packages");
  };

  const handleAddPackage = () => {
    append(defaultPackage);
  };

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
        carrier: pkg.carrier || "any"
      } 
    });
    setIsEditing(true);
  };

  const handleDeletePackage = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      
      if (fields.length === 2) {
        setShowMultiPackage(false);
      }
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
          [field]: value
        }
      });
    }
  };

  const enableMultiPackage = () => {
    setShowMultiPackage(true);
    append(defaultPackage);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">Package Details</h3>
          {showErrors && fields.some(pkg => {
            const typedPkg = pkg as unknown as PackageItem;
            return !typedPkg.packageType || !typedPkg.weightLbs;
          }) && (
            <Badge variant="destructive" className="px-1.5 py-0.5 text-xs">
              Missing information
            </Badge>
          )}
        </div>
        {showMultiPackage && (
          <Badge variant="outline" className="px-1.5 py-0.5 text-xs" data-testid="badge-package-count">
            {fields.length} {fields.length === 1 ? "package" : "packages"}
          </Badge>
        )}
      </div>

      {!showMultiPackage && !isEditing && (
        <>
          <div className="mb-4 pb-4 border-b">
            <FormLabel className="text-sm font-medium mb-2 block">Custom Packages</FormLabel>
            <div className="flex flex-wrap gap-2">
              {PACKAGE_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetSelect(preset)}
                  className="gap-1.5"
                  data-testid={`button-preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
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
                    <FormLabel className="text-sm font-medium">Preferred Carrier</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset package type if it's not available for the new carrier
                        const currentPackageType = form.getValues("packages.0.packageType");
                        const newAvailableTypes = CARRIER_PACKAGE_TYPES[value] || CARRIER_PACKAGE_TYPES.any;
                        if (currentPackageType && !newAvailableTypes.includes(currentPackageType)) {
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
                    <FormLabel className="text-sm font-medium">Package Type</FormLabel>
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

            <div>
              <FormLabel className="text-sm font-medium">Weight</FormLabel>
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
                            data-testid="input-weight-lbs"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
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
                            data-testid="input-weight-oz"
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
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
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`packages.0.length`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Length (in) *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0" {...field} data-testid="input-length" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`packages.0.width`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Width (in) *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0" {...field} data-testid="input-width" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`packages.0.height`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Height (in) *</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0" {...field} data-testid="input-height" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
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

      {showMultiPackage && !isEditing && (
        <>
          <div className="mb-4 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] py-3">#</TableHead>
                  <TableHead className="py-3">Type</TableHead>
                  <TableHead className="text-right py-3">Weight</TableHead>
                  <TableHead className="text-right py-3">Dimensions</TableHead>
                  <TableHead className="text-right w-[100px] py-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((pkg, index) => {
                  const typedPkg = pkg as unknown as PackageItem;
                  return (
                    <TableRow 
                      key={pkg.id} 
                      className={`cursor-pointer hover-elevate ${showErrors && (!typedPkg.packageType || !typedPkg.weightLbs) ? 'bg-destructive/10 border-l-4 border-destructive' : ''}`}
                      onClick={() => handleEditPackage(index)}
                      data-testid={`row-package-${index}`}
                    >
                      <TableCell className="font-medium py-3">{index + 1}</TableCell>
                      <TableCell className="py-3">
                        {typedPkg.packageType ? getPackageTypeLabel(typedPkg.packageType) : "Parcel/Package"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm py-3">
                        {typedPkg.weightLbs ? `${typedPkg.weightLbs} lbs ${typedPkg.weightOz || '0'} oz` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm py-3">
                        {typedPkg.length && typedPkg.width && typedPkg.height 
                          ? `${typedPkg.length} × ${typedPkg.width} × ${typedPkg.height}"`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPackage(index);
                            }}
                            data-testid={`button-edit-package-${index}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePackage(index);
                              }}
                              data-testid={`button-delete-package-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="gap-2" 
              onClick={handleAddPackage}
              data-testid="button-add-another-package"
            >
              <Plus className="h-4 w-4" />
              Add Another Package
            </Button>
          </div>
        </>
      )}

      {isEditing && editingPackage && (
        <div className="space-y-2 p-4 border rounded-md bg-card">
          <h4 className="font-semibold text-sm">Edit Package #{editingPackage.index + 1}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel className="text-sm font-medium">Preferred Carrier</FormLabel>
              <Select 
                onValueChange={(value) => updatePackageField('carrier', value)} 
                value={editingPackage.data.carrier || "any"}
              >
                <SelectTrigger data-testid="select-edit-carrier" className="mt-1.5">
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
                onValueChange={(value) => updatePackageField('packageType', value)} 
                value={editingPackage.data.packageType}
              >
                <SelectTrigger data-testid="select-edit-package-type" className="mt-1.5">
                  <SelectValue placeholder="Select package type" />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t my-4"></div>

          <div>
            <FormLabel className="text-sm font-medium">Weight</FormLabel>
            <div className="flex gap-4 mt-1.5">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    min="0"
                    step="1"
                    placeholder="0" 
                    value={editingPackage.data.weightLbs}
                    onChange={(e) => updatePackageField('weightLbs', e.target.value.replace(/[^0-9]/g, ''))}
                    data-testid="input-edit-weight-lbs"
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
                    onChange={(e) => updatePackageField('weightOz', e.target.value.replace(/[^0-9]/g, ''))}
                    data-testid="input-edit-weight-oz"
                  />
                  <span className="text-sm text-muted-foreground">oz</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <FormLabel className="text-sm font-medium">Length (in) *</FormLabel>
              <Input 
                type="text" 
                placeholder="0" 
                value={editingPackage.data.length}
                onChange={(e) => updatePackageField('length', e.target.value)}
                data-testid="input-edit-length"
                className="mt-1.5"
              />
            </div>
            <div>
              <FormLabel className="text-sm font-medium">Width (in) *</FormLabel>
              <Input 
                type="text" 
                placeholder="0" 
                value={editingPackage.data.width}
                onChange={(e) => updatePackageField('width', e.target.value)}
                data-testid="input-edit-width"
                className="mt-1.5"
              />
            </div>
            <div>
              <FormLabel className="text-sm font-medium">Height (in) *</FormLabel>
              <Input 
                type="text" 
                placeholder="0" 
                value={editingPackage.data.height}
                onChange={(e) => updatePackageField('height', e.target.value)}
                data-testid="input-edit-height"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button 
              type="button"
              size="sm"
              onClick={handleSavePackage}
              data-testid="button-save-package"
            >
              Save Package
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageForm;
