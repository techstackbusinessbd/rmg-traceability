import React, { useState, useEffect } from 'react';

export default function EditUserModal({
  show,
  onClose,
  onSubmit,
  user,
  isDark,
  rolesList = [],
  errors = {}
}) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
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
      role,
      is_active: isActive
    });
  };

  const isSuperAdmin = user.roles?.[0]?.name === 'Super Admin' || user.emp_id === 'EMP-SUPERADMIN';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg p-6 sm:p-7 border shadow-xl relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-base font-bold tracking-tight mb-1">Edit User Profile</h3>
        <p className="text-xs text-slate-400 mb-5">Update account name, role privileges, and account status</p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="p-3 rounded bg-slate-500/5 border border-slate-700/15 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-mono font-bold text-blue-500">{user.emp_id || 'N/A'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Email Address</span>
              <span className="font-mono">{user.email || 'N/A'}</span>
            </div>
          </div>

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
              className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 font-medium transition-colors ${
                formErrors.name 
                  ? 'border-red-500 focus:ring-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
              }`}
            />
            {formErrors.name && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {formErrors.name[0]}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Assign Role
              </label>
              <select
                value={role}
                disabled={isSuperAdmin}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
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

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Account Status
              </label>
              <select
                value={isActive ? 'active' : 'suspended'}
                disabled={isSuperAdmin}
                onChange={(e) => setIsActive(e.target.value === 'active')}
                className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="active">ACTIVE (Operational)</option>
                <option value="suspended">SUSPENDED (Locked)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs cursor-pointer transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
