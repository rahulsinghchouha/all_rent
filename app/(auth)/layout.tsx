export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                {children}
            </div>
        </div>
    );
}