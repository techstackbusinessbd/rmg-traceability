import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Check, 
  X, 
  Search, 
  Save, 
  Layers, 
  CheckSquare, 
  Square, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Filter,
  Users,
  Eye,
  PlusCircle,
  Edit3,
  Trash,
  SlidersHorizontal,
  Table,
  LayoutGrid
} from 'lucide-react';

export default function EnterprisePermissionMatrix({
  roles = [],
  allPermissions = [],
  isDark,
  onSaveRolePermissions,
  saving = false
}) {
  const [activeRole, setActiveRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModuleFilter, setActiveModuleFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' (full cross-tab table) | 'editor' (role-scoped inspector)
  const [hasChanges, setHasChanges] = useState(false);

  // Sync activeRole and selected permissions when roles load
  React.useEffect(() => {
    if (roles && roles.length > 0) {
      const currentRole = roles.find(r => r.id === activeRole) || roles[0];
      if (currentRole) {
        if (activeRole !== currentRole.id) {
          setActiveRole(currentRole.id);
        }
        const perms = (currentRole.permissions || []).map(p => p.name);
        setSelectedPermissions(perms);
        setHasChanges(false);
      }
    }
  }, [roles, activeRole]);

  const currentRoleObj = (roles && roles.length > 0) 
    ? (roles.find(r => r.id === activeRole) || roles[0]) 
    : null;

  const isSuperAdmin = currentRoleObj?.name === 'Super Admin';

  // Group permissions by Module prefix
  const groupedPermissions = useMemo(() => {
    if (!allPermissions || !Array.isArray(allPermissions)) return {};
    return allPermissions.reduce((acc, perm) => {
      if (!perm?.name) return acc;
      const parts = perm.name.split('.');
      const moduleKey = parts[0] || 'general';
      const resourceKey = parts[1] || 'action';
      const actionType = parts.slice(2).join('.') || parts[1] || 'access';

      if (!acc[moduleKey]) acc[moduleKey] = [];
      acc[moduleKey].push({
        ...perm,
        moduleKey,
        resourceKey,
        actionType,
        displayName: parts.slice(1).join(' ')
      });
      return acc;
    }, {});
  }, [allPermissions]);

  const moduleKeys = Object.keys(groupedPermissions);

  // Module human readable labels & icons
  const getModuleTitle = (key) => {
    const map = {
      admin: '01. System & Identity Administration',
      master: '02. Master Data & Garment Catalog',
      orders: '03. Style PO & Order Processing',
      planning: '04. Production Planning & IE',
      cutting: '05. Cutting Room & Bundle Generation',
      valueadd: '06. Value Addition & Embellishment',
      sewing: '07. Sewing Floor Telemetry & WIP',
      qc: '08. Quality Control & DHU Body Map',
      washing: '09. Wash Batch & Finishing QC',
      finishing: '10. Finishing & Packaging',
      packing: '11. Carton Packing & Barcode',
      shipment: '12. Dispatch & Export Logistics',
      store: '13. Warehouse Fabric & Trims Ledger',
      analytics: '14. Executive BI & Traceability'
    };
    return map[key] || `${key.toUpperCase()} Module`;
  };

  const togglePermission = (permName) => {
    if (isSuperAdmin) return;
    setHasChanges(true);
    setSelectedPermissions(prev => 
      prev.includes(permName) 
        ? prev.filter(p => p !== permName) 
        : [...prev, permName]
    );
  };

  const toggleAllInModule = (moduleKey) => {
    if (isSuperAdmin) return;
    setHasChanges(true);
    const modulePermNames = groupedPermissions[moduleKey].map(p => p.name);
    const allSelected = modulePermNames.every(name => selectedPermissions.includes(name));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(name => !modulePermNames.includes(name)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...modulePermNames])));
    }
  };

  const selectAllPermissions = () => {
    if (isSuperAdmin) return;
    setHasChanges(true);
    setSelectedPermissions(allPermissions.map(p => p.name));
  };

  const deselectAllPermissions = () => {
    if (isSuperAdmin) return;
    setHasChanges(true);
    setSelectedPermissions([]);
  };

  const handleSave = () => {
    if (!currentRoleObj || isSuperAdmin) return;
    onSaveRolePermissions({
      roleId: currentRoleObj.id,
      permissions: selectedPermissions
    });
  };

  // Filtered Modules and Permissions
  const filteredModules = moduleKeys.filter(key => {
    if (activeModuleFilter !== 'ALL' && activeModuleFilter !== key) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const titleMatch = getModuleTitle(key).toLowerCase().includes(term);
    const permMatch = groupedPermissions[key].some(p => 
      p.name.toLowerCase().includes(term) || p.displayName.toLowerCase().includes(term)
    );
    return titleMatch || permMatch;
  });

  return (
    <div className={`border rounded-lg shadow-xs transition-colors overflow-hidden ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* Top Header & Overview Bar */}
      <div className={`p-5 sm:px-6 sm:py-5 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/70'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Enterprise Access Control & Policy Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-role privilege assignments mapped across all 12 RMG Woven manufacturing domains
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Global Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className={`p-1 rounded-md border flex items-center space-x-1 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'editor'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Role Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Global Matrix Grid</span>
            </button>
          </div>

          {viewMode === 'editor' && !isSuperAdmin && (
            <button
              type="button"
              disabled={isSuperAdmin || saving || !hasChanges}
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save Matrix'}</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: GLOBAL CROSS-TAB MATRIX GRID (Tier-1 ERP Master Table) */}
      {viewMode === 'matrix' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/20">
            <div>
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Cross-Domain Role Privilege Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete overview of authorized capabilities across all defined factory and administration roles
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search capability or scope..."
                className={`w-full pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className={`border rounded-lg overflow-x-auto shadow-2xs ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b font-mono ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-700'
                }`}>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider min-w-[240px]">
                    System Capability Scope
                  </th>
                  {roles.map(r => (
                    <th key={r.id} className="py-3 px-3 text-center font-bold font-sans uppercase min-w-[120px]">
                      <div className="truncate">{r.name}</div>
                      <span className="text-[10px] font-mono text-blue-500 block font-normal">
                        ({r.permissions?.length || 0} scopes)
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20 font-mono">
                {filteredModules.map(moduleKey => {
                  const perms = groupedPermissions[moduleKey];
                  return (
                    <React.Fragment key={moduleKey}>
                      {/* Module Header Row */}
                      <tr className={isDark ? 'bg-slate-900/90' : 'bg-slate-50'}>
                        <td 
                          colSpan={roles.length + 1} 
                          className="py-2.5 px-4 font-bold text-blue-500 uppercase tracking-wider text-[11px] font-sans"
                        >
                          <div className="flex items-center space-x-2">
                            <Layers className="h-3.5 w-3.5" />
                            <span>{getModuleTitle(moduleKey)}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Permissions Rows */}
                      {perms.map(p => (
                        <tr 
                          key={p.id} 
                          className={`transition-colors ${
                            isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">
                            <span className={isDark ? 'text-slate-200' : 'text-slate-800 font-semibold'}>{p.name}</span>
                          </td>
                          {roles.map(r => {
                            const isSuper = r.name === 'Super Admin';
                            const hasPerm = isSuper || (r.permissions || []).some(rp => rp.name === p.name);

                            return (
                              <td key={r.id} className="py-2 px-3 text-center">
                                {hasPerm ? (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Check className="h-3.5 w-3.5" />
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center justify-center h-5 w-5 rounded text-slate-600 opacity-40">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: ROLE-SCOPED DUAL PANE INSPECTOR & LIVE EDITOR */}
      {viewMode === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Column: Roles Selector (4 Cols on LG) */}
          <div className={`lg:col-span-4 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r ${
            isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/70'
          }`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security Roles ({roles.length})
              </span>
            </div>

            <div className="space-y-2">
              {roles.map(r => {
                const isSelected = r.id === activeRole;
                const isSuper = r.name === 'Super Admin';
                const permCount = isSelected ? selectedPermissions.length : (r.permissions?.length || 0);

                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveRole(r.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDark
                          ? 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 text-slate-200'
                          : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-8 w-8 rounded flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-blue-600/10 text-blue-600'
                      }`}>
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center space-x-1.5">
                          <span>{r.name}</span>
                          {isSuper && (
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            }`}>
                              ROOT
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] font-mono block mt-0.5 ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          {permCount} Authorized Scopes
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>

            {/* Role Policy Help Tip */}
            <div className={`mt-6 p-3.5 rounded-lg border text-xs ${
              isDark ? 'bg-slate-900/70 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1 text-blue-500">
                <HelpCircle className="h-4 w-4 shrink-0" />
                <span>Security Principle</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Roles are enforced via Laravel Gate policies. Updating permission scopes immediately invalidates stale sessions.
              </p>
            </div>
          </div>

          {/* Right Column: Permission Matrix Table (8 Cols on LG) */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col">
            
            {/* Active Role Banner & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-700/20">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">Configuring Privileges for:</span>
                  <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentRoleObj?.name}
                  </span>
                  {hasChanges && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold animate-pulse">
                      Unsaved Changes
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedPermissions.length} of {allPermissions.length} total system permissions assigned
                </p>
              </div>

              {/* Filter Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter permissions or modules..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-md text-xs border focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Module Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin">
              <button
                type="button"
                onClick={() => setActiveModuleFilter('ALL')}
                className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
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
                  className={`px-3 py-1 rounded text-xs font-bold uppercase whitespace-nowrap transition-colors cursor-pointer ${
                    activeModuleFilter === key
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {key} ({groupedPermissions[key].length})
                </button>
              ))}
            </div>

            {isSuperAdmin && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Super Admin is the platform owner. All permissions across all modules are active by system architecture.</span>
              </div>
            )}

            {/* Modules Table Accordion Grid */}
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1 flex-1">
              {filteredModules.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-mono">
                  No permissions matching "{searchTerm}"
                </div>
              ) : (
                filteredModules.map(moduleKey => {
                  const perms = groupedPermissions[moduleKey];
                  const allSelected = perms.every(p => selectedPermissions.includes(p.name));
                  const countSelected = perms.filter(p => selectedPermissions.includes(p.name)).length;

                  return (
                    <div key={moduleKey} className={`rounded-lg border overflow-hidden ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}>
                      {/* Module Title Bar */}
                      <div className={`p-3 sm:px-4 flex items-center justify-between border-b ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex items-center space-x-2.5">
                          <Layers className="h-4 w-4 text-blue-500 shrink-0" />
                          <div>
                            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {getModuleTitle(moduleKey)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 ml-2">
                              ({countSelected}/{perms.length} active)
                            </span>
                          </div>
                        </div>

                        {!isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => toggleAllInModule(moduleKey)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
                          >
                            {allSelected ? 'Revoke Module' : 'Grant Module'}
                          </button>
                        )}
                      </div>

                      {/* Permissions Grid within Module */}
                      <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {perms.map(p => {
                          const isChecked = selectedPermissions.includes(p.name);
                          return (
                            <div
                              key={p.id}
                              onClick={() => togglePermission(p.name)}
                              className={`p-2.5 rounded border text-xs font-mono flex items-center justify-between transition-all select-none ${
                                isSuperAdmin ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:border-blue-500/40'
                              } ${
                                isChecked
                                  ? isDark ? 'bg-blue-950/40 border-blue-600/50 text-blue-300' : 'bg-blue-50/80 border-blue-300 text-blue-900'
                                  : isDark ? 'bg-slate-900/60 border-slate-800/80 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center space-x-2 truncate pr-2">
                                {isChecked ? (
                                  <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-slate-400 shrink-0" />
                                )}
                                <span className="truncate">{p.name}</span>
                              </div>
                              {isChecked && (
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
