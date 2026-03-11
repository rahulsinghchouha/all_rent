import Link from "next/link";

export default function SplashPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-6">

            {/* Phone-style card */}
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col">

                {/* ── Brand top section ── */}
                <div className="bg-primary flex flex-col items-center px-6 pt-12 pb-10">

                    {/* App Icon */}
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md mb-5">
                        🏠
                    </div>

                    {/* Brand */}
                    <h1 className="text-4xl font-bold text-primary-foreground tracking-tight font-heading">
                        Rental Flow
                    </h1>
                    <p className="text-primary-foreground/85 text-base mt-1 mb-8 font-sans">
                        Rent Anything. Anytime.
                    </p>

                    {/* Stats Row */}
                    <div className="flex w-full items-center justify-between mt-2">

                        <div className="flex flex-col items-center gap-2 flex-1 text-primary-foreground">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-xs font-bold">1M+</span>
                            </div>
                            <span className="opacity-75 text-[10px] font-semibold tracking-widest uppercase font-sans">Items</span>
                        </div>

                        <div className="w-px h-10 bg-white/25" />

                        <div className="flex flex-col items-center gap-2 flex-1 text-primary-foreground">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-xs font-bold">24/7</span>
                            </div>
                            <span className="opacity-75 text-[10px] font-semibold tracking-widest uppercase font-sans">Support</span>
                        </div>

                        <div className="w-px h-10 bg-white/25" />

                        <div className="flex flex-col items-center gap-2 flex-1 text-primary-foreground">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <span className="text-xs font-bold">100%</span>
                            </div>
                            <span className="opacity-75 text-[10px] font-semibold tracking-widest uppercase font-sans">Secure</span>
                        </div>

                    </div>
                </div>

                {/* ── Bottom CTA section ── */}
                <div className="bg-primary flex flex-col items-center gap-4 px-6 py-8">

                    <Link
                        href="/sign-up"
                        className="bg-secondary w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full border-2 border-transparent text-primary font-bold text-base transition-all duration-200 hover:shadow-lg font-heading"
                    >
                        Get Started <span className="text-xl leading-none">›</span>
                    </Link>

                    <p className="text-sm text-primary-foreground/70 font-sans">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary-foreground font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>

                </div>

            </div>
        </div>
    );
}
