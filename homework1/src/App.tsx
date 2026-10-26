import { useMemo, useState } from 'react';
import { DataGrid } from './components/DataGrid';
import { employees } from './data/employees';
import type { Employee } from './data/employees';
import type { ColumnDef } from './types/grid';

const columns: ColumnDef<Employee>[] = [
  { header: 'ID', accessorKey: 'id', sortable: true },
  { header: 'Employee', accessorKey: 'name', sortable: true },
  { header: 'Department', accessorKey: 'department', sortable: true },
  { header: 'Location', accessorKey: 'location', sortable: true },
  { header: 'Status', accessorKey: 'status', sortable: true },
  { header: 'Monthly Salary (USD)', accessorKey: 'salary', sortable: true }
];

export default function App() {
  const [lastAction, setLastAction] = useState('No row selection yet.');
  const total = useMemo(() => employees.length, []);
  return (
    <main className="page">
      <header className="site-header">
        <p className="eyebrow">LAB 02 · HOMEWORK 1</p>
        <h1>Enterprise Data Grid</h1>
        <p className="lead">Accessible data exploration with sorting, filtering, pagination and keyboard controls.</p>
      </header>
      <section className="overview" aria-label="Dataset overview">
        <div className="metric"><strong>{total}</strong><span>Total employees</span></div>
        <div className="metric"><strong>{columns.length}</strong><span>Columns</span></div>
        <div className="metric"><strong>WCAG 2.2 AA</strong><span>Accessibility target</span></div>
      </section>
      <DataGrid<Employee>
        data={employees}
        columns={columns}
        ariaLabel="Employee records data grid"
        onRowSelect={(item) => setLastAction(`Selection toggled for ${item.name}.`)}
      />
      <p className="action-report" role="status">{lastAction}</p>
      <footer><p>University lab implementation · Demo dataset (not real employee records)</p></footer>
    </main>
  );
}
