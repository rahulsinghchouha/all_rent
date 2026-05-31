import { NextResponse } from "next/server";
import { createProductService } from "@/app/services/products";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const product = await createProductService(body);

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    console.error("🔴 PRODUCT CREATE ERROR:", error?.message, error);

    if (typeof error?.message === "string") {
      if (error.message.includes("Validation failed")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("No product owner configured")) {
        return NextResponse.json({ error: error.message }, { status: 422 });
      }
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
