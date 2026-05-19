"use client";
import Link from "next/link";
import { useState } from "react";

// ── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { label: "Electronics", emoji: "💻", color: "bg-blue-50 text-blue-600" },
  { label: "Photography", emoji: "📷", color: "bg-purple-50 text-purple-600" },
  { label: "Sports", emoji: "🚴", color: "bg-green-50 text-green-600" },
  { label: "Power Tools", emoji: "🔧", color: "bg-yellow-50 text-yellow-600" },
  { label: "Luxury Wear", emoji: "👜", color: "bg-pink-50 text-pink-600" },
  { label: "Adventure", emoji: "🏕️", color: "bg-orange-50 text-orange-600" },
];

const listings = [
  {
    id: 1,
    title: "Sony Alpha a7 IV Mirrorless Camera",
    owner: "Marcus V.",
    rating: 4.9,
    reviews: 134,
    price: 45,
    category: "Photography",
    badge: "Top Rated",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",
  },
  {
    id: 2,
    title: "DJI Mavic 3 Pro – Professional Drone",
    owner: "Sarah K.",
    rating: 4.8,
    reviews: 89,
    price: 120,
    category: "Electronics",
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80",
  },
  {
    id: 3,
    title: "Specialized Diverge SVO STR Bike",
    owner: "Tom R.",
    rating: 4.7,
    reviews: 61,
    price: 35,
    category: "Sports",
    badge: null,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  },
  {
    id: 4,
    title: "DeWalt 20V Max Drill Set",
    owner: "Lisa M.",
    rating: 4.6,
    reviews: 42,
    price: 25,
    category: "Power Tools",
    badge: null,
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
  },
  {
    id: 5,
    title: "North Face 6-Person Camping Tent",
    owner: "Jake A.",
    rating: 4.8,
    reviews: 77,
    price: 40,
    category: "Adventure",
    badge: "New",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&q=80",
  },
  {
    id: 6,
    title: "Gucci Marmont 1955 Shoulder Bag",
    owner: "Nina P.",
    rating: 4.9,
    reviews: 53,
    price: 85,
    category: "Luxury Wear",
    badge: "Trending",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
  },
  {
    id: 7,
    title: "Bose a1 Portable Bluetooth Speaker",
    owner: "Chris D.",
    rating: 4.5,
    reviews: 38,
    price: 20,
    category: "Electronics",
    badge: null,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80",
  },
  {
    id: 8,
    title: "Zhiyun Crane 2S Gimbal Stabilizer",
    owner: "Amy W.",
    rating: 4.7,
    reviews: 29,
    price: 30,
    category: "Photography",
    badge: null,
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80",
  },
];

const trustFeatures = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    title: "Secure Payments",
    desc: "We hold your payment securely until the rental is complete and confirmed.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "Verified Owners",
    desc: "Every owner is ID-verified, background-checked, and professionally reviewed.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h7v7H3z" /><path d="M14 3h7v7h-7z" /><path d="M14 14h7v7h-7z" /><path d="M3 14h7v7H3z" />
      </svg>
    ),
    title: "Insurance Coverage",
    desc: "Items are insured by Rental Flow Protection for up to $10,000 per rental.",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filtered = listings.filter((l) => {
    const matchCat = activeCategory ? l.category === activeCategory : true;
    const matchQ = searchQuery ? l.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    return matchCat && matchQ;
  });

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

            {/* Search Bar */}
            <div className="flex-1 max-w-lg hidden md:flex items-center bg-muted rounded-xl px-4 py-2 gap-2 border border-border focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search gear, tools, cameras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-full text-accent placeholder:text-muted-foreground"
              />
            </div>

            {/* Nav Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link href="/dashboard/listings/new" className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                Become a Host
              </Link>

              <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-accent" title="Favorites">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              </button>

              <button className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-accent" title="Messages">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </button>

              <button className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/20 transition-colors" title="Profile">
                R
              </button>

              {/* Mobile menu toggle */}
              <button className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="flex items-center bg-muted rounded-xl px-4 py-2.5 gap-2 border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Search gear..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative h-[520px] md:h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=80"
          alt="Rent anything, anytime"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="max-w-xl">
              <span className="inline-block bg-primary/90 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                #1 Rental Marketplace
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight mb-4">
                Rent Anything.<br />Anytime. Anywhere.
              </h1>
              <p className="text-white/80 text-base md:text-lg mb-8 leading-relaxed">
                Discover the world's most trusted marketplace for rentals — from cameras to camping gear.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-primary hover:bg-primary/90 text-white font-bold px-7 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-100 shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                  Explore Gear
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                </button>
                <Link
                  href="/dashboard/listings/new"
                  className="bg-white/15 hover:bg-white/25 text-white font-bold px-7 py-3.5 rounded-xl border border-white/30 transition-all hover:scale-105 active:scale-100 backdrop-blur-sm"
                >
                  Start Listing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse Categories ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-accent font-heading">Browse Categories</h2>
              <p className="text-muted-foreground text-sm mt-1">Find exactly what you need to rent</p>
            </div>
            <button
              onClick={() => setActiveCategory(null)}
              className="text-primary text-sm font-semibold hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
                className={`flex flex-col items-center gap-2.5 p-4 md:p-5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-100 ${activeCategory === cat.label
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/30 hover:shadow-md bg-white"
                  }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${cat.color}`}>
                  {cat.emoji}
                </div>
                <span className="text-xs font-semibold text-accent text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Rentals ── */}
      <section id="trending" className="py-14 bg-secondary">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-accent font-heading">Trending Rentals Near You</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {activeCategory ? `Showing: ${activeCategory}` : "Handpicked popular rentals in your area"}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-white rounded-xl px-3 py-2 border border-border">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Filter &amp; Sort
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold">No results found</p>
              <p className="text-sm">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f5f5f5/999?text=${encodeURIComponent(item.category)}`;
                      }}
                    />
                    {item.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground hover:text-red-400 transition-colors"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.category}</span>
                    <h3 className="font-bold text-accent text-sm mt-0.5 mb-1 leading-snug line-clamp-2 font-heading">{item.title}</h3>

                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.floor(item.rating))}
                        {item.rating % 1 >= 0.5 ? "½" : ""}
                      </div>
                      <span className="text-xs text-accent font-semibold">{item.rating}</span>
                      <span className="text-xs text-muted-foreground">({item.reviews}) · {item.owner}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-accent">${item.price}</span>
                        <span className="text-xs text-muted-foreground">/day</span>
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-100 shadow-sm shadow-primary/20">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="text-center mt-10">
              <button className="border-2 border-border hover:border-primary text-accent hover:text-primary font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-md">
                Load More Results
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust & Features ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-accent font-heading">Why Rental Flow?</h2>
            <p className="text-muted-foreground text-sm mt-2">Everything you need to rent and earn with confidence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustFeatures.map((f) => (
              <div key={f.title} className="flex flex-col items-center text-center p-8 rounded-2xl border border-border hover:border-primary/20 hover:shadow-lg transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="font-bold text-accent text-lg font-heading mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-3">
            Ready to earn from your gear?
          </h2>
          <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
            Owners earn an average of $840/mo by renting and listing their items on Rental Flow.
          </p>
          <Link
            href="/dashboard/listings/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-100 shadow-lg shadow-primary/30 text-lg"
          >
            Start Listing Today
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#111827] text-white/60 py-8">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">RF</span>
            </div>
            <span className="text-white font-semibold font-heading">Rental Flow</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p>© 2026 RentalFlow Inc.</p>
        </div>
      </footer>

    </div>
  );
}
