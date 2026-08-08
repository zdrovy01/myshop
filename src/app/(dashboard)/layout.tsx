import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex flex-1 justify-center px-8">
        <div className="w-full max-w-2xl bg-white px-8">{children}</div>
      </main>
    </div>
  );
}
