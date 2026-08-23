"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import PhotoThumb from "@/components/PhotoThumb";
import { addDoneTask, completeTask, updateCompletion } from "./actions";

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

type Completion = {
  performers: string[]; // імена всіх виконавців
  performerIds?: string[];
  note: string | null;
  photoUrl: string | null;
  completedAt?: string | null;
};

function formatTime(iso: string | null | undefined) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <span
      title={name}
      className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2f2f37] text-[10px] font-semibold text-gray-200 ring-2 ring-[#1a1a1e] first:ml-0"
    >
      {initials(name)}
    </span>
  );
}

function PriorityTag() {
  return (
    <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-400">
      Priorytet 1
    </span>
  );
}

function FotoTag() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-300">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
      Foto
    </span>
  );
}

function NameTag({ name }: { name: string }) {
  return (
    <span className="rounded-full bg-[#232327] px-2.5 py-1 text-xs font-medium text-gray-300">
      {name}
    </span>
  );
}

export default function PublicTasksList({
  token,
  tasks,
  employees,
  completedIds = [],
  completions = {},
}: {
  token: string;
  tasks: PublicTask[];
  employees: PublicEmployee[];
  completedIds?: string[];
  completions?: Record<string, Completion>;
}) {
  const [items, setItems] = useState<PublicTask[]>(tasks);
  const [details, setDetails] = useState<Record<string, Completion>>(
    () => ({ ...completions }),
  );
  const [active, setActive] = useState<PublicTask | null>(null);
  const [editing, setEditing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pinStep, setPinStep] = useState(false);
  // Перший — головний виконавець (вводить PIN), далі — додаткові.
  const [employeeIds, setEmployeeIds] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(
    () => new Set(completedIds),
  );

  // Додати виконане поза списком.
  const [addOpen, setAddOpen] = useState(false);
  const [addPinStep, setAddPinStep] = useState(false);
  const [addDesc, setAddDesc] = useState("");
  const [addEmployeeId, setAddEmployeeId] = useState("");
  const [addPin, setAddPin] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  function openAdd() {
    setAddOpen(true);
    setAddPinStep(false);
    setAddDesc("");
    setAddEmployeeId("");
    setAddPin("");
    setAddError(null);
  }

  function addToPin(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!addDesc.trim()) {
      setAddError("Wpisz, co zostało zrobione.");
      return;
    }
    if (!addEmployeeId) {
      setAddError("Wybierz pracownika.");
      return;
    }
    setAddPin("");
    setAddPinStep(true);
  }

  async function confirmAddPin(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    const result = await addDoneTask({
      token,
      employeeId: addEmployeeId,
      pin: addPin,
      description: addDesc,
    });
    setAddLoading(false);
    if ("error" in result) {
      setAddError(result.error);
      return;
    }
    const newTask: PublicTask = {
      id: result.taskId,
      name: addDesc.trim(),
      priority: 2,
      requiresPhoto: false,
    };
    setItems((prev) => [...prev, newTask]);
    setDetails((prev) => ({
      ...prev,
      [result.taskId]: {
        performers: [result.employeeName],
        note: null,
        photoUrl: null,
        completedAt: result.completedAt,
      },
    }));
    setDoneIds((prev) => new Set(prev).add(result.taskId));
    setAddOpen(false);
  }

  const addPrimaryName =
    employees.find((e) => e.id === addEmployeeId)?.name ?? "";

  function openComplete(task: PublicTask) {
    setActive(task);
    setEditing(false);
    setPinStep(false);
    setEmployeeIds([""]);
    setNote("");
    setPhoto(null);
    setPin("");
    setError(null);
  }

  function openEdit(task: PublicTask) {
    const info = details[task.id];
    setActive(task);
    setEditing(true);
    setPinStep(false);
    setEmployeeIds(info?.performerIds?.length ? info.performerIds : [""]);
    setNote(info?.note ?? "");
    setPhoto(info?.photoUrl ?? null);
    setPin("");
    setError(null);
  }

  // Працівники, ще не вибрані в інших рядках (щоб не дублювались).
  function availableFor(index: number) {
    const taken = new Set(employeeIds.filter((_, i) => i !== index));
    return employees.filter((e) => !taken.has(e.id));
  }

  function closeAll() {
    setActive(null);
    setEditing(false);
    setPinStep(false);
  }

  function goToPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!employeeIds[0]) {
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
    const taskId = active.id;
    const chosen = employeeIds.filter(Boolean);
    const performers = chosen
      .map((id) => employees.find((e) => e.id === id)?.name)
      .filter((n): n is string => Boolean(n));

    // Нове фото — лише якщо це data:-URL (інакше лишаємо існуюче).
    const newPhoto = photo && photo.startsWith("data:") ? photo : null;

    if (editing) {
      const result = await updateCompletion({
        token,
        taskId,
        employeeId: chosen[0],
        helperIds: chosen.slice(1),
        pin,
        note,
        photoBase64: newPhoto,
      });
      setLoading(false);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setDetails((prev) => ({
        ...prev,
        [taskId]: {
          performers: result.performers,
          performerIds: chosen,
          note: result.note,
          photoUrl: result.photoUrl,
          completedAt: prev[taskId]?.completedAt ?? new Date().toISOString(),
        },
      }));
      closeAll();
      return;
    }

    const result = await completeTask({
      taskId,
      employeeId: chosen[0],
      helperIds: chosen.slice(1),
      pin,
      note,
      photoBase64: newPhoto,
    });
    setLoading(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setDetails((prev) => ({
      ...prev,
      [taskId]: {
        performers,
        performerIds: chosen,
        note: note.trim() || null,
        photoUrl: photo,
        completedAt: new Date().toISOString(),
      },
    }));
    setDoneIds((prev) => new Set(prev).add(taskId));
    closeAll();
  }

  const primaryName =
    employees.find((e) => e.id === employeeIds[0])?.name ?? "";

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(await fileToDataUrl(file));
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className="text-2xl font-semibold text-gray-100">Lista zadań</h1>
        <button
          type="button"
          onClick={openAdd}
          className="shrink-0 rounded-[4px] bg-[#2f2f37] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a3a42]"
        >
          Dodaj
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-gray-400">Brak zadań.</p>
      )}

      <ul className="flex flex-col gap-3">
        {[...items]
          .sort(
            (a, b) => Number(doneIds.has(a.id)) - Number(doneIds.has(b.id)),
          )
          .map((task) => {
            const done = doneIds.has(task.id);
            const info = details[task.id];
            return (
              <li
                key={task.id}
                onClick={done ? undefined : () => openComplete(task)}
                className={`rounded-xl border border-[#26262b] bg-[#161619] p-4 transition-colors ${
                  done ? "" : "cursor-pointer hover:border-[#3a3a42]"
                }`}
              >
                {/* Верх: час виконання + аватарки виконавців */}
                {done && (
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                      {formatTime(info?.completedAt) ?? "Wykonane"}
                    </span>
                    <div className="flex items-center gap-2">
                      {info?.performers && info.performers.length > 0 && (
                        <span className="flex items-center pl-2">
                          {info.performers.map((name) => (
                            <Avatar key={name} name={name} />
                          ))}
                        </span>
                      )}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((cur) =>
                              cur === task.id ? null : task.id,
                            )
                          }
                          aria-label="Opcje"
                          className="rounded-[4px] p-1.5 text-gray-400 transition-colors hover:bg-[#232327] hover:text-gray-100"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <circle cx="5" cy="12" r="1.6" />
                            <circle cx="12" cy="12" r="1.6" />
                            <circle cx="19" cy="12" r="1.6" />
                          </svg>
                        </button>
                        {openMenuId === task.id && (
                          <>
                            <button
                              type="button"
                              aria-hidden="true"
                              tabIndex={-1}
                              onClick={() => setOpenMenuId(null)}
                              className="fixed inset-0 z-10 cursor-default"
                            />
                            <div className="absolute right-0 z-20 mt-1 w-32 overflow-hidden rounded-md border border-[#26262b] bg-[#1a1a1e] shadow-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  openEdit(task);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-[#232327]"
                              >
                                Edytuj
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Назва */}
                <h3
                  className={`text-base font-medium first-letter:uppercase ${
                    done ? "text-gray-300" : "text-gray-100"
                  }`}
                >
                  {task.name}
                </h3>

                {/* Теги */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {done ? (
                    info?.performers?.map((name) => (
                      <NameTag key={name} name={name} />
                    ))
                  ) : (
                    <>
                      {task.priority === 1 && <PriorityTag />}
                      {task.requiresPhoto && <FotoTag />}
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        Aktywne
                      </span>
                    </>
                  )}
                </div>

                {/* Примітка й фото */}
                {done && (info?.note || info?.photoUrl) && (
                  <div className="mt-3 flex flex-col items-start gap-2">
                    {info?.note && (
                      <p className="text-sm text-gray-400">{info.note}</p>
                    )}
                    {info?.photoUrl && (
                      <PhotoThumb src={info.photoUrl} alt="Zdjęcie wykonania" />
                    )}
                  </div>
                )}

              </li>
            );
          })}
      </ul>

      {active && !pinStep && (
        <Modal title={active.name} onClose={closeAll}>
          <form onSubmit={goToPin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-200">
                Pracownik
              </label>
              {employeeIds.map((id, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={id}
                    onChange={(e) =>
                      setEmployeeIds((prev) =>
                        prev.map((v, idx) => (idx === i ? e.target.value : v)),
                      )
                    }
                    className="flex-1 rounded-[4px] border border-[#34343c] bg-[#1a1a1e] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">
                      {i === 0 ? "Wybierz pracownika…" : "Dodatkowy pracownik…"}
                    </option>
                    {availableFor(i).map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setEmployeeIds((prev) =>
                          prev.filter((_, idx) => idx !== i),
                        )
                      }
                      aria-label="Usuń pracownika"
                      className="shrink-0 rounded-[4px] p-2 text-gray-400 hover:bg-[#232327] hover:text-red-400"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {employeeIds.length < employees.length && (
                <button
                  type="button"
                  onClick={() => setEmployeeIds((prev) => [...prev, ""])}
                  className="self-start rounded-[4px] border border-[#34343c] px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-[#232327]"
                >
                  + Dodaj pracownika
                </button>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-200">
                Notatka (opcjonalnie)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="resize-none rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>

            {active.requiresPhoto && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-200">
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
                    className="mt-1 h-32 w-32 rounded-[4px] border border-[#26262b] object-cover"
                  />
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeAll}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#232327]"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="rounded-[4px] bg-[#2f2f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3a42]"
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
            {primaryName && (
              <p className="text-sm text-gray-400">
                PIN pracownika: <span className="font-medium text-gray-100">{primaryName}</span>
              </p>
            )}
            <input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-gray-400"
            />

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPinStep(false);
                  setError(null);
                }}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#232327]"
              >
                Wstecz
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-[4px] bg-[#2f2f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3a42] disabled:opacity-50"
              >
                {loading ? "..." : "Potwierdź"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Додати виконане поза списком */}
      {addOpen && !addPinStep && (
        <Modal title="Co zostało zrobione?" onClose={() => setAddOpen(false)}>
          <form onSubmit={addToPin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-200">Opis</label>
              <textarea
                autoFocus
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                rows={3}
                placeholder="Np. Umyłem podłogę na zapleczu"
                className="resize-none rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-200">
                Pracownik
              </label>
              <select
                value={addEmployeeId}
                onChange={(e) => setAddEmployeeId(e.target.value)}
                className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-sm outline-none focus:border-gray-400"
              >
                <option value="">Wybierz pracownika…</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {addError && <p className="text-sm text-red-400">{addError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#232327]"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="rounded-[4px] bg-[#2f2f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3a42]"
              >
                Dodaj
              </button>
            </div>
          </form>
        </Modal>
      )}

      {addOpen && addPinStep && (
        <Modal title="Wprowadź PIN" onClose={() => setAddOpen(false)}>
          <form onSubmit={confirmAddPin} className="flex flex-col gap-4">
            {addPrimaryName && (
              <p className="text-sm text-gray-400">
                PIN pracownika:{" "}
                <span className="font-medium text-gray-100">
                  {addPrimaryName}
                </span>
              </p>
            )}
            <input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              value={addPin}
              onChange={(e) =>
                setAddPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              className="rounded-[4px] border border-[#34343c] px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none focus:border-gray-400"
            />

            {addError && <p className="text-sm text-red-400">{addError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAddPinStep(false);
                  setAddError(null);
                }}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-300 hover:bg-[#232327]"
              >
                Wstecz
              </button>
              <button
                type="submit"
                disabled={addLoading}
                className="rounded-[4px] bg-[#2f2f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#3a3a42] disabled:opacity-50"
              >
                {addLoading ? "..." : "Potwierdź"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
