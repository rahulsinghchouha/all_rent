"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, nextStep, prevStep } from "@/app/store/listingSlice";

export default function LocationStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);

  const canProceed = draft.address.trim().length > 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Location & Delivery</h2>
        <p className="text-muted-foreground text-sm mt-1">Where can renters pick up or receive this item?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Address */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              </span>
              <input
                type="text"
                value={draft.address}
                onChange={(e) => dispatch(updateDraft({ address: e.target.value }))}
                placeholder="Search for address..."
                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">City / Area</label>
            <input
              type="text"
              value={draft.city}
              onChange={(e) => dispatch(updateDraft({ city: e.target.value }))}
              placeholder="e.g. San Francisco, CA"
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Map placeholder */}
          <div className="bg-muted rounded-2xl h-48 flex items-center justify-center border border-border">
            <div className="text-center text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-40">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <p className="text-xs font-semibold">Map Preview</p>
              <p className="text-[10px]">Will appear when address is set</p>
            </div>
          </div>

          {/* Privacy toggle */}
          <div className="flex items-center justify-between bg-muted/30 border border-border rounded-xl p-4">
            <div>
              <p className="text-xs font-bold text-accent">Hide Exact Address</p>
              <p className="text-[10px] text-muted-foreground">Show approximate area until booking is confirmed</p>
            </div>
            <button
              type="button"
              onClick={() => dispatch(updateDraft({ hideExactAddress: !draft.hideExactAddress }))}
              className={`w-10 h-6 rounded-full transition-all ${draft.hideExactAddress ? "bg-primary" : "bg-border"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-all ${draft.hideExactAddress ? "translate-x-5" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Delivery Options */}
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Delivery Option</label>
            <div className="grid grid-cols-3 gap-2">
              {(["pickup", "delivery", "both"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => dispatch(updateDraft({ deliveryOption: opt }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    draft.deliveryOption === opt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <div className="text-lg mb-1">
                    {opt === "pickup" ? "📍" : opt === "delivery" ? "🚚" : "📍🚚"}
                  </div>
                  <p className="text-xs font-bold capitalize">{opt}</p>
                </button>
              ))}
            </div>
          </div>

          {(draft.deliveryOption === "delivery" || draft.deliveryOption === "both") && (
            <div className="space-y-4 bg-muted/30 border border-border rounded-2xl p-5">
              <h4 className="text-xs font-bold text-accent uppercase tracking-widest">Delivery Settings</h4>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Delivery Radius (km)</label>
                <input
                  type="number"
                  value={draft.deliveryRadius}
                  onChange={(e) => dispatch(updateDraft({ deliveryRadius: e.target.value ? Number(e.target.value) : "" }))}
                  placeholder="e.g. 25"
                  className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Delivery Fee ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <input
                    type="number"
                    value={draft.deliveryFee}
                    onChange={(e) => dispatch(updateDraft({ deliveryFee: e.target.value ? Number(e.target.value) : "" }))}
                    placeholder="0.00"
                    className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Estimated Delivery Time</label>
                <input
                  type="text"
                  value={draft.estimatedDeliveryTime}
                  onChange={(e) => dispatch(updateDraft({ estimatedDeliveryTime: e.target.value }))}
                  placeholder="e.g. 1-2 hours"
                  className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}

          {(draft.deliveryOption === "pickup" || draft.deliveryOption === "both") && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Pickup Instructions</label>
              <textarea
                value={draft.pickupInstructions}
                onChange={(e) => dispatch(updateDraft({ pickupInstructions: e.target.value }))}
                placeholder="e.g. Ring buzzer #3, I'll meet you at the lobby..."
                rows={3}
                className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/60"
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button onClick={() => dispatch(nextStep())} disabled={!canProceed} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${canProceed ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          Next: Policies
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
