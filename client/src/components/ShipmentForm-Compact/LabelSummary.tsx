import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, Mail, Receipt } from "lucide-react";
import { Rate } from "@shared/schema";
import labelPreviewUrl from "@assets/label_1760604447339.png";

interface LabelSummaryProps {
  purchasedLabel: Rate;
  onCreateAnother: () => void;
}

export const LabelSummary = ({ purchasedLabel, onCreateAnother }: LabelSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-chart-2" />
          <CardTitle className="text-lg">Label Purchased</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-chart-2" />
            <p className="text-sm font-medium text-chart-2">Label successfully purchased!</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your shipping label has been created and is ready to download.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <div className="flex-1 space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Carrier & Service</p>
                  <p className="font-semibold">{purchasedLabel.carrier} - {purchasedLabel.service}</p>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Rate</p>
                    <p className="font-semibold text-lg">${purchasedLabel.rate}</p>
                  </div>
                  {purchasedLabel.deliveryDays && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Delivery Time</p>
                      <p className="font-semibold">{purchasedLabel.deliveryDays} business days</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                  <p className="font-mono font-semibold">1Z999AA10123456784</p>
                </div>

                {purchasedLabel.deliveryDate && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                    <p className="font-medium">{purchasedLabel.deliveryDate}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button className="w-full gap-2" data-testid="button-download-label">
                  <Download className="h-4 w-4" />
                  Download Label
                </Button>
                <Button variant="outline" className="w-full gap-2" data-testid="button-email-label">
                  <Mail className="h-4 w-4" />
                  Email Label
                </Button>
                <Button variant="outline" className="w-full gap-2" data-testid="button-view-receipt">
                  <Receipt className="h-4 w-4" />
                  View Receipt
                </Button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={onCreateAnother}
                size="lg"
                className="w-full gap-3 h-14 text-base font-semibold text-white"
                style={{ backgroundColor: '#005392' }}
                data-testid="button-create-another"
              >
                Create Another Shipment
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <p className="text-xs text-muted-foreground mb-3">Label Preview</p>
            <div className="border rounded-md overflow-hidden bg-white">
              <img 
                src={labelPreviewUrl} 
                alt="Shipping Label Preview" 
                className="w-full h-auto"
                data-testid="img-label-preview"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
