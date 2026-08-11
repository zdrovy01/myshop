import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import TasksList, { type Task } from "./TasksList";
import { purgeOldTasks } from "./tasks.actions";

// Вікно перегляду: минулий тиждень … +2 дні.
function clampDate(input: string | undefined): string {
  const today = new Date();
  const min = new Date(today);
  min.setDate(min.getDate() - 7);
  const max = new Date(today);
  max.setDate(max.getDate() + 2);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return iso(today);
  if (input < iso(min)) return iso(min);
  if (input > iso(max)) return iso(max);
  return input;
}

export default async function ListaZadanPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = clampDate(date);

  const userId = await getSessionUserId();
  const supabase = createAdminClient();

  // Чистимо задачі, старші за вікно перегляду.
  await purgeOldTasks();

  const { data } = await supabase
    .from("tasks")
    .select("id, name, priority, requires_photo")
    .eq("user_id", userId)
    .eq("task_date", selectedDate)
    .order("position", { ascending: true });

  const tasks: Task[] = (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    priority: t.priority === 1 ? 1 : 2,
    requiresPhoto: t.requires_photo,
  }));

  const taskIds = tasks.map((t) => t.id);
  const { data: completionRows } = taskIds.length
    ? await supabase
        .from("task_completions")
        .select("task_id, note, photo_url, completed_at, employee:employees(name)")
        .in("task_id", taskIds)
        .order("completed_at", { ascending: false })
    : { data: [] };

  const completedIds = [
    ...new Set((completionRows ?? []).map((r) => r.task_id as string)),
  ];

  const completions: Record<
    string,
    {
      employeeName: string | null;
      note: string | null;
      photoUrl: string | null;
      completedAt: string | null;
    }
  > = {};
  for (const r of (completionRows ?? []) as Array<{
    task_id: string;
    note: string | null;
    photo_url: string | null;
    completed_at: string | null;
    employee: { name: string | null } | { name: string | null }[] | null;
  }>) {
    if (completions[r.task_id]) continue;
    const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee;
    completions[r.task_id] = {
      employeeName: emp?.name ?? null,
      note: r.note,
      photoUrl: r.photo_url,
      completedAt: r.completed_at,
    };
  }

  return (
    <div className="py-8">
      <TasksList
        initial={tasks}
        completedIds={completedIds}
        completions={completions}
        selectedDate={selectedDate}
      />
    </div>
  );
}
