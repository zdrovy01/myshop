import Link from "next/link";

export default function BackHeader({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link
        href={href}
        aria-label="Wstecz"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
