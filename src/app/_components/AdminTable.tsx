"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
}

interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string | number;
  renderDetailPanel?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  pageSizeOptions?: number[];
  /** Column keys shown in the compact mobile card header (rest are reachable via the expand button). Defaults to the first 3 columns. */
  mobileColumns?: string[];
  /** Row id to auto-expand and scroll its page into view on first load — used for email "View" deep links (e.g. /Orders?id=42). */
  initialExpandedId?: string | number | null;
}

// A lightweight Tailwind replacement for material-react-table — sortable
// headers, expandable detail-panel rows, and client-side pagination, styled
// to match the rest of the (Tailwind-only) admin panel instead of MUI.
// Below `sm` it swaps the table for a stacked card list — a data table is
// unreadable on a phone (tiny cells forced into a horizontal scroll), so
// mobile gets a compact card per row instead, built from the same columns.
export default function AdminTable<T>({
  columns,
  data,
  getRowId,
  renderDetailPanel,
  emptyMessage = "No records yet.",
  pageSizeOptions = [10, 25, 50],
  mobileColumns,
  initialExpandedId,
}: AdminTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const didInitialExpand = React.useRef(false);

  const sortableColumns = useMemo(() => columns.filter((c) => c.sortValue), [columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, columns]);

  useEffect(() => {
    setPage(0);
  }, [data.length, sortKey, sortDir, pageSize]);

  useEffect(() => {
    if (didInitialExpand.current) return;
    if (initialExpandedId === undefined || initialExpandedId === null) return;
    const idx = sorted.findIndex((row) => getRowId(row) === initialExpandedId);
    if (idx === -1) return;
    didInitialExpand.current = true;
    setExpandedId(initialExpandedId);
    setPage(Math.floor(idx / pageSize));
  }, [initialExpandedId, sorted, pageSize, getRowId]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const paged = useMemo(
    () => sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize),
    [sorted, currentPage, pageSize]
  );

  const toggleSort = (col: AdminTableColumn<T>) => {
    if (!col.sortValue) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  if (data.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const headlineCols = mobileColumns
    ? columns.filter((c) => mobileColumns.includes(c.key))
    : columns.slice(0, 3);
  const restCols = columns.filter((c) => !headlineCols.includes(c));

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              {renderDetailPanel && <th className="w-10 px-4 py-3" />}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-200 whitespace-nowrap ${
                    col.width ?? ""
                  } ${col.sortValue ? "cursor-pointer select-none" : ""}`}
                  onClick={() => toggleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortValue &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : (
                        <ChevronsUpDown size={14} className="opacity-30" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => {
              const id = getRowId(row);
              const isExpanded = expandedId === id;
              return (
                <React.Fragment key={id}>
                  <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {renderDetailPanel && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : id)}
                          className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
                          aria-label={isExpanded ? "Collapse row" : "Expand row"}
                        >
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                  {renderDetailPanel && isExpanded && (
                    <tr>
                      <td
                        colSpan={columns.length + 1}
                        className="p-0 bg-gray-50 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800"
                      >
                        {renderDetailPanel(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="sm:hidden">
        {sortableColumns.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex-shrink-0">
              Sort by
            </span>
            <select
              value={sortKey ?? ""}
              onChange={(e) => {
                const key = e.target.value || null;
                setSortKey(key);
                setSortDir("asc");
              }}
              className="flex-1 min-w-0 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Default</option>
              {sortableColumns.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.header}
                </option>
              ))}
            </select>
            {sortKey && (
              <button
                onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                className="flex-shrink-0 p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                aria-label="Toggle sort direction"
              >
                {sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {paged.map((row) => {
            const id = getRowId(row);
            const isExpanded = expandedId === id;
            return (
              <div key={id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    {headlineCols.map((col) => (
                      <div key={col.key}>{col.cell(row)}</div>
                    ))}
                  </div>
                  {renderDetailPanel ? (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="flex-shrink-0 flex items-center justify-center size-8 text-primary bg-primary/10 rounded-lg"
                      aria-label={isExpanded ? "Collapse row" : "Expand row"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  ) : null}
                </div>

                {/* Remaining columns as a compact label/value grid */}
                {restCols.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {restCols.map((col) => (
                      <div key={col.key} className="min-w-0">
                        <div className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                          {col.header}
                        </div>
                        <div className="text-xs truncate">{col.cell(row)}</div>
                      </div>
                    ))}
                  </div>
                )}

                {renderDetailPanel && isExpanded && (
                  <div className="mt-3 -mx-3 border-t border-gray-100 dark:border-gray-800">
                    {renderDetailPanel(row)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span>
            {total === 0 ? 0 : currentPage * pageSize + 1}-
            {Math.min(total, (currentPage + 1) * pageSize)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
