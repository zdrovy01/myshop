import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user";

// Головна (Lista zadań) — просто "MyShop"; інші сторінки — "<Nazwa> - MyShop".
export const metadata: Metadata = {
  title: { template: "%s - MyShop", default: "MyShop" },
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  // Немає сесії / користувача — на сторінку входу.
  if (!user) redirect("/login");

  // Профіль неповний — на онбординг.
  const complete =
    user.firstName &&
    user.lastName &&
    user.email &&
    user.shopName &&
    user.shopAddress;
  if (!complete) redirect("/onboarding");

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar user={user} />
      <main className="flex h-full flex-1 justify-center overflow-y-auto px-4 pt-14 md:px-8 md:pt-0">
        <div className="flex h-full min-h-0 w-full max-w-3xl flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
