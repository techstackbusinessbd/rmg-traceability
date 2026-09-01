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

        {/* Global Overall Bulk Selection Toolbar */}
        {!isSuperAdmin && (
          <div className={`mt-3 p-2.5 rounded border flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Overall Actions:
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Bulk configure all {allPermissions.length} scopes
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPermissions(allPermissions.map(p => p.name))}
                className="px-2.5 py-1 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-2xs transition-colors flex items-center space-x-1.5"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Select All (Full Access)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const viewNames = allPermissions.filter(p => p.name.endsWith('.view')).map(p => p.name);
                  setSelectedPermissions(viewNames);
                }}
                className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-blue-700 border-slate-300 shadow-2xs'
                }`}
              >
                <span>Select All Read-Only</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPermissions([])}
                className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700' : 'bg-white hover:bg-slate-100 text-rose-600 border-slate-300 shadow-2xs'
                }`}
              >
                <X className="h-3.5 w-3.5" />
                <span>Deselect All</span>
              </button>
            </div>
          </div>
        )}

        {/* Permissions Grid */}
        <div className="overflow-y-auto flex-1 py-4 space-y-5 pr-1">
          {moduleKeys
            .filter(key => activeModuleFilter === 'ALL' || activeModuleFilter === key)
            .map(moduleKey => {
              const perms = groupedPermissions[moduleKey];
              const allChecked = perms.every(p => selectedPermissions.includes(p.name));
              const count = perms.filter(p => selectedPermissions.includes(p.name)).length;

              // Quick preset for Read Only (.view permissions)
              const viewPerms = perms.filter(p => p.name.endsWith('.view'));
              const isReadOnlyActive = viewPerms.length > 0 && viewPerms.every(p => selectedPermissions.includes(p.name));

              const toggleReadOnly = () => {
                if (isSuperAdmin) return;
                const viewNames = viewPerms.map(p => p.name);
                if (isReadOnlyActive) {
                  setSelectedPermissions(prev => prev.filter(name => !viewNames.includes(name)));
                } else {
                  setSelectedPermissions(prev => Array.from(new Set([...prev, ...viewNames])));
                }
              };

              return (
                <div key={moduleKey} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-700/20">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-500 font-mono">
                        Module: {moduleKey}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        count > 0 
                          ? (isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200')
                          : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-200 text-slate-600 border-slate-300')
                      }`}>
                        {count}/{perms.length} Active
                      </span>
                    </div>

                    {!isSuperAdmin && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={toggleReadOnly}
                          className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isReadOnlyActive
                              ? (isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-300')
                              : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200' : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900')
                          }`}
                        >
                          Read Only
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => toggleAllInModule(moduleKey)}
                          className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-2xs"
                        >
                          {allChecked ? 'Revoke All' : 'Grant All'}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {perms.map(p => {
                      const isChecked = selectedPermissions.includes(p.name);
                      const parts = p.name.split('.');
                      const action = (parts[parts.length - 1] || 'access').toLowerCase();
                      const entity = parts.slice(1, -1).join(' ') || parts[0];
                      const formattedEntity = entity.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      const formattedAction = action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                      const humanTitle = `${formattedAction} ${formattedEntity}`;

                      const getBadgeStyle = () => {
                        if (action === 'create' || action === 'store') {
                          return isDark ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                        }
                        if (action === 'edit' || action === 'update' || action === 'manage') {
                          return isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800' : 'bg-amber-50 text-amber-700 border-amber-200';
                        }
                        if (action === 'delete' || action === 'destroy') {
                          return isDark ? 'bg-rose-950/60 text-rose-300 border-rose-800' : 'bg-rose-50 text-rose-700 border-rose-200';
                        }
                        return isDark ? 'bg-blue-950/60 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200';
                      };

                      return (
                        <div
                          key={p.id}
                          onClick={() => togglePermission(p.name)}
                          className={`p-2.5 rounded border transition-all select-none flex flex-col justify-between ${
                            isSuperAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:border-blue-500/50 shadow-2xs'
                          } ${
                            isChecked
                              ? isDark ? 'bg-blue-950/30 border-blue-600/60 text-white' : 'bg-blue-50/70 border-blue-400 text-slate-900 font-semibold'
                              : isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2 min-w-0">
                              <div className="mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Square className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {humanTitle}
                                </div>
                                <div className={`text-[10px] font-mono truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {p.name}
                                </div>
                              </div>
                            </div>

                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border shrink-0 ${getBadgeStyle()}`}>
                              {action}
                            </span>
                          </div>
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
