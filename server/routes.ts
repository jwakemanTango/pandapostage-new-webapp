import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { shippingApiClient } from "./api-client";
import type { RateQuoteRequest, BuyShipmentRequest } from "./api-client";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.get("/api/addresses", async (req, res) => {
    try {
      const addresses = await storage.getAddresses();
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch addresses" });
    }
  });

  // Get shipping rate quotes from external API
  app.post("/api/shipments/rates", async (req, res) => {
    try {
      const { fromAddress, toAddress, packages, additionalServices } = req.body;

      // Transform frontend data to API format
      const shipper = {
        name: fromAddress.name,
        company: fromAddress.company,
        phone: fromAddress.phone,
        street1: fromAddress.addressLine1,
        street2: fromAddress.addressLine2 || null,
        city: fromAddress.city,
        state: fromAddress.state,
        postalCode: fromAddress.zipCode,
        country: fromAddress.country || "US",
      };

      const recipient = {
        name: toAddress.name,
        company: toAddress.company,
        phone: toAddress.phone,
        street1: toAddress.addressLine1,
        street2: toAddress.addressLine2 || null,
        city: toAddress.city,
        state: toAddress.state,
        postalCode: toAddress.postalCode || toAddress.zipCode,
        country: toAddress.country || "US",
      };

      // Transform packages to API format
      const apiPackages = packages.map((pkg: any) => {
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

      // Transform additional services to API format
      const options = {
        saturdayDelivery: additionalServices?.saturdayDelivery,
        requireSignature: additionalServices?.requireSignature,
        expressMailWaiver: additionalServices?.expressMailWaiver,
        insuranceValue: additionalServices?.insuranceValue,
        returnLabel: additionalServices?.returnLabel,
        weekendService: additionalServices?.weekendService,
        additionalHandling: additionalServices?.additionalHandling,
        certifiedMail: additionalServices?.certifiedMail,
      };

      const request: RateQuoteRequest = {
        shipper,
        recipient,
        packages: apiPackages,
        options,
      };

      const rateResponse = await shippingApiClient.getRateQuotes(request);

      // Transform API response to frontend format
      const rates = rateResponse.rates.map((rate, index) => ({
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

      res.json({ rates, messages: rateResponse.messages });
    } catch (error: any) {
      console.error("Error getting rates:", error);
      res.status(500).json({ 
        error: "Failed to get shipping rates",
        details: error.message 
      });
    }
  });

  // Purchase a shipping label from external API
  app.post("/api/shipments/buy", async (req, res) => {
    try {
      const { provider, shipmentId, rateId, reference } = req.body;

      if (!provider || !shipmentId || !rateId) {
        return res.status(400).json({ 
          error: "Missing required fields: provider, shipmentId, and rateId are required" 
        });
      }

      const request: BuyShipmentRequest = {
        provider,
        shipmentId,
        rateId,
        reference,
      };

      const buyResponse = await shippingApiClient.buyShipment(request);

      // Transform API response to frontend format
      const result = {
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

      res.json(result);
    } catch (error: any) {
      console.error("Error buying shipment:", error);
      res.status(500).json({ 
        error: "Failed to purchase shipping label",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
