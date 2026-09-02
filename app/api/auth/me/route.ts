import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";
import { db } from "@/app/utils/dbConnect";
import { users } from "@/app/tables/usersTable";
import { eq } from "drizzle-orm";

async function getAuthPayload(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (headerToken) {
    try {
      return verifyAccessToken(headerToken);
    } catch {
      // fall through
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    try {
      return verifyAccessToken(accessToken);
    } catch {
      // fall through to refresh
    }
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Missing access token");
  }

  return verifyRefreshToken(refreshToken);
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getAuthPayload(req);

    const [user] = await db
      .select({
        id: users.id,
        userName: users.userName,
        email: users.email,
        phoneNumber: users.phoneNumber,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error: unknown) {
    console.error("🔴 GET ME ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
