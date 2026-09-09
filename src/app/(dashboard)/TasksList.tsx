"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Calendar from "@/components/Calendar";
import Modal from "@/components/Modal";
import PhotoThumb from "@/components/PhotoThumb";
import { createTask, deleteTask, saveTasks } from "./tasks.actions";

export type Task = {
  id: string;
  name: string;
  priority: 1 | 2;
  requiresPhoto: boolean;
};

function DotsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

type Completion = {
  performers: string[];
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
      className="-ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2f2f37] text-[10px] font-semibold text-gray-200 ring-2 ring-[#161619] first:ml-0"
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

export default function TasksList({
  initial,
  completedIds = [],
  completions = {},
  selectedDate: selectedDateIso,
}: {
  initial: Task[];
  completedIds?: string[];
  completions?: Record<string, Completion>;
  selectedDate: string; // YYYY-MM-DD
}) {
  const router = useRouter();
  const completed = new Set(completedIds);
  const [tasks, setTasks] = useState(initial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [quickName, setQuickName] = useState("");
  const quickRef = useRef<HTMLTextAreaElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Локальна дата з "YYYY-MM-DD" (без зсуву часових поясів).
  const [y, m, d] = selectedDateIso.split("-").map(Number);
  const selectedDate = new Date(y, m - 1, d);

  // Вікно: минулий тиждень … +2 дні.
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 7);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 2);

  // Минулі дні лише для перегляду — bez edycji i dodawania.
  const todayIso = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();
  const isPast = selectedDateIso < todayIso;

  const dateLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(selectedDate);

  function moveTask(from: number, to: number) {
    if (from === to) return;
    setTasks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function updateTask(index: number, patch: Partial<Task>) {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    );
  }

  async function handleDelete(index: number) {
    setOpenIndex(null);
    const task = tasks[index];
    setTasks((prev) => prev.filter((_, i) => i !== index));
    await deleteTask(task.id);
  }

  // Автовисота поля вводу.
  useEffect(() => {
    const el = quickRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [quickName]);

  async function submitQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = quickName.trim();
    if (!name) return;
    setQuickName("");
    const created = await createTask(name, selectedDateIso);
    if (created) setTasks((prev) => [...prev, created]);
  }

  const isEmpty = tasks.length === 0;

  const quickAddBar = (
    <form
      onSubmit={submitQuickAdd}
      className="flex items-end gap-2 rounded-3xl border border-[#2f2f37] bg-[#1a1a1e] py-2 pl-4 pr-2 shadow-lg"
    >
      <textarea
        ref={quickRef}
        value={quickName}
        onChange={(e) => setQuickName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitQuickAdd(e);
          }
        }}
        rows={1}
        placeholder="Dodaj zadanie…"
        aria-label="Nowe zadanie"
        className="min-w-0 flex-1 resize-none self-center border-0 bg-transparent py-1.5 text-sm leading-6 outline-none focus:border-0 focus:ring-0"
      />
      <button
        type="submit"
        disabled={!quickName.trim()}
        aria-label="Dodaj zadanie"
        className="flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full bg-white text-black transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </form>
  );

  async function toggleEdit() {
    setOpenIndex(null);
    if (editMode) {
      // Збереження: пріоритет 1 (червоні) — завжди вгорі (стабільно).
      const sorted = [
        ...tasks.filter((t) => t.priority === 1),
        ...tasks.filter((t) => t.priority !== 1),
      ];
      setTasks(sorted);
      setEditMode(false);
      await saveTasks(sorted);
    } else {
      setEditMode(true);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-4 md:py-8">
      <div className="mb-6 flex shrink-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="hidden text-2xl font-semibold text-gray-100 md:block">
          Lista zadań
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="flex items-center gap-2 whitespace-nowrap rounded-[4px] border border-[#34343c] px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-[#232327]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {dateLabel}
          </button>
          {!isPast && (
            <button
              type="button"
              onClick={toggleEdit}
              aria-pressed={editMode}
              className={`ml-auto whitespace-nowrap rounded-[4px] px-3 py-2 text-sm font-medium text-white transition-colors md:ml-0 ${
                editMode
                  ? "bg-[#3a3a42] hover:bg-[#3a3a42]"
                  : "bg-[#2f2f37] hover:bg-[#3a3a42]"
              }`}
            >
              {editMode ? "Zapisz" : "Edytuj"}
            </button>
          )}
        </div>
      </div>

      {calendarOpen && (
        <Modal title="Wybierz datę" onClose={() => setCalendarOpen(false)}>
          <Calendar
            value={selectedDate}
            min={minDate}
            max={maxDate}
            onSelect={(d) => {
              setCalendarOpen(false);
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              router.push(`/?date=${iso}`);
              router.refresh();
            }}
          />
        </Modal>
      )}

      {isEmpty ? (
        /* Порожній стан — поле по центру екрана */
        <div className="flex flex-1 flex-col items-center justify-center">
          <h2 className="mb-6 text-center text-xl font-semibold text-gray-100">
            {isPast ? "Brak zadań" : "Zacznij od pierwszego zadania"}
          </h2>
          {!isPast && <div className="w-full">{quickAddBar}</div>}
        </div>
      ) : (
        <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 md:-mx-8 md:px-8">
        <ul className="flex flex-col gap-3 pb-2">
        {(editMode
          ? tasks.map((task, index) => ({ task, index }))
          : tasks
              .map((task, index) => ({ task, index }))
              .sort(
                (a, b) =>
                  Number(completed.has(a.task.id)) -
                  Number(completed.has(b.task.id)),
              )
        ).map(({ task, index }) => {
          const done = completed.has(task.id);
          const info = completions[task.id];

          return (
            <li
              key={task.id}
              onDragOver={(e) => {
                if (editMode && dragIndex !== null) {
                  e.preventDefault();
                  setOverIndex(index);
                }
              }}
              onDrop={() => {
                if (editMode && dragIndex !== null) {
                  moveTask(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }
              }}
              className={`rounded-xl border border-[#26262b] bg-[#161619] p-4 transition-colors ${
                dragIndex === index ? "opacity-40" : ""
              } ${
                overIndex === index && dragIndex !== index
                  ? "border-[#3a3a42]"
                  : ""
              }`}
            >
              {editMode ? (
                /* --- Режим редагування --- */
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 flex-1 items-center gap-3 text-base font-medium text-gray-100">
                    <span
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      aria-label="Przeciągnij, aby zmienić kolejność"
                      title="Przeciągnij, aby zmienić kolejność"
                      className="flex w-5 shrink-0 cursor-grab justify-center text-gray-400 active:cursor-grabbing"
                    >
                      <GripIcon />
                    </span>
                    <input
                      value={task.name}
                      onChange={(e) =>
                        updateTask(index, { name: e.target.value })
                      }
                      aria-label="Nazwa zadania"
                      className="w-full min-w-0 border-b border-gray-400 bg-transparent pb-0.5 text-base font-medium text-gray-100 outline-none focus:border-gray-400"
                    />
                  </span>

                  <div className="flex shrink-0 items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-300">
                      <span>Foto</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={task.requiresPhoto}
                        onClick={() =>
                          updateTask(index, {
                            requiresPhoto: !task.requiresPhoto,
                          })
                        }
                        className={`relative h-5 w-9 rounded-full transition-colors ${
                          task.requiresPhoto ? "bg-emerald-600" : "bg-[#34343c]"
                        }`}
                      >
                        <span
                          className={`absolute left-0 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                            task.requiresPhoto
                              ? "translate-x-[18px]"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </label>

                    <select
                      value={task.priority}
                      onChange={(e) =>
                        updateTask(index, {
                          priority: Number(e.target.value) as 1 | 2,
                        })
                      }
                      aria-label="Priorytet"
                      className="rounded-[4px] border border-[#34343c] bg-[#1a1a1e] px-2 py-1 text-xs text-gray-200 outline-none focus:border-gray-400"
                    >
                      <option value={1}>Priorytet 1</option>
                      <option value={2}>Priorytet 2</option>
                    </select>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenIndex((cur) => (cur === index ? null : index))
                        }
                        aria-label="Opcje"
                        title="Opcje"
                        className="rounded-[4px] p-2 text-gray-400 transition-colors hover:bg-[#232327] hover:text-gray-100"
                      >
                        <DotsIcon />
                      </button>
                      {openIndex === index && (
                        <>
                          <button
                            type="button"
                            aria-hidden="true"
                            tabIndex={-1}
                            onClick={() => setOpenIndex(null)}
                            className="fixed inset-0 z-10 cursor-default"
                          />
                          <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-[#26262b] bg-[#1a1a1e] shadow-lg">
                            <button
                              type="button"
                              onClick={() => handleDelete(index)}
                              className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#232327]"
                            >
                              Usuń
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* --- Режим перегляду (картка) --- */
                <>
                  {done && (
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        {formatTime(info?.completedAt) ?? "Wykonane"}
                      </span>
                      {info?.performers && info.performers.length > 0 && (
                        <span className="flex items-center pl-2">
                          {info.performers.map((name) => (
                            <Avatar key={name} name={name} />
                          ))}
                        </span>
                      )}
                    </div>
                  )}

                  <h3
                    className={`text-base font-medium first-letter:uppercase ${
                      done ? "text-gray-300" : "text-gray-100"
                    }`}
                  >
                    {task.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {task.priority === 1 && <PriorityTag />}
                    {task.requiresPhoto && <FotoTag />}
                    {!done && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                        Aktywne
                      </span>
                    )}
                    {done &&
                      info?.performers?.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-[#232327] px-2.5 py-1 text-xs font-medium text-gray-300"
                        >
                          {name}
                        </span>
                      ))}
                    {!isPast && (
                      <div className="relative ml-auto">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenIndex((cur) =>
                              cur === index ? null : index,
                            )
                          }
                          aria-label="Opcje"
                          title="Opcje"
                          className="rounded-[4px] p-1.5 text-gray-400 transition-colors hover:bg-[#232327] hover:text-gray-100"
                        >
                          <DotsIcon />
                        </button>
                        {openIndex === index && (
                          <>
                            <button
                              type="button"
                              aria-hidden="true"
                              tabIndex={-1}
                              onClick={() => setOpenIndex(null)}
                              className="fixed inset-0 z-10 cursor-default"
                            />
                            <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-[#26262b] bg-[#1a1a1e] shadow-lg">
                              <button
                                type="button"
                                onClick={() => handleDelete(index)}
                                className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-[#232327]"
                              >
                                Usuń
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {done && (info?.note || info?.photoUrl) && (
                    <div className="mt-3 flex flex-col items-start gap-2">
                      {info?.note && (
                        <p className="text-sm text-gray-400">{info.note}</p>
                      )}
                      {info?.photoUrl && (
                        <PhotoThumb
                          src={info.photoUrl}
                          alt="Zdjęcie wykonania"
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
        </ul>
        </div>
      )}

      {!isEmpty && !isPast && !editMode && (
        <div className="mt-auto shrink-0 pt-4">
          <div className="mx-auto w-full max-w-3xl">{quickAddBar}</div>
        </div>
      )}
    </div>
  );
}
