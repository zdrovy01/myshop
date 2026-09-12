import { getSessionUserId } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayWarsaw } from "@/lib/date";
import ScheduleGrid, {
  type ScheduleDay,
  type ScheduleEmployee,
  type ShiftMap,
} from "./ScheduleGrid";

export const metadata = { title: "Grafik pracy" };

const pad = (n: number) => String(n).padStart(2, "0");
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień",
];

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const userId = await getSessionUserId();
  const supabase = createAdminClient();

  const todayStr = todayWarsaw();
  const [ty, tm] = todayStr.split("-").map(Number);

  // Обраний місяць (1-based). За замовчуванням — поточний.
  let my = ty;
  let mm = tm;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [a, b] = month.split("-").map(Number);
    my = a;
    mm = b;
  }
  const monthParam = `${my}-${pad(mm)}`;

  const first = new Date(my, mm - 1, 1);
  const last = new Date(my, mm, 0);

  // Усі дні місяця як колонки таблиці.
  const days: ScheduleDay[] = Array.from({ length: last.getDate() }, (_, i) => {
    const date = new Date(my, mm - 1, i + 1);
    const iso = isoLocal(date);
    const dow = date.getDay();
    return {
      iso,
      label: WEEKDAYS[(dow + 6) % 7],
      dayNum: i + 1,
      isToday: iso === todayStr,
      isWeekend: dow === 0 || dow === 6,
    };
  });

  const { data: employeeRows } = await supabase
    .from("employees")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const employees: ScheduleEmployee[] = employeeRows ?? [];

  // Зміни за весь місяць (для сітки й підсумку).
  const { data: shiftRows } = await supabase
    .from("shifts")
    .select("id, employee_id, shift_date, start_time, end_time")
    .eq("user_id", userId)
    .gte("shift_date", isoLocal(first))
    .lte("shift_date", isoLocal(last));

  const shifts: ShiftMap = {};
  const toMin = (t: string) => {
    const [h, m] = t.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
  };
  const monthMinutes: Record<string, number> = {};
  for (const r of (shiftRows ?? []) as Array<{
    id: string;
    employee_id: string;
    shift_date: string;
    start_time: string;
    end_time: string;
  }>) {
    (shifts[r.shift_date] ??= []).push({
      id: r.id,
      employeeId: r.employee_id,
      start: r.start_time.slice(0, 5),
      end: r.end_time.slice(0, 5),
    });
    let d = toMin(r.end_time) - toMin(r.start_time);
    if (d <= 0) d += 24 * 60;
    monthMinutes[r.employee_id] = (monthMinutes[r.employee_id] ?? 0) + d;
  }

  const monthly = employees
    .map((e) => ({ id: e.id, name: e.name, minutes: monthMinutes[e.id] ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes);

  const monthLabel = `${MONTHS[mm - 1]} ${my}`;

  return (
    <div className="py-8">
      <h1 className="mb-6 hidden text-2xl font-semibold text-gray-100 md:block">
        Grafik pracy
      </h1>
      <ScheduleGrid
        employees={employees}
        days={days}
        shifts={shifts}
        month={monthParam}
        monthLabel={monthLabel}
        monthly={monthly}
      />
    </div>
  );
}
