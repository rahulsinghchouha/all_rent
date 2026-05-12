export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white font-sans animate-pulse">
      {/* ── Navbar Skeleton ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Skeleton */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-muted" />
              <div className="w-24 h-6 bg-muted rounded-md hidden sm:block" />
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex-1 max-w-lg hidden md:flex h-10 bg-muted rounded-xl" />

            {/* Nav Actions Skeleton */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:block w-32 h-9 bg-muted rounded-lg" />
              <div className="w-9 h-9 bg-muted rounded-xl hidden sm:block" />
              <div className="w-9 h-9 bg-muted rounded-xl hidden sm:block" />
              <div className="w-9 h-9 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero Skeleton ── */}
      <section className="h-[520px] md:h-[600px] w-full bg-muted flex items-center">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-xl space-y-4">
            <div className="w-32 h-6 bg-border rounded-full mb-4" />
            <div className="w-full h-12 md:h-16 bg-border rounded-lg" />
            <div className="w-3/4 h-12 md:h-16 bg-border rounded-lg" />
            <div className="w-5/6 h-6 bg-border rounded-lg mt-4" />
            <div className="flex gap-3 pt-6">
              <div className="w-36 h-12 bg-border rounded-xl" />
              <div className="w-36 h-12 bg-border rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse Categories Skeleton ── */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <div className="w-48 h-8 bg-muted rounded-lg mb-2" />
            <div className="w-64 h-4 bg-muted rounded-lg" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2.5 p-4 md:p-5 rounded-2xl border-2 border-border">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="w-16 h-3 bg-muted rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Rentals Skeleton ── */}
      <section className="py-14 bg-secondary">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <div className="w-64 h-8 bg-border rounded-lg mb-2" />
            <div className="w-48 h-4 bg-border rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-border">
                {/* Image placeholder */}
                <div className="h-48 bg-muted w-full" />
                
                {/* Content placeholder */}
                <div className="p-4 space-y-3">
                  <div className="w-16 h-3 bg-muted rounded-md" />
                  <div className="w-full h-4 bg-muted rounded-md" />
                  <div className="w-3/4 h-4 bg-muted rounded-md" />
                  
                  <div className="w-24 h-3 bg-muted rounded-md my-2" />
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="w-16 h-6 bg-muted rounded-lg" />
                    <div className="w-24 h-8 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
