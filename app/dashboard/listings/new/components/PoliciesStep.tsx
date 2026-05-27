"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, nextStep, prevStep } from "@/app/store/listingSlice";

export default function PoliciesStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Policies & Add-ons</h2>
        <p className="text-muted-foreground text-sm mt-1">Set your rental terms, fees, and trust requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — Policies */}
        <div className="space-y-6">
          {/* Usage Rules */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Usage Rules</label>
            <textarea
              value={draft.usageRules}
              onChange={(e) => dispatch(updateDraft({ usageRules: e.target.value }))}
              placeholder="e.g. No smoking, handle with care, return cleaned..."
              rows={6}
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right — Trust */}
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
                  onClick={() => dispatch(updateDraft({ [item.key]: !draft[item.key] }))}
                  className={`w-10 h-6 rounded-full transition-all shrink-0 ${draft[item.key] ? "bg-primary" : "bg-border"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-all ${draft[item.key] ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button onClick={() => dispatch(nextStep())} className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30 transition-all">
          Next: Preview
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
