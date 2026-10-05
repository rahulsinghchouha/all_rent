import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAccessToken, verifyRefreshToken, createAccessToken, createRefreshToken, type AuthPayload } from "@/app/services/auth";
import { db } from "@/app/utils/dbConnect";
import { users } from "@/app/tables/usersTable";
import { eq } from "drizzle-orm";

const isProduction = process.env.NODE_ENV === "production";

function setAuthCookies(response: NextResponse, payload: AuthPayload) {
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

async function getAuthPayload(req: NextRequest) {
  let usedRefreshToken = false;

  const authHeader = req.headers.get("authorization") ?? "";
  const headerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (headerToken) {
    try {
      return { payload: verifyAccessToken(headerToken), usedRefreshToken: false };
    } catch {
      // fall through to cookie validation
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (accessToken) {
    try {
      return { payload: verifyAccessToken(accessToken), usedRefreshToken: false };
    } catch {
      // fall through to refresh
    }
  }

  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Missing access token");
  }

  usedRefreshToken = true;
  return { payload: verifyRefreshToken(refreshToken), usedRefreshToken };
}

export async function GET(req: NextRequest) {
  try {
    const { payload, usedRefreshToken } = await getAuthPayload(req);

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

    const response = NextResponse.json({ data: user }, { status: 200 });

    if (usedRefreshToken) {
      setAuthCookies(response, {
        id: payload.id,
        userName: payload.userName,
        email: payload.email,
      });
    }

    return response;
  } catch (error: unknown) {
    console.error("🔴 GET ME ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
