# Example Components

This folder contains example components demonstrating various features of PandaPostage.

## LabelSummary

**Route**: `/examples/label-summary`

A standalone example showing the `LabelSummary` component with real API response data from EasyPost.

### Data Source

The example uses actual response data from:
- **Rate Selection**: Data returned from `GET /api/rates` endpoint
- **Label Purchase**: Data returned from `POST /api/buy` endpoint

### Features Demonstrated

- Purchased label display with carrier, service, and pricing information
- Tracking number from API response
- Label preview using actual label URL from S3
- Delivery time estimation (4 business days)
- Formatted delivery date
- Label download functionality (opens print dialog)
- Action buttons (Download, Email, View Receipt)
- Create Another Shipment button

### Viewing the Example

Navigate to `/examples/label-summary` in your browser to see the component in action.

### Example Variations

The component demonstrates two variations:
1. **With Label Preview** (default): Shows the shipping label image alongside the details
2. **Without Label Preview**: Shows only the label details and action buttons

### API Response Format

The example includes the raw JSON responses for reference, showing:
- How the frontend transforms API data into the `Rate` schema format
- The difference between rate selection data and purchase response data
- How `estimatedDays` maps to `deliveryDays`
- How numeric `total` is formatted to string `rate` with dollar sign
- How ISO date strings are formatted for display

### Example Data

**Rate Selected (from GET /api/rates)**:
```json
{
  "provider": "EasyPost",
  "carrier": "USPS",
  "service": "GroundAdvantage",
  "total": 8.54,
  "currency": "USD",
  "estimatedDays": 4,
  "estimatedDelivery": "2025-10-25T11:54:36.3411999Z",
  "rateId": "rate_fa79a04204ca48edaa052ac2eb841573",
  "shipmentId": "shp_f1de7249dae8463fb3370476254e32ff",
  "retailRate": 11.55,
  "listRate": 9.77,
  "accountRate": 8.54
}
```

**Purchase Response (from POST /api/buy)**:
```json
{
  "provider": "EasyPost",
  "shipmentId": "shp_f1de7249dae8463fb3370476254e32ff",
  "trackingNumber": "9434600208303110649175",
  "carrier": "USPS",
  "service": "GroundAdvantage",
  "labelUrl": "https://easypost-files.s3.us-west-2.amazonaws.com/files/postage_label/20251021/e8c9b24497fad0466d8445f0b5334d8612.png",
  "currency": "USD",
  "total": 8.54,
  "estimatedDelivery": null,
  "carrierAccountId": "ca_24f2cb44189240e7a259155dcd33dd79",
  "billingType": "easypost"
}
```

### Notes

- The label URL points to an actual EasyPost S3 bucket (may expire over time)
- Tracking number is a real USPS tracking format
- All pricing reflects actual USPS GroundAdvantage rates
- The `estimatedDelivery` in the buy response is `null`, demonstrating conditional rendering
- Notice how the delivery date is only shown when available in the rate data
