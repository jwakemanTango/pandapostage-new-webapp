import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit } from "lucide-react";
import { useFieldArray } from "react-hook-form";

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
}

type EditingPackage = {
  index: number;
  data: PackageItem;
}

const PACKAGE_TYPES = [
  { value: "letter", label: "Letter/Envelope" },
  { value: "parcel", label: "Parcel/Package" },
  { value: "large_box", label: "Large Box" },
  { value: "flat_rate_envelope", label: "Flat Rate Envelope" },
  { value: "flat_rate_box_small", label: "Small Flat Rate Box" },
  { value: "flat_rate_box_medium", label: "Medium Flat Rate Box" },
  { value: "flat_rate_box_large", label: "Large Flat Rate Box" },
  { value: "regional_box_a", label: "Regional Box A" },
  { value: "regional_box_b", label: "Regional Box B" },
  { value: "custom", label: "Custom Package" },
];

const defaultPackage: PackageItem = {
  packageType: "parcel",
  weightLbs: "",
  weightOz: "0",
  length: "",
  width: "",
  height: ""
};

const PackageForm = ({ form, showErrors = false }: PackageFormProps) => {
  const [editingPackage, setEditingPackage] = useState<EditingPackage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMultiPackage, setShowMultiPackage] = useState(false);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "packages"
  });

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
        height: pkg.height || ""
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
          <div className="space-y-4">
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
                      {PACKAGE_TYPES.map((type) => (
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
                    <FormLabel className="text-sm font-medium">Length (in)</FormLabel>
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
                    <FormLabel className="text-sm font-medium">Width (in)</FormLabel>
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
                    <FormLabel className="text-sm font-medium">Height (in)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0" {...field} data-testid="input-height" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-5">
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
        <div className="space-y-4 p-4 border rounded-md bg-card">
          <h4 className="font-semibold text-sm">Edit Package #{editingPackage.index + 1}</h4>
          
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
              <FormLabel className="text-sm font-medium">Length (in)</FormLabel>
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
              <FormLabel className="text-sm font-medium">Width (in)</FormLabel>
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
              <FormLabel className="text-sm font-medium">Height (in)</FormLabel>
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
