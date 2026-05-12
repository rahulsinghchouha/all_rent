"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
      </div>
      
      <h2 className="text-3xl font-bold text-accent font-heading mb-3">
        Something went wrong!
      </h2>
      
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
        >
          Try again
        </button>
        
        <Link 
          href="/dashboard"
          className="bg-muted text-accent font-bold px-8 py-3.5 rounded-xl transition-all hover:bg-border active:scale-95"
        >
          Go back to Dashboard
        </Link>
      </div>
    </div>
  );
}