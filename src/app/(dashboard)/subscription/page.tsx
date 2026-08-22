import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

function Check({ plus = false }: { plus?: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={plus ? "text-sky-400" : "text-gray-400"}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Dash() {
  return <span className="text-gray-600">—</span>;
}

const features: { label: string; free: boolean }[] = [
  { label: "Lista zadań i wykonania", free: true },
  { label: "Pracownicy z PIN", free: true },
  { label: "Kod QR dla pracowników", free: true },
  { label: "Zdjęcia i notatki wykonania", free: false },
  { label: "Historia wykonanych zadań", free: false },
  { label: "Priorytetowe wsparcie", free: false },
];

export default async function SubscriptionPage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("created_at, subscribed")
    .eq("id", userId)
    .maybeSingle();

  const subscribed = Boolean(data?.subscribed);
  const created = data?.created_at ? new Date(data.created_at) : new Date();
  const trialEnd = new Date(created);
  trialEnd.setMonth(trialEnd.getMonth() + 1);
  const trialEndLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(trialEnd);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center">
      {/* Лого замість зірочки */}
      <Image
        src="/logo.png"
        alt="MyShop"
        width={1555}
        height={400}
        priority
        className="h-auto w-40 invert"
      />

      <h1 className="mt-8 text-4xl font-bold text-gray-100">MyShop</h1>
      <p className="mt-3 text-lg text-gray-400">
        Wszystko, czego potrzebuje Twój sklep.
      </p>

      {/* Таблиця порівняння */}
      <div className="mt-8 w-full rounded-2xl border border-[#26262b] bg-[#161619] p-5">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-b border-[#26262b] pb-3 text-sm">
          <span className="text-left font-medium text-gray-400">Funkcje</span>
          <span className="w-14 text-center font-medium text-gray-400">
            Darmowy
          </span>
          <span className="w-14 text-center font-semibold text-sky-400">
            MyShop
          </span>
        </div>

        {features.map((f) => (
          <div
            key={f.label}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-b border-[#26262b] py-4 last:border-0"
          >
            <span className="text-left text-sm text-gray-100">{f.label}</span>
            <span className="flex w-14 justify-center">
              {f.free ? <Check /> : <Dash />}
            </span>
            <span className="flex w-14 justify-center">
              <Check plus />
            </span>
          </div>
        ))}
      </div>

      {/* Кнопка / статус */}
      {subscribed ? (
        <div className="mt-8 w-full rounded-full bg-[#232327] py-4 text-center text-base font-semibold text-gray-300">
          Subskrypcja aktywna
        </div>
      ) : (
        <>
          <button
            type="button"
            className="mt-8 w-full rounded-full bg-white py-4 text-base font-semibold text-gray-900 transition-colors hover:bg-gray-200"
          >
            Aktywuj za 99 zł / miesiąc
          </button>
          <p className="mt-3 text-sm text-gray-400">
            Pierwszy miesiąc gratis do {trialEndLabel}. Odnawia się co miesiąc.
            Anuluj w każdej chwili.
          </p>
        </>
      )}
    </div>
  );
}
