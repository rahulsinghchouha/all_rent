import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getProductByIdService, updateProductService } from "@/app/services/products";
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;
    const product = await getProductByIdService(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product }, { status: 200 });
  } catch (error) {
    console.error("🔴 PRODUCT DETAIL ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const body = await req.json();

    const updatedProduct = await updateProductService(id, {
      ...body,
      ownerId: body.ownerId ?? user.id,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("🔴 PRODUCT UPDATE ERROR:", error?.message, error);

    if (typeof error?.message === "string") {
      if (error.message.includes("Missing access token") || error.message.includes("jwt")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (error.message.includes("Validation failed")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
