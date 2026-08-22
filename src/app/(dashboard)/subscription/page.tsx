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

const features: string[] = [
  "Lista zadań i wykonania",
  "Pracownicy z PIN",
  "Kod QR dla pracowników",
  "Zdjęcia i notatki wykonania",
  "Historia wykonanych zadań",
  "Priorytetowe wsparcie",
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
    <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center md:min-h-screen md:justify-center md:py-10">
      {/* Лого замість зірочки */}
      <Image
        src="/logo.png"
        alt="MyShop"
        width={1555}
        height={400}
        priority
        className="h-auto w-40 invert"
      />

      <p className="mt-6 text-lg text-gray-400">
        Wszystko, czego potrzebuje Twój sklep.
      </p>

      {/* Що дає підписка */}
      <div className="mt-8 w-full rounded-2xl border border-[#26262b] bg-[#161619] p-5 text-left">
        <p className="text-sm text-gray-300">
          Przez pierwszy miesiąc masz wszystko za darmo. Wykup subskrypcję, aby
          po okresie próbnym dalej korzystać ze wszystkich funkcji:
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-3">
              <Check plus />
              <span className="text-sm text-gray-100">{f}</span>
            </li>
          ))}
        </ul>
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
