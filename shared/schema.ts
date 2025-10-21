import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Address schema for shipment forms
export const shipmentAddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional(),
  phone: z.string().min(1, "Phone is required")
    .refine(val => val.replace(/\D/g, '').length >= 10, "Valid phone number is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  country: z.string().default("US"),
});

// Package schema
export const packageSchema = z.object({
  packageType: z.string().min(1, "Package type is required"),
  weightLbs: z.string().min(1, "Weight in pounds is required")
    .refine(val => /^\d+$/.test(val), "Weight must be a whole number"),
  weightOz: z.string().optional()
    .refine(val => !val || /^\d+$/.test(val), "Ounces must be a whole number"),
  length: z.string().min(1, "Length is required")
    .refine(val => /^\d+$/.test(val), "Length must be a whole number"),
  width: z.string().min(1, "Width is required")
    .refine(val => /^\d+$/.test(val), "Width must be a whole number"),
  height: z.string().min(1, "Height is required")
    .refine(val => /^\d+$/.test(val), "Height must be a whole number"),
  carrier: z.string().optional(),
});

// Rate selection schema
export const rateSelectionSchema = z.object({
  service: z.string().min(1, "Service is required"),
  rate: z.string().min(1, "Rate selection is required"),
  carrierId: z.number().optional(),
});

// Additional services schema
export const additionalServicesSchema = z.object({
  saturdayDelivery: z.boolean().optional().default(false),
  requireSignature: z.boolean().optional().default(false),
  expressMailWaiver: z.boolean().optional().default(false),
  insuranceValue: z.boolean().optional().default(false),
  returnLabel: z.boolean().optional().default(false),
  weekendService: z.boolean().optional().default(false),
  additionalHandling: z.boolean().optional().default(false),
  certifiedMail: z.boolean().optional().default(false),
});

// Complete shipment creation schema
export const createShipmentSchema = z.object({
  fromAddress: shipmentAddressSchema,
  toAddress: shipmentAddressSchema,
  packages: z.array(packageSchema).min(1, "At least one package is required"),
  rateSelection: rateSelectionSchema,
  additionalServices: additionalServicesSchema.optional().default({}),
});

// Rate schema for API responses
export const rateSchema = z.object({
  id: z.string(),
  provider: z.string().optional(),
  shipmentId: z.string().optional(),
  rateId: z.string().optional(),
  carrierId: z.number().optional(),
  service: z.string(),
  carrier: z.string(),
  rate: z.string(),
  deliveryDays: z.number().optional(),
  deliveryDate: z.string().optional(),
  retailRate: z.string().optional(),
  labelUrl: z.string().optional(),
  labelFormat: z.enum(['pdf', 'png', 'zpl']).optional(),
  currency: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  carrierAccountId: z.string().optional(),
  billingType: z.string().optional(),
  listRate: z.string().optional(),
  accountRate: z.string().optional(),
});

// Address type for saved addresses
export interface Address {
  id: number;
  name: string;
  company?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: "sender" | "recipient";
}

// Export types
export type ShipmentFormData = z.infer<typeof createShipmentSchema>;
export type Rate = z.infer<typeof rateSchema>;
export type Package = z.infer<typeof packageSchema>;
export type ShipmentAddress = z.infer<typeof shipmentAddressSchema>;
export type AdditionalServices = z.infer<typeof additionalServicesSchema>;
