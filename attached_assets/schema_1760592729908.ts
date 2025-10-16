import { pgTable, text, serial, integer, boolean, jsonb, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Account model
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("user").notNull(), // superadmin, admin, or user
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Address model
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  company: text("company"),
  phone: text("phone").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").default("US").notNull(),
  isDefault: boolean("is_default").default(false),
  type: text("type").notNull(), // sender or recipient
});

export const insertAddressSchema = createInsertSchema(addresses).omit({
  id: true,
});

// Carrier model
export const carriers = pgTable("carriers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // easypost, ups_dap, usps_native, etc.
  apiKey: text("api_key"),
  accountNumber: text("account_number"),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"),
});

export const insertCarrierSchema = createInsertSchema(carriers).omit({
  id: true,
});

// Shipment model
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fromAddressId: integer("from_address_id").references(() => addresses.id),
  toAddressId: integer("to_address_id").references(() => addresses.id),
  carrierId: integer("carrier_id").references(() => carriers.id),
  service: text("service"),
  trackingNumber: text("tracking_number"),
  status: text("status").default("draft"),
  labelUrl: text("label_url"),
  cost: text("cost"),
  weight: text("weight"),
  dimensions: jsonb("dimensions"),
  packageType: text("package_type"),
  createdAt: timestamp("created_at").defaultNow(),
  batchId: text("batch_id"),
  shippingDate: timestamp("shipping_date"),
  providerId: text("provider_id"), // ID from shipping provider
  refundStatus: text("refund_status").default("none"),
  metadata: jsonb("metadata"),
});

export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
});

// Create type interfaces
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAddress = z.infer<typeof insertAddressSchema>;
export type Address = typeof addresses.$inferSelect;

export type InsertCarrier = z.infer<typeof insertCarrierSchema>;
export type Carrier = typeof carriers.$inferSelect;

export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Shipment = typeof shipments.$inferSelect;

// Shipment create/update form schemas
export const shipmentAddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  company: z.string().optional(),
  phone: z.string().min(10, "Valid phone number is required"),
  addressLine1: z.string().min(3, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  country: z.string().default("US"),
});

export const packageSchema = z.object({
  packageType: z.string().min(1, "Package type is required"),
  weightLbs: z.string().min(1, "Weight in pounds is required")
    .refine(val => /^\d+$/.test(val), "Weight must be a whole number"),
  weightOz: z.string().optional()
    .refine(val => !val || /^\d+$/.test(val), "Ounces must be a whole number"),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
});

export const packageDetailsSchema = z.object({
  weight: z.string().optional(), // For API compatibility - will be calculated
  weightLbs: z.string().min(1, "Weight in pounds is required")
    .refine(val => /^\d+$/.test(val), "Weight must be a whole number"),
  weightOz: z.string().optional()
    .refine(val => !val || /^\d+$/.test(val), "Ounces must be a whole number"),
  length: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  packageType: z.string().min(1, "Package type is required"),
}).refine(data => {
  // Ensure we have either weight or weightLbs
  const hasLbs = data.weightLbs && data.weightLbs.trim() !== "";
  const hasWeight = data.weight && data.weight.trim() !== "";
  return hasLbs || hasWeight;
}, {
  message: "Weight is required",
  path: ["weightLbs"]
});

export const rateSelectionSchema = z.object({
  service: z.string().min(1, "Service is required"),
  rate: z.string().min(1, "Rate selection is required"),
  carrierId: z.number().optional(),
});

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

export const createShipmentSchema = z.object({
  fromAddress: shipmentAddressSchema,
  toAddress: shipmentAddressSchema,
  packageDetails: packageDetailsSchema.optional(), // Keep for backward compatibility
  packages: z.array(packageSchema).min(1, "At least one package is required"),
  rateSelection: rateSelectionSchema,
  additionalServices: additionalServicesSchema.optional().default({}),
});

// Schema for rate requests - only uses packages array
export const rateRequestSchema = z.object({
  fromAddress: shipmentAddressSchema,
  toAddress: shipmentAddressSchema,
  packages: z.array(packageSchema.extend({
    weight: z.string().optional() // Add weight field for rate calculation
  })).min(1, "At least one package is required"),
});

// Provider service schema
export const providerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string()
});

export const rateSchema = z.object({
  id: z.string(),
  carrierId: z.number().optional(),
  service: z.string(),
  carrier: z.string(),
  rate: z.string(),
  deliveryDays: z.number().optional(),
  deliveryDate: z.string().optional()
});
