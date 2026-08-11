"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

export type TaskDTO = {
  id: string;
  name: string;
  priority: 1 | 2;
  requiresPhoto: boolean;
};

function todayIso() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export async function createTask(
  name: string,
  date?: string,
): Promise<TaskDTO | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;

  const supabase = createAdminClient();
  const taskDate = date ?? todayIso();

  // Минулі дні лише для перегляду.
  if (taskDate < todayIso()) return null;

  const { data: last } = await supabase
    .from("tasks")
    .select("position")
    .eq("user_id", userId)
    .eq("task_date", taskDate)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;

  const { data } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      name: trimmed,
      priority: 2,
      requires_photo: false,
      position,
      task_date: taskDate,
    })
    .select("id, name, priority, requires_photo")
    .single();

  revalidatePath("/");
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    priority: data.priority === 1 ? 1 : 2,
    requiresPhoto: data.requires_photo,
  };
}

// Прибирає задачі, старші за 7 днів (вікно перегляду — минулий тиждень).
export async function purgeOldTasks(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const supabase = createAdminClient();
  await supabase
    .from("tasks")
    .delete()
    .eq("user_id", userId)
    .lt("task_date", cutoff.toISOString().slice(0, 10));
}

export async function deleteTask(id: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  const supabase = createAdminClient();
  // Минулі дні лише для перегляду.
  await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .gte("task_date", todayIso());
  revalidatePath("/");
}

// Зберігає назви/пріоритети/фото та поточний порядок (position = індекс).
export async function saveTasks(tasks: TaskDTO[]): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) return;
  const supabase = createAdminClient();

  // Минулі дні лише для перегляду — оновлюємо тільки від сьогодні.
  await Promise.all(
    tasks.map((t, i) =>
      supabase
        .from("tasks")
        .update({
          name: t.name.trim() || "—",
          priority: t.priority,
          requires_photo: t.requiresPhoto,
          position: i,
        })
        .eq("id", t.id)
        .eq("user_id", userId)
        .gte("task_date", todayIso()),
    ),
  );

  revalidatePath("/");
}
