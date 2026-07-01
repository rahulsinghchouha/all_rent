import { NextResponse } from "next/server";
import { createProductService, getProductsService } from "@/app/services/products";
import { verifyAccessToken } from "@/app/services/auth";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

function requireAuth(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error("Missing access token");
  }
  return verifyAccessToken(token);
}

export async function GET(req: Request) {
  try {
    requireAuth(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "published";
    const ownerId = url.searchParams.get("ownerId") ?? undefined;
    const category = url.searchParams.get("category") ?? undefined;
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 50;

    if (limitParam && (Number.isNaN(limit) || limit <= 0)) {
      return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
    }

    const products = await getProductsService({
      status,
      ownerId: ownerId || undefined,
      category: category || undefined,
      limit,
    });

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error("🔴 PRODUCT LIST ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = requireAuth(req);
    const body = await req.json();
    const product = await createProductService({
      ...body,
      ownerId: user.id,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    console.error("🔴 PRODUCT CREATE ERROR:", error?.message, error);

    if (typeof error?.message === "string") {
      if (error.message.includes("Missing access token") || error.message.includes("jwt")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Validation failed")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes("Product ownerId is required")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
