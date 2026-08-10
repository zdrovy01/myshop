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
        .select("task_id")
        .in("task_id", taskIds)
    : { data: [] };
  const completedIds = [
    ...new Set((completionRows ?? []).map((r) => r.task_id as string)),
  ];

  return (
    <div className="py-8">
      <TasksList initial={tasks} completedIds={completedIds} />
    </div>
  );
}
