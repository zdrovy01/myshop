"use server";

import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setDamagedReviewed(
  id: string,
  value: boolean,
): Promise<{ ok: true } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Brak sesji." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("damaged_items")
    .update({ reviewed: value })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: "Nie udało się zapisać." };
  return { ok: true };
}
