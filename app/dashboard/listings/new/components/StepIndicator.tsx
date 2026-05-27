"use client";

import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { setStep, TOTAL_STEPS } from "@/app/store/listingSlice";

const STEP_LABELS = [
  "Images",
  "Details",
  "Availability",
  "Location",
  "Policies",
  "Preview",
  "Publish",
];

// Steps that require basic details to be able to submit/publish
// (navigation is always free, but submission is blocked)
const REQUIRES_DETAILS_STEPS = [7];

export default function StepIndicator({ canPublish }: { canPublish: boolean }) {
  const dispatch = useAppDispatch();
  const currentStep = useAppSelector((s) => s.listing.currentStep);

  return (
    <div className="w-full">
      {/* Desktop indicator */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        {/* Active progress line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />

        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const needsDetails = REQUIRES_DETAILS_STEPS.includes(step) && !canPublish;
          return (
            <button
              key={label}
              onClick={() => dispatch(setStep(step))}
              title={
                needsDetails
                  ? "Fill in required details (title, category, price, address, image) to publish"
                  : label
              }
              className="flex flex-col items-center gap-2 relative z-10 group cursor-pointer"
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-primary border-primary text-white"
                      : isActive
                      ? "bg-white border-primary text-primary shadow-lg shadow-primary/20"
                      : "bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-primary/70"
                  }`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {/* Lock badge for steps that need details to submit */}
                {needsDetails && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 border border-white rounded-full flex items-center justify-center"
                    title="Requires basic details to publish"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
                  isActive ? "text-primary" : isCompleted ? "text-accent" : "text-muted-foreground group-hover:text-primary/70"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
          <span className="text-xs font-semibold text-accent">
            {STEP_LABELS[currentStep - 1]}
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        {/* Mobile: scrollable step pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {STEP_LABELS.map((label, i) => {
            const step = i + 1;
            const isActive = step === currentStep;
            const needsDetails = REQUIRES_DETAILS_STEPS.includes(step) && !canPublish;
            return (
              <button
                key={label}
                onClick={() => dispatch(setStep(step))}
                className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {needsDetails && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {step}. {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
