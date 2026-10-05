import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createProductService, getProductsService } from "@/app/services/products";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";

function getBearerToken(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

async function getAccessToken(req: Request) {
  const headerToken = getBearerToken(req);
  if (headerToken) {
    return headerToken;
  }

  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value ?? null;
}

async function requireAuth(req: Request) {
  const token = await getAccessToken(req);
  if (token) {
    try {
      return verifyAccessToken(token);
    } catch {
      // continue to refresh token fallback
    }
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Missing access token");
  }

  return verifyRefreshToken(refreshToken);
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "published";
    const ownerId = url.searchParams.get("ownerId") ?? undefined;
    const excludeOwnerId = url.searchParams.get("excludeOwnerId") ?? undefined;
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

    console.log("Fetched products:", products);

    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error("🔴 PRODUCT LIST ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const product = await createProductService({
      ...body,
      ownerId: user.id,
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("🔴 PRODUCT CREATE ERROR:", errorMessage, error);

    if (errorMessage) {
      if (errorMessage.includes("Missing access token") || errorMessage.includes("jwt")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (errorMessage.includes("Validation failed")) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      if (errorMessage.includes("Product ownerId is required")) {
        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
