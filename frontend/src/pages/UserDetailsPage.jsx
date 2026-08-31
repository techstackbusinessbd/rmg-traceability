import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX,
  Lock,
  Activity,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import EditUserModal from '../modules/AuthAdmin/components/EditUserModal';

const API_BASE = 'http://localhost:8000/api/v1';

export default function UserDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const { isDark } = useThemeStore();

  const [user, setUser] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormErrors, setEditFormErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUserDetails();
    }
  }, [id, isAuthenticated, token]);

  const fetchUserDetails = async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [uRes, rRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users/${id}`, config),
        axios.get(`${API_BASE}/admin/roles`, config)
      ]);
      setUser(uRes.data.data);
      setRolesList(rRes.data.data?.roles || []);
    } catch (err) {
      toast.error('Failed to load user profile');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = !user.is_active;
    try {
      await axios.put(`${API_BASE}/admin/users/${user.id}`, {
        is_active: newStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      toast.success(`User ${user.name} ${newStatus ? 'activated' : 'suspended'}!`);
      fetchUserDetails();
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
      setShowEditModal(false);
      setEditFormErrors({});
      fetchUserDetails();
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

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`User ${user.name} deleted successfully!`);
      navigate('/admin/users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const isSuperAdmin = user?.roles?.[0]?.name === 'Super Admin' || user?.emp_id === 'EMP-SUPERADMIN' || user?.email === 'admin@rmgtrace.com';

  return (
    <AdminLayout
      activeTab="users"
      onTabChange={(tabId) => navigate(`/admin/${tabId}`)}
      breadcrumbs={['Identity & Security', 'Users & Operators', user?.name || 'User Profile']}
    >
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/users"
            className={`inline-flex items-center space-x-2 text-xs font-semibold transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users Directory</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-xs text-slate-400 font-mono">Loading User Profile...</span>
          </div>
        ) : !user ? (
          <div className="p-8 text-center text-slate-400">User not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Top Profile Summary Card */}
            <div className={`p-6 sm:p-8 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-700/20">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-lg bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-xs">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {user.name}
                      </h1>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                        user.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {user.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        <span>{user.is_active ? 'ACTIVE' : 'SUSPENDED'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      Employee ID: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{user.emp_id || 'NO EMP ID'}</strong>
                    </p>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="flex items-center space-x-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  {isSuperAdmin ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold font-mono px-3 py-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <ShieldCheck className="h-4 w-4" />
                      <span>ROOT OWNER</span>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleStatus}
                        className={`px-3.5 py-2 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center space-x-1.5 ${
                          user.is_active 
                            ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' 
                            : 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                        <span>{user.is_active ? 'Suspend' : 'Activate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDeleteUser}
                        className="px-3.5 py-2 rounded text-xs font-bold border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center space-x-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Details Key-Value Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-lg bg-slate-500/5 border border-slate-700/15">
                  <span className="text-xs text-slate-400 block mb-1">Email Address</span>
                  <span className="font-mono text-sm font-semibold">{user.email || '—'}</span>
                </div>

                <div className="p-4 rounded-lg bg-slate-500/5 border border-slate-700/15">
                  <span className="text-xs text-slate-400 block mb-1">Assigned Security Role</span>
                  <span className="font-mono text-sm font-bold text-blue-500">
                    {user.roles?.[0]?.name || 'Standard User'}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-500/5 border border-slate-700/15">
                  <span className="text-xs text-slate-400 block mb-1">Registered Timestamp</span>
                  <span className="font-mono text-sm font-semibold">{new Date(user.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Granular Permissions Matrix Card */}
            <div className={`p-6 sm:p-8 rounded-lg border transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="mb-4 pb-3 border-b border-slate-700/20 flex items-center justify-between">
                <div>
                  <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Active Role Permissions & API Gates
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time RBAC scopes granted to this operator via Spatie permission system
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {user.roles?.[0]?.permissions?.length || 0} Scopes Active
                </span>
              </div>

              {user.roles?.[0]?.permissions && user.roles[0].permissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
                  {user.roles[0].permissions.map((p) => (
                    <div 
                      key={p.id} 
                      className={`p-3 rounded border text-xs font-mono flex items-center space-x-2 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <Lock className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No granular permissions mapped directly to this role.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditFormErrors({});
        }}
        onSubmit={handleUpdateUser}
        user={user}
        isDark={isDark}
        rolesList={rolesList}
        errors={editFormErrors}
      />
    </AdminLayout>
  );
}
