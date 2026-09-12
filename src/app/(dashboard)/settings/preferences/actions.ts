"use server";

import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setShowSchedule(
  value: boolean,
): Promise<{ ok: true } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Brak sesji." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ show_schedule: value })
    .eq("id", userId);
  if (error)
    return { error: "Nie udało się zapisać (brak kolumny show_schedule?)." };
  return { ok: true };
}
