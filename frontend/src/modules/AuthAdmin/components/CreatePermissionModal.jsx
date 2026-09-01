import React, { useState } from 'react';
import { KeyRound, X } from 'lucide-react';

export default function CreatePermissionModal({
  show,
  onClose,
  onSubmit,
  isDark
}) {
  const [modulePrefix, setModulePrefix] = useState('sewing');
  const [scopeName, setScopeName] = useState('');
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanScope = scopeName.toLowerCase().trim().replace(/[^a-z0-9_.]/g, '.');
    if (!cleanScope) {
      setError('Permission key action is required.');
      return;
    }

    const fullPermissionName = `${modulePrefix}.${cleanScope}`;
    onSubmit({ name: fullPermissionName });
    setScopeName('');
    setError('');
  };

  const domainOptions = [
    { value: 'admin', label: 'Module 01: System Admin & Auth (admin)' },
    { value: 'master', label: 'Module 02: Master Data Setup (master)' },
    { value: 'orders', label: 'Module 03: Order & PO Management (orders)' },
    { value: 'planning', label: 'Module 04: Planning & IE Targets (planning)' },
    { value: 'cutting', label: 'Module 05: Cutting & Bundling (cutting)' },
    { value: 'valueadd', label: 'Module 06: Value Addition - Wash/Print/Emb (valueadd)' },
    { value: 'sewing', label: 'Module 07: Sewing Line Telemetry (sewing)' },
    { value: 'qc', label: 'Module 08: Quality Control & DHU (qc)' },
    { value: 'washing', label: 'Module 09: Washing & Laundry (washing)' },
    { value: 'finishing', label: 'Module 09: Finishing & Pressing (finishing)' },
    { value: 'packing', label: 'Module 10: Carton Packing (packing)' },
    { value: 'shipment', label: 'Module 10: Dispatch Logistics (shipment)' },
    { value: 'store', label: 'Module 11: Warehouse Store (store)' },
    { value: 'analytics', label: 'Module 12: Analytics & Deep Trace (analytics)' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg p-6 border shadow-xl relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-md bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Add Dynamic Permission Scope</h3>
              <p className="text-xs text-slate-400">Register new API gate for RBAC policies</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4">
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Select Target Domain / Module
            </label>
            <select
              value={modulePrefix}
              onChange={(e) => setModulePrefix(e.target.value)}
              className={`w-full px-3 py-2 rounded-md text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {domainOptions.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Permission Action Key <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="flex items-center">
              <span className={`px-3 py-2 text-xs font-mono border border-r-0 rounded-l-md ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}>
                {modulePrefix}.
              </span>
              <input
                type="text"
                value={scopeName}
                onChange={(e) => {
                  setScopeName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. machine.calibrate or batch.approve"
                className={`w-full px-3 py-2 rounded-r-md text-xs border focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-medium ${
                  error 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
            {error && <span className="text-[11px] text-red-500 mt-1 block font-medium">{error}</span>}
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              Generated Gate: <strong className="text-blue-500">{modulePrefix}.{scopeName ? scopeName.toLowerCase().replace(/[^a-z0-9_.]/g, '.') : 'action'}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 pt-3 border-t border-slate-700/20">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Add Permission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
