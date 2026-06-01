import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ── Shared Types ─────────────────────────────────────────────── */

export interface ImageFile {
  id: string;
  file?: File;
  preview: string;
  isCover: boolean;
}

export interface PricingRule {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  price: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  enabled: boolean;
}

export interface ListingDraft {
  // Step 1 — Images
  images: ImageFile[];

  // Step 2 — Product Details
  title: string;
  category: string;
  description: string;
  condition: string;
  tags: string[];
  pricePerDay: number | "";
  deposit: number | "";
  depositEnabled: boolean;
  hourlyRate: number | "";
  // weekendRate removed
  // weeklyDiscount removed
  minRentalDays: number | "";
  pricingRules: PricingRule[];

  // Step 3 — Availability
  availableRanges: { start: string; end: string }[];
  quantity: number;
  maxConcurrent: number;
  bufferDays: number;

  // Step 4 — Location & Delivery
  address: string;
  googleMapsAddress?: string;
  city: string;
  deliveryOption: "pickup" | "delivery" | "both";
  deliveryRadius: number | "";
  deliveryFee: number | "";
  estimatedDeliveryTime: string;
  pickupInstructions: string;
  

  // Step 5 — Policies
  cancellationPolicy: "flexible" | "moderate" | "strict" | "custom";
  customCancellationText: string;
  depositChargeType: "hold" | "immediate";
  requireIdVerification: boolean;
  requireSecurityDeposit: boolean;
  requireRenterReviews: boolean;
  usageRules: string;
  addOns: AddOn[];

  // Meta
  status: "draft" | "pending" | "published" | "scheduled";
  publishDate: string;
}

/* ── Initial State ────────────────────────────────────────────── */

const initialDraft: ListingDraft = {
  images: [],
  title: "",
  category: "",
  description: "",
  condition: "like-new",
  tags: [],
  pricePerDay: "",
  deposit: "",
  depositEnabled: false,
  hourlyRate: "",
  // weekendRate removed
  // weeklyDiscount removed
  minRentalDays: "",
  pricingRules: [],
  availableRanges: [],
  quantity: 1,
  maxConcurrent: 1,
  bufferDays: 0,
  address: "",
  googleMapsAddress: "",
  city: "",
  deliveryOption: "pickup",
  deliveryRadius: "",
  deliveryFee: "",
  estimatedDeliveryTime: "",
  pickupInstructions: "",
  
  cancellationPolicy: "flexible",
  customCancellationText: "",
  depositChargeType: "hold",
  requireIdVerification: false,
  requireSecurityDeposit: false,
  requireRenterReviews: false,
  usageRules: "",
  addOns: [],
  status: "draft",
  publishDate: "",
};

export const TOTAL_STEPS = 7;

interface ListingState {
  draft: ListingDraft;
  currentStep: number;
}

const initialState: ListingState = {
  draft: { ...initialDraft },
  currentStep: 1,
};

/* ── Slice ────────────────────────────────────────────────────── */

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.currentStep = Math.min(Math.max(action.payload, 1), TOTAL_STEPS);
    },
    nextStep(state) {
      state.currentStep = Math.min(state.currentStep + 1, TOTAL_STEPS);
    },
    prevStep(state) {
      state.currentStep = Math.max(state.currentStep - 1, 1);
    },
    updateDraft(state, action: PayloadAction<Partial<ListingDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    resetDraft(state) {
      state.draft = { ...initialDraft };
      state.currentStep = 1;
    },
  },
});

export const { setStep, nextStep, prevStep, updateDraft, resetDraft } =
  listingSlice.actions;

export default listingSlice.reducer;
