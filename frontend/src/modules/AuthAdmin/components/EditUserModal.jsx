import React, { useState, useEffect } from 'react';

export default function EditUserModal({
  show,
  onClose,
  onSubmit,
  user,
  isDark,
  rolesList = [],
  companiesList = [],
  unitsList = [],
  errors = {}
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setDesignation(user.designation || '');
      setCompanyId(user.company_id || '');
      setUnitId(user.unit_id || '');
      setRole(user.roles?.[0]?.name || (rolesList[0]?.name || 'Line Supervisor'));
      setIsActive(user.is_active !== undefined ? user.is_active : true);
      setFormErrors({});
    }
  }, [user, rolesList]);

  useEffect(() => {
    setFormErrors(errors);
  }, [errors]);

  if (!show || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: user.id,
      name,
      username: username ? username.toLowerCase().trim() : null,
      designation,
      company_id: companyId || null,
      unit_id: unitId || null,
      role,
      is_active: isActive
    });
  };

  const isSuperAdmin = user.roles?.[0]?.name === 'Super Admin' || user.emp_id === 'EMP-SUPERADMIN';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-xl w-full rounded-lg p-6 sm:p-7 border shadow-xl relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-base font-bold tracking-tight mb-1">Edit User Profile & Scoped Access</h3>
        <p className="text-xs text-slate-400 mb-5">Update account name, username, designation, group/factory unit access, and role privileges</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="p-3 rounded bg-slate-500/5 border border-slate-700/15 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-mono font-bold text-blue-500">{user.emp_id || 'N/A'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="font-mono">{user.email || 'N/A (Emp ID)'}</span>
            </div>
          </div>

          {/* Group and Unit Access Scoping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 rounded border border-blue-500/20 bg-blue-500/5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Group of Company
              </label>
              <select
                value={companyId || ''}
                onChange={(e) => setCompanyId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">Global Enterprise HQ</option>
                {companiesList.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Assigned Factory / Unit Access
              </label>
              <select
                value={unitId || ''}
                onChange={(e) => setUnitId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-medium border focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">All Units (Super Admin / Global)</option>
                {unitsList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                }}
                placeholder="e.g. John Doe"
                className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-1 font-medium transition-colors ${
                  formErrors.name 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
              {formErrors.name && (
                <span className="text-[11px] text-red-500 mt-1 block font-medium">
                  {formErrors.name[0]}
                </span>
              )}
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Username <span className="text-slate-400 font-normal">(Login Handle)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                placeholder="e.g. khaled.admin"
                className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-1 font-mono font-medium transition-colors ${
                  formErrors.username 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Designation / Job Title
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Plant GM, Cutting Master, QC Incharge"
                className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-1 font-medium transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Designated Role
              </label>
              <select
                value={role}
                disabled={isSuperAdmin}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {rolesList.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} {r.name === 'Super Admin' ? '(Platform Owner)' : r.name === 'Admin' ? '(Factory Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Account Status
            </label>
            <select
              value={isActive ? 'active' : 'suspended'}
              disabled={isSuperAdmin}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="active">ACTIVE (Operational)</option>
              <option value="suspended">SUSPENDED (Locked)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Save Scoped Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
