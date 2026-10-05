"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/app/lib/socket";

type MessageRow = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
};

type UserSummary = {
  id: string;
  userName?: string;
  email?: string;
};

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatPage() {
  const params = useParams();
  const productId = typeof params?.id === "string" ? params.id : "";
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [productOwnerId, setProductOwnerId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    userOneId: string;
    userTwoId: string;
    otherUserId: string;
    otherUser?: { id: string; userName?: string; email?: string; isOnline?: boolean; isTyping?: boolean; lastSeenAt?: string | null } | null;
  }>>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" });
        const result = await response.json();
        setCurrentUser(result?.data ?? null);
      } catch {
        setCurrentUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, { credentials: "include" });
        const result = await response.json();
        setProductOwnerId(result?.data?.ownerId ?? null);
      } catch (error) {
        console.error("Failed to load product owner", error);
        setProductOwnerId(null);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  useEffect(() => {
    if (!currentUser || !productId || !productOwnerId) {
      return;
    }

    if (currentUser.id === productOwnerId) {
      let ignore = false;

      async function loadConversations() {
        try {
          const response = await fetch("/api/conversations", {
            credentials: "include",
          });
          const result = await response.json();

          if (!ignore) {
            const nextConversations = result?.data ?? [];
            setConversations(nextConversations);

            if (!conversationId && nextConversations.length > 0) {
              setConversationId(nextConversations[0].id);
            }
          }
        } catch (error) {
          console.error("Failed to load owner conversations", error);
        }
      }

      loadConversations();

      return () => {
        ignore = true;
      };
    }

    let ignore = false;

    async function ensureConversation() {
      try {
        const response = await fetch("/api/conversations", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });

        const result = await response.json();
        if (!response.ok || !result?.data?.id) {
          return;
        }

        if (!ignore) {
          setConversationId(result.data.id);
        }
      } catch (error) {
        console.error("Failed to create conversation", error);
      }
    }

    ensureConversation();

    return () => {
      ignore = true;
    };
  }, [currentUser, productId, productOwnerId, conversationId]);

  useEffect(() => {
    const activeConversationId = conversationId;
    if (!activeConversationId) return;

    let ignore = false;

    async function loadMessages() {
      try {
        const response = await fetch(`/api/conversations/${activeConversationId}/messages`, {
          credentials: "include",
        });
        const result = await response.json();
        if (!ignore) {
          setMessages(result?.data ?? []);
        }
      } catch (error) {
        console.error("Failed to load conversation messages", error);
      }
    }

    loadMessages();

    socket.connect();
    socket.emit("join_conversation", activeConversationId);

    const handleIncomingMessage = (message: MessageRow) => {
      if (message.conversationId !== activeConversationId) {
        return;
      }

      setMessages((current) => {
        const exists = current.some((item) => item.id === message.id);
        return exists ? current : [...current, message];
      });
    };

    const handleTypingStatus = (payload: { conversationId?: string; userId?: string; isTyping?: boolean }) => {
      if (payload.conversationId !== activeConversationId) {
        return;
      }

      if (payload.userId && payload.userId !== currentUser?.id) {
        setTypingUserId(payload.isTyping ? payload.userId : null);
      }
    };

    socket.on("new_message", handleIncomingMessage);
    socket.on("typing_status", handleTypingStatus);

    return () => {
      ignore = true;
      socket.off("new_message", handleIncomingMessage);
      socket.off("typing_status", handleTypingStatus);
    };
  }, [conversationId, currentUser?.id]);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error", error.message);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, []);

  const emitTypingStatus = (isTyping: boolean) => {
    if (!conversationId) return;

    socket.emit("typing_status", {
      conversationId,
      isTyping,
    });
  };

  const sendMessage = () => {
    const activeConversationId = conversationId;
    const trimmed = draft.trim();
    if (!trimmed || !activeConversationId) {
      return;
    }

    emitTypingStatus(false);
    socket.emit("send_message", {
      conversationId: activeConversationId,
      content: trimmed,
    });

    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const selectedConversation = conversations.find((conversation) => conversation.id === conversationId) ?? conversations[0] ?? null;
  const selectedUserName = selectedConversation?.otherUser?.userName || selectedConversation?.otherUser?.email || "Requested user";
  const otherUser = selectedConversation?.otherUser ?? null;
  const otherUserIsOnline = Boolean(otherUser?.isOnline);
  const otherUserIsTyping = Boolean(otherUser?.isTyping || typingUserId);

  const isOwnerViewingInquiries = Boolean(currentUser && productOwnerId && currentUser.id === productOwnerId);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-700">Loading chat...</div>;
  }

  if (isOwnerViewingInquiries) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-4">
              <Link
                href={`/dashboard/products/${productId}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600"
              >
                ←
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Inquiries</p>
                <h1 className="text-xl font-bold text-slate-900">Owner conversations</h1>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-3 px-3 pt-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Requested users</div>
              {conversations.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                  No inquiries yet.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const userName = conversation.otherUser?.userName || conversation.otherUser?.email || "Requested user";
                  const isActive = conversation.id === selectedConversation?.id;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setConversationId(conversation.id)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition ${
                        isActive
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <div className="text-sm font-semibold">{userName}</div>
                      <div className={`mt-1 text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                        Conversation started
                      </div>
                    </button>
                  );
                })
              )}
            </aside>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Request</div>
                <div className="mt-2 flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{selectedUserName}</h2>
                  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    otherUserIsOnline ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${otherUserIsOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {otherUserIsTyping ? "Typing..." : otherUserIsOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="max-h-[560px] min-h-[420px] overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="rounded-3xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                      No messages yet for this request.
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMine = message.senderId === currentUser?.id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-[26px] px-4 py-3 shadow-sm ${
                              isMine
                                ? "bg-slate-900 text-white"
                                : "bg-white text-slate-900"
                            }`}
                          >
                            <p className="text-sm leading-6">{message.content}</p>
                            <div
                              className={`mt-2 text-[11px] ${
                                isMine ? "text-slate-300" : "text-slate-400"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex gap-3">
                  <textarea
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      emitTypingStatus(event.target.value.trim().length > 0);
                    }}
                    onBlur={() => emitTypingStatus(false)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Reply to this inquiry..."
                    className="min-h-[72px] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    className="inline-flex h-[72px] items-center justify-center rounded-3xl bg-slate-900 px-5 text-sm font-semibold text-white"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/products/${productId}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-600"
            >
              ←
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Conversation</p>
              <h1 className="text-xl font-bold text-slate-900">Product owner</h1>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="max-h-[560px] min-h-[420px] overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                  No messages yet. Send the first message to start the conversation.
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.senderId === currentUser?.id;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-[26px] px-4 py-3 shadow-sm ${
                          isMine
                            ? "bg-slate-900 text-white"
                            : "bg-white text-slate-900"
                        }`}
                      >
                        <p className="text-sm leading-6">{message.content}</p>
                        <div
                          className={`mt-2 text-[11px] ${
                            isMine ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {formatTime(message.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex gap-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                placeholder="Type a message..."
                className="min-h-[72px] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="inline-flex h-[72px] items-center justify-center rounded-3xl bg-slate-900 px-5 text-sm font-semibold text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
