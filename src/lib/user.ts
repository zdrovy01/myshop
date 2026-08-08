import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

export type CurrentUser = {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  shopName: string | null;
  shopAddress: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("first_name, last_name, email, shop_name, shop_address")
    .eq("id", userId)
    .maybeSingle();

  if (!data) return null;

  return {
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    shopName: data.shop_name,
    shopAddress: data.shop_address,
  };
}
