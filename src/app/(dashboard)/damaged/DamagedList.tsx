"use client";

import { useState } from "react";
import PhotoThumb from "@/components/PhotoThumb";
import { setDamagedReviewed } from "./actions";

export type DamagedItem = {
  id: string;
  note: string | null;
  photoUrls: string[];
  dateLabel: string;
  reviewed: boolean;
};

export default function DamagedList({
  items: initial,
}: {
  items: DamagedItem[];
}) {
  const [items, setItems] = useState(initial);

  async function toggle(id: string, next: boolean) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, reviewed: next } : it)),
    );
    await setDamagedReviewed(id, next);
  }

  // Неперевірені — зверху.
  const sorted = [...items].sort(
    (a, b) => Number(a.reviewed) - Number(b.reviewed),
  );

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((it) => (
        <li
          key={it.id}
          className={`rounded-2xl border p-4 transition-colors ${
            it.reviewed
              ? "border-[#26262b] bg-[#161616]"
              : "border-[#26262b] bg-[#212121]"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {it.dateLabel}
              {it.reviewed && (
                <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Sprawdzone
                </span>
              )}
            </span>

            <button
              type="button"
              onClick={() => toggle(it.id, !it.reviewed)}
              aria-pressed={it.reviewed}
              aria-label={it.reviewed ? "Oznacz jako niesprawdzone" : "Oznacz jako sprawdzone"}
              title={it.reviewed ? "Sprawdzone" : "Oznacz jako sprawdzone"}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                it.reviewed
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-[#34343c] text-gray-400 hover:bg-[#2c2c2c] hover:text-gray-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          </div>

          {it.note && (
            <p
              className={`mb-3 text-sm ${
                it.reviewed ? "text-gray-400" : "text-gray-200"
              }`}
            >
              {it.note}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {it.photoUrls.map((url, i) => (
              <PhotoThumb key={i} src={url} alt={`Uszkodzony towar ${i + 1}`} />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
