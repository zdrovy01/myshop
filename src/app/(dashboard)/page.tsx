import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import TasksList, { type Task } from "./TasksList";

export default async function ListaZadanPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("tasks")
    .select("id, name, priority, requires_photo")
    .eq("user_id", userId)
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
    { employeeName: string | null; note: string | null; photoUrl: string | null }
  > = {};
  for (const r of (completionRows ?? []) as Array<{
    task_id: string;
    note: string | null;
    photo_url: string | null;
    employee: { name: string | null } | { name: string | null }[] | null;
  }>) {
    if (completions[r.task_id]) continue;
    const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee;
    completions[r.task_id] = {
      employeeName: emp?.name ?? null,
      note: r.note,
      photoUrl: r.photo_url,
    };
  }

  return (
    <div className="py-8">
      <TasksList
        initial={tasks}
        completedIds={completedIds}
        completions={completions}
      />
    </div>
  );
}
