"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { completeTask } from "./actions";

export type PublicTask = {
  id: string;
  name: string;
  priority: 1 | 2;
  requiresPhoto: boolean;
};
export type PublicEmployee = { id: string; name: string };

// Стискає фото до розумного розміру перед відправкою.
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1280;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("no ctx"));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PublicTasksList({
  tasks,
  employees,
  completedIds = [],
}: {
  tasks: PublicTask[];
  employees: PublicEmployee[];
  completedIds?: string[];
}) {
  const [active, setActive] = useState<PublicTask | null>(null);
  const [pinStep, setPinStep] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(
    () => new Set(completedIds),
  );

  function openComplete(task: PublicTask) {
    setActive(task);
    setPinStep(false);
    setEmployeeId("");
    setNote("");
    setPhoto(null);
    setPin("");
    setError(null);
  }

  function closeAll() {
    setActive(null);
    setPinStep(false);
  }

  function goToPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!employeeId) {
      setError("Wybierz pracownika.");
      return;
    }
    if (active?.requiresPhoto && !photo) {
      setError("To zadanie wymaga zdjęcia.");
      return;
    }
    setPin("");
    setPinStep(true);
  }

  async function confirmPin(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setError(null);
    setLoading(true);
    const result = await completeTask({
      taskId: active.id,
      employeeId,
      pin,
      note,
      photoBase64: photo,
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDoneIds((prev) => new Set(prev).add(active.id));
    closeAll();
  }

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(await fileToDataUrl(file));
  }

  return (
    <>
      <ul className="-mx-5 flex flex-col sm:-mx-8">
        {[...tasks]
          .sort(
            (a, b) => Number(doneIds.has(a.id)) - Number(doneIds.has(b.id)),
          )
          .map((task) => {
            const done = doneIds.has(task.id);
            return (
              <li
                key={task.id}
                className={`flex items-center justify-between gap-3 px-5 py-4 sm:px-8 ${
                  done
                    ? "bg-gray-100"
                    : task.priority === 1
                      ? "bg-red-200/80"
                      : "bg-blue-200/70"
                }`}
              >
                <span
                  className={`min-w-0 truncate text-base font-medium ${
                    done ? "text-gray-400" : "text-gray-900"
                  }`}
                >
                  {task.name}
                </span>
                {done ? (
                  <span className="shrink-0 text-sm font-medium text-gray-400">
                    Wykonane
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => openComplete(task)}
                    className="shrink-0 rounded-[4px] bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Wykonaj
                  </button>
                )}
              </li>
            );
          })}
      </ul>

      {active && !pinStep && (
        <Modal title={active.name} onClose={closeAll}>
          <form onSubmit={goToPin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Pracownik
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="rounded-[4px] border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              >
                <option value="">Wybierz pracownika…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Notatka (opcjonalnie)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none rounded-[4px] border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
              />
            </div>

            {active.requiresPhoto && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Zdjęcie (wymagane)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPhotoChange}
                  className="text-sm"
                />
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt="Podgląd"
                    className="mt-1 h-32 w-32 rounded-[4px] border border-gray-200 object-cover"
                  />
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAll}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Zapisz
              </button>
            </div>
          </form>
        </Modal>
      )}

      {active && pinStep && (
        <Modal title="Wprowadź PIN" onClose={closeAll}>
          <form onSubmit={confirmPin} className="flex flex-col gap-4">
            <input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              className="rounded-[4px] border border-gray-300 px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-gray-900"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPinStep(false);
                  setError(null);
                }}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Wstecz
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "..." : "Potwierdź"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
