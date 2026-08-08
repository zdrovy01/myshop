import { cookies } from "next/headers";

export const SESSION_COOKIE = "session_uid";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
