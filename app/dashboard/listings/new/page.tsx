"use client";

import Link from "next/link";
import { useListingStore } from "@/app/store/listing.store";
import StepIndicator from "./components/StepIndicator";
import ImageUploadStep from "./components/ImageUploadStep";
import ProductDetailsStep from "./components/ProductDetailsStep";
import AvailabilityStep from "./components/AvailabilityStep";
import LocationStep from "./components/LocationStep";
import PoliciesStep from "./components/PoliciesStep";
import PreviewStep from "./components/PreviewStep";
import PublishStep from "./components/PublishStep";

function StepContent({ step }: { step: number }) {
  switch (step) {
    case 1: return <ImageUploadStep />;
    case 2: return <ProductDetailsStep />;
    case 3: return <AvailabilityStep />;
    case 4: return <LocationStep />;
    case 5: return <PoliciesStep />;
    case 6: return <PreviewStep />;
    case 7: return <PublishStep />;
    default: return null;
  }
}

export default function NewListingPage() {
  const { currentStep, draft, updateDraft } = useListingStore();

  // Auto-save toast simulation
  const handleSaveDraft = () => {
    updateDraft({ status: "draft" });
    // In production, this would call an API
    alert("Draft saved successfully!");
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm font-heading">RF</span>
              </div>
              <span className="font-bold text-accent text-lg font-heading hidden sm:block">Rental Flow</span>
            </Link>

            {/* Page title */}
            <div className="flex-1 text-center hidden md:block">
              <h1 className="text-sm font-bold text-accent font-heading">Create New Listing</h1>
              <p className="text-[10px] text-muted-foreground">
                {draft.title ? draft.title : "Untitled listing"} · {draft.status === "draft" ? "Draft" : draft.status}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted border border-border"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span className="hidden sm:inline">Save Draft</span>
              </button>
              <Link
                href="/dashboard"
                className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-accent"
                title="Exit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="container mx-auto px-4 max-w-5xl py-8">
        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator />
        </div>

        {/* Step Content */}
        <div className="min-h-[500px]">
          <StepContent step={currentStep} />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#111827] text-white/60 py-6 mt-16">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">RF</span>
            </div>
            <span className="text-white font-semibold font-heading">Rental Flow</span>
          </div>
          <p>© 2026 RentalFlow Inc.</p>
        </div>
      </footer>
    </div>
  );
}
