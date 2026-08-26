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

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "owner",
    text: "Hello! Yes, it's available. I just cleaned them and they are ready for the next user.",
    time: "10:32 AM",
  },
  {
    id: "2",
    sender: "renter",
    text: "Great! Does it come with the charging cable and the carry case?",
    time: "10:33 AM",
  },
  {
    id: "3",
    sender: "owner",
    text: "Yes, it includes the original hard-shell case and a USB-C cable. I can also include an aux cable if you need it for wired listening.",
    time: "10:35 AM",
  },
  {
    id: "4",
    sender: "renter",
    text: "That would be perfect. I'll be using it for a long flight. I'll place the booking now.",
    time: "10:36 AM",
  },
  {
    id: "5",
    sender: "owner",
    text: "Awesome! I'll confirm it immediately once I see it on my dashboard.",
    time: "10:37 AM",
  },
];

export default function ChatPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    setMessages((current) => [
      ...current,
      {
        id: `${current.length + 1}`,
        sender: "renter",
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/products/${productId}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Owner conversation</p>
              <h1 className="text-2xl font-bold text-slate-900">Chat with Marcus V.</h1>
              <p className="text-sm text-slate-500">Typically replies in under 1 hour.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block flex-col gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm shadow-sm sm:text-right">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</span>
              <span className="inline-flex items-center gap-2 font-semibold text-slate-900">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
            <button
              onClick={() => setShowSummary((s) => !s)}
              className="sm:hidden inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-semibold shadow-sm"
            >
              {showSummary ? 'Hide' : 'Summary'}
            </button>
          </div>
          
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-7">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 overflow-hidden rounded-3xl bg-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&q=80"
                    alt="Owner avatar"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Marcus V.</p>
                  <p className="text-xs text-slate-500">Owner • 100% response rate • Active 2 min ago</p>
                </div>
              </div>
            </div>

            <div className="flex min-h-[360px] sm:min-h-[520px] flex-col overflow-hidden bg-slate-50">
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isRenter = message.sender === "renter";
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isRenter ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] rounded-[28px] p-4 shadow-sm ${
                          isRenter
                            ? "bg-primary text-white rounded-br-[4px] rounded-tl-[28px] rounded-tr-[28px] rounded-bl-[28px]"
                            : "bg-white text-slate-900 rounded-bl-[4px] rounded-tr-[28px] rounded-tl-[28px] rounded-br-[28px]"
                        }`}>
                          <p className="text-sm leading-6">{message.text}</p>
                          <div className="mt-2 text-[11px] text-slate-400">{message.time}</div>
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

          <aside className={`${showSummary ? 'block' : 'hidden'} sm:block space-y-5 transition-all`}>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Booking summary</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span>Item</span>
                  <span className="font-semibold text-slate-900">Headphones</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span>Dates</span>
                  <span className="font-semibold text-slate-900">May 23 – 25</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span>Pickup method</span>
                  <span className="font-semibold text-slate-900">Self pickup</span>
                </div>
                <div className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <span>Owner</span>
                  <span className="font-semibold text-slate-900">Marcus V.</span>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Pro tip</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Confirm pickup details, cable preferences, and arrival time in this chat so the owner can prepare the headphones for you.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
