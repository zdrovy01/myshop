"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateProfile } from "./actions";

const fieldClass =
  "rounded-[4px] border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900";
const labelClass = "text-sm font-medium text-gray-700";

export type SettingsInitial = {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  shopType: "zabka" | "other";
  shopName: string;
  shopAddress: string;
};

export default function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const router = useRouter();

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [email, setEmail] = useState(initial.email);
  const [shopType, setShopType] = useState<"zabka" | "other">(initial.shopType);
  const [shopName, setShopName] = useState(
    initial.shopType === "other" ? initial.shopName : "",
  );
  const [shopAddress, setShopAddress] = useState(initial.shopAddress);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const result = await updateProfile({
      firstName,
      lastName,
      email,
      shopType,
      shopName,
      shopAddress,
    });

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <div className="py-8">
      <Link
        href="/settings"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-900"
      >
        ← Ustawienia
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">
        Ustawienia konta
      </h1>

      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Numer telefonu</label>
          <input
            value={initial.phone}
            disabled
            className={`${fieldClass} cursor-not-allowed bg-gray-50 text-gray-500`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className={labelClass}>
            Imię
          </label>
          <input
            id="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className={labelClass}>
            Nazwisko
          </label>
          <input
            id="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="shopType" className={labelClass}>
            Sklep
          </label>
          <select
            id="shopType"
            value={shopType}
            onChange={(e) => setShopType(e.target.value as "zabka" | "other")}
            className={`${fieldClass} bg-white`}
          >
            <option value="zabka">Żabka</option>
            <option value="other">Inny sklep</option>
          </select>
        </div>

        {shopType === "other" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="shopName" className={labelClass}>
              Nazwa sklepu
            </label>
            <input
              id="shopName"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className={fieldClass}
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="shopAddress" className={labelClass}>
            Adres sklepu
          </label>
          <input
            id="shopAddress"
            required
            value={shopAddress}
            onChange={(e) => setShopAddress(e.target.value)}
            className={fieldClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Zapisano zmiany.</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 self-start rounded-[4px] bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "..." : "Zapisz zmiany"}
        </button>
      </form>
    </div>
  );
}
