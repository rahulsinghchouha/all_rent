import { create } from "zustand";

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
  weekendRate: number | "";
  weeklyDiscount: number | "";
  minRentalDays: number | "";
  pricingRules: PricingRule[];

  // Step 3 — Availability
  availableRanges: { start: string; end: string }[];
  blockedDates: string[];
  quantity: number;
  maxConcurrent: number;
  bufferDays: number;

  // Step 4 — Location & Delivery
  address: string;
  city: string;
  deliveryOption: "pickup" | "delivery" | "both";
  deliveryRadius: number | "";
  deliveryFee: number | "";
  estimatedDeliveryTime: string;
  pickupInstructions: string;
  hideExactAddress: boolean;

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

interface ListingStore {
  draft: ListingDraft;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateDraft: (partial: Partial<ListingDraft>) => void;
  resetDraft: () => void;
}

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
  weekendRate: "",
  weeklyDiscount: "",
  minRentalDays: "",
  pricingRules: [],
  availableRanges: [],
  blockedDates: [],
  quantity: 1,
  maxConcurrent: 1,
  bufferDays: 0,
  address: "",
  city: "",
  deliveryOption: "pickup",
  deliveryRadius: "",
  deliveryFee: "",
  estimatedDeliveryTime: "",
  pickupInstructions: "",
  hideExactAddress: false,
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

export const useListingStore = create<ListingStore>((set) => ({
  draft: { ...initialDraft },
  currentStep: 1,
  setStep: (step) => set({ currentStep: Math.min(Math.max(step, 1), TOTAL_STEPS) }),
  nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS) })),
  prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  updateDraft: (partial) => set((s) => ({ draft: { ...s.draft, ...partial } })),
  resetDraft: () => set({ draft: { ...initialDraft }, currentStep: 1 }),
}));
