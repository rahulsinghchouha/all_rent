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

export default function StepIndicator() {
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
          return (
            <button
              key={label}
              onClick={() => step <= currentStep && dispatch(setStep(step))}
              className="flex flex-col items-center gap-2 relative z-10 group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-white"
                    : isActive
                    ? "bg-white border-primary text-primary shadow-lg shadow-primary/20"
                    : "bg-white border-border text-muted-foreground"
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
              <span
                className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
                  isActive ? "text-primary" : isCompleted ? "text-accent" : "text-muted-foreground"
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
      </div>
    </div>
  );
}
