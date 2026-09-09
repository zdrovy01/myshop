import Link from "next/link";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const options: {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}[] = [
  {
    label: "Ustawienia konta",
    description: "Dane osobowe, sklep i adres",
    href: "/settings/account",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    label: "QR kod listy zadań",
    description: "Kod i link do listy zadań",
    href: "/settings/qr",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M21 14v7h-7v-3" />
      </svg>
    ),
  },
  {
    label: "Preferencje",
    description: "Ustawienia aplikacji",
    href: "/settings/preferences",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...stroke} aria-hidden="true">
        <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h6M14 18h6" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="8" cy="12" r="2" />
        <circle cx="12" cy="18" r="2" />
      </svg>
    ),
  },
];

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

export default function SettingsPage() {
  return (
    <div className="py-8">
      <h1 className="mb-6 hidden text-2xl font-semibold text-gray-100 md:block">
        Ustawienia
      </h1>

      <div className="divide-y divide-[#26262b] overflow-hidden rounded-2xl border border-[#26262b] bg-[#161619]">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-[#1c1c20]"
          >
            <span className="shrink-0 text-gray-300">{opt.icon}</span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-medium text-gray-100">
                {opt.label}
              </span>
              <span className="truncate text-xs text-gray-400">
                {opt.description}
              </span>
            </span>
            <Chevron />
          </Link>
        ))}
      </div>
    </div>
  );
}
