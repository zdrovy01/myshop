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

  // Задачі, які вже виконано (виконуються один раз) + деталі виконання.
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
    if (completions[r.task_id]) continue; // беремо найновіше
    const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee;
    completions[r.task_id] = {
      employeeName: emp?.name ?? null,
      note: r.note,
      photoUrl: r.photo_url,
      completedAt: r.completed_at,
    };
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] sm:px-4 sm:py-10">
      <div className="mx-auto w-full max-w-2xl overflow-hidden bg-white px-5 py-6 sm:rounded-2xl sm:px-8 sm:py-8 sm:shadow-sm sm:ring-1 sm:ring-gray-200">
        <h1 className="mb-5 text-2xl font-semibold text-gray-900 sm:mb-6">
          Lista zadań
        </h1>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">Brak zadań.</p>
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
