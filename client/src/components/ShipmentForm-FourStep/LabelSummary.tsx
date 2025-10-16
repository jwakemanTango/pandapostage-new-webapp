import { Button } from "@/components/ui/button";
import { Download, Mail, Receipt, ArrowLeft } from "lucide-react";
import { Rate } from "@shared/schema";
import labelPreviewUrl from "@assets/label_1760604447339.png";

interface LabelSummaryProps {
  purchasedLabel: Rate;
  onCreateAnother: () => void;
  showLabelPreview?: boolean;
}

export const LabelSummary = ({ purchasedLabel, onCreateAnother, showLabelPreview = true }: LabelSummaryProps) => {
  return (
    <div className={`grid ${showLabelPreview ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
      <div className="flex flex-col h-full">
        <div className="bg-chart-2/10 border border-chart-2/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-chart-2" />
            <p className="text-sm font-medium text-chart-2">Label successfully purchased!</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Your shipping label has been created and is ready to download.
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="border rounded-lg p-5 space-y-5">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Carrier & Service</p>
              <p className="font-semibold">{purchasedLabel.carrier} - {purchasedLabel.service}</p>
            </div>
            
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Rate</p>
                <p className="font-semibold text-lg">${purchasedLabel.rate}</p>
              </div>
              {purchasedLabel.deliveryDays && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Delivery Time</p>
                  <p className="font-semibold">{purchasedLabel.deliveryDays} business days</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Tracking Number</p>
              <p className="font-mono font-semibold">1Z999AA10123456784</p>
            </div>

            {purchasedLabel.deliveryDate && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Estimated Delivery</p>
                <p className="font-medium">{purchasedLabel.deliveryDate}</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
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
            className="w-full gap-3 font-semibold text-white"
            style={{ backgroundColor: '#005392' }}
            data-testid="button-create-another"
          >
            <ArrowLeft className="h-6 w-6" style={{ color: 'rgb(255, 113, 97)' }} />
            Create Another Shipment
          </Button>
        </div>
      </div>

      {showLabelPreview && (
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
      )}
    </div>
  );
};
