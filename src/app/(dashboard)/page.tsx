const tasks: string[] = [
  "Zamówienie dostawy",
  "Inwentaryzacja",
  "Grafik pracowników",
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

      <ul className="-mx-8 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
        {tasks.map((task) => (
          <li key={task}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-gray-50"
            >
              <span className="text-base font-medium text-gray-900">{task}</span>
              <ChevronRight />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
