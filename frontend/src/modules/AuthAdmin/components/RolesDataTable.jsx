import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Users, 
  Sliders, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  ChevronRight, 
  Save, 
  X, 
  CheckSquare, 
  Square,
  Layers,
  KeyRound,
  Trash2
} from 'lucide-react';
import { DataTable } from '../../../components/common/DataTable';

const PROTECTED_ROLES = ['Super Admin', 'Admin', 'Plant Manager', 'Line Supervisor', 'QC Inspector', 'Cutting Master', 'Packing Operator', 'Store Keeper'];

export default function RolesDataTable({
  roles = [],
  allPermissions = [],
  usersList = [],
  isDark,
  onSaveRolePermissions,
  onOpenCreateRole,
  onOpenCreatePermission,
  onDeleteRole,
  onDeletePermission,
  saving = false
}) {
  const [editingRole, setEditingRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [modalSearch, setModalSearch] = useState('');

  // Map user count per role
  const roleUserCountMap = useMemo(() => {
    const map = {};
    usersList.forEach(u => {
      const roleName = u.roles?.[0]?.name;
      if (roleName) {
        map[roleName] = (map[roleName] || 0) + 1;
      }
    });
    return map;
  }, [usersList]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    if (!allPermissions || !Array.isArray(allPermissions)) return {};
    return allPermissions.reduce((acc, perm) => {
      if (!perm?.name) return acc;
      const parts = perm.name.split('.');
      const moduleKey = parts[0] || 'general';

      if (!acc[moduleKey]) acc[moduleKey] = [];
      acc[moduleKey].push(perm);
      return acc;
    }, {});
  }, [allPermissions]);

  const moduleKeys = Object.keys(groupedPermissions);

  const getModuleLabel = (key) => {
    const map = {
      admin: 'System Administration',
      master: 'Master Data Setup',
      orders: 'Order & Style PO',
      planning: 'Production Planning',
      cutting: 'Cutting & Bundling',
      valueadd: 'Value Addition (Wash/Print/Emb)',
      sewing: 'Sewing Floor Telemetry',
      qc: 'Quality Control & DHU',
      washing: 'Washing & Laundry',
      finishing: 'Finishing & Pressing',
      packing: 'Carton Packing',
      shipment: 'Dispatch & Shipment',
      store: 'Warehouse Store Ledger',
      analytics: 'Analytics & Deep Trace'
    };
    return map[key] || `${key.toUpperCase()}`;
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setSelectedPermissions((role.permissions || []).map(p => p.name));
    setModuleFilter('ALL');
    setModalSearch('');
  };

  const togglePermission = (permName) => {
    if (editingRole?.name === 'Super Admin') return;
    setSelectedPermissions(prev => 
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const toggleAllInModule = (moduleKey) => {
    if (editingRole?.name === 'Super Admin') return;
    const perms = groupedPermissions[moduleKey].map(p => p.name);
    const allChecked = perms.every(p => selectedPermissions.includes(p));

    if (allChecked) {
      setSelectedPermissions(prev => prev.filter(p => !perms.includes(p)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...perms])));
    }
  };

  const handleSave = () => {
    if (!editingRole || editingRole.name === 'Super Admin') return;
    onSaveRolePermissions({
      roleId: editingRole.id,
      permissions: selectedPermissions
    });
    setEditingRole(null);
  };

  // Table Columns Definition
  const columns = [
    {
      key: 'name',
      label: 'Security Role Name',
      sortable: true,
      render: (row) => {
        const isSuper = row.name === 'Super Admin';
        const isCustom = !PROTECTED_ROLES.includes(row.name);
        return (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
              {row.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-xs flex items-center space-x-2">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>{row.name}</span>
                {isSuper && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                    PLATFORM OWNER
                  </span>
                )}
                {isCustom && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                    CUSTOM ROLE
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {row.guard_name || 'web'} Guard
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'user_count',
      label: 'Assigned Members',
      sortable: true,
      render: (row) => {
        const count = roleUserCountMap[row.name] || 0;
        return (
          <div className="flex items-center space-x-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono font-bold text-xs">
              {count} {count === 1 ? 'Operator' : 'Operators'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'permissions_count',
      label: 'Permission Scopes',
      sortable: true,
      render: (row) => {
        const count = row.permissions?.length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {count} of {allPermissions.length} Scopes
            </span>
          </div>
        );
      }
    },
    {
      key: 'access_level',
      label: 'Access Scope',
      sortable: false,
      render: (row) => {
        const isSuper = row.name === 'Super Admin';
        const isAdmin = row.name === 'Admin';
        return (
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isSuper 
              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
              : isAdmin
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-700/20'
          }`}>
            <span>{isSuper ? 'Global Enterprise' : isAdmin ? 'Factory Level' : 'Floor Scoped'}</span>
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => {
        const isProtected = PROTECTED_ROLES.includes(row.name);
        return (
          <div className="flex items-center justify-end space-x-1.5">
            <button
              type="button"
              onClick={() => handleOpenEdit(row)}
              className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1 shadow-2xs cursor-pointer transition-colors"
            >
              <Sliders className="h-3 w-3" />
              <span>Configure</span>
            </button>
            {!isProtected && onDeleteRole && (
              <button
                type="button"
                onClick={() => onDeleteRole(row)}
                title="Delete Custom Role"
                className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const filteredModalModules = moduleKeys.filter(key => {
    if (moduleFilter !== 'ALL' && moduleFilter !== key) return false;
    if (!modalSearch.trim()) return true;

    const term = modalSearch.toLowerCase();
    const titleMatch = getModuleLabel(key).toLowerCase().includes(term);
    const permMatch = groupedPermissions[key].some(p => p.name.toLowerCase().includes(term));
    return titleMatch || permMatch;
  });

  // =========================================================================
  // DEDICATED IN-PAGE VIEW: ROLE PERMISSIONS POLICY MATRIX EDITOR
  // =========================================================================
  if (editingRole) {
    const isSuperAdmin = editingRole.name === 'Super Admin';

    return (
      <div className="space-y-4 animate-in fade-in duration-150">
        
        {/* Back Navigation Bar & Role Header */}
        <div className={`p-5 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-start space-x-3.5">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className={`p-2 rounded border transition-colors cursor-pointer shrink-0 mt-0.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
                title="Back to Roles Directory"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>

              <div>
                <div className="flex items-center space-x-2.5">
                  <span className={`text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    Role Policy Matrix
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {editingRole.id || 'system-role'}
                  </span>
                </div>

                <h2 className="text-xl font-black tracking-tight mt-1 flex items-center space-x-2">
                  <span>{editingRole.name}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-600 text-white shadow-2xs font-normal">
                    {selectedPermissions.length} / {allPermissions.length} Active Scopes
                  </span>
                </h2>

                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Configure fine-grained API gates, module capabilities, and operational authorization policies.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className={`px-3.5 py-2 rounded text-xs font-bold border transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                }`}
              >
                ← Back to Roles
              </button>

              {!isSuperAdmin && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Updating Policies...' : 'Save Matrix Policies'}</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Super Admin Notice */}
        {isSuperAdmin && (
          <div className="p-3.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center space-x-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Super Admin is the platform owner. All permissions across all 12 domains are permanently active.</span>
          </div>
        )}

        {/* Overall Bulk Actions Toolbar */}
        {!isSuperAdmin && (
          <div className={`p-3.5 rounded border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="flex items-center space-x-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Overall Bulk Actions:
              </span>
              <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                One-click permission presets across all {allPermissions.length} scopes
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedPermissions(allPermissions.map(p => p.name))}
                className="px-3 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-2xs transition-colors flex items-center space-x-1.5"
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
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-blue-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-blue-700 border-slate-300 shadow-2xs'
                }`}
              >
                <span>Select All Read-Only</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPermissions([])}
                className={`px-3 py-1.5 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700' : 'bg-white hover:bg-slate-100 text-rose-600 border-slate-300 shadow-2xs'
                }`}
              >
                <X className="h-3.5 w-3.5" />
                <span>Deselect / Clear All</span>
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Layout: Left Domain Navigator + Right Permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Domain Navigator */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            <div className={`p-2 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Permission Domains
              </div>

              {/* Search Box */}
              <div className="p-1 mb-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Search scopes..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Domain list */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setModuleFilter('ALL')}
                  className={`w-full text-left p-2.5 rounded text-xs transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                    moduleFilter === 'ALL'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : isDark
                        ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800 font-medium'
                        : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Layers className="h-4 w-4 shrink-0" />
                    <span>All Domains</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    moduleFilter === 'ALL'
                      ? 'bg-blue-700 text-white'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {allPermissions.length}
                  </span>
                </button>

                {moduleKeys.map(key => {
                  const count = groupedPermissions[key].length;
                  const activeInDomain = groupedPermissions[key].filter(p => selectedPermissions.includes(p.name)).length;
                  const isActive = moduleFilter === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setModuleFilter(key)}
                      className={`w-full text-left p-2.5 rounded text-xs transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : isDark
                            ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800 font-medium'
                            : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="truncate">{getModuleLabel(key)}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : activeInDomain > 0
                            ? (isDark ? 'bg-blue-950/80 text-blue-300 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200')
                            : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600')
                      }`}>
                        {activeInDomain}/{count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Permissions Container */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {filteredModalModules.map(moduleKey => {
              const perms = groupedPermissions[moduleKey];
              const allSelected = perms.every(p => selectedPermissions.includes(p.name));
              const count = perms.filter(p => selectedPermissions.includes(p.name)).length;

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
                <div 
                  key={moduleKey}
                  className={`rounded border transition-colors overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Domain Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1 rounded ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-600 border border-slate-200'}`}>
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {getModuleLabel(moduleKey)}
                        </h4>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {count} of {perms.length} scopes granted for this role
                        </span>
                      </div>
                    </div>

                    {!isSuperAdmin && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={toggleReadOnly}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            isReadOnlyActive
                              ? (isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-300')
                              : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200' : 'bg-white text-slate-600 border-slate-300 hover:text-slate-900 shadow-2xs')
                          }`}
                        >
                          Read Only
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => toggleAllInModule(moduleKey)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-2xs"
                        >
                          {allSelected ? 'Revoke All' : 'Grant All'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                          className={`p-3 rounded border transition-all select-none flex flex-col justify-between ${
                            isSuperAdmin
                              ? 'cursor-not-allowed opacity-90'
                              : 'cursor-pointer hover:border-blue-500/50 shadow-2xs'
                          } ${
                            isChecked
                              ? isDark ? 'bg-blue-950/30 border-blue-600/60 text-white' : 'bg-blue-50/70 border-blue-400 text-slate-900 font-semibold'
                              : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start space-x-2.5 min-w-0">
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

                          {onDeletePermission && (
                            <div className="flex justify-end mt-2 pt-1 border-t border-slate-700/10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeletePermission(p);
                                }}
                                title="Delete Permission Scope"
                                className="opacity-0 hover:opacity-100 p-0.5 text-slate-400 hover:text-red-400 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>
        </div>

      </div>
    );
  }

  // =========================================================================
  // DEFAULT VIEW: ROLES & PERMISSIONS DIRECTORY TABLE
  // =========================================================================
  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className={`p-4 sm:p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded bg-blue-600 text-white shadow-2xs">
                <KeyRound className="h-4 w-4" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Role-Based Access Control (RBAC)
              </h3>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {roles.length} System Roles
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage user roles, grant granular module authorizations, and configure dynamic operational permissions.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {onOpenCreatePermission && (
              <button
                type="button"
                onClick={onOpenCreatePermission}
                className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                }`}
              >
                + New Scope
              </button>
            )}

            {onOpenCreateRole && (
              <button
                type="button"
                onClick={onOpenCreateRole}
                className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>+ Define New Role</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className={`p-4 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <DataTable
          columns={columns}
          data={roles}
          searchPlaceholder="Search roles by title or level..."
          exportFileName="rmg-security-roles-matrix"
        />
      </div>

    </div>
  );
}

