import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
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
import { ShipmentFormInput } from "@shared/schema";
import { printMultipleShippingLabels, printShippingLabel } from "@/utils/printLabel";

interface LabelSummaryProps {
  purchasedLabel: any;
  formData: ShipmentFormInput;
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


  // Split semicolon-delimited URLs into array
  const labelUrls = (purchasedLabel.labelUrl || "")
    .split(";")
    .map((url: string) => url.trim())
    .filter(Boolean);

  // Preload label images
  useEffect(() => {
    labelUrls.forEach((url: string) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    });
  }, [labelUrls]);

  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);
  const [direction, setDirection] = useState(0); // +1 for next, -1 for previous
  const currentLabelUrl =
    labelUrls.length > 0 ? labelUrls[currentLabelIndex] : labelPreviewUrl;

  // Navigation helpers
  const handleNextLabel = () => {
    setDirection(1);
    setCurrentLabelIndex((prev) => (prev + 1) % labelUrls.length);
  };

  const handlePrevLabel = () => {
    setDirection(-1);
    setCurrentLabelIndex((prev) =>
      prev === 0 ? labelUrls.length - 1 : prev - 1
    );
  };


  const handlePrintLabel = async () => {
    setIsPrinting(true);
    try {
      const urlToPrint = currentLabelUrl || labelPreviewUrl;
      await printShippingLabel(
        urlToPrint,
        purchasedLabel.trackingNumber || "Shipping-Label",
        widthIn,
        heightIn,
        purchasedLabel.fileType
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintAllLabels = async () => {
    setIsPrinting(true);
    console.log("Printing all labels:", labelUrls);
    try {
      const urlToPrint = currentLabelUrl || labelPreviewUrl;
      await printMultipleShippingLabels(
        labelUrls,                         // array of label URLs
        purchasedLabel.trackingNumber
          ? purchasedLabel.trackingNumber.split(",").map((t: string) => t.trim())
          : [],
        widthIn,
        heightIn,
        purchasedLabel.fileType
      );
    } finally {
      setIsPrinting(false);
    }
  };

  const handleEmailLabel = () => alert("TODO: Email label");
  const handleViewReceipt = async () => {
    setIsPrinting(true);
    try {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Unable to access iframe document.");

      // Example dynamic data
      const billedTo = formData?.fromAddress?.name || "Customer";
      const company = formData?.fromAddress?.company
        ? `(${formData.fromAddress.company})`
        : "";
      const subtotal = purchasedLabel.price || "$0.00";
      const total = subtotal;
      const date = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const transactionId = purchasedLabel.transactionId || "PP-" + Math.floor(Math.random() * 999999);

      // Build HTML for the receipt
      doc.open();
      doc.write(`
      <html>
        <head>
          <title>Shipping Receipt</title>
          <style>
            @page { size: auto; margin: 0.5in; }
            body {
              font-family: Arial, sans-serif;
              color: #111;
              margin: 0;
              padding: 1in;
              line-height: 1.5;
            }
            header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 1.5em;
            }
            header img {
              height: 60px;
            }
            h1 {
              font-size: 1.4rem;
              text-align: center;
              margin-bottom: 1em;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 1em;
              font-size: 0.95rem;
            }
            th, td {
              border: 1px solid #888;
              padding: 6px 10px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
            .totals {
              margin-top: 1em;
              font-size: 1rem;
            }
            footer {
              margin-top: 2em;
              font-size: 0.9rem;
              color: #333;
            }
          </style>
        </head>
        <body>
          <header>
            <img src="https://pandapostage.com/assets/logo.png" alt="PandaPostage Logo" />
          </header>
          <h1>Receipt</h1>

          <p><strong>Billed To:</strong> ${billedTo} ${company}</p>
          <p><strong>Date of Purchase:</strong> ${date}</p>

          <table>
            <thead>
              <tr><th>Description</th><th>Quantity</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr><td>Shipping Label</td><td>1</td><td>${subtotal}</td></tr>
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> ${subtotal}</p>
            <p><strong>Tax:</strong> Included</p>
            <p><strong>Total:</strong> ${total}</p>
            <p><strong>Payment Method:</strong> Credit Card</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
          </div>

          <footer>
            <p><strong>Business Info:</strong><br>
            Panda Postage<br>
            Email: support@pandapostage.com<br>
            Phone: (800) 803-7704<br>
            Website: www.pandapostage.com</p>
          </footer>
        </body>
      </html>
    `);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => iframe.remove(), 2000);
    } catch (error) {
      console.error("Error generating receipt:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  const { fromAddress, toAddress, packages } = formData || {};

  console.log("Purchased Label:", purchasedLabel);

  const listRate = parseFloat(purchasedLabel.listRate?.replace(/[^0-9.]/g, "") || 0);
  const retailRate = parseFloat(purchasedLabel.retailRate?.replace(/[^0-9.]/g, "") || 0);
  const price = parseFloat(purchasedLabel.price?.replace(/[^0-9.]/g, "") || 0);

  const savings =
    retailRate > price ? (retailRate - price).toFixed(2) : null;

  console.log(listRate, retailRate, price, savings);


  // For label animation
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,   // shorter slide distance for subtle motion
      opacity: 0,              // start fully transparent
      scale: 0.98,             // tiny scale adds depth
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      scale: 0.98,
    }),
  };


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

          <Button
            onClick={handlePrintAllLabels}
            disabled={!labelUrls.length || isPrinting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground 
              text-sm sm:text-md font-semibold uppercase tracking-wide rounded-md sm:rounded-lg py-2.5 sm:py-4 
              shadow-md cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="">Print</span>
          </Button>
          {/*}
          <div
            onClick={handlePrintLabel}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground 
              text-sm sm:text-md font-semibold uppercase tracking-wide rounded-md sm:rounded-lg py-2.5 sm:py-4 
              shadow-md cursor-pointer transition-all duration-200 hover:bg-primary/90 active:scale-[0.98]"
          >
            <Printer className="h-4 w-4 sm:h-6 sm:w-6" />
            <span className="">Print One</span>
          </div>
          */}
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
        className={`grid ${showLabelPreview ? "md:grid-cols-[1.2fr_0.8fr]" : "grid-cols-1"
          } gap-3 sm:gap-6`}
      >
        {/* Left Column */}
        <div className="flex flex-col h-full">
          <div className="rounded-lg sm:rounded-xl bg-white border border-gray-200 shadow-sm p-2 sm:p-5 space-y-3 sm:space-y-5">
            {/* Rate Summary */}
            <div className="bg-gray-50 rounded-md p-3 sm:p-4">
              {/* Header row: carrier/service + price/savings */}
              <div className="flex items-center justify-between flex-wrap gap-y-1">
                <p className="text-sm sm:text-base font-semibold flex items-center gap-2 text-slate-700">
                  <Truck className="h-4 w-4 text-primary" />
                  {purchasedLabel.carrier} – {purchasedLabel.service}
                </p>

                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-xl font-bold text-black-700">
                      {purchasedLabel.price}
                    </span>
                    {purchasedLabel.retailRate && (
                      <span className="text-sm sm:text-base text-red-400 line-through">
                        {purchasedLabel.retailRate}
                      </span>
                    )}
                  </div>

                  {savings && (
                    <p className="text-[11px] sm:text-xs text-green-600 leading-tight">
                      You saved ${savings}
                    </p>
                  )}
                </div>
              </div>

              {/* Tracking numbers */}
              <div className="pt-2">
                <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Tracking Number{purchasedLabel.trackingNumber?.includes(",") ? "s" : ""}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {(purchasedLabel.trackingNumber?.split(",") || ["N/A"]).map((tn: any) => {
                    const trimmed = tn.trim();
                    const trackingUrl = trimmed
                      ? `https://track.easypost.com/${trimmed}`
                      : "#";

                    return (
                      <a
                        key={trimmed}
                        href={trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs sm:text-sm font-semibold text-blue-700 hover:underline inline-flex items-center gap-1 select-text"
                      >
                        {trimmed}
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-blue-500" />
                      </a>
                    );
                  })}
                </div>
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

        {showLabelPreview && (
          <div className="relative rounded-md sm:rounded-xl bg-transparent group overflow-hidden">
            {/* Animated label image */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.img
                key={currentLabelUrl}
                src={currentLabelUrl}
                alt={`Shipping Label ${currentLabelIndex + 1}`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",        // smooth blend both directions
                  opacity: { duration: 0.3 },
                }}
                className="w-full h-auto rounded-md shadow-[0_5px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_7px_18px_rgba(0,0,0,0.18)] transition-shadow duration-300 cursor-pointer select-none"
                onClick={handlePrintLabel}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 50) handlePrevLabel();
                  if (info.offset.x < -50) handleNextLabel();
                }}
              />
            </AnimatePresence>

            {/* Navigation Arrows (visible if multiple labels) */}
            {labelUrls.length > 1 && (
              <>
                <button
                  onClick={handlePrevLabel}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition"
                >
                  ‹
                </button>
                <button
                  onClick={handleNextLabel}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition"
                >
                  ›
                </button>

                {/* Pagination indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {labelUrls.map((_: any, i: any) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i === currentLabelIndex ? "bg-blue-500" : "bg-gray-300"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}


      </div>
    </div>
  );
};
