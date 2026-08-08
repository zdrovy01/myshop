import Link from "next/link";

export default function LanguageSettingsPage() {
  return (
    <div className="py-8">
      <Link
        href="/settings"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← Ustawienia
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Język</h1>
      <p className="text-sm text-gray-500">Wkrótce.</p>
    </div>
  );
}
