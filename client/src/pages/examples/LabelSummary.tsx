import { LabelSummary } from "@/components/LabelSummary";
import { Rate } from "@shared/schema";

/**
 * Example component showing the LabelSummary with real API response data
 * 
 * This demonstrates how the purchased label appears after a successful purchase.
 * The data combines information from:
 * 1. The selected rate (from GET /api/rates)
 * 2. The purchase response (from POST /api/buy)
 */

// Mock data based on actual API responses
const examplePurchasedLabel: Rate = {
  // From the rate selection
  id: "rate_fa79a04204ca48edaa052ac2eb841573",
  provider: "EasyPost",
  shipmentId: "shp_f1de7249dae8463fb3370476254e32ff",
  rateId: "rate_fa79a04204ca48edaa052ac2eb841573",
  carrier: "USPS",
  service: "GroundAdvantage",
  
  // Pricing information (formatted with $ sign)
  rate: "$8.54",
  retailRate: "$11.55",
  listRate: "$9.77",
  accountRate: "$8.54",
  currency: "USD",
  
  // Delivery information
  deliveryDays: 4,
  deliveryDate: "October 25, 2025", // Formatted from "2025-10-25T11:54:36.3411999Z"
  estimatedDelivery: "2025-10-25T11:54:36.3411999Z",
  
  // Label information (from purchase response)
  trackingNumber: "9434600208303110649175",
  labelUrl: "https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/20251021/e8c9b24497fad0466d8445f0b5334d8612.png",
  labelFormat: "png",
  
  // Account information
  carrierAccountId: "ca_24f2cb44189240e7a259155dcd33dd79",
  billingType: "easypost",
};

export default function LabelSummaryExample() {
  const handleCreateAnother = () => {
    console.log("Create another shipment clicked");
    alert("This would navigate back to create a new shipment");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-[1200px]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Label Summary Example</h1>
          <p className="text-muted-foreground">
            This demonstrates the LabelSummary component with real API response data from EasyPost
          </p>
        </div>

        <div className="space-y-8">
          {/* Example with Label Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">With Label Preview (Default)</h2>
            <LabelSummary
              purchasedLabel={examplePurchasedLabel}
              onCreateAnother={handleCreateAnother}
              showLabelPreview={true}
            />
          </div>

          {/* Example without Label Preview */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Without Label Preview</h2>
            <LabelSummary
              purchasedLabel={examplePurchasedLabel}
              onCreateAnother={handleCreateAnother}
              showLabelPreview={false}
            />
          </div>
        </div>

        {/* API Response Data for Reference */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">API Response Data (for reference)</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Selected Rate (GET /api/rates)</h4>
              <pre className="text-xs bg-card p-4 rounded-md overflow-auto">
{JSON.stringify({
  provider: "EasyPost",
  carrier: "USPS",
  service: "GroundAdvantage",
  total: 8.54,
  currency: "USD",
  estimatedDays: 4,
  estimatedDelivery: "2025-10-25T11:54:36.3411999Z",
  rateId: "rate_fa79a04204ca48edaa052ac2eb841573",
  shipmentId: "shp_f1de7249dae8463fb3370476254e32ff",
  carrierAccountId: "ca_24f2cb44189240e7a259155dcd33dd79",
  billingType: "easypost",
  reference: null,
  retailRate: 11.55,
  listRate: 9.77,
  accountRate: 8.54
}, null, 2)}
              </pre>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Purchase Response (POST /api/buy)</h4>
              <pre className="text-xs bg-card p-4 rounded-md overflow-auto">
{JSON.stringify({
  provider: "EasyPost",
  shipmentId: "shp_f1de7249dae8463fb3370476254e32ff",
  trackingNumber: "9434600208303110649175",
  carrier: "USPS",
  service: "GroundAdvantage",
  labelUrl: "https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/20251021/e8c9b24497fad0466d8445f0b5334d8612.png",
  currency: "USD",
  total: 8.54,
  estimatedDelivery: null,
  carrierAccountId: "ca_24f2cb44189240e7a259155dcd33dd79",
  billingType: "easypost"
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
