import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, inArray, or } from "drizzle-orm";
import { verifyAccessToken, verifyRefreshToken } from "@/app/services/auth";
import { db } from "@/app/utils/dbConnect";
import { conversationsTable } from "@/app/tables/conversationTable";
import { products } from "@/app/tables/productsTable";
import { users } from "@/app/tables/usersTable";

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
      // fall through to refresh token validation
    }
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    throw new Error("Missing access token");
  }

  return verifyRefreshToken(refreshToken);
}

function normalizeConversationUsers(userOneId: string, userTwoId: string) {
  return [userOneId, userTwoId].sort((a, b) => a.localeCompare(b));
}

async function getOrCreateConversation(currentUserId: string, otherUserId: string) {
  const [userOneId, userTwoId] = normalizeConversationUsers(currentUserId, otherUserId);

  const existingConversation = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        and(
          eq(conversationsTable.userOneId, userOneId),
          eq(conversationsTable.userTwoId, userTwoId)
        ),
        and(
          eq(conversationsTable.userOneId, userTwoId),
          eq(conversationsTable.userTwoId, userOneId)
        )
      )
    )
    .limit(1);

  if (existingConversation.length > 0) {
    return existingConversation[0];
  }

  const [createdConversation] = await db
    .insert(conversationsTable)
    .values({
      userOneId,
      userTwoId,
    })
    .returning();

  return createdConversation;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      const conversations = await db
        .select()
        .from(conversationsTable)
        .where(
          or(
            eq(conversationsTable.userOneId, user.id),
            eq(conversationsTable.userTwoId, user.id)
          )
        );

      const participantIds = [...new Set(
        conversations.flatMap((conversation) => [
          conversation.userOneId,
          conversation.userTwoId,
        ])
      )].filter((participantId) => participantId !== user.id);

      const participantUsers = participantIds.length
        ? await db
            .select({
              id: users.id,
              userName: users.userName,
              email: users.email,
              isOnline: users.isOnline,
              isTyping: users.isTyping,
              lastSeenAt: users.lastSeenAt,
            })
            .from(users)
            .where(inArray(users.id, participantIds))
        : [];

      const userMap = new Map(
        participantUsers.map((participant) => [participant.id, participant])
      );

      return NextResponse.json(
        {
          data: conversations.map((conversation) => {
            const otherUserId =
              conversation.userOneId === user.id
                ? conversation.userTwoId
                : conversation.userOneId;

            return {
              ...conversation,
              otherUserId,
              otherUser: userMap.get(otherUserId) ?? null,
            };
          }),
        },
        { status: 200 }
      );
    }

    const [product] = await db
      .select({ ownerId: products.ownerId })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.ownerId === user.id) {
      return NextResponse.json({ error: "A product owner cannot start a conversation with themselves" }, { status: 400 });
    }

    const conversation = await getOrCreateConversation(user.id, product.ownerId);

    return NextResponse.json({ data: conversation }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔴 GET CONVERSATION ERROR:", message);

    if (message.includes("Missing access token") || message.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const productId = typeof body?.productId === "string" ? body.productId : null;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const [product] = await db
      .select({ ownerId: products.ownerId })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.ownerId === user.id) {
      return NextResponse.json({ error: "A product owner cannot start a conversation with themselves" }, { status: 400 });
    }

    const conversation = await getOrCreateConversation(user.id, product.ownerId);

    return NextResponse.json({ data: conversation }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("🔴 CREATE CONVERSATION ERROR:", message);

    if (message.includes("Missing access token") || message.includes("jwt")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 });
  }
}
