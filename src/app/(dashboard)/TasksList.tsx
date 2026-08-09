"use client";

import { useState } from "react";

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

export default function TasksList({ initial }: { initial: string[] }) {
  const [tasks, setTasks] = useState(initial);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleEdit(index: number) {
    setOpenIndex(null);
    const next = window.prompt("Zmień nazwę zadania", tasks[index]);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    setTasks((prev) => prev.map((t, i) => (i === index ? trimmed : t)));
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
    setTasks((prev) => [...prev, trimmed]);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Lista zadań</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Edytuj"
            title="Edytuj"
            className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-gray-900 text-white transition-colors hover:bg-gray-800"
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
        {tasks.map((task, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-2 bg-blue-100/60 px-8 py-4 transition-colors hover:bg-blue-100"
          >
            <span className="flex items-center gap-3 text-base font-medium text-gray-900">
              <span className="w-5 shrink-0 text-gray-400">{index + 1}.</span>
              {task}
            </span>
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
                  {/* клік поза меню закриває його */}
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
                      onClick={() => handleEdit(index)}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edytuj
                    </button>
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
          </li>
        ))}
      </ul>
    </>
  );
}
