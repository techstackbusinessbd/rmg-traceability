import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CheckSquare, Square, X, AlertCircle } from 'lucide-react';

export default function RolePermissionModal({
  show,
  onClose,
  onSubmit,
  role,
  allPermissions = [],
  isDark,
  loading = false
}) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [activeModuleFilter, setActiveModuleFilter] = useState('ALL');

  useEffect(() => {
    if (role) {
      const currentPermNames = (role.permissions || []).map(p => p.name);
      setSelectedPermissions(currentPermNames);
    }
  }, [role]);

  if (!show || !role) return null;

  const isSuperAdmin = role.name === 'Super Admin';

  // Group permissions by module prefix (e.g. admin, master, orders, sewing, qc, store, etc.)
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    const prefix = perm.name.split('.')[0] || 'other';
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(perm);
    return acc;
  }, {});

  const moduleKeys = Object.keys(groupedPermissions);

  const togglePermission = (permName) => {
    if (isSuperAdmin) return;
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName) 
        : [...prev, permName]
    );
  };

  const toggleAllInModule = (moduleKey) => {
    if (isSuperAdmin) return;
    const modulePermNames = groupedPermissions[moduleKey].map(p => p.name);
    const allSelected = modulePermNames.every(name => selectedPermissions.includes(name));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(name => !modulePermNames.includes(name)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...modulePermNames])));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSubmit({
      roleId: role.id,
      permissions: selectedPermissions
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-3xl w-full rounded-lg p-6 sm:p-7 border shadow-xl relative max-h-[90vh] flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/20 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-md bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight flex items-center space-x-2">
                <span>{role.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-normal">
                  {selectedPermissions.length} Scopes Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">Configure granular permission scopes & API authorization policies</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuperAdmin && (
          <div className="mt-4 p-3 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center space-x-2 shrink-0">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Super Admin permissions are absolute across all 12 modules and cannot be restricted.</span>
          </div>
        )}

        {/* Module Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-4 pb-2 border-b border-slate-700/20 shrink-0">
          <button
            type="button"
            onClick={() => setActiveModuleFilter('ALL')}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              activeModuleFilter === 'ALL'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Modules ({allPermissions.length})
          </button>
          {moduleKeys.map(key => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveModuleFilter(key)}
              className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
                activeModuleFilter === key
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {key} ({groupedPermissions[key].length})
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1">
          {moduleKeys
            .filter(key => activeModuleFilter === 'ALL' || activeModuleFilter === key)
            .map(moduleKey => {
              const perms = groupedPermissions[moduleKey];
              const allChecked = perms.every(p => selectedPermissions.includes(p.name));
              const someChecked = perms.some(p => selectedPermissions.includes(p.name));

              return (
                <div key={moduleKey} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
                      Module: {moduleKey} ({perms.length})
                    </span>
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => toggleAllInModule(moduleKey)}
                        className="text-[11px] font-bold text-slate-400 hover:text-blue-500 cursor-pointer"
                      >
                        {allChecked ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {perms.map(p => {
                      const isChecked = selectedPermissions.includes(p.name);
                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.name)}
                          className={`p-2.5 rounded border text-xs font-mono flex items-center space-x-2 transition-colors select-none ${
                            isSuperAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'
                          } ${
                            isChecked
                              ? isDark ? 'bg-blue-950/40 border-blue-600/50 text-blue-300' : 'bg-blue-50 border-blue-300 text-blue-800'
                              : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-blue-500 shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate">{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center space-x-3 pt-4 border-t border-slate-700/20 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancel
          </button>
          {!isSuperAdmin && (
            <button
              type="button"
              disabled={loading}
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Matrix...' : 'Save Permission Matrix'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
