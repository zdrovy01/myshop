import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

function Chevron() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-gray-500"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function Row({
  icon,
  title,
  subtitle,
  danger = false,
  external = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  danger?: boolean;
  external?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[#1c1c20]"
    >
      <span
        className={`shrink-0 ${danger ? "text-red-400" : "text-gray-300"}`}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span
          className={`text-sm font-medium ${danger ? "text-red-400" : "text-gray-100"}`}
        >
          {title}
        </span>
        {subtitle && (
          <span className="truncate text-xs text-gray-400">{subtitle}</span>
        )}
      </span>
      {external ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-gray-500"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6M10 14 21 3" />
        </svg>
      ) : (
        <Chevron />
      )}
    </button>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default async function SubscriptionPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("created_at, subscribed")
    .eq("id", userId)
    .maybeSingle();

  const subscribed = Boolean(data?.subscribed);
  const planName = subscribed ? "MyShop" : "MyShop trial";

  // Пробний період — 1 місяць від реєстрації.
  const created = data?.created_at ? new Date(data.created_at) : new Date();
  const trialEnd = new Date(created);
  trialEnd.setMonth(trialEnd.getMonth() + 1);
  const trialEndLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-100">Subskrypcja</h1>
      <p className="mt-1 text-sm text-gray-400">
        Zarządzaj planem i płatnościami.
      </p>

      {/* Поточний план */}
      <div className="mt-6 rounded-2xl border border-[#26262b] bg-[#161619] p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Obecny plan
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-100">{planName}</p>
            <p className="mt-1 text-lg text-gray-200">
              99 zł <span className="text-sm text-gray-400">/ miesiąc</span>
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {subscribed
                ? "Subskrypcja aktywna"
                : `Pierwszy miesiąc gratis · do ${trialEndLabel}`}
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#232327]">
            <Image
              src="/logo.png"
              alt="MyShop"
              width={1555}
              height={400}
              className="h-auto w-11 invert"
            />
          </div>
        </div>
      </div>

      {/* Дії */}
      <div className="mt-4 divide-y divide-[#26262b] overflow-hidden rounded-2xl border border-[#26262b] bg-[#161619]">
        <Row
          title="Płatności"
          subtitle="Zmień metodę płatności"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          }
        />
        <Row
          title="Historia płatności"
          subtitle="Zobacz swoje faktury"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          }
        />
        <Row
          title="Szczegóły planu"
          subtitle="Funkcje i limity"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          }
        />
      </div>

      {/* Скасувати */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#26262b] bg-[#161619]">
        <Row
          danger
          title="Anuluj subskrypcję"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M15 9l-6 6M9 9l6 6" />
            </svg>
          }
        />
      </div>

      {/* Допомога */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#26262b] bg-[#161619]">
        <Row
          external
          title="Potrzebujesz pomocy?"
          subtitle="Odwiedź centrum pomocy"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
