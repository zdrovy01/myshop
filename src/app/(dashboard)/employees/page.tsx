import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import EmployeesList, { type Employee } from "./EmployeesList";

export default async function EmployeesPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, pin")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const employees: Employee[] = data ?? [];

  return (
    <div className="py-8">
      <EmployeesList initial={employees} />
    </div>
  );
}
