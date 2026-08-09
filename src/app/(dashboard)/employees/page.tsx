import EmployeesList from "./EmployeesList";

const employees: string[] = ["Anna Nowak", "Piotr Wiśniewski"];

export default function EmployeesPage() {
  return (
    <div className="py-8">
      <EmployeesList initial={employees} />
    </div>
  );
}
