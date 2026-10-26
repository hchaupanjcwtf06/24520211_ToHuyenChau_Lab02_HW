import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ColumnDef, DataGridProps } from '../types/grid';

type SortDirection = 'asc' | 'desc';
type SortState<T> = { key: keyof T; direction: SortDirection } | null;
const PAGE_SIZE = 5;

export function DataGrid<T extends { id: string | number }>({
  data, columns, onRowSelect, ariaLabel
}: DataGridProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortState<T>>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Array<T['id']>>([]);
  const [active, setActive] = useState({ row: 0, col: 0 });
  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const gridId = useId();

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return data.filter((item) => columns.some((column) =>
      String(item[column.accessorKey]).toLocaleLowerCase().includes(needle)
    ));
  }, [data, columns, query]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const order = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'en', { numeric: true, sensitivity: 'base' });
      return sort.direction === 'asc' ? order : -order;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const rows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const lastCol = columns.length - 1;
  const activeRow = Math.min(active.row, Math.max(0, rows.length - 1));
  const activeCol = Math.min(active.col, Math.max(0, lastCol));

  useEffect(() => {
    cellRefs.current.forEach((_cell, key) => {
      if (!rows.some((item) => String(item.id) === key.split(':')[0])) cellRefs.current.delete(key);
    });
  }, [rows]);

  function changeSort(column: ColumnDef<T>) {
    if (!column.sortable) return;
    setSort((current) => current?.key === column.accessorKey
      ? { key: column.accessorKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key: column.accessorKey, direction: 'asc' });
    setPage(1);
    setActive({ row: 0, col: 0 });
  }

  function changeFilter(value: string) {
    setQuery(value);
    setPage(1);
    setActive({ row: 0, col: 0 });
  }

  function toggleSelection(item: T) {
    setSelected((current) => current.includes(item.id)
      ? current.filter((id) => id !== item.id)
      : [...current, item.id]);
    onRowSelect?.(item);
  }

  function handleCellKey(event: KeyboardEvent<HTMLTableCellElement>, rowIndex: number, colIndex: number, item: T) {
    let nextRow = rowIndex;
    let nextCol = colIndex;
    switch (event.key) {
      case 'ArrowUp': nextRow = Math.max(0, rowIndex - 1); break;
      case 'ArrowDown': nextRow = Math.min(rows.length - 1, rowIndex + 1); break;
      case 'ArrowLeft': nextCol = Math.max(0, colIndex - 1); break;
      case 'ArrowRight': nextCol = Math.min(lastCol, colIndex + 1); break;
      case 'Home': nextCol = 0; break;
      case 'End': nextCol = lastCol; break;
      case 'Enter':
        event.preventDefault();
        toggleSelection(item);
        return;
      case ' ':
        event.preventDefault();
        toggleSelection(item);
        return;
      default: return;
    }
    event.preventDefault();
    setActive({ row: nextRow, col: nextCol });
    const target = rows[nextRow];
    cellRefs.current.get(`${String(target.id)}:${nextCol}`)?.focus();
  }

  function goToPage(next: number) {
    setPage(Math.max(1, Math.min(pageCount, next)));
    setActive({ row: 0, col: 0 });
  }

  return (
    <section aria-labelledby={`${gridId}-heading`} className="grid-panel">
      <div className="panel-header">
        <div>
          <h2 id={`${gridId}-heading`}>Employee records</h2>
          <p id={`${gridId}-instructions`} className="muted">Focus a cell, then use arrow keys to move. Enter or Space toggles its row selection.</p>
        </div>
        <label className="search-label" htmlFor={`${gridId}-search`}>
          Search all columns
          <input id={`${gridId}-search`} type="search" value={query} onChange={(event) => changeFilter(event.target.value)} placeholder="Search employees..." />
        </label>
      </div>
      <p className="visually-hidden" role="status" aria-live="polite">{sorted.length} matching records. Page {safePage} of {pageCount}. {selected.length} selected.</p>
      <div className="table-scroll" role="region" aria-label="Scrollable employee grid" tabIndex={0}>
        <table role="grid" aria-label={ariaLabel} aria-describedby={`${gridId}-instructions`} aria-multiselectable="true" aria-rowcount={sorted.length + 1}>
          <thead role="rowgroup">
            <tr role="row" aria-rowindex={1}>
              {columns.map((column) => (
                <th role="columnheader" scope="col" key={String(column.accessorKey)} aria-sort={sort?.key === column.accessorKey ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  {column.sortable ? (
                    <button type="button" className="sort-button" onClick={() => changeSort(column)} aria-label={`Sort by ${column.header}${sort?.key === column.accessorKey ? `, currently ${sort.direction === 'asc' ? 'ascending' : 'descending'}` : ''}`}>
                      {column.header} <span aria-hidden="true">{sort?.key === column.accessorKey ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'}</span>
                    </button>
                  ) : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {rows.length === 0 ? (
              <tr role="row"><td role="gridcell" colSpan={columns.length} className="empty-state">No matching employees. Try another search.</td></tr>
            ) : rows.map((item, rowIndex) => {
              const isSelected = selected.includes(item.id);
              return (
                <tr role="row" aria-selected={isSelected} aria-rowindex={(safePage - 1) * PAGE_SIZE + rowIndex + 2} key={item.id} className={isSelected ? 'selected-row' : undefined}>
                  {columns.map((column, colIndex) => (
                    <td
                      role="gridcell"
                      key={String(column.accessorKey)}
                      aria-colindex={colIndex + 1}
                      aria-label={`${column.header}: ${String(item[column.accessorKey])}; ${isSelected ? 'selected' : 'not selected'}`}
                      tabIndex={rowIndex === activeRow && colIndex === activeCol ? 0 : -1}
                      ref={(node) => { const refKey = `${String(item.id)}:${colIndex}`; if (node) cellRefs.current.set(refKey, node); else cellRefs.current.delete(refKey); }}
                      onFocus={() => setActive({ row: rowIndex, col: colIndex })}
                      onKeyDown={(event) => handleCellKey(event, rowIndex, colIndex, item)}
                      onClick={() => setActive({ row: rowIndex, col: colIndex })}
                    >
                      {String(item[column.accessorKey])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <nav className="pagination" aria-label="Data grid pagination">
        <p>Showing {sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sorted.length)} of {sorted.length}</p>
        <div className="page-actions">
          <button type="button" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>Previous page</button>
          <span aria-current="page">Page {safePage} of {pageCount}</span>
          <button type="button" disabled={safePage >= pageCount} onClick={() => goToPage(safePage + 1)}>Next page</button>
        </div>
      </nav>
      <p className="selection-summary">Selected rows: <strong>{selected.length}</strong></p>
    </section>
  );
}
