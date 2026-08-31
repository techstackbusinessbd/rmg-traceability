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
  Moon,
  Layers,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:8000/api/v1';

export default function AdminConsolePage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [activeAdminTab, setActiveAdminTab] = useState('users');
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState(false);

  // Admin lists
  const [usersList, setUsersList] = useState([]);
  const [devicesList, setDevicesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserRole, setNewUserRole] = useState('Line Supervisor');
  const [createMsg, setCreateMsg] = useState('');

  const [newDevName, setNewDevName] = useState('');
  const [newDevCode, setNewDevCode] = useState('');
  const [newDevPin, setNewDevPin] = useState('123456');
  const [newDevLine, setNewDevLine] = useState('Line 01');

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

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
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-cyan-500 selection:text-black ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <div className="h-4 w-px bg-slate-700"></div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">Module 01: System Admin & Auth</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                Protected Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-xl border ${
              isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <UserCheck className="h-4 w-4 text-cyan-400" />
              <span className="font-semibold">{user?.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">
                {user?.roles?.[0] || 'Super Admin'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-md shadow-black/20'
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
        <section className={`p-6 sm:p-8 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-cyan-500/50 shadow-2xl' : 'bg-white border-cyan-500/60 shadow-xl'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/30">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-white shadow-md">
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
            <div className={`p-1 rounded-2xl border flex items-center space-x-1 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveAdminTab('users')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'users' 
                    ? 'bg-cyan-500 text-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Users ({usersList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('devices')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'devices' 
                    ? 'bg-cyan-500 text-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Tablets ({devicesList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('roles')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'roles' 
                    ? 'bg-cyan-500 text-black shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>Roles ({rolesList.length})</span>
              </button>
              <button
                onClick={() => setActiveAdminTab('audit')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeAdminTab === 'audit' 
                    ? 'bg-cyan-500 text-black shadow-md' 
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
                  <strong className="text-cyan-400">Protected Rule:</strong> শুধুমাত্র অ্যাডমিন নতুন ইউজার রেজিস্ট্রেশন করতে পারেন।
                </span>
                <button
                  onClick={() => setShowNewUserModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register New User</span>
                </button>
              </div>

              <div className={`overflow-hidden rounded-2xl border ${
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
                      <tr key={u.id} className="hover:bg-cyan-500/5 transition-colors">
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
                  <strong className="text-cyan-400">Line-Locking Rule:</strong> প্রতিটি ট্যাবলেট নির্দিষ্ট ৬-ডিজিট PIN কোড দ্বারা প্রোডাকশন লাইনে লকড।
                </span>
                <button
                  onClick={() => setShowNewDeviceModal(true)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Register Floor Tablet</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {devicesList.map((d) => (
                  <div key={d.id} className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-cyan-400">{d.device_code}</span>
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
                <div key={r.id} className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-cyan-400">{r.name}</span>
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
                        <span className="text-[10px] text-cyan-500 font-mono">+{r.permissions.length - 4} more</span>
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
                সিস্টেমের সমস্ত নিরাপত্তা ঘটনা এবং অ্যাডমিন ক্রিয়াকলাপের অপরিবর্তনীয় লগ:
              </div>
              <div className={`divide-y rounded-2xl border overflow-hidden ${
                isDark ? 'divide-slate-800 border-slate-800 bg-slate-950/60' : 'divide-slate-200 border-slate-200 bg-slate-50'
              }`}>
                {auditList.map((a) => (
                  <div key={a.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
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
          <div className={`max-w-md w-full rounded-3xl p-6 sm:p-8 border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-bold mb-1">Register New User (Admin Only)</h3>
            <p className="text-xs text-slate-400 mb-4">Create account and assign role with custom scopes</p>

            {createMsg && (
              <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs">
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
                  placeholder="e.g. Rahim Cutting In-charge"
                  required
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                  placeholder="rahim@factory.com"
                  required
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Assign Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md cursor-pointer"
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
          <div className={`max-w-md w-full rounded-3xl p-6 sm:p-8 border shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg font-bold mb-1">Register Floor Tablet</h3>
            <p className="text-xs text-slate-400 mb-4">Lock device to a production line with 6-digit PIN</p>

            {createMsg && (
              <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs">
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
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
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
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono tracking-widest ${
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
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewDeviceModal(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${
                    isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-md cursor-pointer"
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
