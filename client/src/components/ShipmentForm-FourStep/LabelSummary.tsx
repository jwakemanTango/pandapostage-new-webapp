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
import { Download, Mail, Receipt, ArrowLeft } from "lucide-react";
import { Rate } from "@shared/schema";
import labelPreviewUrl from "@assets/label_1760604447339.png";

interface LabelSummaryProps {
  purchasedLabel: any;
  onCreateAnother: () => void;
  showLabelPreview?: boolean;
}

interface LabelFormValues {
  labelDimensions: {
    width: number;
    height: number;
  };
}

export const LabelSummary = ({
  purchasedLabel,
  onCreateAnother,
  showLabelPreview = true,
}: LabelSummaryProps) => {
  // Base defaults
  const [widthIn, setWidthIn] = useState(4);
  const [heightIn, setHeightIn] = useState(6);

  // Form setup
  const form = useForm<LabelFormValues>({
    defaultValues: {
      labelDimensions: {
        width: 4,
        height: 6,
      },
    },
  });

  const handleDownloadLabel = () => {
    const labelUrl = purchasedLabel.labelUrl || labelPreviewUrl;
    const trackingNumber = purchasedLabel.trackingNumber || "Shipping-Label";

    // Create hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.title = trackingNumber;

    // Write print-safe content with top-right anchored label
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${trackingNumber}</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              position: relative;
            }
            .label {
              position: absolute;
              top: 0;
              left: 0;
              width: ${widthIn}in;
              height: ${heightIn}in;
            }
            .label img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              display: block;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <img src="${labelUrl}" alt="${trackingNumber}" />
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Wait for the label image to load before printing
    const img = doc.querySelector("img") as HTMLImageElement;
    img.onload = () => {
      const win = iframe.contentWindow;
      if (win) {
        win.focus();
        win.print();
      }
      // Clean up after print
      setTimeout(() => iframe.remove(), 1000);
    };
  };


  const handleEmailLabel = () => alert("TODO: NOT IMPLEMENTED");
  const handleViewReceipt = () => alert("TODO: NOT IMPLEMENTED");

  return (
    <div
      className={`grid ${
        showLabelPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      } gap-4`}
    >
      <div className="flex flex-col h-full">
        <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-chart-2" />
            <p className="text-sm font-medium text-chart-2">
              Label successfully purchased!
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your shipping label has been created and is ready to download.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="border rounded-lg p-5 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Carrier & Service
              </p>
              <p className="font-semibold">
                {purchasedLabel.carrier} - {purchasedLabel.service}
              </p>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Rate</p>
                <p className="font-semibold text-lg">{purchasedLabel.rate}</p>
              </div>
              {purchasedLabel.deliveryDays && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Delivery Time
                  </p>
                  <p className="font-semibold">
                    {purchasedLabel.deliveryDays} business days
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Tracking Number
              </p>
              <p className="font-mono font-semibold">
                {purchasedLabel.trackingNumber || "N/A"}
              </p>
            </div>

            {purchasedLabel.deliveryDate && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Estimated Delivery
                </p>
                <p className="font-medium">{purchasedLabel.deliveryDate}</p>
              </div>
            )}

            {/* --- Label dimension controls (with form) --- */}
            <Form {...form}>
              <div className="pt-4 border-t mt-4">
                <FormLabel className="text-sm font-medium mb-2 block">
                  Label Print Dimensions
                </FormLabel>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="labelDimensions.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium">
                          Width (in)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="1"
                            placeholder="4.0"
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setWidthIn(isNaN(value) ? 4 : value);
                              field.onChange(value);
                            }}
                            data-testid="input-label-width"
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
                        <FormLabel className="text-xs font-medium">
                          Height (in)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            min="1"
                            placeholder="6.0"
                            {...field}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              setHeightIn(isNaN(value) ? 6 : value);
                              field.onChange(value);
                            }}
                            data-testid="input-label-height"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Form>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full gap-2"
              onClick={handleDownloadLabel}
              data-testid="button-download-label"
            >
              <Download className="h-4 w-4" />
              Download Label
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleEmailLabel}
              data-testid="button-email-label"
            >
              <Mail className="h-4 w-4" />
              Email Label
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleViewReceipt}
              data-testid="button-view-receipt"
            >
              <Receipt className="h-4 w-4" />
              View Receipt
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <Button
            onClick={onCreateAnother}
            size="lg"
            className="w-full gap-3 font-semibold text-white"
            style={{ backgroundColor: "#005392" }}
            data-testid="button-create-another"
          >
            <ArrowLeft
              className="h-6 w-6"
              style={{ color: "rgb(255, 113, 97)" }}
            />
            Create Another Shipment
          </Button>
        </div>
      </div>

      {showLabelPreview && (
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-3">Label Preview</p>
          <div className="border rounded-md overflow-hidden bg-white">
            <img
              src={purchasedLabel.labelUrl || labelPreviewUrl}
              alt="Shipping Label Preview"
              className="w-full h-auto"
              data-testid="img-label-preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
