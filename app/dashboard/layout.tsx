
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <main className="flex-1 overflow-auto bg-[#f5f5f5] px-4 py-4 md:px-6 lg:px-8">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
