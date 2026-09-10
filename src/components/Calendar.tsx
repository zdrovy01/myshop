"use client";

import { useState } from "react";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];
const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar({
  value,
  onSelect,
  min,
  max,
  statuses = {},
}: {
  value: Date;
  onSelect: (d: Date) => void;
  min?: Date;
  max?: Date;
  statuses?: Record<string, "done" | "partial">;
}) {
  const [view, setView] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const today = new Date();
  const year = view.getFullYear();
  const month = view.getMonth();

  const offset = (new Date(year, month, 1).getDay() + 6) % 7; // пн = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView(new Date(year, month - 1, 1))}
          aria-label="Poprzedni miesiąc"
          className="rounded-[4px] px-2 py-1 text-gray-400 hover:bg-[#2c2c2c] hover:text-gray-100"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-100">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Następny miesiąc"
          className="rounded-[4px] px-2 py-1 text-gray-400 hover:bg-[#2c2c2c] hover:text-gray-100"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
        {WEEKDAYS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const date = new Date(year, month, d);
          const selected = sameDay(date, value);
          const isToday = sameDay(date, today);
          const disabled =
            (min !== undefined && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) ||
            (max !== undefined && date > new Date(max.getFullYear(), max.getMonth(), max.getDate()));
          const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const status = disabled ? undefined : statuses[iso];
          const todayMidnight = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
          );
          const isFuture = !disabled && !isToday && date > todayMidnight;
          const ring = isToday
            ? " ring-1 ring-inset ring-[#2c67c5]"
            : isFuture
              ? " ring-1 ring-inset ring-[#3a3a3a]"
              : "";
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`relative flex h-9 items-center justify-center rounded-[4px] text-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed text-gray-700"
                  : selected
                    ? "bg-white font-semibold text-black"
                    : isToday
                      ? "bg-[#212121] font-semibold text-gray-100"
                      : "text-gray-200 hover:bg-[#2c2c2c]"
              }${ring}`}
            >
              {d}
              {status && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    status === "done" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
