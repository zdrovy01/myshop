"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { createShift, deleteShift, updateShift } from "./actions";

export type ScheduleEmployee = { id: string; name: string };
export type ScheduleDay = {
  iso: string;
  label: string;
  dayNum: number;
  isToday: boolean;
  isWeekend: boolean;
};
export type Shift = {
  id: string;
  employeeId: string;
  start: string;
  end: string;
};
export type ShiftMap = Record<string, Shift[]>; // ключ — дата (iso)

const pad = (n: number) => String(n).padStart(2, "0");
const MONTHS_SHORT = [
  "sty",
  "lut",
  "mar",
  "kwi",
  "maj",
  "cze",
  "lip",
  "sie",
  "wrz",
  "paź",
  "lis",
  "gru",
];

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function durationMin(start: string, end: string) {
  let d = toMin(end) - toMin(start);
  if (d <= 0) d += 24 * 60;
  return d;
}
function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
// Маска для ручного вводу часу: цифри → "GG:MM".
function maskTime(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
const TIME_OK = /^([01]\d|2[0-3]):[0-5]\d$/;

type Dialog = { day: ScheduleDay; title: string; editing?: Shift };

export default function ScheduleGrid({
  employees,
  days,
  shifts: initialShifts,
  month,
  monthLabel,
  monthly,
}: {
  employees: ScheduleEmployee[];
  days: ScheduleDay[];
  shifts: ShiftMap;
  month: string; // YYYY-MM
  monthLabel: string;
  monthly: { id: string; name: string; minutes: number }[];
}) {
  const [selY, selM] = month.split("-").map(Number);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selY);

  const [shifts, setShifts] = useState<ShiftMap>(initialShifts);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [formEmp, setFormEmp] = useState("");
  const [formStart, setFormStart] = useState("06:00");
  const [formEnd, setFormEnd] = useState("14:00");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Масштабування таблиці двома пальцями (щипок).
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;
  const pinchRef = useRef<{ d: number; z: number } | null>(null);
  useEffect(() => {
    const el = tableWrapRef.current;
    if (!el) return;
    const dist = (t: TouchList) =>
      Math.hypot(
        t[0].clientX - t[1].clientX,
        t[0].clientY - t[1].clientY,
      );
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { d: dist(e.touches), z: zoomRef.current };
        e.preventDefault();
      }
    };
    const onMove = (e: TouchEvent) => {
      if (pinchRef.current && e.touches.length === 2) {
        e.preventDefault();
        const ratio = dist(e.touches) / pinchRef.current.d;
        const z =
          Math.round(
            Math.min(2.5, Math.max(0.6, pinchRef.current.z * ratio)) * 100,
          ) / 100;
        setZoom(z);
      }
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) pinchRef.current = null;
    };
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  const minutesById = new Map(monthly.map((m) => [m.id, m.minutes]));

  function cellShifts(iso: string, employeeId: string) {
    return (shifts[iso] ?? [])
      .filter((s) => s.employeeId === employeeId)
      .sort((a, b) => toMin(a.start) - toMin(b.start));
  }

  function openAdd(day: ScheduleDay, employeeId: string) {
    setFormEmp(employeeId);
    setFormStart("06:00");
    setFormEnd("14:00");
    setError(null);
    setDialog({ day, title: `Dodaj zmianę · ${day.dayNum} ${day.label}` });
  }
  function openEdit(day: ScheduleDay, shift: Shift) {
    setFormEmp(shift.employeeId);
    setFormStart(shift.start);
    setFormEnd(shift.end);
    setError(null);
    setDialog({ day, title: `Zmiana · ${day.dayNum} ${day.label}`, editing: shift });
  }

  function upsertLocal(iso: string, shift: Shift) {
    setShifts((prev) => {
      const list = [...(prev[iso] ?? [])];
      const idx = list.findIndex((s) => s.id === shift.id);
      if (idx >= 0) list[idx] = shift;
      else list.push(shift);
      return { ...prev, [iso]: list };
    });
  }
  function removeLocal(iso: string, id: string) {
    setShifts((prev) => ({
      ...prev,
      [iso]: (prev[iso] ?? []).filter((s) => s.id !== id),
    }));
  }

  async function save() {
    if (!dialog || !formEmp) return;
    if (!TIME_OK.test(formStart) || !TIME_OK.test(formEnd)) {
      setError("Podaj godziny w formacie GG:MM.");
      return;
    }
    setSaving(true);
    setError(null);
    const iso = dialog.day.iso;
    if (dialog.editing) {
      upsertLocal(iso, {
        ...dialog.editing,
        employeeId: formEmp,
        start: formStart,
        end: formEnd,
      });
      const res = await updateShift({
        id: dialog.editing.id,
        employeeId: formEmp,
        start: formStart,
        end: formEnd,
      });
      setSaving(false);
      if ("error" in res) return setError(res.error);
    } else {
      const res = await createShift({
        employeeId: formEmp,
        date: iso,
        start: formStart,
        end: formEnd,
      });
      setSaving(false);
      if ("error" in res) return setError(res.error);
      upsertLocal(iso, {
        id: res.id,
        employeeId: formEmp,
        start: formStart,
        end: formEnd,
      });
    }
    setDialog(null);
  }

  async function remove() {
    if (!dialog?.editing) return;
    setSaving(true);
    removeLocal(dialog.day.iso, dialog.editing.id);
    await deleteShift(dialog.editing.id);
    setSaving(false);
    setDialog(null);
  }

  async function downloadXlsx() {
    setExporting(true);
    try {
      const XLSX = await import("xlsx");
      const header = [
        "Pracownik",
        ...days.map((d) => `${d.dayNum} ${d.label}`),
        "Suma (h)",
      ];
      const rows = employees.map((e) => {
        const cells = days.map((d) =>
          cellShifts(d.iso, e.id)
            .map((s) => `${s.start}-${s.end}`)
            .join(" / "),
        );
        const hours =
          Math.round(((minutesById.get(e.id) ?? 0) / 60) * 100) / 100;
        return [e.name, ...cells, hours];
      });
      const aoa: (string | number)[][] = [
        [`Grafik pracy — ${monthLabel}`],
        header,
        ...rows,
      ];
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = [{ wch: 20 }, ...days.map(() => ({ wch: 12 })), { wch: 10 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Grafik");
      XLSX.writeFile(wb, `grafik-pracy-${month}.xlsx`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Перемикач місяця + експорт */}
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            setPickerYear(selY);
            setPickerOpen((o) => !o);
          }}
          className="flex items-center gap-1.5 rounded-full bg-[#212121] px-4 py-1.5 text-sm font-semibold capitalize text-gray-100 transition-colors hover:bg-[#2c2c2c]"
        >
          {monthLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={downloadXlsx}
          disabled={exporting}
          className="absolute right-0 flex items-center gap-1.5 rounded-full bg-[#212121] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:bg-[#2c2c2c] disabled:opacity-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span className="hidden sm:inline">{exporting ? "…" : "XLSX"}</span>
        </button>

        {pickerOpen && (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => setPickerOpen(false)}
              className="fixed inset-0 z-10 cursor-default"
            />
            <div className="absolute top-full z-20 mt-2 w-64 rounded-xl border border-[#26262b] bg-[#1a1a1e] p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={() => setPickerYear((y) => y - 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 hover:bg-[#2c2c2c]" aria-label="Poprzedni rok">‹</button>
                <span className="text-sm font-semibold text-gray-100">{pickerYear}</span>
                <button type="button" onClick={() => setPickerYear((y) => y + 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-gray-300 hover:bg-[#2c2c2c]" aria-label="Następny rok">›</button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {MONTHS_SHORT.map((label, i) => {
                  const isSel = pickerYear === selY && i + 1 === selM;
                  return (
                    <Link
                      key={label}
                      href={`/schedule?month=${pickerYear}-${pad(i + 1)}`}
                      onClick={() => setPickerOpen(false)}
                      className={`rounded-md px-2 py-2 text-center text-xs font-medium capitalize transition-colors ${
                        isSel ? "bg-[#2c67c5] text-white" : "text-gray-300 hover:bg-[#2c2c2c]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Таблиця — пласка сітка як у Google Sheets (темна) */}
      {employees.length === 0 ? (
        <p className="border border-[#2f2f2f] bg-[#181818] px-4 py-6 text-center text-sm text-gray-400">
          Najpierw dodaj pracowników w zakładce „Pracownicy”.
        </p>
      ) : (
        <div
          ref={tableWrapRef}
          style={{ touchAction: "pan-x pan-y" }}
          className="max-h-[72vh] overflow-auto border border-[#2f2f2f]"
        >
          <div style={{ zoom }}>
            <table className="border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[140px] border border-[#2f2f2f] bg-[#202020] px-3 py-1.5 text-left text-xs font-semibold text-gray-300">
                  Pracownik
                </th>
                {days.map((d) => (
                  <th
                    key={d.iso}
                    className={`w-[56px] min-w-[56px] border border-[#2f2f2f] px-1 py-1 text-center ${
                      d.isToday
                        ? "bg-[#1d2a3f]"
                        : d.isWeekend
                          ? "bg-[#241a1a]"
                          : "bg-[#202020]"
                    }`}
                  >
                    <div
                      className={`text-[10px] font-medium uppercase ${
                        d.isToday ? "text-[#5b9bff]" : d.isWeekend ? "text-rose-400" : "text-gray-500"
                      }`}
                    >
                      {d.label}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        d.isWeekend && !d.isToday ? "text-rose-400" : "text-gray-100"
                      }`}
                    >
                      {d.dayNum}
                    </div>
                  </th>
                ))}
                <th className="min-w-[64px] border border-[#2f2f2f] bg-[#202020] px-2 py-1.5 text-center text-xs font-semibold text-gray-300">
                  Suma
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id}>
                  <td className="sticky left-0 z-10 border border-[#2f2f2f] bg-[#171717] px-3 py-1.5 text-sm text-gray-100">
                    <span className="block max-w-[160px] truncate">{e.name}</span>
                  </td>
                  {days.map((d) => {
                    const cs = cellShifts(d.iso, e.id);
                    return (
                      <td
                        key={d.iso}
                        onClick={() => cs.length === 0 && openAdd(d, e.id)}
                        className={`h-10 border border-[#2f2f2f] px-0.5 align-middle ${
                          d.isToday
                            ? "bg-[#1d2a3f]/30"
                            : d.isWeekend
                              ? "bg-[#241a1a]/50"
                              : "bg-[#161616]"
                        } ${cs.length === 0 ? "cursor-pointer hover:bg-[#242424]" : ""}`}
                      >
                        {cs.length === 0 ? (
                          <span className="flex items-center justify-center text-gray-700">
                            +
                          </span>
                        ) : (
                          <div className="flex flex-col leading-tight">
                            {cs.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => openEdit(d, s)}
                                className="text-center text-[10px] font-medium text-[#7db0ff] hover:underline"
                              >
                                {s.start}-{s.end}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => openAdd(d, e.id)}
                              className="text-center text-[10px] text-gray-600 hover:text-gray-400"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="border border-[#2f2f2f] bg-[#171717] px-2 py-1.5 text-center text-sm font-semibold text-gray-200">
                    {Math.round(((minutesById.get(e.id) ?? 0) / 60) * 10) / 10}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Підсумок за місяць */}
      {employees.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold capitalize text-gray-300">
            Godziny w miesiącu — {monthLabel}
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <div className="overflow-x-auto border border-[#2f2f2f]">
              <table className="border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="min-w-[180px] border border-[#2f2f2f] bg-[#202020] px-3 py-1.5 text-left text-xs font-semibold text-gray-300">
                      Pracownik
                    </th>
                    <th className="w-20 border border-[#2f2f2f] bg-[#202020] px-3 py-1.5 text-right text-xs font-semibold text-gray-300">
                      Godziny
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((m) => (
                    <tr key={m.id}>
                      <td className="border border-[#2f2f2f] bg-[#161616] px-3 py-1.5 text-gray-100">
                        {m.name}
                      </td>
                      <td className="w-20 border border-[#2f2f2f] bg-[#161616] px-3 py-1.5 text-right font-semibold text-gray-200">
                        {fmtDuration(m.minutes)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-center border border-[#2f2f2f] bg-[#202020] px-5 py-3">
              <span className="text-xs text-gray-400">Razem</span>
              <span className="text-xl font-semibold text-gray-100">
                {fmtDuration(monthly.reduce((sum, m) => sum + m.minutes, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Діалог */}
      {dialog && (
        <Modal title={dialog.title} onClose={() => setDialog(null)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="shift-emp" className="text-sm font-medium text-gray-200">
                Pracownik
              </label>
              <select
                id="shift-emp"
                value={formEmp}
                onChange={(e) => setFormEmp(e.target.value)}
                className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shift-start" className="text-sm font-medium text-gray-200">
                  Od
                </label>
                <input
                  id="shift-start"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="GG:MM"
                  value={formStart}
                  onChange={(e) => setFormStart(maskTime(e.target.value))}
                  className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm tracking-wide outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shift-end" className="text-sm font-medium text-gray-200">
                  Do
                </label>
                <input
                  id="shift-end"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="GG:MM"
                  value={formEnd}
                  onChange={(e) => setFormEnd(maskTime(e.target.value))}
                  className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm tracking-wide outline-none focus:border-gray-400"
                />
              </div>
            </div>

            {TIME_OK.test(formStart) && TIME_OK.test(formEnd) && (
              <p className="text-xs text-gray-400">
                Czas pracy: {fmtDuration(durationMin(formStart, formEnd))}
              </p>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex items-center justify-between gap-2">
              {dialog.editing ? (
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="rounded-[4px] px-3 py-2 text-sm font-medium text-red-400 hover:bg-[#2c2c2c] disabled:opacity-40"
                >
                  Usuń
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDialog(null)}
                  className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#2c2c2c]"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !formEmp}
                  className="rounded-[4px] bg-[#2c67c5] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Zapisz
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
