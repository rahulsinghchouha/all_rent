import { NextResponse } from "next/server";
import { signUpSchema } from "@/app/tablesValidation/userValidation";
import { createUserService } from "@/app/services/auth";

// In-memory store for rate limiting IP sign-ups
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0].trim() || req.headers.get("x-real-ip") || "unknown-ip";
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // Periodically clean up old entries to prevent memory leaks in the Map
    if (Math.random() < 0.1) {
      for (const [key, data] of rateLimitMap.entries()) {
        if (now - data.lastReset > oneHour) {
          rateLimitMap.delete(key);
        }
      }
    }

    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    // Reset if an hour has passed
    if (now - rateData.lastReset > oneHour) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    if (rateData.count >= 5) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again after an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();

    const parsedBody = signUpSchema.safeParse(body);

    if (!parsedBody.success) {
      console.error("Validation errors:", parsedBody.error.format());
      return NextResponse.json({ error: "Validation failed", details: parsedBody.error }, { status: 400 });
    }

    console.log("getting the parse body data", parsedBody.data);

    const newUser = await createUserService({
      userName: parsedBody.data.userName,
      email: parsedBody.data.email,
      password: parsedBody.data.password,
    });

    // Increment and save the updated rate limit count for this IP after successful registration
    rateData.count += 1;
    rateLimitMap.set(ip, rateData);

    return NextResponse.json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error: any) {
    if (error.message === "Email already exists") {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}