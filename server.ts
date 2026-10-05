import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { verifyAccessToken } from "@/app/services/auth";

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

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      console.log("🍪 Socket cookies:", socket.handshake.headers.cookie);
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

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    console.log("Authenticated user:", socket.data.userId);
    socket.on(
      "send_message",
      (data: { productId: string; content: string }) => {
        console.log("📩 Message received:", {
          userId: socket.data.userId,
          productId: data.productId,
          content: data.content,
        });
      }
    );
    // socket.on("join_conversation", (conversationId: string) => {
    //   socket.join(conversationId);

    //   console.log(
    //     `User ${socket.data.userId} joined conversation ${conversationId}`
    //   );
    // })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO running on http://${hostname}:${port}`);
  });
}

startServer();