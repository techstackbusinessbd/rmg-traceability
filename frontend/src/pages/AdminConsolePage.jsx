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
  HardDrive,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Power,
  Eye,
  Radio,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import RegisterUserModal from '../modules/AuthAdmin/components/RegisterUserModal';
import RegisterDeviceModal from '../modules/AuthAdmin/components/RegisterDeviceModal';
import EditUserModal from '../modules/AuthAdmin/components/EditUserModal';
import RolesDataTable from '../modules/AuthAdmin/components/RolesDataTable';
import SystemSettingsDashboard from '../modules/AuthAdmin/components/SystemSettingsDashboard';
import ShiftManagementDashboard from '../modules/AuthAdmin/components/ShiftManagementDashboard';
import CreateShiftModal from '../modules/AuthAdmin/components/CreateShiftModal';
import EditShiftModal from '../modules/AuthAdmin/components/EditShiftModal';
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
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftFormErrors, setShiftFormErrors] = useState({});

  const [editingUser, setEditingUser] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [editingRolePermissions, setEditingRolePermissions] = useState(null);
  const [allPermissionsList, setAllPermissionsList] = useState([]);
  const [savingRoleMatrix, setSavingRoleMatrix] = useState(false);

  // Admin lists
  const [usersList, setUsersList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [settingsList, setSettingsList] = useState([]);
  const [settingsForm, setSettingsForm] = useState({});
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Form states
  const [newEmpId, setNewEmpId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState('Line Supervisor');
  const [newUserStatus, setNewUserStatus] = useState(true);
  const [userFormErrors, setUserFormErrors] = useState({});

  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevPin, setNewDevPin] = useState('123456');
  const [newDevLine, setNewDevLine] = useState('Line 01');
  const [deviceFormErrors, setDeviceFormErrors] = useState({});

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
      const [uRes, dRes, rRes, aRes, sRes, shRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/admin/users`, config),
        axios.get(`${API_BASE}/admin/devices`, config),
        axios.get(`${API_BASE}/admin/roles`, config),
        axios.get(`${API_BASE}/admin/audit-logs`, config),
        axios.get(`${API_BASE}/admin/settings`, config),
        axios.get(`${API_BASE}/admin/shifts`, config),
      ]);

      if (uRes.status === 'fulfilled') {
        setUsersList(uRes.value.data?.data?.data || []);
      }
      if (dRes.status === 'fulfilled') {
        setDevicesList(dRes.value.data?.data || []);
      }
      if (rRes.status === 'fulfilled') {
        setRolesList(rRes.value.data?.data?.roles || []);
        setAllPermissionsList(rRes.value.data?.data?.permissions || []);
      }
      if (aRes.status === 'fulfilled') {
        setAuditList(aRes.value.data?.data?.data || []);
      }
      if (shRes.status === 'fulfilled') {
        setShiftsList(shRes.value.data?.data || []);
      }
      if (sRes.status === 'fulfilled') {
        const sData = sRes.value.data?.data || [];
        setSettingsList(sData);
        const initialMap = {};
        sData.forEach(s => { initialMap[s.key] = s.value; });
        setSettingsForm(initialMap);
      }

      // If all failed, show toast
      const allFailed = [uRes, dRes, rRes, aRes, sRes, shRes].every(r => r.status === 'rejected');
      if (allFailed) {
        toast.error('Unable to reach backend API. Please verify server connection.');
      }
    } catch (e) {
      console.error('Error fetching admin data', e);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSaveRolePermissions = async ({ roleId, permissions }) => {
    setSavingRoleMatrix(true);
    try {
      await axios.put(`${API_BASE}/admin/roles/${roleId}/permissions`, {
        permissions
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('Role Permission Matrix updated successfully!');
      setEditingRolePermissions(null);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role permissions');
    } finally {
      setSavingRoleMatrix(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await axios.post(`${API_BASE}/admin/settings`, {
        settings: settingsForm
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('System settings saved & Redis cache refreshed!');
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormErrors({});

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
      setUserFormErrors({});
      setShowNewUserModal(false);
      fetchAdminData();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setUserFormErrors(resp.errors);
        const firstErrorKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstErrorKey][0] || 'Validation error');
      } else {
        toast.error(resp?.message || 'Error creating user');
      }
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setDeviceFormErrors({});

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
      setDeviceFormErrors({});
      setShowNewDeviceModal(false);
      fetchAdminData();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setDeviceFormErrors(resp.errors);
        const firstErrorKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstErrorKey][0] || 'Validation error');
      } else {
        toast.error(resp?.message || 'Error registering device');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    const newStatus = !user.is_active;
    try {
      await axios.put(`${API_BASE}/admin/users/${user.id}`, {
        is_active: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`User ${user.name} ${newStatus ? 'activated' : 'suspended'}!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleUpdateUser = async (formData) => {
    setEditFormErrors({});
    try {
      await axios.put(`${API_BASE}/admin/users/${formData.id}`, {
        name: formData.name,
        role: formData.role,
        is_active: formData.is_active
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success('User updated successfully!');
      setEditingUser(null);
      setEditFormErrors({});
      fetchAdminData();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setEditFormErrors(resp.errors);
        const firstErrorKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstErrorKey][0] || 'Validation error');
      } else {
        toast.error(resp?.message || 'Failed to update user');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`User ${user.name} removed successfully!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleDeviceStatus = async (device) => {
    const newStatus = !device.is_active;
    try {
      await axios.put(`${API_BASE}/admin/devices/${device.id}`, {
        is_active: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`Device ${device.device_name} is now ${newStatus ? 'ONLINE' : 'OFFLINE'}!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update device');
    }
  };

  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Are you sure you want to delete floor device ${device.device_name}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/devices/${device.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Device ${device.device_name} deleted!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete device');
    }
  };

  const handleCreateShift = async (formData) => {
    setShiftFormErrors({});
    try {
      await axios.post(`${API_BASE}/admin/shifts`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Shift schedule '${formData.shift_name}' created successfully!`);
      setShowCreateShiftModal(false);
      setShiftFormErrors({});
      fetchAdminData();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setShiftFormErrors(resp.errors);
        const firstErrorKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstErrorKey][0] || 'Validation error');
      } else {
        toast.error(resp?.message || 'Error creating shift schedule');
      }
    }
  };

  const handleUpdateShift = async (formData) => {
    setShiftFormErrors({});
    try {
      await axios.put(`${API_BASE}/admin/shifts/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Shift schedule updated successfully!');
      setEditingShift(null);
      setShiftFormErrors({});
      fetchAdminData();
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setShiftFormErrors(resp.errors);
        const firstErrorKey = Object.keys(resp.errors)[0];
        toast.error(resp.errors[firstErrorKey][0] || 'Validation error');
      } else {
        toast.error(resp?.message || 'Failed to update shift schedule');
      }
    }
  };

  const handleToggleShiftStatus = async (shift) => {
    const newStatus = !shift.is_active;
    try {
      await axios.put(`${API_BASE}/admin/shifts/${shift.id}`, {
        is_active: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`Shift '${shift.shift_name}' is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update shift status');
    }
  };

  const handleDeleteShift = async (shift) => {
    if (!window.confirm(`Are you sure you want to delete shift ${shift.shift_name}?`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/shifts/${shift.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Shift '${shift.shift_name}' deleted!`);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete shift');
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
      render: (row) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (row) => {
        const isSuperAdmin = row.roles?.[0]?.name === 'Super Admin' || row.emp_id === 'EMP-SUPERADMIN' || row.email === 'admin@rmgtrace.com';

        return (
          <div className="flex items-center justify-end space-x-1">
            {/* View User Page Link */}
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${row.id}`)}
              title="View User Details Page"
              className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Edit User Button */}
            <button
              type="button"
              onClick={() => setEditingUser(row)}
              title="Edit User"
              className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            {isSuperAdmin ? (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 ml-1" title="Platform Root Administrator (Protected)">
                <ShieldCheck className="h-3 w-3" />
                <span>ROOT</span>
              </span>
            ) : (
              <>
                {/* Toggle Suspend / Activate */}
                <button
                  type="button"
                  onClick={() => handleToggleUserStatus(row)}
                  title={row.is_active ? 'Suspend User' : 'Activate User'}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    row.is_active 
                      ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                      : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  {row.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>

                {/* Delete User */}
                <button
                  type="button"
                  onClick={() => handleDeleteUser(row)}
                  title="Delete User"
                  className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
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
      case 'shifts': return ['Identity & Security', 'Unit & Floor Shifts'];
      case 'audit': return ['Identity & Security', 'Audit Trail'];
      case 'settings': return ['System Config', 'Global Settings'];
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
      {['users', 'devices', 'roles', 'shifts', 'audit', 'settings'].includes(activeTab) && (
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
                <span>Floor Shifts Configured</span>
                <Clock className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <div className="text-3xl font-black tracking-tight">{shiftsList.length}</div>
              <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Staggered Timings Active</span>
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
                    <div className="mt-3 pt-2.5 border-t border-slate-700/30 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                        <span>Auth: PIN</span>
                        <span>•</span>
                        <span>{d.device_type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceStatus(d)}
                          title={d.is_active ? 'Set Tablet Offline' : 'Set Tablet Online'}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            d.is_active 
                              ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                              : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(d)}
                          title="Delete Floor Tablet"
                          className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <RolesDataTable
              roles={rolesList}
              allPermissions={allPermissionsList}
              usersList={usersList}
              isDark={isDark}
              onSaveRolePermissions={handleSaveRolePermissions}
              saving={savingRoleMatrix}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftManagementDashboard
              shifts={shiftsList}
              loading={fetchLoading}
              onOpenCreateModal={() => {
                setShiftFormErrors({});
                setShowCreateShiftModal(true);
              }}
              onOpenEditModal={(shift) => {
                setShiftFormErrors({});
                setEditingShift(shift);
              }}
              onToggleStatus={handleToggleShiftStatus}
              onDeleteShift={handleDeleteShift}
            />
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

          {activeTab === 'settings' && (
            <SystemSettingsDashboard
              settings={settingsList}
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              onSave={handleSaveSettings}
              saving={saveLoading}
            />
          )}

        </div>
      )}

      {/* Placeholder / Hub for other modules */}
      {!['users', 'devices', 'roles', 'shifts', 'audit', 'settings'].includes(activeTab) && (
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
            onClick={() => handleTabChange('users')}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Back to Users Management
          </button>
        </div>
      )}

      {/* Modular Modal: Register New User */}
      <RegisterUserModal
        show={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSubmit={handleCreateUser}
        isDark={isDark}
        rolesList={rolesList}
        empId={newEmpId}
        setEmpId={setNewEmpId}
        userName={newUserName}
        setUserName={setNewUserName}
        userEmail={newUserEmail}
        setUserEmail={setNewUserEmail}
        userPassword={newUserPassword}
        setUserPassword={setNewUserPassword}
        userConfirmPassword={newUserConfirmPassword}
        setUserConfirmPassword={setNewUserConfirmPassword}
        userRole={newUserRole}
        setUserRole={setNewUserRole}
        userStatus={newUserStatus}
        setUserStatus={setNewUserStatus}
        errors={userFormErrors}
      />

      {/* Modular Modal: Register New Tablet Device */}
      <RegisterDeviceModal
        show={showNewDeviceModal}
        onClose={() => setShowNewDeviceModal(false)}
        onSubmit={handleCreateDevice}
        isDark={isDark}
        devName={newDevName}
        setDevName={setNewDevName}
        devCode={newDevCode}
        setDevCode={setNewDevCode}
        devPin={newDevPin}
        setDevPin={setNewDevPin}
        devLine={newDevLine}
        setDevLine={setNewDevLine}
        errors={deviceFormErrors}
      />

      {/* Modular Modal: Edit User */}
      <EditUserModal
        show={Boolean(editingUser)}
        onClose={() => {
          setEditingUser(null);
          setEditFormErrors({});
        }}
        onSubmit={handleUpdateUser}
        user={editingUser}
        isDark={isDark}
        rolesList={rolesList}
        errors={editFormErrors}
      />

      {/* Modular Modal: Create Shift */}
      <CreateShiftModal
        show={showCreateShiftModal}
        onClose={() => {
          setShowCreateShiftModal(false);
          setShiftFormErrors({});
        }}
        onSubmit={handleCreateShift}
        isDark={isDark}
        errors={shiftFormErrors}
      />

      {/* Modular Modal: Edit Shift */}
      <EditShiftModal
        show={Boolean(editingShift)}
        onClose={() => {
          setEditingShift(null);
          setShiftFormErrors({});
        }}
        onSubmit={handleUpdateShift}
        shift={editingShift}
        isDark={isDark}
        errors={shiftFormErrors}
      />

    </AdminLayout>
  );
}
