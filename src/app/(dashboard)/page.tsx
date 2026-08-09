import TasksList, { type Task } from "./TasksList";

const tasks: Task[] = [
  { name: "Zamówienie dostawy", priority: 2, requiresPhoto: false },
  { name: "Inwentaryzacja", priority: 2, requiresPhoto: false },
  { name: "Grafik pracowników", priority: 2, requiresPhoto: false },
];

export default function ListaZadanPage() {
  return (
    <div className="py-8">
      <TasksList initial={tasks} />
    </div>
  );
}
