const tasks: { title: string; description: string }[] = [
  { title: "Zamówienie dostawy", description: "Uzupełnij zapasy na jutro" },
  { title: "Inwentaryzacja", description: "Sprawdź stan magazynu" },
  { title: "Grafik pracowników", description: "Ustaw zmiany na przyszły tydzień" },
];

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function ListaZadanPage() {
  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Lista zadań</h1>

      <ul className="flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200">
        {tasks.map((task) => (
          <li key={task.title}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {task.title}
                </span>
                <span className="text-xs text-gray-500">
                  {task.description}
                </span>
              </span>
              <ChevronRight />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
