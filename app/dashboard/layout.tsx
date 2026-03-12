
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <main className="flex-1 overflow-auto bg-[#f5f5f5] p-4">
                {children}
            </main>
        </div>
    );
}
