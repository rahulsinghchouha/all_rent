import { NextResponse } from "next/server";
import { loginSchema } from "@/app/tablesValidation/userValidation";
import { loginUserService, createAccessToken, createRefreshToken } from "@/app/services/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const user = await loginUserService(parsed.data.email, parsed.data.password);
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

    const response = NextResponse.json(
      {
        message: "Login successful",
        data: user,
        accessToken,
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("🔴 LOGIN ERROR:", error?.message);

    if (error.message === "Invalid email or password") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
