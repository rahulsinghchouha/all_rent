"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { nextStep, prevStep, setStep } from "@/app/store/listingSlice";

export default function PreviewStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);

  const coverImage = draft.images.find((img) => img.isCover) || draft.images[0];
  const dailyPrice = typeof draft.pricePerDay === "number" ? draft.pricePerDay : 0;
  const deposit = typeof draft.deposit === "number" ? draft.deposit : 0;

  // Validation checks
  const issues: string[] = [];
  if (draft.images.length === 0) issues.push("At least 1 image required");
  if (draft.title.trim().length < 5) issues.push("Title must be at least 5 characters");
  if (!draft.category) issues.push("Category is required");
  if (!dailyPrice || dailyPrice <= 0) issues.push("Price per day is required");
  if (draft.address.trim().length < 4) issues.push("Address is required");

  const canPublish = issues.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-accent font-heading">Preview Listing</h2>
          <p className="text-muted-foreground text-sm mt-1">Review how your listing will appear to renters.</p>
        </div>
        {!canPublish && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2">
            <p className="text-xs font-bold text-destructive">{issues.length} issue{issues.length > 1 ? "s" : ""} to fix</p>
          </div>
        )}
      </div>

      {/* Validation errors */}
      {!canPublish && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-destructive uppercase tracking-widest">Missing Requirements</p>
          {issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
              {issue}
            </div>
          ))}
        </div>
      )}

      {/* Preview Card */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-lg max-w-4xl mx-auto">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 bg-muted overflow-hidden">
          {coverImage ? (
            <img src={coverImage.preview} alt={draft.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <p className="text-sm font-semibold">No images uploaded</p>
            </div>
          )}
          {/* Image count badge */}
          {draft.images.length > 1 && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              📷 {draft.images.length} photos
            </span>
          )}
        </div>

        {/* Image thumbnails */}
        {draft.images.length > 1 && (
          <div className="flex gap-1 p-2 overflow-x-auto">
            {draft.images.slice(0, 5).map((img) => (
              <div key={img.id} className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 ${img.isCover ? "border-primary" : "border-transparent"}`}>
                <img src={img.preview} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {draft.images.length > 5 && (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                +{draft.images.length - 5}
              </div>
            )}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Title & Category */}
          <div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{draft.category || "Uncategorized"}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-accent font-heading mt-1">
              {draft.title || "Untitled Listing"}
            </h3>
          </div>

          {/* Owner card */}
          <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">R</div>
            <div>
              <p className="text-sm font-bold text-accent">Your Name</p>
              <p className="text-[10px] text-muted-foreground">Member since 2026</p>
            </div>
            <span className="ml-auto bg-green-50 text-green-600 text-[10px] font-bold px-2 py-1 rounded-full">✓ Verified</span>
          </div>

          {/* Price & Deposit */}
          <div className="flex items-end gap-4 pb-4 border-b border-border">
            <div>
              <span className="text-3xl font-bold text-accent">${dailyPrice || "—"}</span>
              <span className="text-sm text-muted-foreground">/day</span>
            </div>
            {draft.depositEnabled && deposit > 0 && (
              <span className="text-sm text-muted-foreground">+ ${deposit} deposit</span>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Condition</p>
              <p className="text-sm font-bold text-accent mt-1 capitalize">{draft.condition.replace("-", " ")}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Delivery</p>
              <p className="text-sm font-bold text-accent mt-1 capitalize">{draft.deliveryOption}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quantity</p>
              <p className="text-sm font-bold text-accent mt-1">{draft.quantity}</p>
            </div>
          </div>

          {/* Description */}
          {draft.description && (
            <div>
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{draft.description}</p>
            </div>
          )}

          {/* Tags */}
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.tags.map((tag) => (
                <span key={tag} className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}

          {/* Location */}
          {draft.address && (
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              <div>
                <p className="text-sm font-semibold text-accent">{draft.hideExactAddress ? "Approximate area" : draft.address}</p>
                {draft.city && <p className="text-xs text-muted-foreground">{draft.city}</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit shortcuts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {["Images", "Details", "Availability", "Location", "Policies"].map((label, i) => (
          <button
            key={label}
            onClick={() => dispatch(setStep(i + 1))}
            className="text-xs font-semibold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full transition-colors hover:bg-primary/10"
          >
            ✏️ Edit {label}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button
          onClick={() => dispatch(nextStep())}
          disabled={!canPublish}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${
            canPublish
              ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Next: Publish
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
