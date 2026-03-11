"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-500 mb-8">
                We apologize for the inconvenience. Please try again.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-2 bg-[#ff7722] text-white rounded-lg font-semibold hover:bg-[#e66a1f] transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
