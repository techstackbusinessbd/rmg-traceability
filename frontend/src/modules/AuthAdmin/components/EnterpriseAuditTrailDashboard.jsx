import React, { useState, useMemo } from 'react';
import { 
  History, Search, Download, Filter, RefreshCw, Shield, 
  CheckCircle2, AlertCircle, PlusCircle, Edit3, Trash2, Key, Eye, ExternalLink, Calendar
} from 'lucide-react';
import AuditLogInspectorModal from './AuditLogInspectorModal';

const MODULES = [
  'ALL',
  'AuthAdmin',
  'MasterData',
  'OrderManagement',
  'Planning',
  'ShopfloorWIP',
  'QualityInspection',
  'SystemSettings'
];

const EVENTS = [
  'ALL',
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'SECURITY'
];

export default function EnterpriseAuditTrailDashboard({
  auditLogs = [],
  loading = false,
  onRefresh,
  onExportCsv,
  isDark = true
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedEvent, setSelectedEvent] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // KPI calculations
  const kpiStats = useMemo(() => {
    const total = auditLogs.length;
    const creates = auditLogs.filter(l => (l.event || l.action || '').includes('CREATE')).length;
    const updates = auditLogs.filter(l => (l.event || l.action || '').includes('UPDATE')).length;
    const deletes = auditLogs.filter(l => (l.event || l.action || '').includes('DELETE')).length;
    const security = auditLogs.filter(l => ['LOGIN', 'LOGOUT', 'SECURITY'].includes(l.event) || (l.action || '').includes('LOGIN')).length;

    return { total, creates, updates, deletes, security };
  }, [auditLogs]);

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Module filter
      if (selectedModule !== 'ALL' && log.module !== selectedModule) {
        return false;
      }

      // Event filter
      if (selectedEvent !== 'ALL' && (log.event || '') !== selectedEvent) {
        return false;
      }

      // Search keyword filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchAction = (log.action || '').toLowerCase().includes(term);
        const matchSummary = (log.action_summary || '').toLowerCase().includes(term);
        const matchUser = (log.user_name || '').toLowerCase().includes(term);
        const matchEmpId = (log.user_emp_id || '').toLowerCase().includes(term);
        const matchIp = (log.ip_address || '').toLowerCase().includes(term);
        if (!matchAction && !matchSummary && !matchUser && !matchEmpId && !matchIp) {
          return false;
        }
      }

      // Date Range Filter
      if (fromDate) {
        const logDate = new Date(log.created_at);
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }

      if (toDate) {
        const logDate = new Date(log.created_at);
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }

      return true;
    });
  }, [auditLogs, selectedModule, selectedEvent, searchTerm, fromDate, toDate]);

  // Paginated records
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  const handleExport = async () => {
    if (onExportCsv) {
      setExporting(true);
      try {
        await onExportCsv({
          module: selectedModule,
          event: selectedEvent,
          search: searchTerm,
          from_date: fromDate,
          to_date: toDate
        });
      } finally {
        setExporting(false);
      }
    }
  };

  const getEventBadge = (event, action) => {
    const ev = (event || action || '').toUpperCase();
    if (ev.includes('CREATE')) {
      return (
        <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] flex items-center space-x-1 w-fit">
          <PlusCircle className="h-3 w-3" />
          <span>CREATE</span>
        </span>
      );
    }
    if (ev.includes('UPDATE')) {
      return (
        <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] flex items-center space-x-1 w-fit">
          <Edit3 className="h-3 w-3" />
          <span>UPDATE</span>
        </span>
      );
    }
    if (ev.includes('DELETE')) {
      return (
        <span className="font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] flex items-center space-x-1 w-fit">
          <Trash2 className="h-3 w-3" />
          <span>DELETE</span>
        </span>
      );
    }
    if (ev.includes('LOGIN') || ev.includes('SECURITY')) {
      return (
        <span className="font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] flex items-center space-x-1 w-fit">
          <Key className="h-3 w-3" />
          <span>SECURITY</span>
        </span>
      );
    }
    return (
      <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] flex items-center space-x-1 w-fit">
        <Shield className="h-3 w-3" />
        <span>ACTION</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className={`p-4 rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Audited Events</div>
          <div className="text-2xl font-black mt-1 text-blue-500">{kpiStats.total}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immutable System Ledger</div>
        </div>

        <div className={`p-4 rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Creates / Additions</div>
          <div className="text-2xl font-black mt-1 text-emerald-400">{kpiStats.creates}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">New Entities Inserted</div>
        </div>

        <div className={`p-4 rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Updates / Changes</div>
          <div className="text-2xl font-black mt-1 text-amber-400">{kpiStats.updates}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">State Modifications</div>
        </div>

        <div className={`p-4 rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Deletions / Drops</div>
          <div className="text-2xl font-black mt-1 text-red-400">{kpiStats.deletes}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Purged Records</div>
        </div>

        <div className={`p-4 rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Security & Logins</div>
          <div className="text-2xl font-black mt-1 text-purple-400">{kpiStats.security}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sanctum Token Events</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className={`rounded border overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* Header & Filter Toolbar */}
        <div className={`p-4 border-b space-y-3 ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className={`text-sm font-bold tracking-tight flex items-center space-x-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <History className="h-4 w-4 text-blue-500" />
                <span>Enterprise Audit Trail Ledger (SAP/Oracle Standard)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-proof, cryptographically signed ledger capturing user actors, old vs new field diffs, and network telemetry
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className="px-3.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>

          {/* Filtering Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search action, user, emp ID, IP..."
                className={`w-full pl-8 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            {/* Module Filter */}
            <div>
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {MODULES.map(m => (
                  <option key={m} value={m}>Module: {m}</option>
                ))}
              </select>
            </div>

            {/* Event Filter */}
            <div>
              <select
                value={selectedEvent}
                onChange={(e) => {
                  setSelectedEvent(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {EVENTS.map(ev => (
                  <option key={ev} value={ev}>Event: {ev}</option>
                ))}
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center space-x-1.5">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-1/2 px-2 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="text-slate-500 text-xs">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-1/2 px-2 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100/70 border-slate-200 text-slate-600'
              }`}>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Action & Summary</th>
                <th className="py-2.5 px-4">Operator / Actor</th>
                <th className="py-2.5 px-4">Module Scope</th>
                <th className="py-2.5 px-4">Network IP</th>
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4 text-right">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs font-sans">
                    No matching audit trail events found.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((row) => (
                  <tr 
                    key={row.id}
                    onClick={() => setSelectedLog(row)}
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      {getEventBadge(row.event, row.action)}
                    </td>

                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-semibold text-slate-200">
                        {row.action_summary || row.action}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {row.action} {row.auditable_type ? `(${row.auditable_type.split('\\').pop()})` : ''}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 font-sans">
                      <div className="font-semibold text-slate-300">
                        {row.user_name || 'System Automated'}
                      </div>
                      <div className="text-[10px] font-mono text-blue-400">
                        {row.user_emp_id ? `ID: ${row.user_emp_id}` : (row.user_role || 'Daemon')}
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                        {row.module || 'AuthAdmin'}
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-slate-400">
                      {row.ip_address || '127.0.0.1'}
                    </td>

                    <td className="py-2.5 px-4 text-slate-400 text-right font-sans">
                      {new Date(row.created_at).toLocaleString()}
                    </td>

                    <td className="py-2.5 px-4 text-right font-sans">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(row);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[11px] font-semibold flex items-center space-x-1 ml-auto cursor-pointer transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-xs ${
          isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <div>
            Showing <span className="font-bold text-white">{(currentPage - 1) * pageSize + (filteredLogs.length > 0 ? 1 : 0)}</span> to <span className="font-bold text-white">{Math.min(currentPage * pageSize, filteredLogs.length)}</span> of <span className="font-bold text-white">{filteredLogs.length}</span> audit logs
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Previous
            </button>

            <span className="font-mono text-xs font-bold text-blue-400 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={`px-3 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Inspector Modal */}
      <AuditLogInspectorModal
        show={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        log={selectedLog}
        isDark={isDark}
      />

    </div>
  );
}
