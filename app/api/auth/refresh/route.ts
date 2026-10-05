import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, createAccessToken, createRefreshToken } from "@/app/services/auth";

const isProduction = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const authPayload = {
      id: payload.id,
      userName: payload.userName,
      email: payload.email,
    };

    const accessToken = createAccessToken(authPayload);
    const newRefreshToken = createRefreshToken(authPayload);

    const response = NextResponse.json({
      message: "Token refreshed successfully",
      accessToken,
    });

    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: unknown) {
    console.error("🔴 REFRESH TOKEN ERROR:", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }
}
