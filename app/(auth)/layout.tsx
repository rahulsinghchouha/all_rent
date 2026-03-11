export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-[#f5f5f5]">
            {children}
        </div>
    );
}