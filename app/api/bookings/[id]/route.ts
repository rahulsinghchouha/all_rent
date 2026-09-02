import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";
import { getBookingByIdService } from "@/app/services/bookings";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const result = await getBookingByIdService(id);

    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: unknown) {
    console.error("🔴 BOOKING FETCH ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
