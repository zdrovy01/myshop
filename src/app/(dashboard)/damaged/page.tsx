import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import DamagedList, { type DamagedItem } from "./DamagedList";

export const metadata = { title: "Uszkodzone towary" };

type Row = {
  id: string;
  note: string | null;
  photo_urls: string[] | null;
  created_at: string;
  reviewed: boolean | null;
};

export default async function DamagedPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("damaged_items")
    .select("id, note, photo_urls, created_at, reviewed")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const fmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items: DamagedItem[] = ((data ?? []) as Row[]).map((r) => ({
    id: r.id,
    note: r.note,
    photoUrls: r.photo_urls ?? [],
    dateLabel: fmt.format(new Date(r.created_at)),
    reviewed: Boolean(r.reviewed),
  }));

  return (
    <div className="py-8">
      <h1 className="mb-6 hidden text-2xl font-semibold text-gray-100 md:block">
        Uszkodzone towary
      </h1>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-[#26262b] bg-[#212121] px-4 py-6 text-center text-sm text-gray-400">
          Brak zgłoszeń.
        </p>
      ) : (
        <DamagedList items={items} />
      )}
    </div>
  );
}
