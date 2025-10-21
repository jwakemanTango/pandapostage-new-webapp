import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Mail,
  Receipt,
  Settings,
  ExternalLink,
  Loader2,
  Truck,
  DollarSign,
  Clock,
  Barcode,
  MapPin,
  Package,
  CheckCircle2,
} from "lucide-react";
import labelPreviewUrl from "@assets/label_1760604447339.png";
import { ShipmentFormData } from "@shared/schema";
import { printShippingLabel } from "@/utils/printLabel";

interface LabelSummaryProps {
  purchasedLabel: any;
  formData: ShipmentFormData;
  onCreateAnother: () => void;
  showLabelPreview?: boolean;
  hidePrintButton?: boolean;
}

interface LabelFormValues {
  labelDimensions: { width: number; height: number };
}

export const LabelSummary = ({
  purchasedLabel,
  formData,
  onCreateAnother,
  showLabelPreview = true,
  hidePrintButton = false,
}: LabelSummaryProps) => {
  const [widthIn, setWidthIn] = useState(4);
  const [heightIn, setHeightIn] = useState(6);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const form = useForm<LabelFormValues>({
    defaultValues: { labelDimensions: { width: 4, height: 6 } },
  });

  const handlePrintLabel = async () => {
    setIsPrinting(true);
    try {
      await printShippingLabel(
        purchasedLabel.labelUrl || labelPreviewUrl,
        purchasedLabel.trackingNumber || "Shipping-Label",
        widthIn,
        heightIn,
        purchasedLabel.fileType
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handleEmailLabel = () => alert("TODO: NOT IMPLEMENTED");
  const handleViewReceipt = () => alert("TODO: NOT IMPLEMENTED");
  const handleLabelClick = () => {
    window.open(purchasedLabel.labelUrl || labelPreviewUrl, "_blank");
  };

  const { fromAddress, toAddress, packages, additionalServices } = formData || {};

  const selectedServices =
    additionalServices &&
    Object.entries(additionalServices)
      .filter(([_, value]) => value === true)
      .map(([key]) => {
        const serviceLabels: Record<string, string> = {
          saturdayDelivery: "Saturday Delivery",
          requireSignature: "Signature Required",
          expressMailWaiver: "Express Waiver",
          insuranceValue: "Insurance",
          returnLabel: "Return Label",
          weekendService: "Weekend Service",
          additionalHandling: "Additional Handling",
          certifiedMail: "Certified Mail",
        };
        return serviceLabels[key] || key;
      });

  return (
    <div className="space-y-6 relative px-6 md:px-10 xl:px-16 py-6">
      {isPrinting && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
            <span className="text-sm font-medium text-gray-800">
              Preparing label for print...
            </span>
          </div>
        </div>
      )}

      <div
        className={`grid ${
          showLabelPreview
            ? "grid-cols-1 md:grid-cols-[1.2fr_0.8fr] max-[900px]:grid-cols-1"
            : "grid-cols-1"
        } gap-8 max-w-5xl mx-auto w-full`}
      >
        {/* Left Column */}
        <div className="flex flex-col h-full">
          <div className="rounded-xl bg-white/80 border border-gray-200 shadow-sm md:p-6 p-3 space-y-5 flex-grow">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm md:text-base flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  {purchasedLabel.carrier} - {purchasedLabel.service}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Barcode className="h-3 w-3 text-gray-500" /> Tracking Number
                </p>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 truncate"
                >
                  {purchasedLabel.trackingNumber || "N/A"}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <p className="font-semibold text-base md:text-lg flex items-center gap-1 text-green-700">
                <DollarSign className="h-4 w-4" />
                {purchasedLabel.rate}
              </p>
            </div>

            {purchasedLabel.deliveryDays && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Est. {purchasedLabel.deliveryDays} business
                days
              </p>
            )}

            {/* From / To condensed */}
            <div className="border-t pt-4">
              <p className="font-semibold flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-600" /> From → To
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                {/* From */}
                <div className="flex flex-col border border-gray-100 rounded-md p-3 bg-gray-50/60">
                  {fromAddress ? (
                    <>
                      <p className="font-medium text-foreground">{fromAddress.name}</p>
                      {fromAddress.company && <p>{fromAddress.company}</p>}
                      <p>
                        {fromAddress.city}, {fromAddress.state} {fromAddress.zipCode}
                      </p>
                    </>
                  ) : (
                    <p className="italic">Not available</p>
                  )}
                </div>
                {/* To */}
                <div className="flex flex-col border border-gray-100 rounded-md p-3 bg-gray-50/60 relative">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden sm:flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  {toAddress ? (
                    <>
                      <p className="font-medium text-foreground">{toAddress.name}</p>
                      {toAddress.company && <p>{toAddress.company}</p>}
                      <p>
                        {toAddress.city}, {toAddress.state} {toAddress.zipCode}
                      </p>
                    </>
                  ) : (
                    <p className="italic">Not available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Package Details */}
            {packages?.length > 0 && (
              <div className="border-t pt-4 text-sm">
                <p className="font-semibold flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-gray-600" /> Package Details
                </p>
                {packages.map((pkg, i) => (
                  <div key={i} className="pl-6 text-muted-foreground leading-tight">
                    <p className="font-medium text-foreground">
                      Package {i + 1}: {pkg.packageType}
                    </p>
                    <p>
                      Weight: {pkg.weightLbs} lbs {pkg.weightOz || 0} oz
                    </p>
                    {pkg.length && pkg.width && pkg.height && (
                      <p>
                        Dimensions: {pkg.length}" × {pkg.width}" × {pkg.height}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Additional Services */}
            {selectedServices && selectedServices.length > 0 && (
              <div className="border-t pt-4 text-sm">
                <p className="font-semibold flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-600" /> Additional Services
                </p>
                <ul className="pl-6 list-disc text-muted-foreground">
                  {selectedServices.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Buttons */}
            {!hidePrintButton ? (
              // Desktop / Normal layout
              <div className="border-t pt-5 space-y-3">
                <div className="flex gap-2 items-center">
                  <Button
                    className="flex-1 gap-2"
                    onClick={handlePrintLabel}
                    disabled={isPrinting}
                  >
                    {isPrinting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Printing...
                      </>
                    ) : ""}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-none sm:w-10 sm:h-10"
                    onClick={() => setShowPrintSettings((v) => !v)}
                    aria-expanded={showPrintSettings ? "true" : "false"}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleEmailLabel}
                  >
                    <Mail className="h-4 w-4" /> Email Label
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleViewReceipt}
                  >
                    <Receipt className="h-4 w-4" /> View Receipt
                  </Button>
                </div>
              </div>
            ) : (
              // Mobile layout when sticky footer is active
              <div className="border-t pt-5 space-y-2">
                <Button
                  onClick={() => setShowPrintSettings((v) => !v)}
                  className="w-full flex justify-center items-center gap-2 h-11 bg-muted hover:bg-muted/80 text-foreground font-medium"
                >
                  <Settings className="h-4 w-4" />
                  Print Settings
                </Button>

                {showPrintSettings && (
                  <div className="mt-3 border-t pt-3 grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="labelDimensions.width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Width (in)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              value={widthIn}
                              onChange={(e) => setWidthIn(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="labelDimensions.height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (in)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              value={heightIn}
                              onChange={(e) => setHeightIn(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full flex justify-center items-center gap-2 h-11"
                  onClick={handleEmailLabel}
                >
                  <Mail className="h-4 w-4" /> Email Label
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex justify-center items-center gap-2 h-11"
                  onClick={handleViewReceipt}
                >
                  <Receipt className="h-4 w-4" /> View Receipt
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Label Preview */}
        {showLabelPreview && (
          <div className="rounded-xl border border-gray-200 p-3 bg-card shadow-md hover:shadow-lg transition-all duration-300">
            <div
              className="border rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.985]"
              onClick={handleLabelClick}
              role="button"
            >
              <img
                src={purchasedLabel.labelUrl || labelPreviewUrl}
                alt="Shipping Label Preview"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
