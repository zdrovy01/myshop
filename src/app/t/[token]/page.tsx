import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

function CameraIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-500"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

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

  const { data } = await supabase
    .from("tasks")
    .select("id, name, priority, requires_photo")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const tasks = data ?? [];

  return (
    <div className="min-h-screen bg-[#f4f4f6] sm:px-4 sm:py-10">
      <div className="mx-auto w-full max-w-2xl overflow-hidden bg-white px-5 py-6 sm:rounded-2xl sm:px-8 sm:py-8 sm:shadow-sm sm:ring-1 sm:ring-gray-200">
        <h1 className="mb-5 text-2xl font-semibold text-gray-900 sm:mb-6">
          Lista zadań
        </h1>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-500">Brak zadań.</p>
        ) : (
          <ul className="-mx-5 flex flex-col sm:-mx-8">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between gap-3 px-5 py-4 sm:px-8 ${
                  task.priority === 1 ? "bg-red-200/80" : "bg-blue-200/70"
                }`}
              >
                <span className="min-w-0 truncate text-base font-medium text-gray-900">
                  {task.name}
                </span>
                {task.requires_photo && <CameraIcon />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
