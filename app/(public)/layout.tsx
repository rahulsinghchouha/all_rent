export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="grow px-4 sm:px-6 lg:px-8">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}