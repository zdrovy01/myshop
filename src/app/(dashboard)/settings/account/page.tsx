import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import SettingsForm from "./SettingsForm";

export default async function AccountSettingsPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("phone, first_name, last_name, email, shop_type, shop_name, shop_address")
    .eq("id", userId)
    .maybeSingle();

  return (
    <SettingsForm
      initial={{
        phone: data?.phone ?? "",
        firstName: data?.first_name ?? "",
        lastName: data?.last_name ?? "",
        email: data?.email ?? "",
        shopType: data?.shop_type === "other" ? "other" : "zabka",
        shopName: data?.shop_name ?? "",
        shopAddress: data?.shop_address ?? "",
      }}
    />
  );
}
