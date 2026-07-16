"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ProductDetail = {
  id: string;
  title: string;
  description?: string | null;
  pricePerDay?: number | null;
  category?: string | null;
  badge?: string | null;
  imageUrls?: string[] | null;
  address?: string | null;
  city?: string | null;
  condition?: string | null;
  rating?: string | number | null;
  reviewsCount?: number | null;
  tags?: string[] | null;
  ownerId?: string | null;
  deposit?: number | null;
  minRentalDays?: number | null;
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive Booking Calendar State (Defaults to Feb 18-20, 2026 like mockup)
  const [startDay, setStartDay] = useState<number | null>(18);
  const [endDay, setEndDay] = useState<number | null>(20);

  useEffect(() => {
    if (!productId) return;

    async function loadProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          credentials: "include",
        });
        const result = await response.json();
        const data = result?.data ?? null;
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7722]"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-slate-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="mt-2 text-slate-500 max-w-sm">We couldn't locate the rental item you are looking for. It may have been deleted or moved.</p>
        <Link href="/dashboard" className="mt-6 px-6 py-2.5 bg-[#ff7722] hover:bg-[#e0661b] text-white font-semibold rounded-xl shadow-sm transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Premium fallback photos (High quality camera images to mimic mockup)
  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : [
        "https://images.unsplash.com/photo-1616423643768-765ab37d8b6f?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&auto=format&fit=crop&q=80",
      ];

  // Dynamic calculations for the booking widget
  const dailyPrice = product.pricePerDay || 45;
  const depositAmt = product.deposit || 500;
  const minDays = product.minRentalDays || 2;

  // Calculate selected rental days
  let selectedDays = 3;
  if (startDay !== null && endDay !== null) {
    selectedDays = Math.max(minDays, endDay - startDay + 1);
  }

  const subtotal = dailyPrice * selectedDays;
  const serviceFee = Number((subtotal * 0.0925).toFixed(2)) || 12.50;
  const total = subtotal + serviceFee;

  // Handle calendar day click
  const handleDayClick = (day: number) => {
    if (startDay === null || (startDay !== null && endDay !== null)) {
      setStartDay(day);
      setEndDay(null);
    } else if (day < startDay) {
      setStartDay(day);
    } else {
      setEndDay(day);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased font-sans pb-16">
      {/* ── Sub-header Actions Navigation ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Product Details
          </Link>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.567-3.247m-5.567 3.247l5.567 3.246M13.5 5.25a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm0 13.5a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
              </svg>
              Share
            </button>
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5 text-rose-500 fill-rose-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78-9-12z" />
              </svg>
              Save
            </button>
            <Link
              href={`/dashboard/products/${productId}/edit`}
              className="ml-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
            >
              Edit Details
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Main Two-Column Layout ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* Left Column */}
          <div className="space-y-8">
            {/* Image Gallery Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2 relative group overflow-hidden rounded-[24px] bg-slate-100 border border-slate-100">
                <img 
                  src={images[0]} 
                  alt={product.title} 
                  className="h-[400px] w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 hover:bg-slate-50 transition shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78-9-12z" />
                    </svg>
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-800 hover:bg-slate-50 transition shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l5.567-3.247m-5.567 3.247l5.567 3.246M13.5 5.25a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm0 13.5a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="grid grid-rows-2 gap-4">
                <div className="overflow-hidden rounded-[24px] bg-slate-100 border border-slate-100 relative group">
                  <img 
                    src={images[1] || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80"} 
                    alt={`${product.title} view 2`} 
                    className="h-[192px] w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                <div className="overflow-hidden rounded-[24px] bg-slate-100 border border-slate-100 relative group">
                  <img 
                    src={images[2] || "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=600&auto=format&fit=crop&q=80"} 
                    alt={`${product.title} view 3`} 
                    className="h-[192px] w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold text-sm pointer-events-none">
                    +12 Photos
                  </div>
                </div>
              </div>
            </div>

            {/* Instantly Available & Reviews badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                  Instantly Available
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <span className="text-amber-500">★</span>
                <span className="text-slate-900 font-bold">{Number(product.rating ?? 4.9).toFixed(1)}</span>
                <span className="text-slate-400">({product.reviewsCount ?? 128} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {product.title}
              </h1>
              <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4.5 w-4.5 text-[#ff7722]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{product.city || product.address || "Brooklyn, New York (0.8 miles away)"}</span>
              </div>
            </div>

            {/* Rented by Owner info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[24px] border border-slate-100 p-6 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                      alt="Host Avatar" 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Rented by Marcus V.</span>
                    <span className="inline-flex items-center rounded-full bg-[#f0f9ff] border border-sky-100 px-2 py-0.5 text-[9px] font-bold text-sky-700 tracking-wider">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">Active since Jan 2021</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-center sm:text-left self-stretch sm:self-auto justify-around sm:justify-start">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Rate</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">100%</div>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Time</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">&lt; 1 hour</div>
                </div>
                <Link
                  href={`/dashboard/products/${productId}/chat`}
                  className="flex items-center gap-1.5 rounded-xl border border-[#ff7722] bg-white px-4 py-2 text-xs font-bold text-[#ff7722] hover:bg-orange-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                  Chat with Owner
                </Link>
              </div>
            </div>

            {/* About this item */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">About this item</h2>
              <div className="text-sm leading-relaxed text-slate-600 space-y-3">
                <p>
                  {product.description || "The Sony Alpha a7 IV is the ultimate hybrid mirrorless camera, offering professional-grade photo and video performance. Whether you're shooting a wedding, a short film, or street photography, this body provides exceptional detail and color science."}
                </p>
                <p className="font-semibold text-slate-900 mt-4">
                  Includes: 2x 128GB High-Speed SD Cards, 3x Batteries, Dual Charger, and a padded carrying case. The 28-70mm f/3.5-5.6 OSS lens is perfect for versatile everyday shooting.
                </p>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Technical Specifications</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-4 bg-slate-50/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff7722]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sensor</div>
                    <div className="text-sm font-semibold text-slate-800">33MP Full-Frame</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-4 bg-slate-50/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff7722]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h.008v.008H15V9zm0 3h.008v.008H15V12zm0 3h.008v.008H15V15zM9 9h.008v.008H9V9zm0 3h.008v.008H9V12zm0 3h.008v.008H9V15z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Video</div>
                    <div className="text-sm font-semibold text-slate-800">4K 60p 10-bit</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-4 bg-slate-50/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff7722]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weight</div>
                    <div className="text-sm font-semibold text-slate-800">658g (Body)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3.5 rounded-2xl border border-slate-100 p-4 bg-slate-50/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff7722]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.0" stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mount</div>
                    <div className="text-sm font-semibold text-slate-800">Sony E-Mount</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Pickup Location</h2>
                <button className="text-sm font-bold text-[#ff7722] hover:text-[#e0661b] transition">
                  View on map &gt;
                </button>
              </div>
              {/* Map mockup canvas */}
              <div className="h-60 w-full overflow-hidden rounded-[24px] border border-slate-100 bg-[#eef2f6] relative flex items-center justify-center">
                {/* Simplified geometric styled map patterns using standard SVG */}
                <svg className="absolute inset-0 h-full w-full opacity-60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#cfd7df" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Roads / land shapes */}
                  <path d="M-10 100 C 100 120, 200 80, 400 130 S 600 90, 900 150" fill="none" stroke="#d5dde5" strokeWidth="24" strokeLinecap="round" />
                  <path d="M200 -20 L 250 300" fill="none" stroke="#d5dde5" strokeWidth="18" />
                  <path d="M500 -20 L 450 300" fill="none" stroke="#d5dde5" strokeWidth="18" />
                  <path d="M-20 40 L 900 40" fill="none" stroke="#d5dde5" strokeWidth="14" />
                  <path d="M-20 220 C 300 220, 500 240, 900 210" fill="none" stroke="#d5dde5" strokeWidth="16" />
                </svg>

                {/* Radar Pulse circle to indicate approximate location */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="absolute h-20 w-20 rounded-full bg-[#ff7722]/10 animate-ping"></div>
                  <div className="absolute h-12 w-12 rounded-full bg-[#ff7722]/20 border border-[#ff7722]/30"></div>
                  <div className="h-4 w-4 rounded-full bg-[#ff7722] border-2 border-white shadow-md"></div>
                </div>
              </div>
              {/* Warning banner */}
              <div className="flex items-start gap-3 rounded-2xl bg-amber-50/55 border border-amber-100 p-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 text-amber-600 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-xs font-semibold text-amber-800 leading-normal">
                  Exact location provided after booking confirmation. Pickup hours: Mon-Fri 9AM-6PM.
                </p>
              </div>
            </div>

            {/* What renters are saying */}
            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">What renters are saying</h2>
                <button className="text-sm font-bold text-[#ff7722] hover:text-[#e0661b] transition">
                  View all reviews
                </button>
              </div>

              <div className="space-y-6">
                {/* Review 1 */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" 
                          alt="Sarah Johnson Avatar" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Sarah Johnson</div>
                        <div className="text-[10px] font-semibold text-slate-400">Oct 12, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs text-[#ff7722]">
                      {"★★★★★".split("").map((star, idx) => <span key={idx}>{star}</span>)}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-12">
                    Marcus was incredibly helpful. The camera was in mint condition and came fully charged with all promised accessories. Perfect for my weekend shoot!
                  </p>
                </div>

                {/* Review 2 */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                          alt="David Chen Avatar" 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">David Chen</div>
                        <div className="text-[10px] font-semibold text-slate-400">Sep 28, 2023</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs">
                      <span className="text-[#ff7722]">★★★★</span>
                      <span className="text-slate-200">★</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed pl-12">
                    Great gear. The autofocus on the a7 IV is truly a game changer. Only giving 4 stars because pickup was delayed by 15 mins, but otherwise fantastic.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky Booking Widget) */}
          <div className="space-y-6">
            <div className="sticky top-6 space-y-6">
              {/* Main Booking Card */}
              <div className="rounded-[28px] border border-slate-150 bg-white p-6 shadow-sm">
                
                {/* Price block */}
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#ff7722]">${dailyPrice}</span>
                  <span className="text-slate-400 text-sm font-semibold">/ day</span>
                </div>

                {/* Min rental condition */}
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Minimum {minDays} days rental</span>
                </div>

                {/* Calendar Date Picker container */}
                <div className="mt-6 space-y-3">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Select Dates</label>
                  
                  <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50/30">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <span className="text-xs font-bold text-slate-700">February 2026</span>
                      <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Days row */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-1">
                      <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>

                    {/* Calendar grid (Feb 2026 starts on Sunday) */}
                    <div className="grid grid-cols-7 gap-y-1.5 text-center text-xs font-bold text-slate-700">
                      {Array.from({ length: 28 }, (_, i) => {
                        const day = i + 1;
                        const isStart = day === startDay;
                        const isEnd = day === endDay;
                        const isSelected = startDay !== null && endDay !== null && day >= startDay && day <= endDay;

                        let dayBg = "hover:bg-slate-100 rounded-lg";
                        let dayColor = "text-slate-700";

                        if (isStart || isEnd) {
                          dayBg = "bg-[#ff7722] rounded-full";
                          dayColor = "text-white";
                        } else if (isSelected) {
                          dayBg = "bg-orange-50 rounded-lg";
                          dayColor = "text-[#ff7722]";
                        }

                        return (
                          <button
                            key={day}
                            onClick={() => handleDayClick(day)}
                            className={`py-1.5 w-full transition ${dayBg} ${dayColor}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="mt-6 space-y-3.5 text-sm font-semibold text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>${dailyPrice.toFixed(2)} x {selectedDays} days</span>
                    <span className="text-slate-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Service Fee</span>
                    <span className="text-slate-800">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      Refundable Deposit
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083 1.083l-.04.04-.041a.75.75 0 11-1.083-1.083l.04-.04zm0 0a.75.75 0 10-1.083 1.083l.04-.04.041a.75.75 0 101.083-1.083l-.04-.04zM12 21.75a9.75 9.75 0 100-19.5 9.75 9.75 0 000 19.5z" />
                      </svg>
                    </span>
                    <span className="text-slate-800">${depositAmt.toFixed(2)}</span>
                  </div>
                  
                  <div className="h-px bg-slate-100 my-2"></div>
                  
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 text-base">Total due now</span>
                    <span className="text-slate-900 text-lg">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
                    Deposit of ${depositAmt} will be held during rental period.
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 space-y-4">
                  <Link href={`/dashboard/products/${productId}/book`} className="block w-full rounded-2xl bg-[#ff7722] py-3.5 text-sm font-extrabold text-white text-center transition hover:bg-[#e0661b] shadow-md hover:shadow-lg">
                    Book Now
                  </Link>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-3.5 w-3.5 text-emerald-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0110.1 20.9c-.49-.219-.94-.537-1.328-.936a3.748 3.748 0 01-3.006-.132A3.745 3.745 0 014.2 16.543a3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013.1 10.1c.218-.49.536-.94.936-1.328a3.748 3.748 0 01.132-3.006 3.745 3.745 0 014.282-2.284 3.745 3.745 0 013.296 1.043A3.746 3.746 0 0113 3c.49.219.94.537 1.328.936a3.745 3.745 0 013.006.132A3.745 3.745 0 0119.8 7.457a3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span>Secure payment with Buyer Protection</span>
                  </div>
                </div>

              </div>

              {/* Rental Tips Card */}
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/40 p-5 space-y-3.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <span>⚡</span> Rental Tips
                </h3>
                <ul className="text-xs font-semibold text-slate-500 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7722] text-sm shrink-0 leading-none">•</span>
                    <span>Check for sensor dust upon pickup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7722] text-sm shrink-0 leading-none">•</span>
                    <span>Verify all accessories in the checklist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#ff7722] text-sm shrink-0 leading-none">•</span>
                    <span>Format SD cards before returning</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

