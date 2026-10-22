"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ProductForm = {
  title: string;
  description: string;
  pricePerDay: string;
  category: string;
  condition: string;
  deposit: string;
  minRentalDays: string;
  address: string;
  city: string;
  deliveryOption: string;
  deliveryFee: string;
  pickupInstructions: string;
  usageRules: string;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    pricePerDay: "",
    category: "General",
    condition: "like-new",
    deposit: "0",
    minRentalDays: "1",
    address: "",
    city: "",
    deliveryOption: "pickup",
    deliveryFee: "0",
    pickupInstructions: "",
    usageRules: "",
  });

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

        if (data) {
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            pricePerDay: data.pricePerDay?.toString() ?? "",
            category: data.category ?? "General",
            condition: data.condition ?? "like-new",
            deposit: data.deposit?.toString() ?? "0",
            minRentalDays: data.minRentalDays?.toString() ?? "1",
            address: data.address ?? "",
            city: data.city ?? "",
            deliveryOption: data.deliveryOption ?? "pickup",
            deliveryFee: data.deliveryFee?.toString() ?? "0",
            pickupInstructions: data.pickupInstructions ?? "",
            usageRules: data.usageRules ?? "",
          });
          setImageUrls(data.imageUrls ?? []);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to load product", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          pricePerDay: Number(form.pricePerDay || 0),
          category: form.category,
          condition: form.condition,
          deposit: Number(form.deposit || 0),
          minRentalDays: Number(form.minRentalDays || 1),
          address: form.address,
          city: form.city,
          deliveryOption: form.deliveryOption,
          deliveryFee: Number(form.deliveryFee || 0),
          pickupInstructions: form.pickupInstructions,
          usageRules: form.usageRules,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update product");
      }

      router.push(`/dashboard/products/${productId}`);
    } catch (err) {
      console.error("Failed to save product", err);
      setError(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff7722]"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading product form...</p>
      </div>
    );
  }

  const mainImage = imageUrls.length > 0 
    ? imageUrls[0] 
    : "https://images.unsplash.com/photo-1616423643768-765ab37d8b6f?w=600&auto=format&fit=crop&q=80";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-24">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href={`/dashboard/products/${productId}`} className="flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Details
            </Link>
            <h1 className="text-sm font-bold text-slate-900 font-heading">Edit Rental Listing</h1>
            <div className="w-20"></div> {/* Spacer for symmetry */}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700 font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left: Input Fields */}
          <div className="space-y-6">
            
            {/* Basic Info */}
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-950 font-heading border-b border-slate-50 pb-3">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Listing Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Sony Alpha a7 IV Mirrorless Camera"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Photography">Photography</option>
                      <option value="Sports">Sports</option>
                      <option value="Power Tools">Power Tools</option>
                      <option value="Luxury Wear">Luxury Wear</option>
                      <option value="Adventure">Adventure</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Item Condition</label>
                    <select
                      value={form.condition}
                      onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                    >
                      <option value="new">New (Unopened/Unused)</option>
                      <option value="like-new">Like New (Mint Condition)</option>
                      <option value="very-good">Very Good (Minor Signs of Wear)</option>
                      <option value="good">Good (Fully Functional with Wear)</option>
                      <option value="fair">Fair (Heavy Wear but Works)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    rows={5}
                    required
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell renters about your item, what's included, and any helpful tips..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Terms */}
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-950 font-heading border-b border-slate-50 pb-3">Pricing & Terms</h2>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Price Per Day ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.pricePerDay}
                    onChange={(e) => setForm(prev => ({ ...prev, pricePerDay: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Refundable Deposit ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.deposit}
                    onChange={(e) => setForm(prev => ({ ...prev, deposit: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Min Rental Days</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={form.minRentalDays}
                    onChange={(e) => setForm(prev => ({ ...prev, minRentalDays: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Handover & Location */}
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-950 font-heading border-b border-slate-50 pb-3">Handover & Location</h2>
              
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Delivery Option</label>
                    <select
                      value={form.deliveryOption}
                      onChange={(e) => setForm(prev => ({ ...prev, deliveryOption: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                    >
                      <option value="pickup">Local Pickup Only</option>
                      <option value="delivery">Delivery Only</option>
                      <option value="both">Both (Pickup & Delivery)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Delivery Fee ($)</label>
                    <input
                      type="number"
                      min="0"
                      disabled={form.deliveryOption === "pickup"}
                      value={form.deliveryFee}
                      onChange={(e) => setForm(prev => ({ ...prev, deliveryFee: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Street Address</label>
                    <input
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g. 142 Willoughby St"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setForm(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="e.g. Brooklyn"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Pickup Instructions</label>
                  <textarea
                    rows={3}
                    value={form.pickupInstructions}
                    onChange={(e) => setForm(prev => ({ ...prev, pickupInstructions: e.target.value }))}
                    placeholder="Provide pickup instructions, available hours, etc."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Additional details */}
            <div className="rounded-[28px] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-950 font-heading border-b border-slate-50 pb-3">Usage Rules & Guidelines</h2>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Usage Rules</label>
                <textarea
                  rows={3}
                  value={form.usageRules}
                  onChange={(e) => setForm(prev => ({ ...prev, usageRules: e.target.value }))}
                  placeholder="e.g. Do not use in wet weather, return fully cleaned..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#ff7722] focus:ring-1 focus:ring-[#ff7722] outline-none transition"
                />
              </div>
            </div>

          </div>

          {/* Right Sidebar: Preview & Actions */}
          <div className="space-y-6">
            
            {/* Summary Preview Card */}
            <div className="rounded-[28px] border border-slate-100 bg-white overflow-hidden shadow-sm">
              <div className="relative h-44 bg-slate-100">
                <Image
                  src={mainImage}
                  alt="Listing preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute top-3 left-3 bg-[#ff7722]/90 text-white font-extrabold uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full">
                  Preview Card
                </span>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{form.category}</span>
                  <span className="text-amber-500">★ New</span>
                </div>
                <h3 className="font-extrabold text-slate-900 line-clamp-1 text-sm">
                  {form.title || "Untitled Product"}
                </h3>
                <div className="flex items-baseline gap-1 text-[#ff7722] font-extrabold">
                  <span>${form.pricePerDay || "0"}</span>
                  <span className="text-slate-400 text-[10px] font-bold">/ day</span>
                </div>
                <div className="h-px bg-slate-50 my-2"></div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{form.city || "No City Selected"}</span>
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#ff7722] hover:bg-[#e0661b] text-white py-3 rounded-xl text-sm font-extrabold shadow-sm transition hover:shadow duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Publish Changes</span>
                )}
              </button>
              
              <Link
                href={`/dashboard/products/${productId}`}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
