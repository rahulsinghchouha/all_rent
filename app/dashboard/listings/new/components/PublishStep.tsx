"use client";

import { useListingStore } from "@/app/store/listing.store";
import { useState } from "react";

type PublishOption = "now" | "schedule" | "approval" | "draft";

export default function PublishStep() {
  const { draft, updateDraft, prevStep, resetDraft } = useListingStore();
  const [selected, setSelected] = useState<PublishOption>("now");
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const PUBLISH_OPTIONS: { value: PublishOption; icon: string; label: string; desc: string }[] = [
    { value: "now", icon: "🚀", label: "Publish Now", desc: "Your listing goes live immediately and appears in search results." },
    { value: "schedule", icon: "📅", label: "Schedule Publish", desc: "Choose a future date and time for your listing to go live." },
    { value: "approval", icon: "✅", label: "Submit for Approval", desc: "Send to admin for review before publishing. Recommended for new owners." },
    { value: "draft", icon: "📝", label: "Save as Draft", desc: "Save and continue editing later from My Listings." },
  ];

  async function handlePublish() {
    setIsPublishing(true);

    // Simulate publish action (frontend only)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const statusMap: Record<PublishOption, typeof draft.status> = {
      now: "published",
      schedule: "scheduled",
      approval: "pending",
      draft: "draft",
    };

    updateDraft({ status: statusMap[selected] });
    setIsPublishing(false);
    setPublished(true);
  }

  if (published) {
    const statusMessages: Record<string, { icon: string; title: string; desc: string; color: string }> = {
      published: { icon: "🎉", title: "Listing Published!", desc: "Your listing is now live and visible to renters.", color: "text-green-600" },
      scheduled: { icon: "📅", title: "Listing Scheduled!", desc: `Your listing will go live on ${draft.publishDate || "the scheduled date"}.`, color: "text-blue-600" },
      pending: { icon: "⏳", title: "Submitted for Approval", desc: "An admin will review your listing. You'll be notified once approved.", color: "text-yellow-600" },
      draft: { icon: "📝", title: "Draft Saved!", desc: "You can find and edit this listing in My Listings anytime.", color: "text-muted-foreground" },
    };

    const msg = statusMessages[draft.status] || statusMessages.draft;

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="text-6xl mb-4">{msg.icon}</div>
          <h2 className={`text-3xl font-bold font-heading ${msg.color}`}>{msg.title}</h2>
          <p className="text-muted-foreground">{msg.desc}</p>

          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              {draft.images[0] && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <img src={draft.images[0].preview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-left">
                <p className="font-bold text-accent text-sm">{draft.title}</p>
                <p className="text-xs text-muted-foreground">{draft.category} · ${typeof draft.pricePerDay === "number" ? draft.pricePerDay : 0}/day</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <a href="/dashboard" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
              Go to Dashboard
            </a>
            <button
              onClick={() => { resetDraft(); setPublished(false); }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              Create Another Listing
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Publish Your Listing</h2>
        <p className="text-muted-foreground text-sm mt-1">Choose how you'd like to publish your listing.</p>
      </div>

      {/* Publish options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
        {PUBLISH_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelected(opt.value)}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              selected === opt.value
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border hover:border-primary/30"
            }`}
          >
            <div className="text-2xl mb-2">{opt.icon}</div>
            <p className="font-bold text-accent text-sm">{opt.label}</p>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Schedule date picker */}
      {selected === "schedule" && (
        <div className="max-w-sm space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Schedule Date & Time</label>
          <input
            type="datetime-local"
            value={draft.publishDate}
            onChange={(e) => updateDraft({ publishDate: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      )}

      {/* Summary */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 max-w-3xl">
        <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Listing Summary</h3>
        <div className="flex items-start gap-4">
          {draft.images[0] && (
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border">
              <img src={draft.images[0].preview} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-0">
            <p className="font-bold text-accent truncate">{draft.title || "Untitled"}</p>
            <p className="text-xs text-muted-foreground">{draft.category || "No category"}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
              <span>💰 ${typeof draft.pricePerDay === "number" ? draft.pricePerDay : "—"}/day</span>
              <span>📷 {draft.images.length} photo{draft.images.length !== 1 ? "s" : ""}</span>
              <span>📍 {draft.address || "No address"}</span>
              <span>📋 {draft.cancellationPolicy} policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Preview
        </button>
        <button
          onClick={handlePublish}
          disabled={isPublishing || (selected === "schedule" && !draft.publishDate)}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${
            isPublishing
              ? "bg-primary/70 text-white cursor-wait"
              : "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30"
          }`}
        >
          {isPublishing ? (
            <>
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              Publishing...
            </>
          ) : (
            <>
              {selected === "draft" ? "Save Draft" : selected === "schedule" ? "Schedule" : selected === "approval" ? "Submit for Approval" : "Publish Now"}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
