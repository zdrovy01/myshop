import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import TasksList, { type Task } from "./TasksList";
import { purgeOldTasks } from "./tasks.actions";
import { todayWarsaw } from "@/lib/date";

const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Вікно перегляду: минулий тиждень … +2 дні (за польським часом).
function clampDate(input: string | undefined): string {
  const todayStr = todayWarsaw();
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const base = new Date(ty, tm - 1, td);

  const min = new Date(base);
  min.setDate(min.getDate() - 7);
  const max = new Date(base);
  max.setDate(max.getDate() + 2);

  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return todayStr;
  if (input < isoLocal(min)) return isoLocal(min);
  if (input > isoLocal(max)) return isoLocal(max);
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

  // Статус днів для календаря (у межах вікна перегляду): partial / done.
  const todayStr = todayWarsaw();
  const [wy, wm, wd] = todayStr.split("-").map(Number);
  const wBase = new Date(wy, wm - 1, wd);
  const wMin = new Date(wBase);
  wMin.setDate(wMin.getDate() - 7);
  const wMax = new Date(wBase);
  wMax.setDate(wMax.getDate() + 2);
  const minIso = isoLocal(wMin);
  const maxIso = isoLocal(wMax);

  const { data: windowTasks } = await supabase
    .from("tasks")
    .select("id, task_date")
    .eq("user_id", userId)
    .gte("task_date", minIso)
    .lte("task_date", maxIso);
  const winIds = (windowTasks ?? []).map((t) => t.id as string);
  const { data: winCompletions } = winIds.length
    ? await supabase
        .from("task_completions")
        .select("task_id")
        .in("task_id", winIds)
    : { data: [] };
  const completedSet = new Set(
    (winCompletions ?? []).map((r) => r.task_id as string),
  );
  const perDay: Record<string, { total: number; done: number }> = {};
  for (const t of windowTasks ?? []) {
    const key = t.task_date as string;
    (perDay[key] ??= { total: 0, done: 0 }).total++;
    if (completedSet.has(t.id as string)) perDay[key].done++;
  }
  const dayStatus: Record<string, "done" | "partial"> = {};
  for (const [k, v] of Object.entries(perDay)) {
    if (v.total > 0) dayStatus[k] = v.done === v.total ? "done" : "partial";
  }

  const { data: employeeRows } = await supabase
    .from("employees")
    .select("id, name")
    .eq("user_id", userId);
  const nameById = new Map(
    (employeeRows ?? []).map((e) => [e.id as string, e.name as string]),
  );

  const taskIds = tasks.map((t) => t.id);
  const { data: completionRows } = taskIds.length
    ? await supabase
        .from("task_completions")
        .select("task_id, employee_id, helper_ids, note, photo_url, completed_at")
        .in("task_id", taskIds)
        .order("completed_at", { ascending: false })
    : { data: [] };

  const completedIds = [
    ...new Set((completionRows ?? []).map((r) => r.task_id as string)),
  ];

  const completions: Record<
    string,
    {
      performers: string[];
      note: string | null;
      photoUrl: string | null;
      completedAt: string | null;
    }
  > = {};
  for (const r of (completionRows ?? []) as Array<{
    task_id: string;
    employee_id: string | null;
    helper_ids: string[] | null;
    note: string | null;
    photo_url: string | null;
    completed_at: string | null;
  }>) {
    if (completions[r.task_id]) continue;
    const performers = [r.employee_id, ...(r.helper_ids ?? [])]
      .map((id) => (id ? nameById.get(id) : undefined))
      .filter((n): n is string => Boolean(n));
    completions[r.task_id] = {
      performers,
      note: r.note,
      photoUrl: r.photo_url,
      completedAt: r.completed_at,
    };
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TasksList
        key={selectedDate}
        initial={tasks}
        completedIds={completedIds}
        completions={completions}
        selectedDate={selectedDate}
        dayStatus={dayStatus}
      />
    </div>
  );
}
