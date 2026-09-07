"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type User = {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string | null;
  createdAt?: string;
};

type Product = {
  id: string;
  title: string;
  pricePerDay: number;
  imageUrls?: string[] | null;
  status: string;
  category?: string;
};

type ProductResponse = {
  id: string;
  title?: string;
  pricePerDay?: number | string;
  imageUrls?: string[] | null;
  status?: string;
  category?: string;
};

// ─── Account Menu Items ───────────────────────────────────────────────────────

const menuItems = [
  {
    id: "listings",
    label: "My Listings",
    href: "/dashboard/profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
    badge: null as number | null,
  },
  {
    id: "rentals",
    label: "My Rentals",
    href: "/dashboard/rentals",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="14" x="3" y="5" rx="2" /><path d="M3 10h18" />
      </svg>
    ),
    badge: 3 as number | null,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    href: "/dashboard/wishlist",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
    badge: 15 as number | null,
  },
  {
    id: "payments",
    label: "Payment History",
    href: "/dashboard/payments",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    badge: null as number | null,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    badge: null as number | null,
  },
];

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: "Available", cls: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
    rented: { label: "Rented", cls: "bg-blue-50 text-blue-600 border border-blue-200" },
    draft: { label: "Draft", cls: "bg-slate-100 text-slate-500 border border-slate-200" },
    paused: { label: "Paused", cls: "bg-amber-50 text-amber-600 border border-amber-200" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
  const img =
    Array.isArray(product.imageUrls) && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : `https://placehold.co/200x140/f5f5f5/999?text=${encodeURIComponent(product.category ?? "Item")}`;

  return (
    <Link
      href={`/dashboard/products/${product.id}`}
      className="group flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-3 hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
        <img
          src={img}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate leading-tight">
          {product.title}
        </p>
        <p className="text-xs font-bold text-primary mt-0.5">
          ${product.pricePerDay}/day
        </p>
        <div className="mt-1">
          <StatusBadge status={product.status} />
        </div>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-slate-300 group-hover:text-primary transition-colors shrink-0"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeMenu, setActiveMenu] = useState("listings");
  const [signingOut, setSigningOut] = useState(false);

  // ── Computed stats ──
  const activeCount = products.filter((p) => p.status === "published").length;
  const rentedCount = products.filter((p) => p.status === "rented").length;

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const json = await res.json();
      if (res.ok) {
        setUser(json.data);
        return json.data as User;
      }
    } catch (e) {
      console.error("Failed to load user", e);
    } finally {
      setLoadingUser(false);
    }
    return null;
  }, []);

  const fetchProducts = useCallback(async (ownerId: string) => {
    try {
      const res = await fetch(`/api/products?ownerId=${encodeURIComponent(ownerId)}&limit=50`, { credentials: "include" });
      const json = await res.json();
      const data: Product[] = Array.isArray(json?.data)
        ? (json.data as ProductResponse[]).map((p) => ({
            id: p.id,
            title: p.title ?? "Untitled",
            pricePerDay: Number(p.pricePerDay ?? 0),
            imageUrls: p.imageUrls,
            status: p.status ?? "draft",
            category: p.category,
          }))
        : [];
      setProducts(data);
    } catch (e) {
      console.error("Failed to load products", e);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const currentUser = await fetchUser();
      if (currentUser) await fetchProducts(currentUser.id);
      else setLoadingProducts(false);
    }

    loadProfile();
  }, [fetchUser, fetchProducts]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // Clear cookies by calling a logout-like action
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    } finally {
      router.push("/");
    }
  };

  // ── Derive initials / greeting from user ──
  const initials = user?.userName
    ? user.userName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-sans">
      {/* ── Top Navbar ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-lg hidden sm:block" style={{ fontFamily: "Poppins, sans-serif" }}>
              Rental Flow
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/listings/new"
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
              List New Item
            </Link>
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20">
              {initials}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left Sidebar ── */}
          <aside className="w-full lg:w-[300px] shrink-0 flex flex-col gap-4">

            {/* Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Peach header strip */}
              <div className="h-24 bg-gradient-to-br from-orange-50 to-amber-100 relative" />

              {/* Avatar */}
              <div className="px-6 pb-6">
                <div className="flex justify-between items-start -mt-10 mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {loadingUser ? "…" : initials}
                    </div>
                    {/* Camera edit icon */}
                    <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center hover:border-primary transition-colors shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ff7722" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Name & location */}
                {loadingUser ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-5 bg-slate-100 rounded-lg w-32" />
                    <div className="h-4 bg-slate-100 rounded-lg w-24" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                      {user?.userName ?? "Guest User"}
                    </h2>
                    <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                      <span>{user?.email ?? "—"}</span>
                    </div>
                    {memberSince && (
                      <p className="text-xs text-slate-400 mt-1">Member since {memberSince}</p>
                    )}
                  </>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mt-5 py-4 border-y border-slate-100">
                  {[
                    { value: "4.9", label: "RATING" },
                    { value: rentedCount.toString(), label: "RENTALS" },
                    { value: products.length.toString(), label: "LISTINGS" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {loadingProducts ? "—" : stat.value}
                      </p>
                      <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex flex-col gap-2 mt-4">
                  <Link
                    href="/dashboard/listings/new"
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-primary border border-primary/30 bg-orange-50 hover:bg-primary hover:text-white rounded-xl px-4 py-2.5 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    List New Item
                  </Link>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-red-500 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-xl px-4 py-2.5 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </div>
            </div>

            {/* Account Menu */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
              <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase px-2 mb-3">
                Account Menu
              </p>
              <nav className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id)}
                      className={`flex items-center justify-between w-full px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? "text-white" : "text-slate-400"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge !== null && (
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={isActive ? "text-white/60" : "text-slate-300"}
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Elite Banner */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-5 relative overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-orange-100/60" />
              <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-orange-100/30" />
              <p className="text-sm font-bold text-slate-800 relative z-10" style={{ fontFamily: "Poppins, sans-serif" }}>
                Rent with confidence
              </p>
              <p className="text-xs text-slate-500 mt-1 mb-4 relative z-10 leading-relaxed">
                You&apos;ve reached <strong className="text-primary">Elite</strong> status. Enjoy lower deposit fees on all rentals.
              </p>
              <button className="relative z-10 bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-primary/30">
                View Benefits
              </button>
            </div>
          </aside>

          {/* ── Right Main Area ── */}
          <main className="flex-1 flex flex-col gap-5">

            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {activeMenu === "listings"
                    ? "My Listings"
                    : menuItems.find((m) => m.id === activeMenu)?.label ?? ""}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage and track your{" "}
                  {activeMenu === "listings" ? "my listings" : activeMenu} activities.
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white hover:border-primary/30 hover:text-primary px-4 py-2 rounded-xl transition-all shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                History
              </button>
            </div>

            {/* Listings Grid */}
            {activeMenu === "listings" && (
              <>
                {loadingProducts ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-3">
                        <div className="w-16 h-14 rounded-xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                          <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                          <div className="h-3 bg-slate-100 rounded-lg w-1/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff7722" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
                      </svg>
                    </div>
                    <p className="text-slate-700 font-semibold text-lg">No listings yet</p>
                    <p className="text-slate-400 text-sm mt-1 max-w-xs">
                      Start earning by listing your first item for rent.
                    </p>
                  </div>
                )}

                {/* Add New Listing */}
                <Link
                  href="/dashboard/listings/new"
                  className="group flex flex-col items-center justify-center gap-2 bg-white border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-orange-50/30 rounded-2xl py-8 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-primary transition-colors">
                      <path d="M12 5v14" /><path d="M5 12h14" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-500 group-hover:text-primary transition-colors">
                    Add New Listing
                  </span>
                </Link>
              </>
            )}

            {/* Placeholder for other menu sections */}
            {activeMenu !== "listings" && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  <span className="text-2xl">{
                    activeMenu === "rentals" ? "🏷️" :
                    activeMenu === "wishlist" ? "❤️" :
                    activeMenu === "payments" ? "💳" : "⚙️"
                  }</span>
                </div>
                <p className="text-slate-700 font-semibold text-lg">
                  {menuItems.find((m) => m.id === activeMenu)?.label}
                </p>
                <p className="text-slate-400 text-sm mt-1">Coming soon — this section is under construction.</p>
              </div>
            )}

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Wallet Balance */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Wallet Balance</p>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                  $1,240.50
                </p>
              </div>

              {/* Active Listings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Active</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Active Listings</p>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {loadingProducts ? "—" : `${activeCount} Items`}
                </p>
              </div>

              {/* Review Score */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Top Rated</span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Review Score</p>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Poppins, sans-serif" }}>
                  4.9 / 5.0
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
