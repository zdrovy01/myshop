import Link from "next/link";

const options: { label: string; description: string; href: string }[] = [
  {
    label: "Ustawienia konta",
    description: "Dane osobowe, sklep i adres",
    href: "/settings/account",
  },
  {
    label: "QR kod listy zadań",
    description: "Kod i link do listy zadań",
    href: "/settings/qr",
  },
  {
    label: "Język",
    description: "Język aplikacji",
    href: "/settings/language",
  },
];

function ChevronRight() {
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
      className="text-gray-400"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function SettingsPage() {
  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Ustawienia</h1>

      <ul className="flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
        {options.map((opt) => (
          <li key={opt.href}>
            <Link
              href={opt.href}
              className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-gray-50"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {opt.label}
                </span>
                <span className="text-xs text-gray-500">{opt.description}</span>
              </span>
              <ChevronRight />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
