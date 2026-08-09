"use client";

import { useState } from "react";

export type Task = {
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

function PencilIcon() {
  return (
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
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

export default function TasksList({ initial }: { initial: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

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

  function handleDelete(index: number) {
    setOpenIndex(null);
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const value = window.prompt("Nazwa zadania");
    if (value === null) return;
    const trimmed = value.trim();
    if (!trimmed) return;
    setTasks((prev) => [
      ...prev,
      { name: trimmed, priority: 2, requiresPhoto: false },
    ]);
  }

  function toggleEdit() {
    setOpenIndex(null);
    if (editMode) {
      // Збереження: пріоритет 1 (червоні) — завжди вгорі (стабільно).
      setTasks((prev) => [
        ...prev.filter((t) => t.priority === 1),
        ...prev.filter((t) => t.priority !== 1),
      ]);
    }
    setEditMode((e) => !e);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Lista zadań</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleEdit}
            aria-label="Edytuj"
            title={editMode ? "Zapisz" : "Edytuj"}
            aria-pressed={editMode}
            className={`flex h-9 w-9 items-center justify-center rounded-[4px] transition-colors ${
              editMode
                ? "bg-gray-600 text-white hover:bg-gray-700"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Dodaj zadanie
          </button>
        </div>
      </div>

      <ul className="-mx-8 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
        {tasks.map((task, index) => {
          const rowClass =
            task.priority === 1
              ? "bg-red-200/80 hover:bg-red-200"
              : "bg-blue-200/70 hover:bg-blue-200";

          return (
            <li
              key={index}
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
              className={`flex items-center justify-between gap-2 px-8 py-4 transition-colors ${rowClass} ${
                dragIndex === index ? "opacity-40" : ""
              } ${
                overIndex === index && dragIndex !== index
                  ? "shadow-[inset_0_2px_0_0_#111827]"
                  : ""
              }`}
            >
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
                  <span className="w-5 shrink-0 text-gray-400">
                    {index + 1}
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
              </span>

              <div className="flex shrink-0 items-center gap-3">
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
            </li>
          );
        })}
      </ul>
    </>
  );
}
