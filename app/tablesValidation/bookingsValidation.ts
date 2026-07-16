import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { bookings } from "../tables/bookingsTable";
import { z } from "zod";

export const insertBookingSchema = createInsertSchema(bookings, {
  startDate: (s) => s.min(1, "Start date is required"),
  endDate: (s) => s.min(1, "End date is required"),
  totalDays: (s) => s.positive("Total days must be positive"),
  quantity: (s) => s.positive("Quantity must be at least 1"),
  rentalAmount: (s) => s.nonnegative("Rental amount must be non-negative"),
  serviceFee: (s) => s.nonnegative("Service fee must be non-negative"),
  securityDeposit: (s) => s.nonnegative("Deposit must be non-negative"),
  deliveryFee: (s) => s.nonnegative("Delivery fee must be non-negative"),
  totalAmount: (s) => s.nonnegative("Total must be non-negative"),
  deliveryMethod: (s) => s.refine((v) => ["pickup", "delivery"].includes(v), "Invalid delivery method"),
  paymentMethod: (s) => s.refine((v) => ["upi", "card", "wallet"].includes(v), "Invalid payment method"),
});

export const selectBookingSchema = createSelectSchema(bookings);

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type SelectBooking = z.infer<typeof selectBookingSchema>;

// Zod schema for the client-facing POST body (no id, bookingReference, renterId — those are server-set)
export const createBookingBodySchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  totalDays: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
  deliveryMethod: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
  deliveryAptFloor: z.string().optional(),
  deliveryGateCode: z.string().optional(),
  deliveryInstructions: z.string().optional(),
  paymentMethod: z.enum(["upi", "card", "wallet"]),
  rentalAmount: z.number().nonnegative(),
  serviceFee: z.number().nonnegative(),
  securityDeposit: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative(),
});

export type CreateBookingBody = z.infer<typeof createBookingBodySchema>;
