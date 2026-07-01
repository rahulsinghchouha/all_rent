"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";

export default function SignUpPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false
    });

    const [touched, setTouched] = useState({
        userName: false,
        email: false,
        password: false,
        confirmPassword: false,
        terms: false
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const isNameValid = formData.userName.trim().length >= 3;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    const isPasswordValid = formData.password.length >= 8;
    const isConfirmPasswordValid = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;
    const isTermsValid = formData.terms;

    const isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && isTermsValid;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isFormValid) return;

        try {
            const userData = {
                userName: formData.userName,
                email: formData.email,
                password: formData.password,
                terms: formData.terms
            };
            const response = await fetch('/api/auth/sign-up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (response.ok) {
                if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                }
                console.log('User created successfully:', data);
                router.push('/dashboard');
            } else {
                console.error('Error creating user:', data);
            }
        }
        catch (error) {
            console.error('Error creating user:', error);
        }

    }

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

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-accent font-heading tracking-tight leading-tight">
                            Join Rental Flow
                        </h1>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Enter your details to start renting or listing items today.
                        </p>
                    </div>
                </div>

                {/* Form Fields */}
                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* Name Row */}
                    <div className="flex flex-col md:flex-row gap-5">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="John"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="w-full bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                            {touched.userName && !isNameValid && (
                                <p className="text-[10px] text-red-500 font-medium">Name is required with at least 3 characters.</p>
                            )}
                        </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="11" x="2" y="5" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="name@example.com"
                                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                        {touched.email && !isEmailValid && (
                            <p className="text-[10px] text-red-500 font-medium">Please enter a valid email address.</p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </span>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="••••••••"
                                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                        {touched.password && !isPasswordValid && (
                            <p className="text-[10px] text-red-500 font-medium">Password must be at least 8 characters long.</p>
                        )}
                    </div>

                    {/* Confirm password */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold tracking-widest text-accent uppercase">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                            </span>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="••••••••"
                                className="w-full bg-muted/50 border-none rounded-xl pl-11 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                        {touched.confirmPassword && !isConfirmPasswordValid && (
                            <p className="text-[10px] text-red-500 font-medium">Passwords must match.</p>
                        )}
                    </div>

                    {/* Agreement */}
                    <div className="flex flex-col gap-1 py-2">
                        <div className="flex items-start gap-3">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-border bg-white checked:bg-primary checked:border-primary transition-all shadow-sm"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-3.5 w-3.5 scale-0 opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100 peer-checked:translate-x-0.5 pointer-events-none text-white font-bold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                                I agree to the <Link href="/terms" className="text-primary font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</Link>. <span className="text-red-500">*</span>
                            </label>
                        </div>
                        {touched.terms && !isTermsValid && (
                            <p className="text-[10px] text-red-500 font-medium">You must accept the terms and conditions.</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={!isFormValid}
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${!isFormValid
                            ? 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed'
                            : 'bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-primary/20'
                            }`}
                    >
                        Create Account
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                    </button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                    <div className="h-px bg-border flex-1"></div>
                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Or Sign Up With</span>
                    <div className="h-px bg-border flex-1"></div>
                </div>

                {/* Social Sign Up Section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 border-2 border-border/50 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-muted/30 transition-all font-semibold text-sm text-accent">
                        <svg width="20" height="20" viewBox="0 0 20 20">
                            <path d="M19.6 10.23c0-.64-.06-1.25-.16-1.84H10v3.48h5.38a4.6 4.6 0 0 1-2 3.01v2.5h3.23c1.9-1.75 3-4.32 3-7.15z" fill="#4285F4" />
                            <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5a6.2 6.2 0 0 1-3.39.93c-2.6 0-4.81-1.76-5.6-4.12H1.1v2.55A10 10 0 0 0 10 20z" fill="#34A853" />
                            <path d="M4.4 11.88a6 6 0 0 1 0-3.76V5.57H1.1a10 10 0 0 0 0 8.86l3.3-2.55z" fill="#FBBC05" />
                            <path d="M10 3.97c1.47 0 2.79.5 3.82 1.5l2.87-2.87A10 10 0 0 0 1.1 5.57l3.3 2.55c.79-2.36 3-4.12 5.6-4.12z" fill="#EA4335" />
                        </svg>
                        Google
                    </button>
                    <button className="flex-1 border-2 border-border/50 rounded-xl py-3 px-4 flex items-center justify-center gap-3 hover:bg-muted/30 transition-all font-semibold text-sm text-accent">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="#1877F2">
                            <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" />
                        </svg>
                        Facebook
                    </button>
                </div>

                {/* Footer Section */}
                <p className="text-center text-sm text-muted-foreground mt-2">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-bold hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
