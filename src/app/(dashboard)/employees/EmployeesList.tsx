"use client";

import { useState } from "react";

export type Employee = { name: string; pin: string };

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

function askPin(current?: string): string | null {
  while (true) {
    const value = window.prompt("PIN (4 cyfry)", current ?? "");
    if (value === null) return null;
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) return trimmed;
    window.alert("PIN musi składać się z 4 cyfr.");
  }
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

export default function EmployeesList({ initial }: { initial: Employee[] }) {
  const [employees, setEmployees] = useState(initial);

  function handleEdit(index: number) {
    const name = window.prompt("Imię i nazwisko", employees[index].name);
    if (name === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const pin = askPin(employees[index].pin);
    if (pin === null) return;

    setEmployees((prev) =>
      prev.map((e, i) => (i === index ? { name: trimmedName, pin } : e)),
    );
  }

  function handleDelete(index: number) {
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const name = window.prompt("Imię i nazwisko pracownika");
    if (name === null) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const pin = askPin();
    if (pin === null) return;

    setEmployees((prev) => [...prev, { name: trimmedName, pin }]);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Pracownicy</h1>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-[4px] bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          Dodaj pracownika
        </button>
      </div>

      <ul className="-mx-8 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
        {employees.map((employee, index) => (
          <li
            key={index}
            className="flex items-center justify-between gap-2 bg-white px-8 py-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                {initials(employee.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-gray-900">
                  {employee.name}
                </p>
                <p className="text-xs text-gray-500">PIN: {employee.pin}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleEdit(index)}
                aria-label="Edytuj"
                title="Edytuj"
                className="rounded-[4px] p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <PencilIcon />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                aria-label="Usuń"
                title="Usuń"
                className="rounded-[4px] p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
              >
                <TrashIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
