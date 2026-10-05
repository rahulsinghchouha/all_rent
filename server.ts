import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { and, eq, or } from "drizzle-orm";
import { verifyAccessToken } from "@/app/services/auth";
import { db } from "./app/utils/dbConnect";
import { conversationsTable } from "./app/tables/conversationTable";
import { message as messagesTable } from "./app/tables/messageTable";
import { products } from "./app/tables/productsTable";
import { users } from "./app/tables/usersTable";

declare global {
  var io: Server | undefined;
}

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

const app = next({
  dev,
  hostname,
  port,
  webpack: true,
});

const handle = app.getRequestHandler();

async function getOrCreateConversationForProduct(userId: string, productId: string) {
  const [product] = await db
    .select({ ownerId: products.ownerId })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    throw new Error("Product not found");
  }

  const existingConversation = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        and(
          eq(conversationsTable.userOneId, userId),
          eq(conversationsTable.userTwoId, product.ownerId)
        ),
        and(
          eq(conversationsTable.userOneId, product.ownerId),
          eq(conversationsTable.userTwoId, userId)
        )
      )
    )
    .limit(1);

  if (existingConversation.length > 0) {
    return existingConversation[0];
  }

  const [created] = await db
    .insert(conversationsTable)
    .values({
      userOneId: userId,
      userTwoId: product.ownerId,
    })
    .returning();

  return created;
}

async function updateUserPresence(userId: string, presence: { isOnline: boolean; isTyping?: boolean }) {
  await db
    .update(users)
    .set({
      isOnline: presence.isOnline,
      isTyping: presence.isTyping ?? users.isTyping,
      lastSeenAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

async function startServer() {
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  global.io = io;

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error("Unauthorized"));
      }

      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((cookie) => {
          const [key, ...value] = cookie.split("=");
          return [key, value.join("=")];
        })
      );

      const accessToken = cookies.accessToken;
      if (!accessToken) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyAccessToken(accessToken);
      socket.data.userId = payload.id;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id);
    console.log("Authenticated user:", socket.data.userId);

    if (socket.data.userId) {
      await updateUserPresence(socket.data.userId, { isOnline: true, isTyping: false });
    }

    socket.on("typing_status", async (payload: { conversationId?: string; isTyping?: boolean }) => {
      const userId = socket.data.userId;
      const conversationId = payload?.conversationId;
      const isTyping = Boolean(payload?.isTyping);

      if (!userId || !conversationId) {
        return;
      }

      await updateUserPresence(userId, { isOnline: true, isTyping });
      socket.to(`conversation:${conversationId}`).emit("typing_status", {
        conversationId,
        userId,
        isTyping,
      });
    });

    socket.on("join_conversation", async (conversationId: string) => {
      try {
        const userId = socket.data.userId;
        if (!conversationId || !userId) {
          return;
        }

        const [conversation] = await db
          .select()
          .from(conversationsTable)
          .where(eq(conversationsTable.id, conversationId))
          .limit(1);

        if (!conversation) {
          return;
        }

        const isParticipant =
          conversation.userOneId === userId || conversation.userTwoId === userId;

        if (!isParticipant) {
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit("conversation_joined", { conversationId });
      } catch (error) {
        console.error("join_conversation failed:", error);
      }
    });

    socket.on(
      "send_message",
      async (data: { conversationId?: string; productId?: string; content?: string }) => {
        try {
          const userId = socket.data.userId;
          const content = String(data?.content ?? "").trim();

          if (!userId || !content) {
            return;
          }

          let conversationId = data?.conversationId ?? null;

          if (!conversationId && data?.productId) {
            const conversation = await getOrCreateConversationForProduct(userId, data.productId);
            conversationId = conversation.id;
          }

          if (!conversationId) {
            return;
          }

          const [conversation] = await db
            .select()
            .from(conversationsTable)
            .where(eq(conversationsTable.id, conversationId))
            .limit(1);

          if (!conversation) {
            return;
          }

          const isParticipant =
            conversation.userOneId === userId || conversation.userTwoId === userId;

          if (!isParticipant) {
            return;
          }

          const [savedMessage] = await db
            .insert(messagesTable)
            .values({
              conversationId,
              senderId: userId,
              content,
              messageType: "TEXT",
            })
            .returning();

          io.to(`conversation:${conversationId}`).emit("new_message", savedMessage);
        } catch (error) {
          console.error("❌ Error handling message:", error);
        }
      }
    );

    socket.on("disconnect", async () => {
      if (socket.data.userId) {
        await updateUserPresence(socket.data.userId, { isOnline: false, isTyping: false });
      }
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO running on http://${hostname}:${port}`);
  });
}

startServer();