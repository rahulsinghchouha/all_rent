"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, prevStep, resetDraft } from "@/app/store/listingSlice";
import { fetchWithAuth } from "@/app/lib/fetcher";
import { useState } from "react";

type PublishOption = "now" | "schedule" | "draft";

export default function PublishStep({ canPublish }: { canPublish: boolean }) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);
  const [selected, setSelected] = useState<PublishOption>("now");
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const PUBLISH_OPTIONS: { value: PublishOption; icon: string; label: string; desc: string }[] = [
    { value: "now", icon: "🚀", label: "Publish Now", desc: "Your listing goes live immediately and appears in search results." },
    { value: "schedule", icon: "📅", label: "Schedule Publish", desc: "Choose a future date and time for your listing to go live." },
    { value: "draft", icon: "📝", label: "Save as Draft", desc: "Save and continue editing later from My Listings." },
  ];

  async function uploadImages(): Promise<string[]> {
    const files = draft.images.filter((img) => img.file);
    if (!files.length) return [];

    const formData = new FormData();
    files.forEach((img) => {
      formData.append("images", img.file as File, img.file.name || img.id);
    });

    const response = await fetchWithAuth("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error || "Image upload failed.");
    }

    return result.data.map((item: { url: string }) => item.url);
  }

  async function handlePublish() {
    setIsPublishing(true);
    setServerError("");

    const statusMap: Record<PublishOption, typeof draft.status> = {
      now: "published",
      schedule: "scheduled",
      draft: "draft",
    };

    const uploadedUrls = await uploadImages();
    const localImageMap = new Map(
      draft.images
        .filter((img) => img.file)
        .map((img, index) => [img.id, uploadedUrls[index]])
    );

    const imageUrls = draft.images.map((img) => {
      if (img.file) {
        return localImageMap.get(img.id) ?? img.preview;
      }
      if (img.preview.startsWith("blob:")) {
        throw new Error("Unable to publish image: missing upload data for a local image.");
      }
      return img.preview;
    });

    const productPayload = {
      title: draft.title,
      category: draft.category,
      pricePerDay: Number(draft.pricePerDay),
      description: draft.description,
      condition: draft.condition,
      tags: draft.tags,
      deposit: typeof draft.deposit === "number" ? draft.deposit : undefined,
      depositEnabled: draft.depositEnabled,
      hourlyRate: typeof draft.hourlyRate === "number" ? draft.hourlyRate : undefined,
      minRentalDays: typeof draft.minRentalDays === "number" ? draft.minRentalDays : undefined,
      pricingRules: draft.pricingRules,
      availableRanges: draft.availableRanges,
      quantity: draft.quantity,
      maxConcurrent: draft.maxConcurrent,
      bufferDays: draft.bufferDays,
      address: draft.address,
      googleMapsAddress: draft.googleMapsAddress,
      city: draft.city,
      deliveryOption: draft.deliveryOption,
      deliveryRadius: typeof draft.deliveryRadius === "number" ? draft.deliveryRadius : undefined,
      deliveryFee: typeof draft.deliveryFee === "number" ? draft.deliveryFee : undefined,
      estimatedDeliveryTime: draft.estimatedDeliveryTime,
      pickupInstructions: draft.pickupInstructions,
      cancellationPolicy: draft.cancellationPolicy,
      customCancellationText: draft.customCancellationText,
      depositChargeType: draft.depositChargeType,
      requireIdVerification: draft.requireIdVerification,
      requireSecurityDeposit: draft.requireSecurityDeposit,
      requireRenterReviews: draft.requireRenterReviews,
      usageRules: draft.usageRules,
      addOns: draft.addOns,
      status: statusMap[selected],
      publishDate: selected === "schedule" ? draft.publishDate || undefined : undefined,
      imageUrls,
    };

    try {
      const response = await fetchWithAuth("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const result = await response.json();
      if (!response.ok) {
        setServerError(result?.error || "Could not save listing.");
        setIsPublishing(false);
        return;
      }

      dispatch(updateDraft({ status: statusMap[selected] }));
      setPublished(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setServerError(error.message || "Failed to save listing.");
      } else {
        setServerError("Failed to save listing.");
      }
    } finally {
      setIsPublishing(false);
    }
  }

  if (published) {
    const statusMessages: Record<string, { icon: string; title: string; desc: string; color: string }> = {
      published: { icon: "🎉", title: "Listing Published!", desc: "Your listing is now live and visible to renters.", color: "text-green-600" },
      scheduled: { icon: "📅", title: "Listing Scheduled!", desc: `Your listing will go live on ${draft.publishDate || "the scheduled date"}.`, color: "text-blue-600" },
      draft: { icon: "📝", title: "Draft Saved!", desc: "You can find and edit this listing in My Listings anytime.", color: "text-muted-foreground" },
    };

    const msg = statusMessages[draft.status] || statusMessages.draft;

    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center max-w-md mx-auto space-y-6">
          <div className="text-6xl mb-4">{msg.icon}</div>
          <h2 className={`text-3xl font-bold font-heading ${msg.color}`}>{msg.title}</h2>
          <p className="text-muted-foreground">{msg.desc}</p>

          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              {draft.images[0] && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
              onClick={() => { dispatch(resetDraft()); setPublished(false); }}
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
        <p className="text-muted-foreground text-sm mt-1">Choose how you want to publish your listing.</p>
      </div>
      { !canPublish && (
        <p className="text-sm text-red-500 mb-4">Please fill all required details before publishing.</p>
      ) }
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
            onChange={(e) => dispatch(updateDraft({ publishDate: e.target.value }))}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      )}

      {serverError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Summary */}
      <div className="bg-muted/30 border border-border rounded-2xl p-5 max-w-3xl">
        <h3 className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Listing Summary</h3>
        <div className="flex items-start gap-4">
          {draft.images[0] && (
            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Preview
        </button>
        <button
          onClick={handlePublish}
          disabled={isPublishing || (selected === "schedule" && !draft.publishDate) || !canPublish}
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
              {selected === "draft" ? "Save Draft" : selected === "schedule" ? "Schedule" : "Publish Now"}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
