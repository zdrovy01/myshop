import { createClient } from "@supabase/supabase-js";

// Адмін-клієнт із секретним ключем — ТІЛЬКИ на сервері.
// Обходить RLS, тож ніколи не імпортуй це в клієнтський код.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
