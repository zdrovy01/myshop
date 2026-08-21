import { notFound } from "next/navigation";
import { todayWarsaw } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicTasksList, {
  type PublicEmployee,
  type PublicTask,
} from "./PublicTasksList";

export default async function PublicTasksPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("qr_token", token)
    .maybeSingle();

  if (!user) notFound();

  const [{ data: taskRows }, { data: employeeRows }] = await Promise.all([
    supabase
      .from("tasks")
      .select("id, name, priority, requires_photo")
      .eq("user_id", user.id)
      .eq("task_date", todayWarsaw())
      .order("position", { ascending: true }),
    supabase
      .from("employees")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  const tasks: PublicTask[] = (taskRows ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    priority: t.priority === 1 ? 1 : 2,
    requiresPhoto: t.requires_photo,
  }));
  const employees: PublicEmployee[] = employeeRows ?? [];
  const nameById = new Map(employees.map((e) => [e.id, e.name]));

  // Задачі, які вже виконано (виконуються один раз) + деталі виконання.
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
    if (completions[r.task_id]) continue; // беремо найновіше
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
    <div className="min-h-screen bg-[#0b0b0d] px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-5 text-2xl font-semibold text-gray-100 sm:mb-6">
          Lista zadań
        </h1>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400">Brak zadań.</p>
        ) : (
          <PublicTasksList
            tasks={tasks}
            employees={employees}
            completedIds={completedIds}
            completions={completions}
          />
        )}
      </div>
    </div>
  );
}
