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
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerDay: "",
    category: "",
    city: "",
    condition: "",
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
        setProduct(data);
        if (data) {
          setForm({
            title: data.title ?? "",
            description: data.description ?? "",
            pricePerDay: data.pricePerDay?.toString() ?? "",
            category: data.category ?? "",
            city: data.city ?? "",
            condition: data.condition ?? "",
          });
        }
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  const images = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls
    : ["https://placehold.co/900x700/f5f5f5/999?text=Product"];

  async function handleSave() {
    if (!productId || !product) return;

    try {
      setSaving(true);
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
          city: form.city,
          condition: form.condition,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Failed to update product");
      }

      setProduct((prev) => prev ? { ...prev, ...result.data } : prev);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save product", error);
      alert(error instanceof Error ? error.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <img src={images[0]} alt={product.title} className="h-[500px] w-full object-cover" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {images.slice(0, 3).map((image, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img src={image} alt={`${product.title} ${index + 1}`} className="h-32 w-full object-cover" />
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-slate-900">About this rental</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">Available now</span>
              </div>

              <p className="mt-5 text-base leading-8 text-slate-600">
                {product.description || "A premium rental item with excellent availability, easy pickup, and a smooth booking experience from start to finish."}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Condition</div>
                  <div className="mt-1 font-semibold text-slate-900">{product.condition || "Like new"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Location</div>
                  <div className="mt-1 font-semibold text-slate-900">{product.city || product.address || "Not provided"}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Pickup</div>
                  <div className="mt-1 font-semibold text-slate-900">Flexible</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {product.badge ? (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">{product.badge}</span>
                ) : null}
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{product.category}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                {isEditing ? (
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-2xl font-bold text-slate-900 outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
                )}

                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  {saving ? "Saving..." : isEditing ? "Save" : "Edit"}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">★ {Number(product.rating ?? 0).toFixed(1)}</span>
                <span>•</span>
                <span>{product.reviewsCount ?? 0} reviews</span>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                <div className="text-sm text-slate-500">Price per day</div>
                {isEditing ? (
                  <input
                    value={form.pricePerDay}
                    onChange={(e) => setForm((prev) => ({ ...prev, pricePerDay: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-2xl font-bold text-slate-900 outline-none"
                  />
                ) : (
                  <div className="mt-1 text-3xl font-bold text-slate-900">${product.pricePerDay ?? 0}</div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags?.map((tag) => (
                  <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">{tag}</span>
                ))}
              </div>

              {isEditing ? (
                <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 p-4">
                  <input
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    placeholder="Description"
                  />
                  <input
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    placeholder="Category"
                  />
                  <input
                    value={form.city}
                    onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    placeholder="City"
                  />
                  <input
                    value={form.condition}
                    onChange={(e) => setForm((prev) => ({ ...prev, condition: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                    placeholder="Condition"
                  />
                  <button
                    onClick={() => setIsEditing(false)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Book this item
                </button>
              )}
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Hosted by</h2>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  O
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Verified owner</div>
                  <div className="text-sm text-slate-600">ID verified • Usually responds in minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
