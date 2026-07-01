import { NextResponse } from "next/server";
import { verifyRefreshToken, createAccessToken, createRefreshToken } from "@/app/services/auth";

export async function POST(req: Request) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    const accessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);

    const response = NextResponse.json({
      message: "Token refreshed successfully",
      accessToken,
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("🔴 REFRESH TOKEN ERROR:", error?.message);
    return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
  }
}
