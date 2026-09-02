"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const ChatPage = dynamic(() => import("../chat/page").then((m) => m.default), { ssr: false });
const BookingPage = dynamic(() => import("../book/page").then((m) => m.default), { ssr: false });

export default function FlowPage() {
  const search = useSearchParams();
  const flowParam = search?.get("flow");

  const [flow, setFlow] = useState<string>(flowParam === "book" ? "book" : "chat");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Conversation & Booking</h1>
          <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm">
            <button
              onClick={() => setFlow("chat")}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                flow === "chat" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setFlow("book")}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition ${
                flow === "book" ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Booking
            </button>
          </div>
        </div>

        <div>
          {flow === "chat" ? (
            <ChatPage />
          ) : (
            <BookingPage />
          )}
        </div>
      </div>
    </div>
  );
}
