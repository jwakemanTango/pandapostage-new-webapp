import { useState, useEffect } from "react";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Package as PackageIcon } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";

interface PackageFormProps {
  form: any;
  showErrors?: boolean;
}

// Define package structure
type PackageItem = {
  packageType: string;
  weightLbs: string;
  weightOz: string;
  length: string;
  width: string;
  height: string;
}

// Package in edit mode
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

  // Use react-hook-form's useFieldArray to manage the packages array
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "packages"
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

  // Get the package type label from the value
  const getPackageTypeLabel = (value: string) => {
    const packageType = PACKAGE_TYPES.find(type => type.value === value);
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
        height: pkg.height || ""
      } 
    });
    setIsEditing(true);
  };

  // Handle deleting a package
  const handleDeletePackage = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      
      // If we're down to one package, hide the multi-package interface
      if (fields.length === 2) { // Will be 1 after removal
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
          [field]: value
        }
      });
    }
  };

  // Enable multi-package mode and add a new package
  const enableMultiPackage = () => {
    setShowMultiPackage(true);
    // When enabling multi-package mode, automatically add a new package
    append(defaultPackage);
  };

  // Get the primary package (first package)
  const primaryPackage = fields[0] as unknown as PackageItem;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Package Details</h3>
          {showErrors && fields.some(pkg => {
            const typedPkg = pkg as unknown as PackageItem;
            return !typedPkg.packageType || !typedPkg.weightLbs;
          }) && (
            <Badge variant="destructive" className="px-2 py-1">
              Missing information
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
          <div className="space-y-4">
            {/* Package Type */}
            <FormField
              control={form.control}
              name={`packages.0.packageType`}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Package Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
            
            {/* Weight - Split into pounds and ounces */}
            <div className="mb-4">
              <FormLabel>Weight</FormLabel>
              <div className="flex gap-4 mt-2">
                <FormField
                  control={form.control}
                  name={`packages.0.weightLbs`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            step="1"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => {
                              // Only allow whole numbers
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <div className="flex items-center ml-2 text-sm text-gray-500">
                          lbs
                        </div>
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
                      <div className="flex">
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            max="15" 
                            step="1"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0" 
                            {...field} 
                            onChange={(e) => {
                              // Only allow whole numbers
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <div className="flex items-center ml-2 text-sm text-gray-500">
                          oz
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name={`packages.0.length`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (in)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Length" {...field} />
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
                    <FormLabel>Width (in)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Width" {...field} />
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
                    <FormLabel>Height (in)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Height" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" className="gap-2" onClick={enableMultiPackage}>
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
                  const typedPkg = pkg as unknown as PackageItem;
                  return (
                    <TableRow 
                      key={pkg.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${showErrors && (!typedPkg.packageType || !typedPkg.weightLbs) ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                      onClick={() => handleEditPackage(index)}
                    >
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {typedPkg.packageType ? getPackageTypeLabel(typedPkg.packageType) : "Parcel/Package"}
                      </TableCell>
                      <TableCell className="text-right">
                        {typedPkg.weightLbs 
                          ? (typedPkg.weightOz && parseInt(typedPkg.weightOz) > 0 
                              ? `${typedPkg.weightLbs} lbs ${typedPkg.weightOz} oz` 
                              : `${typedPkg.weightLbs} lbs`)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {typedPkg.length && typedPkg.width && typedPkg.height
                          ? `${typedPkg.length}" × ${typedPkg.width}" × ${typedPkg.height}"`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePackage(index);
                          }}
                          disabled={fields.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-2">
            <Button variant="outline" className="gap-2" onClick={handleAddPackage}>
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
              <span>{showMultiPackage || fields.length > 1 ? `Package ${editingPackage.index + 1}` : 'Package Details'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Package Type */}
              <div className="mb-4">
                <FormLabel>Package Type</FormLabel>
                <Select 
                  value={editingPackage.data.packageType}
                  onValueChange={(value) => updatePackageField("packageType", value)}
                >
                  <FormControl>
                    <SelectTrigger>
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
              </div>
              
              {/* Weight - Split into pounds and ounces */}
              <div className="mb-4">
                <FormLabel>Weight</FormLabel>
                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <div className="flex">
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0" 
                        value={editingPackage.data.weightLbs}
                        onChange={(e) => {
                          // Only allow whole numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          updatePackageField("weightLbs", value);
                        }}
                      />
                      <div className="flex items-center ml-2 text-sm text-gray-500">
                        lbs
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex">
                      <Input 
                        type="number"
                        min="0"
                        max="15" 
                        step="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="0" 
                        value={editingPackage.data.weightOz}
                        onChange={(e) => {
                          // Only allow whole numbers
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          updatePackageField("weightOz", value);
                        }}
                      />
                      <div className="flex items-center ml-2 text-sm text-gray-500">
                        oz
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dimensions */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <FormLabel>Length (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="Length"
                    value={editingPackage.data.length}
                    onChange={(e) => updatePackageField("length", e.target.value)}
                  />
                </div>
                <div>
                  <FormLabel>Width (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="Width"
                    value={editingPackage.data.width}
                    onChange={(e) => updatePackageField("width", e.target.value)}
                  />
                </div>
                <div>
                  <FormLabel>Height (in)</FormLabel>
                  <Input
                    type="text"
                    placeholder="Height"
                    value={editingPackage.data.height}
                    onChange={(e) => updatePackageField("height", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSavePackage}>
              Save Package
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default PackageForm;
