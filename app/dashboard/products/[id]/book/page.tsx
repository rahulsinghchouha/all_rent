"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  title: string;
  pricePerDay: number;
  deposit: number;
  minRentalDays: number;
  quantity: number;
  imageUrls: string[] | null;
  category: string;
  city: string | null;
  address: string | null;
  deliveryOption: string;
  deliveryFee: number;
  rating: string | number | null;
};

type BookingState = {
  // Step 1
  startDate: Date | null;
  endDate: Date | null;
  quantity: number;
  // Step 2
  deliveryMethod: "pickup" | "delivery";
  deliveryAddress: string;
  deliveryAptFloor: string;
  deliveryGateCode: string;
  deliveryInstructions: string;
  // Step 3
  paymentMethod: "upi" | "card" | "wallet";
};

// ─── Calendar ─────────────────────────────────────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function isBetween(date: Date, start: Date, end: Date) {
  return date > start && date < end;
}
function formatDateISO(d: Date) {
  return d.toISOString().split("T")[0];
}
function formatDateLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Calendar({
  startDate,
  endDate,
  onSelect,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  return (
    <div className="select-none">
      {/* Month navigator */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="text-sm font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const isStart = startDate && isSameDay(date, startDate);
          const isEnd = endDate && isSameDay(date, endDate);
          const isInRange = startDate && endDate && isBetween(date, startDate, endDate);
          const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected = isStart || isEnd;

          return (
            <button
              key={date.toISOString()}
              disabled={isPast}
              onClick={() => !isPast && onSelect(date)}
              className={[
                "h-9 text-sm font-medium transition-all duration-150 rounded-full mx-0.5",
                isPast ? "text-slate-200 cursor-not-allowed" : "cursor-pointer",
                isSelected
                  ? "bg-primary text-white font-bold shadow-md shadow-primary/30"
                  : isInRange
                  ? "bg-orange-100 text-primary rounded-none mx-0"
                  : !isPast
                  ? "hover:bg-orange-50 text-slate-700 hover:text-primary"
                  : "",
                isStart && endDate ? "rounded-l-full rounded-r-none mx-0 ml-0.5" : "",
                isEnd && startDate ? "rounded-r-full rounded-l-none mx-0 mr-0.5" : "",
              ].join(" ")}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgress({ step }: { step: number }) {
  const steps = ["DURATION", "LOGISTICS", "PAYMENT"];
  return (
    <div className="flex items-center gap-2 px-1 mb-6">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isActive = idx === step;
        const isDone = idx < step;
        return (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`h-1 rounded-full w-full transition-all duration-300 ${
                  isDone ? "bg-primary" : isActive ? "bg-primary" : "bg-slate-200"
                }`}
              />
              {step >= 3 && (
                <span className={`text-[9px] font-bold tracking-widest uppercase ${
                  isActive ? "text-primary" : isDone ? "text-slate-400" : "text-slate-300"
                }`}>
                  {label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step Tracker (for Payment step) ────────────────────────────────────────

function StepTracker({ step }: { step: number }) {
  const steps = [
    { label: "DURATION", num: 1 },
    { label: "LOGISTICS", num: 2 },
    { label: "PAYMENT", num: 3 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((s, i) => {
        const done = step > s.num;
        const active = step === s.num;
        return (
          <div key={s.label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                done ? "bg-slate-700 border-slate-700 text-white" :
                active ? "bg-primary border-primary text-white shadow-md shadow-primary/30" :
                "bg-white border-slate-200 text-slate-400"
              }`}>
                {done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : s.num}
              </div>
              <span className={`text-[9px] font-bold tracking-widest uppercase ${active ? "text-primary" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-px mx-1 mb-4 ${done ? "bg-slate-700" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Product Mini Card ────────────────────────────────────────────────────────

function ProductMiniCard({
  product,
  dateLabel,
  deliveryLabel,
}: {
  product: Product;
  dateLabel?: string;
  deliveryLabel?: string;
}) {
  const img =
    Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : `https://placehold.co/80x80/f5f5f5/999?text=${encodeURIComponent(product.category)}`;

  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-3 shadow-sm mb-5">
      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
        <img src={img} alt={product.title} className="w-full h-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Verified</span>
        </div>
        <p className="text-sm font-bold text-slate-800 truncate">{product.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span className="text-[11px] font-semibold text-slate-600">{Number(product.rating || 4.9).toFixed(1)}</span>
          </div>
          {(product.city || product.address) && (
            <span className="text-[11px] text-slate-400">• {product.city ?? product.address}</span>
          )}
        </div>
        {dateLabel && (
          <div className="flex items-center gap-1 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
            <span className="text-[11px] text-slate-500">{dateLabel}</span>
          </div>
        )}
        {deliveryLabel && (
          <div className="flex items-center gap-1 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <span className="text-[11px] text-slate-500">{deliveryLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    id: string;
    bookingReference: string;
    totalAmount: number;
    securityDeposit: number;
    rentalAmount: number;
  } | null>(null);

  const [booking, setBooking] = useState<BookingState>({
    startDate: null,
    endDate: null,
    quantity: 1,
    deliveryMethod: "pickup",
    deliveryAddress: "",
    deliveryAptFloor: "",
    deliveryGateCode: "",
    deliveryInstructions: "",
    paymentMethod: "upi",
  });

  // ── Load product ──
  const fetchProduct = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await fetch(`/api/products/${productId}`, { credentials: "include" });
      const json = await res.json();
      const d = json?.data;
      if (d) {
        setProduct({
          id: d.id,
          title: d.title,
          pricePerDay: Number(d.pricePerDay ?? 45),
          deposit: Number(d.deposit ?? 150),
          minRentalDays: Number(d.minRentalDays ?? 1),
          quantity: Number(d.quantity ?? 3),
          imageUrls: d.imageUrls,
          category: d.category ?? "Item",
          city: d.city ?? null,
          address: d.address ?? null,
          deliveryOption: d.deliveryOption ?? "pickup",
          deliveryFee: Number(d.deliveryFee ?? 12),
          rating: d.rating ?? 4.9,
        });
      }
    } catch (e) {
      console.error("Failed to load product", e);
    } finally {
      setLoadingProduct(false);
    }
  }, [productId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // ── Calendar date selection ──
  const handleDateSelect = (date: Date) => {
    if (!booking.startDate || (booking.startDate && booking.endDate)) {
      setBooking((b) => ({ ...b, startDate: date, endDate: null }));
    } else if (date < booking.startDate) {
      setBooking((b) => ({ ...b, startDate: date }));
    } else {
      setBooking((b) => ({ ...b, endDate: date }));
    }
  };

  // ── Derived financials ──
  const dailyPrice = product?.pricePerDay ?? 45;
  const depositAmt = product?.deposit ?? 150;
  const minDays = product?.minRentalDays ?? 1;
  const maxQty = product?.quantity ?? 3;

  let totalDays = minDays;
  if (booking.startDate && booking.endDate) {
    const diff = Math.ceil(
      (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    totalDays = Math.max(minDays, diff + 1);
  }

  const deliveryFee = booking.deliveryMethod === "delivery" ? (product?.deliveryFee ?? 12) : 0;
  const rentalAmount = dailyPrice * totalDays * booking.quantity;
  const serviceFee = Math.round(rentalAmount * 0.0925 * 100) / 100;
  const totalAmount = rentalAmount + serviceFee + depositAmt + deliveryFee;

  const dateLabel = booking.startDate && booking.endDate
    ? `${formatDateLabel(booking.startDate)} — ${formatDateLabel(booking.endDate)}`
    : null;

  const deliveryLabel = booking.deliveryMethod === "delivery" ? "Delivery included" : "Self pickup";

  // ── Confirm booking API call ──
  const handleConfirmBooking = async () => {
    if (!product || !booking.startDate || !booking.endDate) return;
    setSubmitting(true);
    try {
      const body = {
        productId: product.id,
        startDate: formatDateISO(booking.startDate),
        endDate: formatDateISO(booking.endDate),
        totalDays,
        quantity: booking.quantity,
        deliveryMethod: booking.deliveryMethod,
        deliveryAddress: booking.deliveryAddress || null,
        deliveryAptFloor: booking.deliveryAptFloor || null,
        deliveryGateCode: booking.deliveryGateCode || null,
        deliveryInstructions: booking.deliveryInstructions || null,
        paymentMethod: booking.paymentMethod,
        rentalAmount,
        serviceFee,
        securityDeposit: depositAmt,
        deliveryFee,
        totalAmount,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Booking failed");

      setBookingResult({
        id: json.data.id,
        bookingReference: json.data.bookingReference,
        totalAmount: json.data.totalAmount,
        securityDeposit: json.data.securityDeposit,
        rentalAmount: json.data.rentalAmount,
      });
      setStep(4);
    } catch (err: any) {
      alert(err.message ?? "Failed to confirm booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Copy booking ref ──
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (bookingResult) {
      navigator.clipboard.writeText(bookingResult.bookingReference).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Loading state ──
  if (loadingProduct) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center gap-4 text-center p-6">
        <p className="text-xl font-bold text-slate-800">Product not found</p>
        <Link href="/dashboard" className="text-primary font-semibold hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  // ── Render Steps ──

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => step > 1 && step < 4 ? setStep((s) => (s - 1) as 1 | 2 | 3 | 4) : router.push(`/dashboard/products/${productId}`)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="text-base font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
            {step === 1 ? "Step 1: Duration" : step === 2 ? "Logistics" : step === 3 ? "Payment" : "Booking Confirmed"}
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-28">

        {/* ═══════════════════════════════════════════
            STEP 1 — DURATION
        ═══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="flex flex-col gap-5 animate-[fadeIn_0.25s_ease]">
            <StepProgress step={1} />

            {/* Product card */}
            <ProductMiniCard product={product} />

            {/* Calendar section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Select Dates</h2>
                {booking.startDate && booking.endDate && (
                  <span className="flex items-center gap-1.5 bg-orange-50 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-orange-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                    {totalDays} {totalDays === 1 ? "Day" : "Days"}
                  </span>
                )}
              </div>

              <Calendar
                startDate={booking.startDate}
                endDate={booking.endDate}
                onSelect={handleDateSelect}
              />

              {booking.startDate && booking.endDate && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  ✱ Selected: {formatDateLabel(booking.startDate)} — {formatDateLabel(booking.endDate)}
                </p>
              )}
              {booking.startDate && !booking.endDate && (
                <p className="text-center text-xs text-primary mt-3 animate-pulse">
                  Now pick your end date →
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">Quantity</p>
                <p className="text-xs text-slate-400 mt-0.5">Items available: {maxQty}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setBooking((b) => ({ ...b, quantity: Math.max(1, b.quantity - 1) }))}
                  className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all text-slate-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                </button>
                <span className="text-lg font-bold text-slate-800 w-4 text-center">{booking.quantity}</span>
                <button
                  onClick={() => setBooking((b) => ({ ...b, quantity: Math.min(maxQty, b.quantity + 1) }))}
                  className="w-9 h-9 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-primary hover:text-primary transition-all text-slate-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                </button>
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Price Details</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>${dailyPrice} × {totalDays} {totalDays === 1 ? "day" : "days"} × {booking.quantity} {booking.quantity === 1 ? "unit" : "units"}</span>
                  <span className="font-semibold">${rentalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    Security Deposit
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                  </span>
                  <span className="font-semibold">${depositAmt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Service Fee</span>
                  <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-100 my-1" />
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Total Amount</p>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Deposit is fully refundable</p>
                  </div>
                  <span className="text-xl font-bold text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 2 — LOGISTICS
        ═══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="flex flex-col gap-5 animate-[fadeIn_0.25s_ease]">
            <StepProgress step={2} />

            {/* Method selector */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Select Method</h2>
                <span className="text-[10px] font-bold text-primary bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Popular</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Self Pickup */}
                <button
                  onClick={() => setBooking((b) => ({ ...b, deliveryMethod: "pickup" }))}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all ${
                    booking.deliveryMethod === "pickup"
                      ? "border-slate-700 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    booking.deliveryMethod === "pickup" ? "bg-slate-800" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={booking.deliveryMethod === "pickup" ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Self Pickup</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pick up from owner's location</p>
                  <p className="text-xs font-bold text-slate-700 mt-2">Free</p>
                </button>

                {/* Delivery */}
                <button
                  onClick={() => setBooking((b) => ({ ...b, deliveryMethod: "delivery" }))}
                  className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                    booking.deliveryMethod === "delivery"
                      ? "border-primary bg-orange-50"
                      : "border-slate-200 hover:border-primary/40"
                  }`}
                >
                  {booking.deliveryMethod === "delivery" && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    booking.deliveryMethod === "delivery" ? "bg-primary" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={booking.deliveryMethod === "delivery" ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.93 12 19.79 19.79 0 0 1 1.18 3.4a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800">Delivery</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Doorstep delivery &amp; return</p>
                  <p className="text-xs font-bold text-primary mt-2">${product.deliveryFee}.00</p>
                </button>
              </div>
            </div>

            {/* Delivery Address (shown when delivery selected) */}
            {booking.deliveryMethod === "delivery" && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5 animate-[fadeIn_0.2s_ease]">
                <h2 className="text-sm font-bold text-slate-800 mb-1">Delivery Address</h2>
                <p className="text-xs text-slate-400 mb-4">Where should we drop off the items?</p>

                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Full Address</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      <input
                        type="text"
                        placeholder="452 West End Ave, New York, NY 10"
                        value={booking.deliveryAddress}
                        onChange={(e) => setBooking((b) => ({ ...b, deliveryAddress: e.target.value }))}
                        className="flex-1 text-sm outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Apt / Floor</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="3" y2="21" /><line x1="15" x2="15" y1="3" y2="21" /></svg>
                        <input
                          type="text"
                          placeholder="e.g. 4B"
                          value={booking.deliveryAptFloor}
                          onChange={(e) => setBooking((b) => ({ ...b, deliveryAptFloor: e.target.value }))}
                          className="flex-1 text-sm outline-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Gate Code</label>
                      <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                        <input
                          type="text"
                          placeholder="Optional"
                          value={booking.deliveryGateCode}
                          onChange={(e) => setBooking((b) => ({ ...b, deliveryGateCode: e.target.value }))}
                          className="flex-1 text-sm outline-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Delivery Instructions</label>
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                      <input
                        type="text"
                        placeholder="Leave at front desk"
                        value={booking.deliveryInstructions}
                        onChange={(e) => setBooking((b) => ({ ...b, deliveryInstructions: e.target.value }))}
                        className="flex-1 text-sm outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fee Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Fee Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Rental Logistics</span>
                  <span className="font-semibold">${(deliveryFee * 0.67).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Service Fee</span>
                  <span className="font-semibold">${(deliveryFee * 0.33).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Insurance (Basic)</span>
                  <span className="font-semibold text-emerald-600">Included</span>
                </div>
                <div className="h-px bg-slate-100 my-1" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-800">Total Logistics</span>
                  <span className="text-base font-bold text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>
                    ${deliveryFee.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed flex items-start gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                Final delivery fees are calculated based on your distance (4.2 miles) from the owner's hub. Taxes will be applied at the next step.
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 3 — PAYMENT
        ═══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="flex flex-col gap-5 animate-[fadeIn_0.25s_ease]">
            <StepTracker step={3} />

            {/* Product summary */}
            <ProductMiniCard
              product={product}
              dateLabel={dateLabel ?? undefined}
              deliveryLabel={deliveryLabel}
            />

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>Payment Method</h2>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Encrypted</span>
              </div>

              <div className="flex flex-col gap-3">
                {/* UPI */}
                <button
                  onClick={() => setBooking((b) => ({ ...b, paymentMethod: "upi" }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    booking.paymentMethod === "upi"
                      ? "border-primary bg-orange-50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "upi" ? "bg-primary" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={booking.paymentMethod === "upi" ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">UPI (Google Pay, PhonePe)</p>
                    <p className="text-xs text-slate-400">Instant transfer with no extra fees</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "upi" ? "border-primary bg-primary" : "border-slate-300"
                  }`}>
                    {booking.paymentMethod === "upi" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setBooking((b) => ({ ...b, paymentMethod: "card" }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    booking.paymentMethod === "card"
                      ? "border-primary bg-orange-50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "card" ? "bg-primary" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={booking.paymentMethod === "card" ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Credit / Debit Card</p>
                    <p className="text-xs text-slate-400">Visa, Mastercard, Amex supported</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "card" ? "border-primary bg-primary" : "border-slate-300"
                  }`}>
                    {booking.paymentMethod === "card" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                {/* Wallet */}
                <button
                  onClick={() => setBooking((b) => ({ ...b, paymentMethod: "wallet" }))}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    booking.paymentMethod === "wallet"
                      ? "border-primary bg-orange-50"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "wallet" ? "bg-primary" : "bg-slate-100"
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={booking.paymentMethod === "wallet" ? "white" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12V22H4V12" /><path d="M22 7H2v5h20V7z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Digital Wallets</p>
                    <p className="text-xs text-slate-400">Apple Pay, PayPal or Amazon Pay</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    booking.paymentMethod === "wallet" ? "border-primary bg-primary" : "border-slate-300"
                  }`}>
                    {booking.paymentMethod === "wallet" && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-5">
              <h2 className="text-base font-bold text-slate-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Rental ({totalDays} {totalDays === 1 ? "Day" : "Days"} × ${dailyPrice})</span>
                  <span className="font-semibold">${rentalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Service Fee</span>
                  <span className="font-semibold">${serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Refundable Deposit</span>
                  <span className="font-semibold">${depositAmt.toFixed(2)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-slate-800">Order Total</span>
                  <span className="text-xl font-bold text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Security + Legal */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2"><rect width="11" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Your payment is secured by 256-bit SSL encryption. We will hold the security deposit until the item is returned in original condition.
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-xs font-semibold text-emerald-600">Verified Trusted Platform</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 mb-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
              By confirming, you agree to the{" "}
              <span className="text-primary font-semibold underline cursor-pointer">Rental Terms</span>{" "}
              and{" "}
              <span className="text-primary font-semibold underline cursor-pointer">Insurance Policy</span>.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            STEP 4 — CONFIRMATION
        ═══════════════════════════════════════════ */}
        {step === 4 && bookingResult && (
          <div className="flex flex-col items-center gap-6 animate-[fadeIn_0.35s_ease] pt-6">
            {/* Animated checkmark */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 animate-ping opacity-20" />
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
                Booking Confirmed!
              </h1>
              <p className="text-sm text-slate-500 max-w-xs">
                Your rental for <strong>{product.title}</strong> is all set.
              </p>
            </div>

            {/* Booking reference card */}
            <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Booking Reference</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">Confirmed</span>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-xl font-bold text-slate-800 font-mono" style={{ fontFamily: "Poppins, monospace" }}>
                  {bookingResult.bookingReference}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                  title="Copy reference"
                >
                  {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                  )}
                </button>
              </div>

              {/* Product info */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={
                      Array.isArray(product.imageUrls) && product.imageUrls.length > 0
                        ? product.imageUrls[0]
                        : `https://placehold.co/56x56/f5f5f5/999?text=${encodeURIComponent(product.category)}`
                    }
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 truncate">{product.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">H</span>
                    </div>
                    <span className="text-xs text-slate-400">Hosted by Owner</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff7722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Rental Duration</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {totalDays} {totalDays === 1 ? "Day" : "Days"}
                      {booking.startDate && booking.endDate
                        ? ` (${booking.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${booking.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff7722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Handover Method</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {booking.deliveryMethod === "delivery" ? "Standard Delivery" : "Self Pickup"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cost row */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" /></svg>
                    Total Rental Cost
                  </div>
                  <span className="font-semibold">${bookingResult.rentalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    Security Deposit
                  </div>
                  <span className="font-semibold">${bookingResult.securityDeposit.toFixed(2)} (Refundable)</span>
                </div>
              </div>
            </div>

            {/* Success banner */}
            <div className="w-full bg-primary rounded-2xl p-4 text-center">
              <p className="text-white text-sm font-semibold">
                Payment successfully processed via{" "}
                {booking.paymentMethod === "upi" ? "UPI" : booking.paymentMethod === "card" ? "Card" : "Digital Wallet"}
              </p>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">
                Thank you for renting!
              </p>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed max-w-xs">
              A confirmation email and receipt have been sent to your registered address. You can now chat with the owner to coordinate the pickup.
            </p>

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-3">
              <Link
                href="/dashboard/profile"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-2xl text-center text-sm shadow-lg shadow-primary/25 transition-all"
              >
                View My Booking
              </Link>
              <Link
                href="/dashboard"
                className="w-full text-primary border-2 border-primary/30 hover:bg-orange-50 font-bold py-4 rounded-2xl text-center text-sm transition-all"
              >
                Return to Home
              </Link>
            </div>

            <div className="flex items-center gap-1.5 opacity-40 mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              <span className="text-xs text-slate-400 font-medium">Rental Flow</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Sticky CTA Footer (Steps 1–3) ── */}
      {step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 shadow-2xl p-4 z-40">
          <div className="max-w-4xl mx-auto flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <button
              disabled={
                (step === 1 && (!booking.startDate || !booking.endDate)) ||
                (step === 3 && submitting)
              }
              onClick={() => {
                if (step === 1) setStep(2);
                else if (step === 2) setStep(3);
                else if (step === 3) handleConfirmBooking();
              }}
              className={`w-full md:max-w-xl py-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                (step === 1 && (!booking.startDate || !booking.endDate))
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-primary hover:bg-primary/90 shadow-primary/30 active:scale-[0.98]"
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  {step === 1 ? "Proceed to Delivery" : step === 2 ? "Continue to Payment" : "Confirm Booking"}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400">
              {step === 1 && "Free cancellation until 24 hours before pick-up"}
              {step === 2 && "By continuing, you agree to Rental Flow's Logistics Policy and Damage Protection Plan."}
              {step === 3 && "Your payment is protected by 256-bit SSL encryption."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
