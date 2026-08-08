"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, register } from "./actions";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === "login"
        ? await login(phone, password)
        : await register(phone, password);

    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push(result.needsOnboarding ? "/onboarding" : "/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">
          {mode === "login" ? "Zaloguj się" : "Utwórz konto"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">MyShop by zdrovy</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Numer telefonu
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              placeholder="+48123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-[4px] border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-[4px] border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-[4px] bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "login"
                ? "Zaloguj się"
                : "Zarejestruj się"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
          className="mt-4 text-sm text-gray-500 hover:text-gray-900"
        >
          {mode === "login"
            ? "Nie masz konta? Zarejestruj się"
            : "Masz już konto? Zaloguj się"}
        </button>
      </div>
    </div>
  );
}
