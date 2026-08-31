import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Smartphone, 
  KeyRound, 
  History, 
  Plus, 
  CheckCircle2,
  XCircle,
  Database,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Server,
  Activity,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DataTable } from '../components/common/DataTable';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const { subRoute } = useParams();
  const { token, isAuthenticated } = useAuthStore();
  const { isDark } = useThemeStore();
  
  const activeTab = subRoute || 'users';

  const handleTabChange = (tabId) => {
    navigate(`/admin/${tabId}`);
  };
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);

  // Admin lists
  const [usersList, setUsersList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Form states
  const [newEmpId, setNewEmpId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState('Line Supervisor');
  const [newUserStatus, setNewUserStatus] = useState(true);

  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevPin, setNewDevPin] = useState('123456');
  const [newDevLine, setNewDevLine] = useState('Line 01');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchAdminData();
    }
  }, [isAuthenticated, token]);

  const fetchAdminData = async () => {
    if (!token) return;
    setFetchLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, dRes, rRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`, config),
        axios.get(`${API_BASE}/admin/devices`, config),
        axios.get(`${API_BASE}/admin/roles`, config),
        axios.get(`${API_BASE}/admin/audit-logs`, config),
      ]);
      setUsersList(uRes.data.data.data || []);
      setDevicesList(dRes.data.data || []);
      setRolesList(rRes.data.data.roles || []);
      setAuditList(aRes.data.data.data || []);
    } catch (e) {
      console.error('Error fetching admin data', e);
      toast.error('Failed to load administrative records');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUserPassword !== newUserConfirmPassword) {
      toast.error('Password and Confirm Password do not match!');
      return;
    }

    try {
      await axios.post(`${API_BASE}/admin/users`, {
        emp_id: newEmpId || null,
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        password_confirmation: newUserConfirmPassword,
        role: newUserRole,
        is_active: newUserStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('User registered successfully by Admin!');
      setNewEmpId('');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('Password123!');
      setNewUserConfirmPassword('Password123!');
      setNewUserStatus(true);
      setShowNewUserModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/devices`, {
        device_name: newDevName,
        device_code: newDevCode,
        pin_code: newDevPin,
        line_name: newDevLine,
        device_type: 'Tablet'
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Floor Tablet registered & line-locked!');
      setNewDevName('');
      setNewDevCode('');
      setShowNewDeviceModal(false);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error registering device');
    }
  };

  // Table Columns
  const userColumns = [
    { 
      key: 'emp_id', 
      label: 'Emp ID', 
      sortable: true, 
      className: 'font-mono text-blue-500 font-bold',
      render: (row) => row.emp_id ? (
        <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
          {row.emp_id}
        </span>
      ) : (
        <span className="text-slate-500 text-xs">—</span>
      )
    },
    { 
      key: 'name', 
      label: 'Full Name', 
      sortable: true, 
      className: 'font-semibold',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-[10px]">
            {row.name?.charAt(0) || 'U'}
          </div>
          <span className="font-bold">{row.name}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email Address', sortable: true, className: 'font-mono text-slate-400' },
    { 
      key: 'roles', 
      label: 'Assigned Role', 
      sortable: false,
      render: (row) => (
        <span className="px-2 py-0.5 rounded font-mono font-semibold text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {row.roles?.[0]?.name || 'Standard User'}
        </span>
      )
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      sortable: true,
      render: (row) => (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold ${
          row.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {row.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          <span>{row.is_active ? 'ACTIVE' : 'SUSPENDED'}</span>
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Registered On', 
      sortable: true, 
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
  ];

  const auditColumns = [
    { 
      key: 'action', 
      label: 'Event Code', 
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px]">
          {row.action}
        </span>
      )
    },
    { key: 'user_name', label: 'Operator / Principal', sortable: true, render: (row) => row.user_name || 'System Daemon' },
    { key: 'module', label: 'Module Scope', sortable: true, className: 'text-slate-400 font-mono text-[11px]' },
    { 
      key: 'created_at', 
      label: 'Timestamp (UTC)', 
      sortable: true, 
      align: 'right',
      render: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.created_at).toLocaleString()}
        </span>
      )
    },
  ];

  const getBreadcrumbs = () => {
    switch (activeTab) {
      case 'users': return ['Identity & Security', 'Users & Operators'];
      case 'devices': return ['Identity & Security', 'Floor Tablets'];
      case 'roles': return ['Identity & Security', 'Role Permissions & Gates'];
      case 'audit': return ['Identity & Security', 'Audit Trail'];
      default: return ['Master Data Setup', 'Catalog Overview'];
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      breadcrumbs={getBreadcrumbs()}
    >
      <Toaster position="top-right" />

      {/* Module 01: Auth & Administration View */}
      {['users', 'devices', 'roles', 'audit'].includes(activeTab) && (
        <div className="space-y-5">
          
          {/* Top KPI Cards (Enterprise Stat Bar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Active Operators</span>
                <Users className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{usersList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% RBAC Secured</span>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Floor Tablets</span>
                <Smartphone className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{devicesList.length}</div>
              <div className="text-xs text-blue-500 font-semibold flex items-center space-x-1 mt-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Line-Locked PIN Enabled</span>
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Defined Roles</span>
                <KeyRound className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{rolesList.length}</div>
              <div className="text-xs text-slate-400 font-mono mt-1.5 font-medium">
                Spatie Role Gates
              </div>
            </div>

            <div className={`p-4 sm:p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-sm mb-1 font-medium">
                <span>Audit Trail Events</span>
                <History className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{auditList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <Activity className="h-3.5 w-3.5" />
                <span>Immutable Logs</span>
              </div>
            </div>
          </div>

          {/* Module 01 Sub-Views based on activeTab */}
          {activeTab === 'users' && (
            <div className={`p-6 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-700/20">
                <div>
                  <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Factory Users & Operators Directory
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Authorized system users mapped to Spatie roles and permissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(true)}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-2 shadow-2xs cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register New User</span>
                </button>
              </div>

              <DataTable
                columns={userColumns}
                data={usersList}
                loading={fetchLoading}
                searchPlaceholder="Search users by name or email..."
                exportFileName="rmg-users-directory"
              />
            </div>
          )}

          {activeTab === 'devices' && (
            <div className={`p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-700/20">
                <div>
                  <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Floor Tablets & Hardware Scanners
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dedicated hardware terminals locked to factory sewing lines and inspection stations
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewDeviceModal(true)}
                  className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register Floor Tablet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {devicesList.map((d) => (
                  <div key={d.id} className={`p-4 rounded border ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-blue-500">{d.device_code}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {d.is_active ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="font-bold text-sm">{d.device_name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Assigned Station: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{d.line_name || 'Line 01'}</strong>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Auth: 6-Digit PIN</span>
                      <span>Type: {d.device_type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className={`p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="mb-4 pb-3 border-b border-slate-700/20">
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Role-Based Access Control (RBAC Matrix)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Granular permission scopes assigned to user roles for API and Floor operations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {rolesList.map((r) => {
                  // Function to get distinct color for each individual permission tag based on its prefix
                  const getPermissionTagStyle = (permName) => {
                    const prefix = permName.split('.')[0] || '';
                    switch (prefix) {
                      case 'admin':
                        return isDark
                          ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-300'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700';
                      case 'master':
                        return isDark
                          ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                          : 'bg-amber-50 border-amber-200 text-amber-800';
                      case 'orders':
                        return isDark
                          ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                          : 'bg-blue-50 border-blue-200 text-blue-700';
                      case 'cutting':
                        return isDark
                          ? 'bg-orange-950/60 border-orange-800/80 text-orange-300'
                          : 'bg-orange-50 border-orange-200 text-orange-800';
                      case 'sewing':
                        return isDark
                          ? 'bg-sky-950/60 border-sky-800/80 text-sky-300'
                          : 'bg-sky-50 border-sky-200 text-sky-800';
                      case 'qc':
                        return isDark
                          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800';
                      case 'packing':
                      case 'shipment':
                        return isDark
                          ? 'bg-purple-950/60 border-purple-800/80 text-purple-300'
                          : 'bg-purple-50 border-purple-200 text-purple-800';
                      case 'store':
                        return isDark
                          ? 'bg-teal-950/60 border-teal-800/80 text-teal-300'
                          : 'bg-teal-50 border-teal-200 text-teal-800';
                      default:
                        return isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300'
                          : 'bg-slate-100 border-slate-200 text-slate-700';
                    }
                  };

                  return (
                    <div key={r.id} className={`p-4 rounded border transition-colors ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {r.permissions?.length || 0} Scopes
                        </span>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[11px] text-slate-500 font-medium">Authorized Actions:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {r.permissions?.slice(0, 4).map((p) => (
                            <span 
                              key={p.id} 
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${getPermissionTagStyle(p.name)}`}
                            >
                              {p.name}
                            </span>
                          ))}
                          {(r.permissions?.length || 0) > 4 && (
                            <span className="text-[10px] font-mono font-bold text-blue-600 self-center">
                              +{r.permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className={`p-5 rounded border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="mb-4 pb-3 border-b border-slate-700/20">
                <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Tamper-Proof Audit Trail
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Immutable log of all user logins, role changes, and administrative actions
                </p>
              </div>

              <DataTable
                columns={auditColumns}
                data={auditList}
                loading={fetchLoading}
                searchPlaceholder="Search audit events by action or user..."
                exportFileName="rmg-audit-trail"
              />
            </div>
          )}

        </div>
      )}

      {/* Placeholder / Hub for other modules */}
      {!['users', 'devices', 'roles', 'audit'].includes(activeTab) && (
        <div className={`p-12 text-center rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <Database className="h-12 w-12 text-blue-500 mx-auto mb-3 opacity-80" />
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeTab.toUpperCase().replace('_', ' ')}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            This module is scheduled for implementation in Sprint 2. Ready to proceed with Master Data Management.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Back to Users Management
          </button>
        </div>
      )}

      {/* Modal: Register New User */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded p-6 border shadow-lg relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-sm font-bold mb-1">Register New User (Admin Only)</h3>
            <p className="text-xs text-slate-400 mb-4">Create account and assign role with custom scopes</p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    placeholder="e.g. EMP-10492"
                    required
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">
                  Email Address <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@factory.com (optional)"
                  className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Password</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={newUserConfirmPassword}
                    onChange={(e) => setNewUserConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    minLength={8}
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Assign Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} {r.name === 'Super Admin' ? '(Platform Owner)' : r.name === 'Admin' ? '(Factory Admin)' : ''}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Admin">Admin (Factory Admin)</option>
                        <option value="Cutting Master">Cutting Master</option>
                        <option value="Line Supervisor">Line Supervisor</option>
                        <option value="QC Inspector">QC Inspector</option>
                        <option value="Packing Operator">Packing Operator</option>
                        <option value="Store Keeper">Store Keeper</option>
                        <option value="Super Admin">Super Admin (Platform Owner)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Account Status</label>
                  <select
                    value={newUserStatus ? 'active' : 'suspended'}
                    onChange={(e) => setNewUserStatus(e.target.value === 'active')}
                    className={`w-full px-3 py-2 rounded text-xs sm:text-sm border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="active">ACTIVE (Operational)</option>
                    <option value="suspended">SUSPENDED (Locked)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Tablet */}
      {showNewDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded p-6 border shadow-lg relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className="text-sm font-bold mb-1">Register Floor Tablet</h3>
            <p className="text-xs text-slate-400 mb-4">Lock device to a production line with 6-digit PIN</p>

            <form onSubmit={handleCreateDevice} className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  placeholder="e.g. Sewing Line 02 Tablet"
                  required
                  className={`w-full px-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Device Code (Unique)</label>
                <input
                  type="text"
                  value={newDevCode}
                  onChange={(e) => setNewDevCode(e.target.value)}
                  placeholder="TAB-SEW-L02"
                  required
                  className={`w-full px-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">6-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newDevPin}
                  onChange={(e) => setNewDevPin(e.target.value)}
                  required
                  className={`w-full px-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono tracking-widest ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Lock to Production Line</label>
                <input
                  type="text"
                  value={newDevLine}
                  onChange={(e) => setNewDevLine(e.target.value)}
                  placeholder="Sewing Line 02"
                  required
                  className={`w-full px-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewDeviceModal(false)}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
