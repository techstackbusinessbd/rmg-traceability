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
  Filter
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
      const actionKey = parts.slice(1).join(' ') || perm.name;

      if (!acc[moduleKey]) acc[moduleKey] = [];
      acc[moduleKey].push({
        ...perm,
        moduleKey,
        actionKey
      });
      return acc;
    }, {});
  }, [allPermissions]);

  const moduleKeys = Object.keys(groupedPermissions);

  // Module human readable labels
  const getModuleTitle = (key) => {
    const map = {
      admin: 'System & Security Administration',
      master: 'Master Data & Library Management',
      orders: 'Order Processing & Style PO',
      planning: 'Planning & Line Allocation (IE)',
      cutting: 'Cutting Floor & Bundle Generation',
      valueadd: 'Value Addition & Embellishment',
      sewing: 'Sewing Floor Telemetry & WIP',
      qc: 'Quality Control & DHU Body Map',
      washing: 'Washing & Batch Tracking',
      finishing: 'Finishing Inspection & Packaging',
      packing: 'Carton Packing & Barcode Scan',
      shipment: 'Commercial Dispatch & Shipment',
      store: 'Warehouse & Fabric Trims Ledger',
      analytics: 'Executive BI & Traceability Reports'
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
      p.name.toLowerCase().includes(term) || p.actionKey.toLowerCase().includes(term)
    );
    return titleMatch || permMatch;
  });

  return (
    <div className={`border rounded-lg shadow-sm transition-colors overflow-hidden ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* Top Header & Overview */}
      <div className={`p-5 sm:p-6 border-b flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
      }`}>
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-md bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Role & Permission Policy Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized granular access control and API gate authorization across all 12 RMG modules
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {!isSuperAdmin && (
            <>
              <button
                type="button"
                onClick={selectAllPermissions}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Grant All
              </button>
              <button
                type="button"
                onClick={deselectAllPermissions}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Revoke All
              </button>
            </>
          )}

          <button
            type="button"
            disabled={isSuperAdmin || saving || !hasChanges}
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Saving Matrix...' : 'Save Matrix Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout: Left Roles List Sidebar + Right Permission Matrix Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        
        {/* Left Column: Roles Selector (4 Cols on LG) */}
        <div className={`lg:col-span-4 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              System Roles ({roles.length})
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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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
              <span>Policy Principle</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Permissions are evaluated server-side via Laravel Gate & Spatie Policies. Modifying scopes updates authorizations immediately.
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

    </div>
  );
}
