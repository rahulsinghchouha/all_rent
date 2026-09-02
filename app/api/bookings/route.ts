import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";
import { createBookingService, getBookingsByRenterService } from "@/app/services/bookings";
import { createBookingBodySchema } from "@/app/tablesValidation/bookingsValidation";

async function requireAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (headerToken) {
    try { return verifyAccessToken(headerToken); } catch { /* fall through */ }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    try { return verifyAccessToken(accessToken); } catch { /* fall through */ }
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) throw new Error("Missing access token");
  return verifyRefreshToken(refreshToken);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const parsed = createBookingBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const booking = await createBookingService(user.id, parsed.data);
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("🔴 BOOKING CREATE ERROR:", errorMessage);
    if (errorMessage.includes("Missing access token") || errorMessage.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const bookings = await getBookingsByRenterService(user.id);
    return NextResponse.json({ data: bookings }, { status: 200 });
  } catch (error: unknown) {
    console.error("🔴 BOOKING LIST ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
