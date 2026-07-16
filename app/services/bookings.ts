import { db } from "@/app/utils/dbConnect";
import { bookings } from "@/app/tables/bookingsTable";
import { products } from "@/app/tables/productsTable";
import { CreateBookingBody } from "@/app/tablesValidation/bookingsValidation";
import { eq } from "drizzle-orm";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateBookingReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars, no 0/O/1/I confusion
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `RF-${part1}-${part2}`;
}

// ── Services ─────────────────────────────────────────────────────────────────

export async function createBookingService(
  renterId: string,
  data: CreateBookingBody
) {
  const bookingReference = generateBookingReference();

  const [booking] = await db
    .insert(bookings)
    .values({
      productId: data.productId,
      renterId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      quantity: data.quantity,
      deliveryMethod: data.deliveryMethod,
      deliveryAddress: data.deliveryAddress ?? null,
      deliveryAptFloor: data.deliveryAptFloor ?? null,
      deliveryGateCode: data.deliveryGateCode ?? null,
      deliveryInstructions: data.deliveryInstructions ?? null,
      paymentMethod: data.paymentMethod,
      rentalAmount: Math.round(data.rentalAmount),
      serviceFee: Math.round(data.serviceFee),
      securityDeposit: Math.round(data.securityDeposit),
      deliveryFee: Math.round(data.deliveryFee),
      totalAmount: Math.round(data.totalAmount),
      bookingReference,
      status: "confirmed",
    })
    .returning();

  return booking;
}

export async function getBookingByIdService(id: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  if (!booking) return null;

  // Also fetch the product for the confirmation screen
  const [product] = await db
    .select({
      id: products.id,
      title: products.title,
      imageUrls: products.imageUrls,
      pricePerDay: products.pricePerDay,
      category: products.category,
      ownerId: products.ownerId,
    })
    .from(products)
    .where(eq(products.id, booking.productId))
    .limit(1);

  return { booking, product: product ?? null };
}

export async function getBookingsByRenterService(renterId: string) {
  return await db
    .select()
    .from(bookings)
    .where(eq(bookings.renterId, renterId))
    .orderBy(bookings.createdAt);
}
