import React, { useState } from 'react';
import { X, ShieldCheck, Clock, User, Globe, FileText, CheckCircle2, AlertTriangle, ArrowRight, Copy, Check } from 'lucide-react';

export default function AuditLogInspectorModal({
  show,
  onClose,
  log,
  isDark = true
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('diff'); // 'diff' | 'raw' | 'context'

  if (!show || !log) return null;

  const handleCopyRaw = () => {
    const data = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEventBadge = (event) => {
    switch (event) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'LOGIN':
      case 'SECURITY':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const oldValues = log.old_values || {};
  const newValues = log.new_values || log.payload || {};
  const allKeys = Array.from(new Set([...Object.keys(oldValues), ...Object.keys(newValues)]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-3xl rounded border shadow-2xl overflow-hidden transition-colors flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getEventBadge(log.event || 'ACTION')}`}>
                  {log.event || 'ACTION'}
                </span>
                <span className="font-mono font-bold text-xs text-blue-400">
                  {log.action}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  #{log.id.slice(0, 8)}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {log.action_summary || `${log.action} on ${log.module}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`px-6 pt-3 flex space-x-4 border-b text-xs font-semibold ${
          isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'diff'
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Visual Field Diff ({allKeys.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('context')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'context'
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security & Network Context
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`pb-2.5 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'raw'
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw JSON Audit Record
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: VISUAL DIFF */}
          {activeTab === 'diff' && (
            <div className="space-y-4">
              {allKeys.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No structural field changes recorded for this event.
                </div>
              ) : (
                <div className={`rounded border overflow-hidden ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[11px] font-bold ${
                        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        <th className="py-2 px-3 w-1/4">Field / Property</th>
                        <th className="py-2 px-3 w-3/8 text-red-400">Previous Value (Old)</th>
                        <th className="py-2 px-3 w-3/8 text-emerald-400">Updated Value (New)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono text-[11px]">
                      {allKeys.map((key) => {
                        const oldVal = oldValues[key];
                        const newVal = newValues[key];
                        const isDifferent = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                        return (
                          <tr
                            key={key}
                            className={`transition-colors ${
                              isDifferent
                                ? (isDark ? 'bg-blue-500/5' : 'bg-blue-50/50')
                                : ''
                            }`}
                          >
                            <td className="py-2 px-3 font-semibold text-slate-300">
                              {key}
                            </td>
                            <td className={`py-2 px-3 ${
                              isDifferent && oldVal !== undefined
                                ? 'bg-red-500/10 text-red-400 line-through'
                                : 'text-slate-400'
                            }`}>
                              {oldVal !== undefined ? (
                                typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)
                              ) : (
                                <span className="text-slate-600 italic">None</span>
                              )}
                            </td>
                            <td className={`py-2 px-3 ${
                              isDifferent && newVal !== undefined
                                ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                                : 'text-slate-300'
                            }`}>
                              {newVal !== undefined ? (
                                typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)
                              ) : (
                                <span className="text-slate-600 italic">Deleted</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY & CONTEXT */}
          {activeTab === 'context' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 rounded border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Actor / Operator Identity</span>
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Full Name:</span>
                    <span className="font-semibold">{log.user_name || 'System Auto'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Employee ID:</span>
                    <span className="font-mono font-bold text-blue-400">{log.user_emp_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="font-semibold">{log.user_role || 'User'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">User UUID:</span>
                    <span className="font-mono text-[10px] text-slate-400">{log.user_id || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded border space-y-3 ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-bold text-blue-400 flex items-center space-x-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  <span>Network & Target Scope</span>
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="font-mono">{log.ip_address || '127.0.0.1'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">HTTP Method:</span>
                    <span className="font-mono font-bold text-emerald-400">{log.http_method || 'POST'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Module Scope:</span>
                    <span className="font-mono text-blue-400">{log.module}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Timestamp (UTC):</span>
                    <span className="font-mono text-[11px]">{new Date(log.created_at).toISOString()}</span>
                  </div>
                </div>
              </div>

              {log.user_agent && (
                <div className={`sm:col-span-2 p-3 rounded border text-xs font-mono break-all ${
                  isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}>
                  <span className="font-bold text-slate-300 block mb-1">User Agent Device Header:</span>
                  {log.user_agent}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAW JSON */}
          {activeTab === 'raw' && (
            <div className="relative">
              <button
                type="button"
                onClick={handleCopyRaw}
                className="absolute top-2 right-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <pre className="p-4 rounded bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono overflow-x-auto max-h-96">
                {JSON.stringify(log, null, 2)}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Recorded on {new Date(log.created_at).toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer border ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
