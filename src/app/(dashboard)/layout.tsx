import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/user";

export async function generateMetadata(): Promise<Metadata> {
  const userId = await getSessionUserId();
  if (!userId) return { title: "MyShop trial" };
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("subscribed")
    .eq("id", userId)
    .maybeSingle();
  return { title: data?.subscribed ? "MyShop" : "MyShop trial" };
}

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
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="flex flex-1 justify-center px-4 pt-14 md:px-8 md:pt-0">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
