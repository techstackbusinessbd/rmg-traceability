import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Loader2,
  Inbox
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  searchPlaceholder = "Search records...",
  exportFileName = "table-export",
  customFilters = null,
  customActions = null,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50]
}) {
  const { isDark } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // 1. Search Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return columns.some(col => {
        const val = item[col.key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, columns]);

  // 2. Column Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // 4. CSV Export
  const exportToCSV = () => {
    if (!data.length) return;
    const exportableCols = columns.filter(c => c.key !== 'actions');
    const headers = exportableCols.map(c => `"${c.label}"`).join(',');
    const rows = sortedData.map(row => 
      exportableCols.map(c => `"${row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : ''}"`).join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-3 font-sans">
      
      {/* Top Toolbar: Search, Filters, CSV Export & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-2 max-w-md">
          <div className="relative w-full">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-3 py-1.5 rounded-md text-xs border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
          {customFilters}
        </div>

        <div className="flex items-center space-x-2">
          {customActions}
          <button
            type="button"
            onClick={exportToCSV}
            disabled={!data.length}
            className={`px-3 py-1.5 rounded-md border text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors disabled:opacity-50 ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' 
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-2xs'
            }`}
            title="Export to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Structure */}
      <div className={`overflow-x-auto rounded-md border transition-colors ${
        isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200/90 bg-white shadow-2xs'
      }`}>
        <table className="w-full text-left text-xs border-collapse">
          <thead className={`border-b font-semibold uppercase tracking-wider ${
            isDark ? 'border-slate-800 text-slate-400 bg-slate-900/90' : 'border-slate-200 text-slate-600 bg-slate-100/80'
          }`}>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${
                      col.sortable ? 'cursor-pointer select-none hover:text-blue-500' : ''
                    } ${col.className || ''}`}
                  >
                    <div className={`inline-flex items-center space-x-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-blue-500" /> : <ChevronDown className="h-3.5 w-3.5 text-blue-500" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className={`divide-y font-medium ${
            isDark ? 'divide-slate-800/80' : 'divide-slate-200/80'
          }`}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    <span>Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-x-1 space-y-1">
                    <Inbox className="h-8 w-8 text-slate-400/60 mb-1" />
                    <span className="font-semibold text-sm">No records found</span>
                    <span className="text-[11px] text-slate-500">Try adjusting your search query or filters.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr 
                  key={row.id || idx} 
                  className={`transition-colors ${
                    isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  {columns.map((col) => (
                    <td 
                      key={col.key} 
                      className={`p-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : (row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded border text-xs cursor-pointer focus:outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500">
              Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded border transition-colors disabled:opacity-30 cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
              title="Previous Page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded border transition-colors disabled:opacity-30 cursor-pointer ${
                isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-white' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
              title="Next Page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
