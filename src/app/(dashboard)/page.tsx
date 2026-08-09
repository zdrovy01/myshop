import TasksList from "./TasksList";

const tasks: string[] = [
  "Zamówienie dostawy",
  "Inwentaryzacja",
  "Grafik pracowników",
];

export default function ListaZadanPage() {
  return (
    <div className="py-8">
      <TasksList initial={tasks} />
    </div>
  );
}
