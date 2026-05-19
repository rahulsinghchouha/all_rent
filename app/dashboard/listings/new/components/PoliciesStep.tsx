"use client";

import { useListingStore, type AddOn } from "@/app/store/listing.store";
import { useState } from "react";

const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible", desc: "Full refund up to 24 hours before rental starts." },
  { value: "moderate", label: "Moderate", desc: "Full refund up to 5 days before. 50% after that." },
  { value: "strict", label: "Strict", desc: "50% refund up to 7 days before. No refund after." },
  { value: "custom", label: "Custom", desc: "Write your own cancellation policy." },
] as const;

export default function PoliciesStep() {
  const { draft, updateDraft, nextStep, prevStep } = useListingStore();
  const [addOnName, setAddOnName] = useState("");
  const [addOnPrice, setAddOnPrice] = useState("");

  function addAddOn() {
    const name = addOnName.trim();
    const price = Number(addOnPrice);
    if (name && price >= 0) {
      const newAddOn: AddOn = { id: `${Date.now()}`, name, price, enabled: true };
      updateDraft({ addOns: [...draft.addOns, newAddOn] });
      setAddOnName("");
      setAddOnPrice("");
    }
  }

  function removeAddOn(id: string) {
    updateDraft({ addOns: draft.addOns.filter((a) => a.id !== id) });
  }

  function toggleAddOn(id: string) {
    updateDraft({
      addOns: draft.addOns.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Policies & Add-ons</h2>
        <p className="text-muted-foreground text-sm mt-1">Set your rental terms, fees, and trust requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Policies */}
        <div className="space-y-6">
          {/* Cancellation */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Cancellation Policy</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CANCELLATION_POLICIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => updateDraft({ cancellationPolicy: p.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    draft.cancellationPolicy === p.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="text-sm font-bold text-accent">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
                </button>
              ))}
            </div>

            {draft.cancellationPolicy === "custom" && (
              <textarea
                value={draft.customCancellationText}
                onChange={(e) => updateDraft({ customCancellationText: e.target.value })}
                placeholder="Describe your custom cancellation policy..."
                rows={3}
                className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/60"
              />
            )}
          </div>

          {/* Deposit */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Deposit Charge Type</label>
            <div className="flex gap-2">
              {(["hold", "immediate"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateDraft({ depositChargeType: type })}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                    draft.depositChargeType === type
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <p className="text-xs font-bold capitalize">{type === "hold" ? "Hold Only" : "Charge Immediately"}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {type === "hold" ? "Auth hold, refunded after rental" : "Charged upfront, refunded per policy"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Usage Rules */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Usage Rules</label>
            <textarea
              value={draft.usageRules}
              onChange={(e) => updateDraft({ usageRules: e.target.value })}
              placeholder="e.g. No smoking, handle with care, return cleaned..."
              rows={3}
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right — Trust & Add-ons */}
        <div className="space-y-6">
          {/* Trust & Safety */}
          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-accent font-heading text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Trust & Safety
            </h3>

            {[
              { key: "requireIdVerification" as const, label: "Require ID Verification", desc: "Renters must verify their identity" },
              { key: "requireSecurityDeposit" as const, label: "Require Security Deposit", desc: "Collect deposit before rental" },
              { key: "requireRenterReviews" as const, label: "Require Renter Reviews", desc: "Only renters with reviews can book" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold text-accent">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateDraft({ [item.key]: !draft[item.key] })}
                  className={`w-10 h-6 rounded-full transition-all shrink-0 ${draft[item.key] ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-all ${draft[item.key] ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Add-ons */}
          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-accent font-heading text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              Fees & Add-ons
            </h3>

            {/* Existing add-ons */}
            {draft.addOns.length > 0 && (
              <div className="space-y-2">
                {draft.addOns.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-border">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleAddOn(addon.id)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${addon.enabled ? "bg-primary border-primary" : "border-border"}`}>
                        {addon.enabled && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                      <span className={`text-sm font-semibold ${addon.enabled ? "text-accent" : "text-muted-foreground line-through"}`}>{addon.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-accent">${addon.price}</span>
                      <button onClick={() => removeAddOn(addon.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="flex gap-2">
              <input
                type="text"
                value={addOnName}
                onChange={(e) => setAddOnName(e.target.value)}
                placeholder="e.g. Cleaning fee"
                className="flex-1 bg-white border-none rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-muted-foreground/60"
              />
              <div className="relative w-24">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">$</span>
                <input
                  type="number"
                  value={addOnPrice}
                  onChange={(e) => setAddOnPrice(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full bg-white border-none rounded-xl pl-7 pr-2 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <button onClick={addAddOn} className="px-3 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/80 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              </button>
            </div>

            <p className="text-[10px] text-muted-foreground">Add optional fees like cleaning, insurance, setup, or extra accessories.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30 transition-all">
          Next: Preview
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
