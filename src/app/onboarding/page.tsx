import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("first_name, last_name, email, shop_name, shop_address")
    .eq("id", userId)
    .maybeSingle();

  // Немає такого користувача — сесія недійсна.
  if (!user) redirect("/login");

  // Профіль уже повний — онбординг не потрібен.
  const complete =
    user.first_name &&
    user.last_name &&
    user.email &&
    user.shop_name &&
    user.shop_address;
  if (complete) redirect("/");

  return <OnboardingForm />;
}
