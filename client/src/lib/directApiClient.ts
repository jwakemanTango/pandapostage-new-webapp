import { ApiConfig } from "@/components/ApiConfig";

/**
 * Transform frontend address format to API format
 * Matches the transformation in server/routes.ts
 */
const transformAddress = (address: any) => {
  return {
    name: address.name,
    company: address.company,
    phone: address.phone,
    street1: address.addressLine1,
    street2: address.addressLine2 || null,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode || address.zipCode,
    country: address.country || "US",
  };
};

/**
 * Transform frontend package format to API format
 * Matches the transformation in server/routes.ts
 */
const transformPackages = (packages: any[]) => {
  return packages.map((pkg: any) => {
    const weightLbs = parseInt(pkg.weightLbs || "0", 10);
    const weightOz = parseInt(pkg.weightOz || "0", 10);
    const totalOz = weightLbs * 16 + weightOz;

    return {
      weightOz: totalOz,
      dimensionsIn: {
        length: parseFloat(pkg.length),
        width: parseFloat(pkg.width),
        height: parseFloat(pkg.height),
      },
      reference: null,
    };
  });
};

/**
 * Transform additional services to API format
 * Matches the transformation in server/routes.ts
 */
const transformAdditionalServices = (additionalServices: any) => {
  if (!additionalServices) return {};
  
  return {
    saturdayDelivery: additionalServices.saturdayDelivery,
    requireSignature: additionalServices.requireSignature,
    expressMailWaiver: additionalServices.expressMailWaiver,
    insuranceValue: additionalServices.insuranceValue,
    returnLabel: additionalServices.returnLabel,
    weekendService: additionalServices.weekendService,
    additionalHandling: additionalServices.additionalHandling,
    certifiedMail: additionalServices.certifiedMail,
  };
};

/**
 * Get shipping rates from the external API
 * Matches the backend proxy implementation in server/routes.ts
 */
export const getShippingRates = async (config: ApiConfig, data: any) => {
  const url = `${config.baseUrl}${config.ratesEndpoint}`;
  
  const requestBody = {
    shipper: transformAddress(data.fromAddress),
    recipient: transformAddress(data.toAddress),
    packages: transformPackages(data.packages),
    options: transformAdditionalServices(data.additionalServices),
  };

  console.log("Direct API call to:", url, requestBody);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header if API key is configured
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();

  // Transform API response to frontend format
  // Matches the transformation in server/routes.ts
  const rates = (result.rates || []).map((rate: any, index: number) => ({
    id: rate.rateId || `rate-${index}`,
    provider: rate.provider,
    shipmentId: rate.shipmentId,
    rateId: rate.rateId,
    carrier: rate.carrier,
    service: rate.service,
    rate: `$${rate.total.toFixed(2)}`,
    deliveryDays: rate.estimatedDays,
    deliveryDate: rate.estimatedDelivery,
    retailRate: rate.retailRate ? `$${rate.retailRate.toFixed(2)}` : undefined,
    listRate: rate.listRate ? `$${rate.listRate.toFixed(2)}` : undefined,
    accountRate: rate.accountRate ? `$${rate.accountRate.toFixed(2)}` : undefined,
    currency: rate.currency,
    estimatedDelivery: rate.estimatedDelivery,
    carrierAccountId: rate.carrierAccountId,
    billingType: rate.billingType,
  }));

  return { rates, messages: result.messages };
};

/**
 * Purchase a shipping label from the external API
 * Matches the backend proxy implementation in server/routes.ts
 */
export const purchaseShippingLabel = async (config: ApiConfig, data: any) => {
  const url = `${config.baseUrl}${config.buyEndpoint}`;
  
  const { provider, shipmentId, rateId, reference } = data;

  if (!provider || !shipmentId || !rateId) {
    throw new Error("Missing required fields: provider, shipmentId, and rateId are required");
  }

  const requestBody = {
    provider,
    shipmentId,
    rateId,
    reference,
  };

  console.log("Direct API call to:", url, requestBody);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization header if API key is configured
  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error (${response.status}): ${errorText}`);
  }

  const buyResponse = await response.json();

  // Transform API response to frontend format
  // Matches the transformation in server/routes.ts
  return {
    id: buyResponse.shipmentId,
    provider: buyResponse.provider,
    shipmentId: buyResponse.shipmentId,
    rateId: rateId,
    trackingNumber: buyResponse.trackingNumber,
    carrier: buyResponse.carrier,
    service: buyResponse.service,
    rate: `$${buyResponse.total.toFixed(2)}`,
    labelUrl: buyResponse.labelUrl,
    currency: buyResponse.currency,
    estimatedDelivery: buyResponse.estimatedDelivery,
    carrierAccountId: buyResponse.carrierAccountId,
    billingType: buyResponse.billingType,
    labelFormat: buyResponse.labelUrl?.endsWith('.pdf') ? 'pdf' as const : 
                 buyResponse.labelUrl?.endsWith('.png') ? 'png' as const : 
                 'zpl' as const,
  };
};
