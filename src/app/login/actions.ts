"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE } from "@/lib/session";

export type AuthResult =
  | { error: string }
  | { ok: true; needsOnboarding: boolean };

function normalizePhone(phone: string) {
  return phone.trim();
}

// Профіль вважається повним, коли заповнені всі обовʼязкові поля.
function isProfileComplete(u: {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  shop_name: string | null;
  shop_address: string | null;
}) {
  return Boolean(
    u.first_name && u.last_name && u.email && u.shop_name && u.shop_address,
  );
}

async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 днів
  });
}

export async function login(
  phone: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createAdminClient();
  const normalizedPhone = normalizePhone(phone);

  const { data: user, error } = await supabase
    .from("users")
    .select(
      "id, password_hash, first_name, last_name, email, shop_name, shop_address",
    )
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (error) return { error: "Błąd serwera. Spróbuj ponownie." };
  if (!user) return { error: "Nieprawidłowy numer telefonu lub hasło." };

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return { error: "Nieprawidłowy numer telefonu lub hasło." };

  await setSession(user.id);
  return { ok: true, needsOnboarding: !isProfileComplete(user) };
}

export async function register(
  phone: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createAdminClient();
  const normalizedPhone = normalizePhone(phone);

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("phone", normalizedPhone)
    .maybeSingle();

  if (existing) return { error: "Ten numer telefonu jest już zarejestrowany." };

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({ phone: normalizedPhone, password_hash: passwordHash })
    .select("id")
    .single();

  if (error || !user) return { error: "Nie udało się utworzyć konta." };

  await setSession(user.id);
  // Новий користувач завжди має пройти онбординг.
  return { ok: true, needsOnboarding: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
