import { pgTable, uuid, varchar, timestamp, integer, text, boolean } from "drizzle-orm/pg-core";
import { products } from "./productsTable";
import { users } from "./usersTable";

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id).notNull(),
  renterId: uuid("renter_id").references(() => users.id).notNull(),

  // Duration
  startDate: varchar("start_date", { length: 20 }).notNull(), // ISO date string: "2026-02-19"
  endDate: varchar("end_date", { length: 20 }).notNull(),
  totalDays: integer("total_days").notNull(),
  quantity: integer("quantity").notNull().default(1),

  // Logistics
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull().default("pickup"), // "pickup" | "delivery"
  deliveryAddress: text("delivery_address"),
  deliveryAptFloor: varchar("delivery_apt_floor", { length: 100 }),
  deliveryGateCode: varchar("delivery_gate_code", { length: 50 }),
  deliveryInstructions: text("delivery_instructions"),

  // Payment
  paymentMethod: varchar("payment_method", { length: 20 }).notNull().default("card"), // "upi" | "card" | "wallet"

  // Financials (stored as cents to avoid float issues)
  rentalAmount: integer("rental_amount").notNull(),   // pricePerDay * days * quantity
  serviceFee: integer("service_fee").notNull(),
  securityDeposit: integer("security_deposit").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  totalAmount: integer("total_amount").notNull(),

  // Status & Reference
  bookingReference: varchar("booking_reference", { length: 20 }).unique().notNull(),
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // "pending" | "confirmed" | "cancelled" | "completed"
  depositRefunded: boolean("deposit_refunded").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
