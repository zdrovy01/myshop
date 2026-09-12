"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { setShowSchedule } from "./actions";

export default function PreferencesForm({
  initialShowSchedule,
}: {
  initialShowSchedule: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initialShowSchedule);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    await setShowSchedule(next);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#26262b] bg-[#212121]">
      <div className="flex items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100">Grafik pracy</p>
          <p className="text-xs text-gray-400">
            Pokaż zakładkę „Grafik pracy” w panelu bocznym.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Grafik pracy"
          onClick={toggle}
          disabled={saving}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            on ? "bg-[#2c67c5]" : "bg-[#34343c]"
          }`}
        >
          <span
            className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              on ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
