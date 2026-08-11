"use client";

import { useState } from "react";
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
  employeeName: string | null;
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

export default function TasksList({
  initial,
  completedIds = [],
  completions = {},
}: {
  initial: Task[];
  completedIds?: string[];
  completions?: Record<string, Completion>;
}) {
  const completed = new Set(completedIds);
  const [tasks, setTasks] = useState(initial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  function openAdd() {
    setNewName("");
    setAddOpen(true);
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();

    // Без "-" — одне завдання; з "-" — кілька (нове після кожного дефіса).
    const names = (
      newName.includes("-") ? newName.split("-") : [newName]
    )
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;
    setAddOpen(false);

    for (const name of names) {
      const created = await createTask(name);
      if (created) setTasks((prev) => [...prev, created]);
    }
  }

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
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Lista zadań</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="flex items-center gap-2 rounded-[4px] border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
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
          <button
            type="button"
            onClick={toggleEdit}
            aria-pressed={editMode}
            className={`rounded-[4px] px-4 py-2 text-sm font-medium text-white transition-colors ${
              editMode
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
          >
            {editMode ? "Zapisz" : "Edytuj"}
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Dodaj zadanie
          </button>
        </div>
      </div>

      {calendarOpen && (
        <Modal title="Wybierz datę" onClose={() => setCalendarOpen(false)}>
          <Calendar
            value={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setCalendarOpen(false);
            }}
          />
        </Modal>
      )}

      {addOpen && (
        <Modal title="Nowe zadanie" onClose={() => setAddOpen(false)}>
          <form onSubmit={submitAdd} className="flex flex-col gap-4">
            <textarea
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              rows={6}
              placeholder={
                "Nazwa zadania\n\nAby dodać kilka, oddziel “-”, np.:\n-Kawomat\n-Rozmrozić parówki"
              }
              className="resize-none rounded-[4px] border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-900"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-[4px] px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Dodaj
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ul className="-mx-8 flex flex-col">
        {(editMode
          ? tasks.map((task, index) => ({ task, index }))
          : tasks
              .map((task, index) => ({ task, index }))
              .sort(
                (a, b) =>
                  Number(completed.has(a.task.id)) -
                  Number(completed.has(b.task.id)),
              )
        ).map(({ task, index }, displayIndex) => {
          const rowClass = completed.has(task.id)
            ? "bg-gray-100 hover:bg-gray-200/70"
            : task.priority === 1
              ? "bg-rose-100 hover:bg-rose-200/70"
              : "bg-sky-100 hover:bg-sky-200/70";

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
              className={`px-8 py-4 transition-colors ${rowClass} ${
                dragIndex === index ? "opacity-40" : ""
              } ${
                overIndex === index && dragIndex !== index
                  ? "shadow-[inset_0_2px_0_0_#111827]"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 flex-1 items-center gap-3 text-base font-medium text-gray-900">
                {editMode ? (
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
                ) : (
                  <span className="w-4 shrink-0 text-xs text-gray-400">
                    {displayIndex + 1}
                  </span>
                )}
                {editMode ? (
                  <input
                    value={task.name}
                    onChange={(e) => updateTask(index, { name: e.target.value })}
                    aria-label="Nazwa zadania"
                    className="w-full min-w-0 border-b border-gray-400 bg-transparent pb-0.5 text-base font-medium text-gray-900 outline-none focus:border-gray-900"
                  />
                ) : (
                  <span className="truncate">{task.name}</span>
                )}
                {!editMode &&
                  completed.has(task.id) &&
                  completions[task.id]?.employeeName && (
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-300">
                      {completions[task.id].employeeName}
                    </span>
                  )}
              </span>

              <div className="flex shrink-0 items-center gap-3">
                {!editMode && completed.has(task.id) && (
                  <span className="shrink-0 text-sm font-medium text-gray-400">
                    Wykonane
                    {formatTime(completions[task.id]?.completedAt)
                      ? `, ${formatTime(completions[task.id]?.completedAt)}`
                      : ""}
                  </span>
                )}
                {editMode && (
                  <>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
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
                          task.requiresPhoto ? "bg-gray-900" : "bg-gray-300"
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
                      className="rounded-[4px] border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 outline-none focus:border-gray-900"
                    >
                      <option value={1}>Priorytet 1</option>
                      <option value={2}>Priorytet 2</option>
                    </select>
                  </>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex((cur) => (cur === index ? null : index))
                    }
                    aria-label="Opcje"
                    title="Opcje"
                    className="rounded-[4px] p-2 text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
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
                      <div className="absolute right-0 z-20 mt-1 w-36 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                        <button
                          type="button"
                          onClick={() => handleDelete(index)}
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                        >
                          Usuń
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              </div>

              {!editMode &&
                completed.has(task.id) &&
                (completions[task.id]?.note ||
                  completions[task.id]?.photoUrl) && (
                  <div className="mt-2 flex flex-col gap-2">
                    {completions[task.id]?.note && (
                      <p className="text-sm text-gray-600">
                        {completions[task.id].note}
                      </p>
                    )}
                    {completions[task.id]?.photoUrl && (
                      <PhotoThumb
                        src={completions[task.id].photoUrl!}
                        alt="Zdjęcie wykonania"
                      />
                    )}
                  </div>
                )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
