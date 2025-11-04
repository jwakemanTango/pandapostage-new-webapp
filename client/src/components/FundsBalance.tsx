import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useDebug } from "@/components/Debug/debugContext";

export const FundsBalance = () => {
  const { schema, mergeSchema } = useDebug();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // --- Parse safe numeric values ---
  const availableFunds = Number(schema?.user?.fields?.availableFunds) || 0;

  // Explicitly handle both string and object field shapes
  type FieldValue = string | { value: string } | undefined;
  const rawAlertFunds = schema?.user?.fields?.alertFunds as FieldValue;

  const alertFunds = Number(
    typeof rawAlertFunds === "object"
      ? rawAlertFunds?.value
      : rawAlertFunds ?? 25
  );

  // --- Determine state color palette ---
  let state = "normal";
  let bgColor = "bg-emerald-50";
  let borderColor = "border-emerald-300";
  let textColor = "text-emerald-700 hover:bg-emerald-100";

  if (availableFunds <= 0) {
    state = "critical";
    bgColor = "bg-red-50";
    borderColor = "border-red-300";
    textColor = "text-red-700 hover:bg-red-100";
  } else if (availableFunds <= alertFunds) {
    state = "warning";
    bgColor = "bg-amber-50";
    borderColor = "border-amber-300";
    textColor = "text-amber-700 hover:bg-amber-100";
  }

  // --- Add funds handler ---
  const handleAddFunds = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 25) {
      toast({
        title: "Invalid Amount",
        description: "Minimum add amount is $25.00.",
        variant: "destructive",
      });
      return;
    }

    if (!pin) {
      toast({
        title: "Missing PIN",
        description: "Please enter your postage PIN.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // fake request
    setLoading(false);

    const newBalance = availableFunds + amt;

    mergeSchema({
      user: {
        fields: {
          availableFunds: newBalance.toString(),
        },
      },
    });

    toast({
      title: "DEBUG: Funds Added",
      description: `Your balance has been updated to $${newBalance.toFixed(2)}.`,
    });

    setOpen(false);
    setAmount("");
    setPin("");
  };

  // --- Render ---
  return (
    <>
      {/* Clickable balance box */}
      <div
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-md border cursor-pointer text-sm font-medium transition-colors duration-150 ${bgColor} ${borderColor} ${textColor}`}
        title={
          state === "critical"
            ? "Balance critically low"
            : state === "warning"
            ? "Low balance warning"
            : "Sufficient balance"
        }
      >
        Balance: ${availableFunds.toFixed(2)}
      </div>

      {/* Add Funds Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds To Your Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Add funds to your account using your saved payment method
            </p>

            <div className="grid gap-2">
              <Label htmlFor="amount">
                Amount: <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    className="pl-5"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  ($25.00 min)
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pin">
                Postage PIN: <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="default" onClick={handleAddFunds} disabled={loading}>
              {loading ? "Adding..." : "Add Funds"}
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
