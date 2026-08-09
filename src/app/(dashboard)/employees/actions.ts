"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

export type EmployeeDTO = { id: string; name: string; pin: string };

export type EmployeeResult =
  | { error: string }
  | { ok: true; employee: EmployeeDTO };

function validate(name: string, pin: string): string | null {
  if (!name.trim()) return "Podaj imię i nazwisko.";
  if (!/^\d{4}$/.test(pin.trim())) return "PIN musi składać się z 4 cyfr.";
  return null;
}

export async function createEmployee(
  name: string,
  pin: string,
): Promise<EmployeeResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Sesja wygasła." };

  const err = validate(name, pin);
  if (err) return { error: err };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees")
    .insert({ user_id: userId, name: name.trim(), pin: pin.trim() })
    .select("id, name, pin")
    .single();

  if (error || !data) return { error: "Nie udało się dodać pracownika." };

  revalidatePath("/employees");
  return { ok: true, employee: data };
}

export async function updateEmployee(
  id: string,
  name: string,
  pin: string,
): Promise<EmployeeResult> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Sesja wygasła." };

  const err = validate(name, pin);
  if (err) return { error: err };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("employees")
    .update({ name: name.trim(), pin: pin.trim() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name, pin")
    .single();

  if (error || !data) return { error: "Nie udało się zapisać zmian." };

  revalidatePath("/employees");
  return { ok: true, employee: data };
}

export async function deleteEmployee(id: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  const supabase = createAdminClient();
  await supabase.from("employees").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/employees");
}
