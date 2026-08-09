import TasksList from "./TasksList";

const tasks: string[] = [
  "Zamówienie dostawy",
  "Inwentaryzacja",
  "Grafik pracowników",
];

export default function ListaZadanPage() {
  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Lista zadań</h1>
      <TasksList initial={tasks} />
    </div>
  );
}
