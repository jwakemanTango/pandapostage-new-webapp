import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Truck } from "lucide-react";
import { AddressFormSingle } from "./AddressFormSingle";

interface AddressesFormModalsProps {
  form: any;
}

export const AddressesFormModals = ({ form }: AddressesFormModalsProps) => {
  const [openModal, setOpenModal] = useState<"from" | "to" | null>(null);

  // Watch form state live
  const fromValues = form.watch("fromAddress") || {};
  const toValues = form.watch("toAddress") || {};
  const fromErrors = form.formState.errors?.fromAddress || {};
  const toErrors = form.formState.errors?.toAddress || {};

  const isFromFilled = Object.values(fromValues).some((v) => v && v !== "");
  const isToFilled = Object.values(toValues).some((v) => v && v !== "");

  const isFromValid = isFromFilled && Object.keys(fromErrors).length === 0;
  const isToValid = isToFilled && Object.keys(toErrors).length === 0;

  // Check for incomplete addresses
  const fromSummary = [fromValues.city, fromValues.state, fromValues.zipCode]
    .filter(Boolean)
    .join(", ");
  const toSummary = [toValues.city, toValues.state, toValues.zipCode]
    .filter(Boolean)
    .join(", ");

  const isFromIncomplete = isFromFilled && !fromSummary;
  const isToIncomplete = isToFilled && !toSummary;

  const baseButton =
    "w-full py-3 px-4 rounded-lg text-sm font-medium border shadow-sm transition-all";

  // Determines visual state (grey, blue, yellow, or red)
  const getButtonStyle = (
    filled: boolean,
    valid: boolean,
    incomplete: boolean
  ) => {
    if (!filled || incomplete)
      return "bg-muted text-muted-foreground border-border hover:bg-muted/90";
    if (valid && !incomplete)
      return "bg-primary text-primary-foreground border-primary hover:bg-primary/90";
    return "bg-red-500 text-white border-red-500 hover:bg-red-600";
  };

  const handleSave = () => {
    form.trigger(openModal === "from" ? "fromAddress" : "toAddress");
    setOpenModal(null);
  };

  const handleCancel = () => setOpenModal(null);

  const renderButton = (
    type: "from" | "to",
    values: any,
    filled: boolean,
    valid: boolean,
    incomplete: boolean,
    icon: React.ReactNode,
    label: string
  ) => (
    <Dialog
      open={openModal === type}
      onOpenChange={(open) => setOpenModal(open ? type : null)}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`${baseButton} ${getButtonStyle(
            filled,
            valid,
            incomplete
          )} flex flex-col items-start text-left`}
        >
          <div className="flex items-center gap-2 mb-1">
            {icon}
            <span className="font-semibold">{label}</span>
          </div>

          {filled ? (
            <div className="text-sm opacity-90 leading-tight truncate w-full">
              <div className="font-medium">{values.name || "—"}</div>
              <div className="truncate">
                {incomplete
                  ? "Incomplete address"
                  : [values.city, values.state, values.zipCode]
                      .filter(Boolean)
                      .join(", ")}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Not yet filled</div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon} {label}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <AddressFormSingle
            form={form}
            type={type === "from" ? "fromAddress" : "toAddress"}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
      {renderButton(
        "from",
        fromValues,
        isFromFilled,
        isFromValid,
        isFromIncomplete,
        <Truck className="h-5 w-5" />,
        "Ship From"
      )}
      {renderButton(
        "to",
        toValues,
        isToFilled,
        isToValid,
        isToIncomplete,
        <MapPin className="h-5 w-5" />,
        "Ship To"
      )}
    </div>
  );
};
