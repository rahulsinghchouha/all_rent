"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4 md:p-6 font-sans">
            {/* Card Container */}
            <div className="w-full max-w-md bg-white rounded-4xl shadow-xl overflow-hidden p-8 md:p-10 flex flex-col gap-8 transition-all duration-300 hover:shadow-2xl">

                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span className="text-sm font-medium">Back</span>
                    </Link>

                    <div className="space-y-3">
                        <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-white mb-2 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        </div>
                        <h1 className="text-3xl font-bold text-accent font-heading tracking-tight leading-tight">
                            Welcome Back
                        </h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Sign in to continue exploring rentals near you.
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Email Address</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="11" x="2" y="5" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </span>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">Password</label>
                            <Link href="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88 3.59 3.59" /><path d="m21 21-6.29-6.29" /><path d="M12 17c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8Z" /><path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button className="bg-primary text-primary-foreground w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-3 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20">
                        Sign In
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Or</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                {/* Social Sign In Section */}
                <div className="flex flex-col gap-3">
                    <button className="w-full border-2 border-border/50 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-muted/30 transition-all font-semibold text-sm text-accent">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M19.6 10.23c0-.64-.06-1.25-.16-1.84H10v3.48h5.38a4.6 4.6 0 0 1-2 3.01v2.5h3.23c1.9-1.75 3-4.32 3-7.15z" fill="#4285F4" />
                            <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5a6.2 6.2 0 0 1-3.39.93c-2.6 0-4.81-1.76-5.6-4.12H1.1v2.55A10 10 0 0 0 10 20z" fill="#34A853" />
                            <path d="M4.4 11.88a6 6 0 0 1 0-3.76V5.57H1.1a10 10 0 0 0 0 8.86l3.3-2.55z" fill="#FBBC05" />
                            <path d="M10 3.97c1.47 0 2.79.5 3.82 1.5l2.87-2.87A10 10 0 0 0 1.1 5.57l3.3 2.55c.79-2.36 3-4.12 5.6-4.12z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <button className="w-full border-2 border-border/50 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-muted/30 transition-all font-semibold text-sm text-accent">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2">
                            <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
                        </svg>
                        Continue with Facebook
                    </button>
                </div>

                {/* Footer Section */}
                <p className="text-center text-sm text-muted-foreground mt-2">
                    Don't have an account?{" "}
                    <Link href="/sign-up" className="text-primary font-bold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
