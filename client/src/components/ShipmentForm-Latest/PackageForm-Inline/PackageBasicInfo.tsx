import { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Trash2, Scale, Loader2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { useScale } from "@/lib/usbScale";
import { CARRIERS, PACKAGE_TYPES } from "@/lib/constants";

interface PackageBasicInfoProps {
  control: any;
  watch: any;
  setValue: any;
}

export const PackageBasicInfo = ({ control, watch, setValue }: PackageBasicInfoProps) => {
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
    append({ weightLbs: 0, weightOz: 0, length: "", width: "", height: "" });

  const liveOunces = weight?.ounces ?? 0;
  const liveLbs = Math.floor(liveOunces / 16);
  const liveOz = (liveOunces % 16).toFixed(1);

  const integerOnly = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D+/g, "");
  };

  return (
    <div className="space-y-4">
      {/* Carrier + Package Type */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="preferredCarrier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Carrier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="packageType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Package Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <TableHead>Weight (lb)</TableHead>
                <TableHead>Weight (oz)</TableHead>
                <TableHead className="w-[110px] text-center font-medium">
                  {isConnected ? (
                    <div className="flex items-center justify-center text-green-700">
                      <Scale className="h-4 w-4 mr-1 text-green-600" />
                      {`${liveLbs} lb ${liveOz} oz`}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-gray-400">
                      <Scale className="h-4 w-4 mr-1 text-gray-400" />
                      Scale
                    </div>
                  )}
                </TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Width</TableHead>
                <TableHead>Height</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {fields.map((field, i) => (
                <TableRow key={field.id}>
                  <TableCell className="text-center">{i + 1}</TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`packages.${i}.weightLbs`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            onChange={(e) => {
                              integerOnly(e);
                              field.onChange(Number(e.target.value || 0));
                            }}
                          />
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={control}
                      name={`packages.${i}.weightOz`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="0"
                            onChange={(e) => {
                              integerOnly(e);
                              field.onChange(Number(e.target.value || 0));
                            }}
                          />
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={() => handleReadWeight(i)}
                            disabled={isReading || isConnecting || !supported}
                            className={`h-10 w-10 flex items-center justify-center rounded-md border transition-all ${
                              isConnected
                                ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                : "bg-muted text-gray-500 border-gray-300"
                            }`}
                          >
                            {isReading ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Scale className="h-5 w-5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {!supported
                              ? "Scale not supported in this browser"
                              : isConnected
                              ? "Read from Scale"
                              : "Connect Scale"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>

                  {["length", "width", "height"].map((dim) => (
                    <TableCell key={dim}>
                      <FormField
                        control={control}
                        name={`packages.${i}.${dim}`}
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} type="number" placeholder="0" />
                          </FormControl>
                        )}
                      />
                    </TableCell>
                  ))}

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

      {/* Add Package Row */}
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
