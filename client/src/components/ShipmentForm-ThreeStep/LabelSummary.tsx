import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Mail, Receipt } from "lucide-react";
import { Rate } from "@shared/schema";
import labelPreviewUrl from "@assets/label_1760604447339.png";

interface LabelSummaryProps {
  purchasedLabel: Rate;
  onCreateAnother: () => void;
  showLabelPreview?: boolean;
}

export const LabelSummary = ({ purchasedLabel, onCreateAnother, showLabelPreview = true }: LabelSummaryProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" />
          Label Purchased
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className={`grid ${showLabelPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-3`}>
          <div className="flex flex-col h-full">
            <div className="bg-chart-2/10 border border-chart-2/20 rounded-md p-2 mb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="h-1.5 w-1.5 rounded-full bg-chart-2" />
                <p className="text-xs font-medium text-chart-2">Label successfully purchased!</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Your shipping label is ready to download.
              </p>
            </div>

            <div className="flex-1 space-y-3">
              <div className="border rounded-md p-3 space-y-2.5">
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <p className="text-xs text-muted-foreground">Carrier:</p>
                  <p className="text-xs font-semibold">{purchasedLabel.carrier} - {purchasedLabel.service}</p>
                </div>
                
                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <p className="text-xs text-muted-foreground">Rate:</p>
                  <p className="text-xs font-semibold">${purchasedLabel.rate}</p>
                </div>

                {purchasedLabel.deliveryDays && (
                  <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                    <p className="text-xs text-muted-foreground">Delivery:</p>
                    <p className="text-xs font-semibold">{purchasedLabel.deliveryDays} business days</p>
                  </div>
                )}

                <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                  <p className="text-xs text-muted-foreground">Tracking:</p>
                  <p className="text-xs font-mono font-semibold">1Z999AA10123456784</p>
                </div>

                {purchasedLabel.deliveryDate && (
                  <div className="grid grid-cols-[90px_1fr] items-center gap-2">
                    <p className="text-xs text-muted-foreground">Est. Delivery:</p>
                    <p className="text-xs font-medium">{purchasedLabel.deliveryDate}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button size="sm" className="w-full gap-1.5" data-testid="button-download-label">
                  <Download className="h-3 w-3" />
                  Download Label
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-1.5" data-testid="button-email-label">
                  <Mail className="h-3 w-3" />
                  Email Label
                </Button>
                <Button size="sm" variant="outline" className="w-full gap-1.5" data-testid="button-view-receipt">
                  <Receipt className="h-3 w-3" />
                  View Receipt
                </Button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t">
              <Button 
                onClick={onCreateAnother}
                className="w-full gap-2 font-semibold text-white"
                style={{ backgroundColor: '#005392' }}
                data-testid="button-create-another"
              >
                Create Another Shipment
              </Button>
            </div>
          </div>

          {showLabelPreview && (
            <div className="border rounded-md p-2 bg-card">
              <p className="text-xs text-muted-foreground mb-2">Label Preview</p>
              <div className="border rounded-sm overflow-hidden bg-white">
                <img 
                  src={labelPreviewUrl} 
                  alt="Shipping Label Preview" 
                  className="w-full h-auto"
                  data-testid="img-label-preview"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
