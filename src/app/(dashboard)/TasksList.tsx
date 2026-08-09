"use client";

import { useState } from "react";

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

function TrashIcon() {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function TasksList({ initial }: { initial: string[] }) {
  const [tasks, setTasks] = useState(initial);

  function handleEdit(index: number) {
    const next = window.prompt("Zmień nazwę zadania", tasks[index]);
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) return;
    setTasks((prev) => prev.map((t, i) => (i === index ? trimmed : t)));
  }

  function handleDelete(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <ul className="-mx-8 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
      {tasks.map((task, index) => (
        <li
          key={index}
          className="flex items-center justify-between gap-2 bg-blue-50/60 px-8 py-4 transition-colors hover:bg-blue-100/70"
        >
          <span className="text-base font-medium text-gray-900">{task}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleEdit(index)}
              aria-label="Edytuj"
              title="Edytuj"
              className="rounded-[4px] p-2 text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(index)}
              aria-label="Usuń"
              title="Usuń"
              className="rounded-[4px] p-2 text-gray-500 transition-colors hover:bg-white hover:text-red-600"
            >
              <TrashIcon />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
