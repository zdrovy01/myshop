import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex flex-1 justify-center px-8">
        <div className="w-full max-w-2xl bg-white px-8">{children}</div>
      </main>
    </div>
  );
}
