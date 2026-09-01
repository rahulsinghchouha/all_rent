/**
 * Chat Page Component
 * 
 * Features:
 * - Owner views list of users who inquired about their product
 * - Click on a user to open their conversation
 * - Send/receive messages with inquiring users
 * - Each user has their own chat thread with message history
 * - Shows user online/offline status and response rate
 * 
 * Frontend only - uses mock data for 3 dummy users and message threads
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  sender: "owner" | "renter";
  text: string;
  time: string;
};

type ChatUser = {
  id: string;
  name: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage: string;
  lastMessageTime: string;
  responseRate: number;
};

// Mock data: 3 users who inquired about the product
const dummyUsers: ChatUser[] = [
  {
    id: "user1",
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    status: "online",
    lastMessage: "Does it work with all devices?",
    lastMessageTime: "2 min ago",
    responseRate: 95,
  },
  {
    id: "user2",
    name: "Alex Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    status: "online",
    lastMessage: "Can I book for next weekend?",
    lastMessageTime: "15 min ago",
    responseRate: 100,
  },
  {
    id: "user3",
    name: "Maria Garcia",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    status: "offline",
    lastMessage: "Thanks for the quick response!",
    lastMessageTime: "1 hour ago",
    responseRate: 88,
  },
];

// Mock message threads for each user - indexed by user ID
const chatMessages: Record<string, Message[]> = {
  user1: [
    {
      id: "1",
      sender: "renter",
      text: "Hello! Is this product still available?",
      time: "9:15 AM",
    },
    {
      id: "2",
      sender: "owner",
      text: "Yes, absolutely! It's in great condition.",
      time: "9:20 AM",
    },
    {
      id: "3",
      sender: "renter",
      text: "Does it work with all devices?",
      time: "9:22 AM",
    },
  ],
  user2: [
    {
      id: "1",
      sender: "renter",
      text: "Hi! Love your product listing!",
      time: "10:00 AM",
    },
    {
      id: "2",
      sender: "owner",
      text: "Thank you! Happy to help with any questions.",
      time: "10:05 AM",
    },
    {
      id: "3",
      sender: "renter",
      text: "Can I book for next weekend?",
      time: "10:10 AM",
    },
    {
      id: "4",
      sender: "owner",
      text: "Yes, next weekend is available! When exactly?",
      time: "10:12 AM",
    },
  ],
  user3: [
    {
      id: "1",
      sender: "renter",
      text: "Hi, interested in renting this!",
      time: "8:30 AM",
    },
    {
      id: "2",
      sender: "owner",
      text: "Great! Let me know the dates you need.",
      time: "8:35 AM",
    },
    {
      id: "3",
      sender: "renter",
      text: "May 25-27 would work for me",
      time: "8:40 AM",
    },
    {
      id: "4",
      sender: "owner",
      text: "Perfect! That's available.",
      time: "8:42 AM",
    },
    {
      id: "5",
      sender: "renter",
      text: "Thanks for the quick response!",
      time: "8:45 AM",
    },
  ],
};

export default function ChatPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setMessages(chatMessages[userId] || []);
    setDraft("");
  };

  const handleBackToUserList = () => {
    setSelectedUserId(null);
    setDraft("");
  };

  const selectedUser = dummyUsers.find((u) => u.id === selectedUserId);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      {
        id: `${current.length + 1}`,
        sender: "owner",
        text: trimmed,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setDraft("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // Show chat interface if user is selected
  if (selectedUserId && selectedUser) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToUserList}
                className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Inquiry from</p>
                <h1 className="text-2xl font-bold text-slate-900">Chat with {selectedUser.name}</h1>
                <p className="text-sm text-slate-500">{selectedUser.responseRate}% response rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block flex-col gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm shadow-sm sm:text-right">
                <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</span>
                <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
                  <span className={`h-2.5 w-2.5 rounded-full ${selectedUser.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {selectedUser.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <button
                onClick={() => setShowSummary((s) => !s)}
                className="sm:hidden inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold shadow-sm"
              >
                {showSummary ? "Hide" : "Summary"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-7">
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-3xl bg-slate-200">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="h-full w-full object-cover"
                    />
                    <span className={`absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-white ${selectedUser.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedUser.name}</p>
                    <p className="text-xs text-slate-500">{selectedUser.responseRate}% response rate • {selectedUser.status === "online" ? "Active now" : "Inactive"}</p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[360px] sm:min-h-[520px] flex-col overflow-hidden bg-slate-50">
                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwner = message.sender === "owner";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwner ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[85%] rounded-[28px] p-4 shadow-sm ${
                            isOwner
                              ? "bg-primary text-white rounded-br-[4px] rounded-tl-[28px] rounded-tr-[28px] rounded-bl-[28px]"
                              : "bg-white text-slate-900 rounded-bl-[4px] rounded-tr-[28px] rounded-tl-[28px] rounded-br-[28px]"
                          }`}>
                            <p className="text-sm leading-6">{message.text}</p>
                            <div className={`mt-2 text-[11px] ${isOwner ? "text-white/70" : "text-slate-400"}`}>
                              {message.time}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label htmlFor="chat-input" className="sr-only">
                      Write a message
                    </label>
                    <textarea
                      id="chat-input"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your message..."
                      rows={2}
                      className="min-h-[72px] w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 touch-manipulation"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="inline-flex h-12 shrink-0 items-center justify-center rounded-3xl bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <aside className={`${showSummary ? "block" : "hidden"} sm:block space-y-5 transition-all`}>
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Inquiry Details</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                    <span>Customer</span>
                    <span className="font-semibold text-slate-900">{selectedUser.name}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                    <span>Status</span>
                    <span className="font-semibold text-slate-900 capitalize">{selectedUser.status}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                    <span>Response Rate</span>
                    <span className="font-semibold text-slate-900">{selectedUser.responseRate}%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                    <span>Last Message</span>
                    <span className="font-semibold text-slate-900">{selectedUser.lastMessageTime}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Pro tip</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Respond quickly to increase chances of booking. Share additional details, availability, and pricing to help customers decide.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Show users list if no user is selected
  // Display all inquiries from users interested in this product
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Link
            href={`/dashboard/products/${productId}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Product Inquiries</h1>
            <p className="text-sm text-slate-500">You have {dummyUsers.length} pending inquiries</p>
          </div>
        </div>

        <div className="space-y-3">
          {dummyUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.id)}
              className="w-full rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary hover:shadow-md hover:bg-slate-50"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-3xl bg-slate-200">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                  <span className={`absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-white ${user.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                      user.status === "online"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === "online" ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {user.status === "online" ? "Online" : "Offline"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-1">{user.lastMessage}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{user.lastMessageTime}</span>
                    <span className="text-xs font-medium text-slate-600">{user.responseRate}% response rate</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
