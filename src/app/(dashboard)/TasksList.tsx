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
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
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
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Dodaj zadanie
        </button>
      </div>

      <ul className="-mx-8 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-2 bg-blue-50/60 px-8 py-4 transition-colors hover:bg-blue-100/70"
          >
            <span className="text-base font-medium text-gray-900">{task}</span>
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
