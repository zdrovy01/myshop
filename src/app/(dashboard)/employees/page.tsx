import EmployeesList, { type Employee } from "./EmployeesList";

const employees: Employee[] = [
  { name: "Anna Nowak", pin: "1234" },
  { name: "Piotr Wiśniewski", pin: "5678" },
];

export default function EmployeesPage() {
  return (
    <div className="py-8">
      <EmployeesList initial={employees} />
    </div>
  );
}
