"use server";

import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function validTimes(start: string, end: string) {
  return TIME_RE.test(start) && TIME_RE.test(end);
}

export async function createShift(input: {
  employeeId: string;
  date: string; // YYYY-MM-DD
  start: string; // "HH:MM"
  end: string;
}): Promise<{ ok: true; id: string } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Brak sesji." };
  if (!validTimes(input.start, input.end))
    return { error: "Podaj poprawne godziny (GG:MM)." };

  const supabase = createAdminClient();
  const { data: emp } = await supabase
    .from("employees")
    .select("id")
    .eq("id", input.employeeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!emp) return { error: "Nieprawidłowy pracownik." };

  const { data, error } = await supabase
    .from("shifts")
    .insert({
      user_id: userId,
      employee_id: input.employeeId,
      shift_date: input.date,
      start_time: input.start,
      end_time: input.end,
    })
    .select("id")
    .single();
  if (error || !data)
    return { error: error?.message ?? "Nie udało się zapisać." };
  return { ok: true, id: data.id as string };
}

export async function updateShift(input: {
  id: string;
  employeeId: string;
  start: string;
  end: string;
}): Promise<{ ok: true } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Brak sesji." };
  if (!validTimes(input.start, input.end))
    return { error: "Podaj poprawne godziny (GG:MM)." };

  const supabase = createAdminClient();
  const { data: emp } = await supabase
    .from("employees")
    .select("id")
    .eq("id", input.employeeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!emp) return { error: "Nieprawidłowy pracownik." };

  const { error } = await supabase
    .from("shifts")
    .update({
      employee_id: input.employeeId,
      start_time: input.start,
      end_time: input.end,
    })
    .eq("id", input.id)
    .eq("user_id", userId);
  if (error) return { error: "Nie udało się zapisać." };
  return { ok: true };
}

export async function deleteShift(
  id: string,
): Promise<{ ok: true } | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Brak sesji." };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("shifts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error: "Nie udało się usunąć." };
  return { ok: true };
}
