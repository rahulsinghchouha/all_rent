import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-gray-500 mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link href="/" className="px-6 py-2 bg-[#ff7722] text-white rounded-lg font-semibold hover:bg-[#e66a1f] transition-colors">
                Return Home
            </Link>
        </div>
    );
}
