/**
 * API Client for external shipping API
 * Handles all communication with the external unified shipping API
 */

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

interface ApiAddress {
  name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  company?: string;
  phone?: string;
}

interface ApiPackage {
  weightOz: number;
  dimensionsIn: {
    length: number;
    width: number;
    height: number;
  };
  insuredValue?: number;
  reference?: string | null;
}

interface ApiRateOptions {
  saturdayDelivery?: boolean;
  deliveryConfirmation?: string;
  declaredValue?: boolean;
  residential?: boolean;
  requireSignature?: boolean;
  expressMailWaiver?: boolean;
  insuranceValue?: boolean;
  returnLabel?: boolean;
  weekendService?: boolean;
  additionalHandling?: boolean;
  certifiedMail?: boolean;
}

interface RateQuoteRequest {
  shipper: ApiAddress;
  recipient: ApiAddress;
  packages: ApiPackage[];
  provider?: string;
  carrier?: string;
  service?: string;
  pickupDate?: string;
  options?: ApiRateOptions;
}

interface ApiRate {
  provider: string;
  carrier: string;
  service: string;
  total: number;
  currency: string;
  estimatedDays?: number;
  estimatedDelivery?: string;
  rateId: string;
  shipmentId: string;
  carrierAccountId?: string;
  billingType?: string;
  retailRate?: number;
  listRate?: number;
  accountRate?: number;
}

interface RateResponse {
  rates: ApiRate[];
  messages?: Array<{
    provider: string;
    carrier: string;
    message: string;
    type: string;
  }>;
}

interface BuyShipmentRequest {
  provider: string;
  shipmentId: string;
  rateId: string;
  reference?: string;
}

interface BuyShipmentResponse {
  provider: string;
  shipmentId: string;
  trackingNumber: string;
  carrier: string;
  service: string;
  labelUrl: string;
  currency: string;
  total: number;
  estimatedDelivery?: string;
  carrierAccountId?: string;
  billingType?: string;
}

export class ShippingApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  /**
   * Get shipping rate quotes
   */
  async getRateQuotes(request: RateQuoteRequest): Promise<RateResponse> {
    const response = await fetch(`${this.baseUrl}/v1/Rates/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get rate quotes: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Purchase a shipment label
   */
  async buyShipment(request: BuyShipmentRequest): Promise<BuyShipmentResponse> {
    const response = await fetch(`${this.baseUrl}/v1/Shipments/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to buy shipment: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: string;
    service: string;
    version: string;
    timestamp: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/health`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export a singleton instance
export const shippingApiClient = new ShippingApiClient();

// Export types for use in routes
export type {
  ApiAddress,
  ApiPackage,
  ApiRateOptions,
  RateQuoteRequest,
  RateResponse,
  ApiRate,
  BuyShipmentRequest,
  BuyShipmentResponse,
};
