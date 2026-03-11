export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                {/* Simple CSS Spinner */}
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#ff7722]"></div>
                <p className="text-gray-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}
