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

const plans = [
  {
    name: "Darmowy",
    price: "0 zł",
    period: "/ miesiąc",
    current: true,
    highlight: false,
    features: [
      "1 sklep",
      "Do 5 pracowników",
      "Lista zadań i wykonania",
      "Kod QR dla pracowników",
    ],
  },
  {
    name: "Pro",
    price: "49 zł",
    period: "/ miesiąc",
    current: false,
    highlight: true,
    features: [
      "Nielimitowani pracownicy",
      "Historia i statystyki",
      "Zdjęcia wykonania bez limitu",
      "Priorytetowe wsparcie",
    ],
  },
];

export default function SubscriptionPage() {
  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold text-gray-100">Subskrypcja</h1>
      <p className="mt-1 text-sm text-gray-400">
        Zarządzaj swoim planem i płatnościami.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-xl border p-5 ${
              plan.highlight
                ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                : "border-[#26262b] bg-[#161619]"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">
                {plan.name}
              </h2>
              {plan.current && (
                <span className="rounded-full bg-[#232327] px-2.5 py-1 text-xs font-semibold text-gray-300">
                  Aktualny
                </span>
              )}
            </div>

            <div className="mt-3 flex items-end gap-1">
              <span className="text-3xl font-bold text-gray-100">
                {plan.price}
              </span>
              <span className="mb-1 text-sm text-gray-400">{plan.period}</span>
            </div>

            <ul className="mt-5 flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-sm text-gray-300">
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              disabled={plan.current}
              className={`mt-6 rounded-[4px] px-4 py-2.5 text-sm font-medium transition-colors ${
                plan.current
                  ? "cursor-default bg-[#232327] text-gray-500"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"
              }`}
            >
              {plan.current ? "Twój plan" : "Przejdź na Pro"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Płatności obsłużymy wkrótce. W razie pytań napisz do nas.
      </p>
    </div>
  );
}
