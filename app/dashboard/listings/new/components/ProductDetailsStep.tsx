"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateDraft, nextStep, prevStep } from "@/app/store/listingSlice";
import { useState } from "react";

const CATEGORIES = [
  "Electronics", "Photography", "Sports", "Power Tools",
  "Luxury Wear", "Adventure", "Vehicles", "Musical Instruments",
  "Home & Garden", "Party & Events", "Other",
];

const CONDITIONS = [
  { value: "new", label: "Brand New", desc: "Never used, sealed" },
  { value: "like-new", label: "Like New", desc: "Used once or twice" },
  { value: "good", label: "Good", desc: "Minor signs of use" },
  { value: "fair", label: "Fair", desc: "Visible wear, fully functional" },
];

export default function ProductDetailsStep() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.listing.draft);
  const [tagInput, setTagInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [touched, setTouched] = useState({ title: false, category: false, pricePerDay: false });

  function handleBlur(field: string) {
    setTouched((p) => ({ ...p, [field]: true }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !draft.tags.includes(tag) && draft.tags.length < 10) {
      dispatch(updateDraft({ tags: [...draft.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    dispatch(updateDraft({ tags: draft.tags.filter((t) => t !== tag) }));
  }

  const isTitleValid = draft.title.trim().length >= 5 && draft.title.trim().length <= 80;
  const isCategoryValid = draft.category !== "";
  const isPriceValid = typeof draft.pricePerDay === "number" && draft.pricePerDay > 0;
  const canProceed = isTitleValid && isCategoryValid && isPriceValid;

  // Price preview helper
  const dailyPrice = typeof draft.pricePerDay === "number" ? draft.pricePerDay : 0;
  const weeklyDiscount = typeof draft.weeklyDiscount === "number" ? draft.weeklyDiscount : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-accent font-heading">Product Details</h2>
        <p className="text-muted-foreground text-sm mt-1">Tell renters about your item.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — Main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => dispatch(updateDraft({ title: e.target.value }))}
              onBlur={() => handleBlur("title")}
              placeholder="e.g. Sony Alpha a7 IV Mirrorless Camera"
              maxLength={80}
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
            />
            <div className="flex justify-between">
              {touched.title && !isTitleValid && (
                <p className="text-[10px] text-red-500 font-medium">Title must be 5–80 characters.</p>
              )}
              <p className="text-[10px] text-muted-foreground ml-auto">{draft.title.length}/80</p>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => dispatch(updateDraft({ category: cat }))}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    draft.category === cat
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {touched.category && !isCategoryValid && (
              <p className="text-[10px] text-red-500 font-medium">Please select a category.</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Description
            </label>
            <textarea
              value={draft.description}
              onChange={(e) => dispatch(updateDraft({ description: e.target.value }))}
              placeholder="Describe your item in detail — condition, what's included, any instructions..."
              rows={4}
              className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60 resize-none"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Condition
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => dispatch(updateDraft({ condition: c.value }))}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    draft.condition === c.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="text-xs font-bold text-accent">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Tags <span className="text-muted-foreground">(up to 10)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
                className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/80 transition-colors"
              >
                Add
              </button>
            </div>
            {draft.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {draft.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Pricing */}
        <div className="space-y-5">
          <div className="bg-muted/30 border border-border rounded-2xl p-5 space-y-5">
            <h3 className="font-bold text-accent font-heading flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Pricing
            </h3>

            {/* Price per day */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
                Price Per Day <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <input
                  type="number"
                  value={draft.pricePerDay}
                  onChange={(e) => dispatch(updateDraft({ pricePerDay: e.target.value ? Number(e.target.value) : "" }))}
                  onBlur={() => handleBlur("pricePerDay")}
                  placeholder="0.00"
                  min="1"
                  className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              {touched.pricePerDay && !isPriceValid && (
                <p className="text-[10px] text-red-500 font-medium">Price per day is required.</p>
              )}
            </div>

            {/* Deposit toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-accent">Security Deposit</label>
              <button
                type="button"
                onClick={() => dispatch(updateDraft({ depositEnabled: !draft.depositEnabled }))}
                className={`w-10 h-6 rounded-full transition-all ${
                  draft.depositEnabled ? "bg-primary" : "bg-border"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-all ${
                  draft.depositEnabled ? "translate-x-5" : "translate-x-1"
                }`} />
              </button>
            </div>

            {draft.depositEnabled && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                <input
                  type="number"
                  value={draft.deposit}
                  onChange={(e) => dispatch(updateDraft({ deposit: e.target.value ? Number(e.target.value) : "" }))}
                  placeholder="Deposit amount"
                  className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                />
              </div>
            )}

            {/* Advanced pricing toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full text-left text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${showAdvanced ? "rotate-90" : ""}`}>
                <path d="m9 18 6-6-6-6" />
              </svg>
              Advanced Pricing
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Hourly Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <input type="number" value={draft.hourlyRate} onChange={(e) => dispatch(updateDraft({ hourlyRate: e.target.value ? Number(e.target.value) : "" }))} placeholder="0.00" className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Weekend Rate</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <input type="number" value={draft.weekendRate} onChange={(e) => dispatch(updateDraft({ weekendRate: e.target.value ? Number(e.target.value) : "" }))} placeholder="0.00" className="w-full bg-white border-none rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Weekly Discount (%)</label>
                  <input type="number" value={draft.weeklyDiscount} onChange={(e) => dispatch(updateDraft({ weeklyDiscount: e.target.value ? Number(e.target.value) : "" }))} placeholder="0" min="0" max="100" className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Minimum Rental (days)</label>
                  <input type="number" value={draft.minRentalDays} onChange={(e) => dispatch(updateDraft({ minRentalDays: e.target.value ? Number(e.target.value) : "" }))} placeholder="1" min="1" className="w-full bg-white border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60" />
                </div>
              </div>
            )}

            {/* Live price preview */}
            {dailyPrice > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Price Preview</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">1 day</span><span className="font-bold text-accent">${dailyPrice}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">3 days</span><span className="font-bold text-accent">${dailyPrice * 3}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">7 days</span>
                    <span className="font-bold text-accent">
                      ${Math.round(dailyPrice * 7 * (1 - weeklyDiscount / 100))}
                      {weeklyDiscount > 0 && <span className="text-primary text-xs ml-1">(-{weeklyDiscount}%)</span>}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={() => dispatch(prevStep())} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-accent hover:bg-muted transition-colors border border-border">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back
        </button>
        <button onClick={() => dispatch(nextStep())} disabled={!canProceed} className={`flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all ${canProceed ? "bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-100 shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>
          Next: Availability
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
