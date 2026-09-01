import React from 'react';

export default function RegisterUserModal({
  show,
  onClose,
  onSubmit,
  isDark,
  rolesList = [],
  companiesList = [],
  unitsList = [],
  companyId,
  setCompanyId,
  unitId,
  setUnitId,
  empId,
  setEmpId,
  userName,
  setUserName,
  designation,
  setDesignation,
  userEmail,
  setUserEmail,
  userPassword,
  setUserPassword,
  userConfirmPassword,
  setUserConfirmPassword,
  userRole,
  setUserRole,
  userStatus,
  setUserStatus,
  errors = {}
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-xl w-full rounded-lg p-6 sm:p-7 border shadow-xl relative max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-base font-bold tracking-tight mb-1">Register User & Scoped Access (Admin Only)</h3>
        <p className="text-xs text-slate-400 mb-5">Assign Group of Companies, Target Factory Plant, Role, and Security Credentials</p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          
          {/* Step 3 Scope: Group of Company & Assigned Factory Unit */}
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
                <option value="">All Units (Super Admin / Global Access)</option>
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
                Employee ID <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. EMP-10492"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-mono font-medium transition-colors ${
                  errors.emp_id 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
              {errors.emp_id && (
                <span className="text-[11px] text-red-500 mt-1 block font-medium">
                  {errors.emp_id[0]}
                </span>
              )}
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Full Name <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. John Doe"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-medium transition-colors ${
                  errors.name 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
              {errors.name && (
                <span className="text-[11px] text-red-500 mt-1 block font-medium">
                  {errors.name[0]}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Designation / Job Title
              </label>
              <input
                type="text"
                value={designation || ''}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Plant GM, Cutting Master, QC Incharge"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-medium transition-colors ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Email Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="john@factory.com (optional)"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-medium transition-colors ${
                  errors.email 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Password <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                placeholder="Min 8 characters"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-mono font-medium transition-colors ${
                  errors.password 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
              {errors.password && (
                <span className="text-[11px] text-red-500 mt-1 block font-medium">
                  {errors.password[0]}
                </span>
              )}
            </div>

            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Confirm Password <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="password"
                value={userConfirmPassword}
                onChange={(e) => setUserConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 font-mono font-medium transition-colors ${
                  errors.password_confirmation 
                    ? 'border-red-500 bg-red-500/5 text-red-400' 
                    : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-600'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Designated Security Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium ${
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
                value={userStatus ? 'active' : 'suspended'}
                onChange={(e) => setUserStatus(e.target.value === 'active')}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium ${
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
              Register & Assign Scope
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
