import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Smartphone, 
  KeyRound, 
  History, 
  Plus, 
  LogOut, 
  UserCheck, 
  ArrowLeft, 
  Sun, 
  Moon
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [activeAdminTab, setActiveAdminTab] = useState('users');

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
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/admin/users`, {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        is_active: true
      }, { headers: { Authorization: `Bearer ${token}` } });

      setCreateMsg('User registered successfully by Admin!');
      setNewUserName('');
      setNewUserEmail('');
      setTimeout(() => {
        setCreateMsg('');
        setShowNewUserModal(false);
        fetchAdminData();
      }, 1200);
    } catch (err) {
      setCreateMsg(err.response?.data?.message || 'Error creating user');
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

      setCreateMsg('Floor Tablet registered & line-locked!');
      setNewDevName('');
      setNewDevCode('');
      setTimeout(() => {
        setCreateMsg('');
        setShowNewDeviceModal(false);
        fetchAdminData();
      }, 1200);
    } catch (err) {
      setCreateMsg(err.response?.data?.message || 'Error registering device');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-blue-400">
              <ArrowLeft className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Module 01: System Admin & Auth</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                Protected Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-md border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <UserCheck className="h-4 w-4 text-blue-400" />
              <span className="font-semibold">{user?.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">
                {user?.roles?.[0] || 'Super Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Console Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className={`p-6 sm:p-8 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/30">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600 rounded-lg text-white shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Security, RBAC & Floor Device Management
                </h2>
                <p className="text-xs text-slate-400">Manage factory user accounts, roles, tablet security PINs and audit logs</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`p-1 rounded-lg border flex items-center space-x-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveAdminTab('users')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'users' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Users ({usersList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('devices')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'devices' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Tablets ({devicesList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('roles')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'roles' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Roles ({rolesList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('audit')}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'audit' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="h-3.5 w-3.5" />
                <span>Audit Logs ({auditList.length})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Users */}
          {activeAdminTab === 'users' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <strong className="text-blue-400">Protected Rule:</strong> Only authorized Administrators can register new accounts.
                </span>
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register New User</span>
                </button>
              </div>

              <div className={`overflow-hidden rounded-lg border ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
              }`}>
                <table className="w-full text-left text-xs">
                  <thead className={`border-b font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400 bg-slate-900/60' : 'border-slate-200 text-slate-600 bg-slate-100'
                  }`}>
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 font-medium">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-blue-500/5 transition-colors">
                        <td className="p-3.5 font-bold">{u.name}</td>
                        <td className="p-3.5 font-mono text-slate-400">{u.email}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full font-semibold text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {u.roles?.[0]?.name || 'Standard User'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {u.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px] font-mono">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Tablets */}
          {activeAdminTab === 'devices' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  <strong className="text-blue-400">Line-Locking Rule:</strong> Each tablet is locked to a specific line via 6-digit PIN code.
                </span>
                <button
                  onClick={() => setShowNewDeviceModal(true)}
                  className="px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Floor Tablet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devicesList.map((d) => (
                  <div key={d.id} className={`p-4 rounded-lg border ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-blue-400">{d.device_code}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        {d.is_active ? 'ONLINE/ACTIVE' : 'REVOKED'}
                      </span>
                    </div>
                    <div className="font-bold text-sm">{d.device_name}</div>
                    <div className="text-xs text-slate-400 mt-1">Locked Line: <strong className="text-slate-200">{d.line_name || 'Floor Line 01'}</strong></div>
                    <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
                      PIN: ****** (Encrypted) &bull; Type: {d.device_type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Roles */}
          {activeAdminTab === 'roles' && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rolesList.map((r) => (
                <div key={r.id} className={`p-4 rounded-lg border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-blue-400">{r.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {r.permissions?.length || 0} Perms
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="text-[11px] text-slate-400">Granted Scopes:</div>
                    <div className="flex flex-wrap gap-1">
                      {r.permissions?.slice(0, 4).map((p) => (
                        <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {p.name}
                        </span>
                      ))}
                      {(r.permissions?.length || 0) > 4 && (
                        <span className="text-[10px] text-blue-400 font-mono">+{r.permissions.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Audit Logs */}
          {activeAdminTab === 'audit' && (
            <div className="mt-6 space-y-3">
              <div className="text-xs text-slate-400 font-medium">
                Cryptographically tracked system security events and administrator modifications:
              </div>
              <div className={`divide-y rounded-lg border overflow-hidden ${
                isDark ? 'divide-slate-800 border-slate-800 bg-slate-950/60' : 'divide-slate-200 border-slate-200 bg-slate-50'
              }`}>
                {auditList.map((a) => (
                  <div key={a.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {a.action}
                      </span>
                      <span className="font-medium text-slate-300">{a.user_name || 'System'}</span>
                      <span className="text-slate-500">&bull; {a.module}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Modal: Register New User */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-xl p-6 sm:p-8 border shadow-xl relative ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-bold mb-1">Register New User (Admin Only)</h3>
            <p className="text-xs text-slate-400 mb-4">Create account and assign role with custom scopes</p>

            {createMsg && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@factory.com"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Cutting Master">Cutting Master</option>
                  <option value="Line Supervisor">Line Supervisor</option>
                  <option value="QC Inspector">QC Inspector</option>
                  <option value="Packing Operator">Packing Operator</option>
                  <option value="Store Keeper">Store Keeper</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-xl p-6 sm:p-8 border shadow-xl relative ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-bold mb-1">Register Floor Tablet</h3>
            <p className="text-xs text-slate-400 mb-4">Lock device to a production line with 6-digit PIN</p>

            {createMsg && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs">
                {createMsg}
              </div>
            )}

            <form onSubmit={handleCreateDevice} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Device Name</label>
                <input
                  type="text"
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  placeholder="e.g. Sewing Line 02 Tablet"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Device Code (Unique)</label>
                <input
                  type="text"
                  value={newDevCode}
                  onChange={(e) => setNewDevCode(e.target.value)}
                  placeholder="TAB-SEW-L02"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">6-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newDevPin}
                  onChange={(e) => setNewDevPin(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Lock to Production Line</label>
                <input
                  type="text"
                  value={newDevLine}
                  onChange={(e) => setNewDevLine(e.target.value)}
                  placeholder="Sewing Line 02"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewDeviceModal(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm cursor-pointer"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
