import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Receipt,
  ExternalLink,
  Loader2,
  Truck,
  MapPin,
  Package,
  Printer,
  Settings,
} from "lucide-react";
import labelPreviewUrl from "@assets/label_1760604447339.png";
import { ShipmentFormData } from "@shared/schema";
import { printShippingLabel } from "@/utils/printLabel";

interface LabelSummaryProps {
  purchasedLabel: any;
  formData: ShipmentFormData;
  showLabelPreview?: boolean;
}

export const LabelSummary = ({
  purchasedLabel,
  formData,
  showLabelPreview = true,
}: LabelSummaryProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [widthIn, setWidthIn] = useState(4);
  const [heightIn, setHeightIn] = useState(6);

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

  const handleEmailLabel = () => alert("TODO: Email label");
  const handleViewReceipt = () => alert("TODO: View receipt");

  const { fromAddress, toAddress, packages } = formData || {};

  const retailRate = parseFloat(purchasedLabel.retailRate || 0);
  const discountedRate = parseFloat(purchasedLabel.rate?.replace(/[^0-9.]/g, "") || 0);
  const savings =
    retailRate > discountedRate ? (retailRate - discountedRate).toFixed(2) : null;

  return (
    <div className="max-w-5xl mx-auto w-full px-1.5 sm:px-4 py-2 sm:py-6 space-y-4 sm:space-y-6">
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

      {/* Print Controls */}
      <div className="mb-3 sm:mb-5">
        <div className="flex items-center gap-2">
          <div
            onClick={handlePrintLabel}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground 
              text-sm sm:text-lg font-semibold uppercase tracking-wide rounded-md sm:rounded-lg py-2.5 sm:py-4 
              shadow-md cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="hidden xs:inline">Click to Print Label</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPrintSettings((v) => !v)}
            className="border border-gray-300 bg-white hover:bg-gray-50 h-[42px] w-[42px] sm:h-[52px] sm:w-[52px] flex-shrink-0"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
          </Button>
        </div>

        {showPrintSettings && (
          <div className="mt-2 sm:mt-3 border-t pt-3 rounded-lg bg-gray-50/70 p-3 sm:p-4 sm:max-w-md w-full">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-600" /> Print Settings
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Width (in)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={widthIn}
                  onChange={(e) => setWidthIn(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Height (in)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary + Label */}
      <div
        className={`grid ${
          showLabelPreview ? "md:grid-cols-[1.2fr_0.8fr]" : "grid-cols-1"
        } gap-3 sm:gap-6`}
      >
        {/* Left Column */}
        <div className="flex flex-col h-full">
          <div className="rounded-lg sm:rounded-xl bg-white border border-gray-200 shadow-sm p-2 sm:p-5 space-y-3 sm:space-y-5">
            {/* Rate Summary */}
            <div className="bg-gray-50 rounded-md p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-700">
                  <Truck className="h-4 w-4 text-primary" />
                  {purchasedLabel.carrier} – {purchasedLabel.service}
                </p>
                <p className="text-base sm:text-xl font-bold text-green-700">
                  {purchasedLabel.rate}
                </p>
              </div>

              {savings && (
                <p className="text-[11px] sm:text-xs text-gray-600 mt-1">
                  You saved ${savings} off retail (${retailRate})
                </p>
              )}

              <div className="pt-1">
                <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Number
                </p>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm sm:text-base font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 select-text"
                >
                  {purchasedLabel.trackingNumber || "N/A"}
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-blue-500" />
                </a>
              </div>
            </div>

            {/* From → To */}
            <div className="bg-gray-50 rounded-md p-3 sm:p-4">
              <p className="font-semibold text-sm flex items-center gap-2 text-gray-700 mb-2 sm:mb-3">
                <MapPin className="h-4 w-4 text-primary" /> From → To
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm text-muted-foreground">
                {[fromAddress, toAddress].map((addr, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border border-gray-100 rounded-md p-2 sm:p-3 bg-white"
                  >
                    {addr ? (
                      <>
                        <p className="font-medium text-foreground">{addr.name}</p>
                        {addr.company && <p>{addr.company}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.zipCode}
                        </p>
                      </>
                    ) : (
                      <p className="italic">Not available</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Package Details */}
            <div className="bg-gray-50 rounded-md p-3 sm:p-4">
              <p className="font-semibold text-sm flex items-center gap-2 text-gray-700 mb-2 sm:mb-3">
                <Package className="h-4 w-4 text-primary" /> Package Details
              </p>
              {packages?.map((pkg, i) => (
                <div key={i} className="leading-tight text-sm text-gray-700">
                  <p className="font-medium mb-0.5 sm:mb-1">
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

            {/* Actions */}
            <div className="border-t pt-3 sm:pt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2 w-full h-10 sm:h-11 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={handleEmailLabel}
              >
                <Mail className="h-4 w-4" /> Email Label
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 w-full h-10 sm:h-11 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                onClick={handleViewReceipt}
              >
                <Receipt className="h-4 w-4" /> View Receipt
              </Button>
            </div>
          </div>
        </div>

        {/* Label Preview */}
        {showLabelPreview && (
          <div
            className="rounded-md sm:rounded-xl bg-transparent cursor-pointer transition-all duration-300"
            onClick={handlePrintLabel}
            role="button"
          >
            <img
              src={purchasedLabel.labelUrl || labelPreviewUrl}
              alt="Shipping Label Preview"
              className="w-full h-auto rounded-md shadow-[0_5px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_7px_18px_rgba(0,0,0,0.18)] transition-shadow duration-300"
            />
          </div>
        )}
      </div>
    </div>
  );
};
