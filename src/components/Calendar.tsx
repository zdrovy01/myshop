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
}: {
  value: Date;
  onSelect: (d: Date) => void;
  min?: Date;
  max?: Date;
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
          className="rounded-[4px] px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-gray-900">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Następny miesiąc"
          className="rounded-[4px] px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
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
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={`h-9 rounded-[4px] text-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed text-gray-300"
                  : selected
                    ? "bg-gray-900 text-white"
                    : isToday
                      ? "bg-gray-100 font-semibold text-gray-900"
                      : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
