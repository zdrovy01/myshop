"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

export type SettingsData = {
  firstName: string;
  lastName: string;
  email: string;
  shopType: "zabka" | "other";
  shopName: string;
  shopAddress: string;
};

export type SettingsResult = { error: string } | { ok: true };

export async function updateProfile(
  data: SettingsData,
): Promise<SettingsResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Sesja wygasła. Zaloguj się ponownie." };

  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const email = data.email.trim();
  const shopAddress = data.shopAddress.trim();
  const shopName =
    data.shopType === "zabka" ? "Żabka" : data.shopName.trim();

  if (!firstName || !lastName || !email || !shopAddress || !shopName) {
    return { error: "Wypełnij wszystkie pola." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Nieprawidłowy adres e-mail." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({
      first_name: firstName,
      last_name: lastName,
      email,
      shop_type: data.shopType,
      shop_name: shopName,
      shop_address: shopAddress,
    })
    .eq("id", userId);

  if (error) return { error: "Nie udało się zapisać zmian." };

  revalidatePath("/", "layout");
  return { ok: true };
}
