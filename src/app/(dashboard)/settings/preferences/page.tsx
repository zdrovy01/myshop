import BackHeader from "@/components/BackHeader";
import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import PreferencesForm from "./PreferencesForm";

export const metadata = { title: "Preferencje" };

export default async function PreferencesSettingsPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();

  let showSchedule = true;
  const { data } = await supabase
    .from("users")
    .select("show_schedule")
    .eq("id", userId)
    .maybeSingle();
  if (data && typeof data.show_schedule === "boolean") {
    showSchedule = data.show_schedule;
  }

  return (
    <div className="py-8">
      <BackHeader href="/settings" title="Preferencje" />
      <PreferencesForm initialShowSchedule={showSchedule} />
    </div>
  );
}
