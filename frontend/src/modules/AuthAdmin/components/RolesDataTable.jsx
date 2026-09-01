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

  return (
    <div className="space-y-4">
      {/* Clean Header Bar */}
      <div className={`p-5 rounded-lg border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/20">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Dynamic Security Roles & Permissions Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              100% Dynamic Role-Based Access Control (RBAC) across all 12 RMG Garments Modules
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenCreatePermission && (
              <button
                type="button"
                onClick={onOpenCreatePermission}
                className={`px-3 py-2 rounded text-xs font-semibold border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                  isDark ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                <span>+ Add Permission Scope</span>
              </button>
            )}

            {onOpenCreateRole && (
              <button
                type="button"
                onClick={onOpenCreateRole}
                className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Create Custom Role</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean Modern Data Table */}
        <DataTable
          columns={columns}
          data={roles}
          searchPlaceholder="Search roles by title or level..."
          exportFileName="rmg-security-roles-matrix"
        />
      </div>

      {/* Permissions Configuration Drawer / Modal */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-4xl w-full rounded-lg p-6 sm:p-7 border shadow-xl flex flex-col max-h-[90vh] ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/20 shrink-0">
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight flex items-center space-x-2">
                    <span>{editingRole.name}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {selectedPermissions.length} / {allPermissions.length} Scopes Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Configure dynamic API gates and operational authorization scopes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="p-1.5 rounded hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 pb-3 border-b border-slate-700/20 shrink-0">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-400 shrink-0">Filter Domain:</span>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="ALL">All Domains ({allPermissions.length} Scopes)</option>
                  {moduleKeys.map(k => (
                    <option key={k} value={k}>
                      {getModuleLabel(k)} ({groupedPermissions[k].length})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder="Search permission scopes..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Permission Scopes Grid */}
            <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
              {editingRole.name === 'Super Admin' && (
                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Super Admin is the platform owner. All permissions across all domains are permanently active.</span>
                </div>
              )}

              {filteredModalModules.map(moduleKey => {
                const perms = groupedPermissions[moduleKey];
                const allSelected = perms.every(p => selectedPermissions.includes(p.name));
                const count = perms.filter(p => selectedPermissions.includes(p.name)).length;

                return (
                  <div key={moduleKey} className={`rounded border overflow-hidden ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50/50 border-slate-200 shadow-2xs'
                  }`}>
                    {/* Header */}
                    <div className={`p-3 sm:px-4 flex items-center justify-between border-b ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100/70 border-slate-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <Layers className="h-4 w-4 text-blue-500" />
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {getModuleLabel(moduleKey)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({count}/{perms.length} active)
                        </span>
                      </div>

                      {editingRole.name !== 'Super Admin' && (
                        <button
                          type="button"
                          onClick={() => toggleAllInModule(moduleKey)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
                        >
                          {allSelected ? 'Revoke All' : 'Grant All'}
                        </button>
                      )}
                    </div>

                    {/* Permissions list */}
                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {perms.map(p => {
                        const isChecked = selectedPermissions.includes(p.name);
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePermission(p.name)}
                            className={`p-2 rounded border text-xs font-mono flex items-center justify-between transition-all select-none ${
                              editingRole.name === 'Super Admin'
                                ? 'cursor-not-allowed opacity-90'
                                : 'cursor-pointer hover:border-blue-500/40'
                            } ${
                              isChecked
                                ? isDark ? 'bg-blue-950/40 border-blue-600/50 text-blue-300' : 'bg-blue-50/80 border-blue-300 text-blue-900 font-semibold'
                                : isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-2 truncate">
                              {isChecked ? (
                                <CheckSquare className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                              ) : (
                                <Square className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              )}
                              <span className="truncate">{p.name}</span>
                            </div>
                            {onDeletePermission && (
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
                            )}
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
                onClick={() => setEditingRole(null)}
                className={`flex-1 py-2.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                  isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancel
              </button>
              {editingRole.name !== 'Super Admin' && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="flex-1 py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating Policies...' : 'Save Matrix Policies'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
