import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 shrink-0 text-emerald-400"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const features = [
  "Nielimitowana liczba zadań",
  "Do 5 pracowników",
  "Zdjęcia i notatki wykonania",
  "Kod QR dla pracowników",
  "Historia wykonanych zadań",
];

export default async function SubscriptionPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("created_at")
    .eq("id", userId)
    .maybeSingle();

  // Пробний період — 1 місяць від реєстрації.
  const created = data?.created_at ? new Date(data.created_at) : new Date();
  const trialEnd = new Date(created);
  trialEnd.setMonth(trialEnd.getMonth() + 1);
  const daysLeft = Math.ceil(
    (trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  const trialActive = daysLeft > 0;

  const trialEndLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-100">Subskrypcja</h1>
      <p className="mt-1 text-sm text-gray-400">
        Pierwszy miesiąc gratis, potem 99 zł miesięcznie.
      </p>

      {/* Статус */}
      <div
        className={`mt-6 rounded-xl border p-4 ${
          trialActive
            ? "border-emerald-500/40 bg-emerald-500/[0.06]"
            : "border-amber-500/40 bg-amber-500/[0.06]"
        }`}
      >
        {trialActive ? (
          <>
            <p className="text-sm font-semibold text-emerald-400">
              Okres próbny aktywny
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Pozostało {daysLeft}{" "}
              {daysLeft === 1 ? "dzień" : "dni"} — do {trialEndLabel}. Później
              subskrypcja 99 zł / miesiąc.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-amber-400">
              Okres próbny zakończony
            </p>
            <p className="mt-1 text-sm text-gray-300">
              Aby dalej korzystać z aplikacji, wykup subskrypcję.
            </p>
          </>
        )}
      </div>

      {/* План */}
      <div className="mt-4 rounded-xl border border-[#26262b] bg-[#161619] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">MyShop Pro</h2>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            1. miesiąc gratis
          </span>
        </div>

        <div className="mt-3 flex items-end gap-1">
          <span className="text-3xl font-bold text-gray-100">99 zł</span>
          <span className="mb-1 text-sm text-gray-400">/ miesiąc</span>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {features.map((f) => (
            <li key={f} className="flex gap-2 text-sm text-gray-300">
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="mt-6 w-full rounded-[4px] bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
        >
          {trialActive ? "Aktywuj subskrypcję" : "Wykup subskrypcję"}
        </button>
        <p className="mt-3 text-center text-xs text-gray-500">
          Płatności online obsłużymy wkrótce.
        </p>
      </div>
    </div>
  );
}
