import React, { useState } from 'react';
import { ShieldCheck, Plus, X } from 'lucide-react';

export default function CreateRoleModal({
  show,
  onClose,
  onSubmit,
  isDark,
  allPermissions = []
}) {
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }
    onSubmit({
      name: roleName.trim(),
      permissions: selectedPermissions
    });
    setRoleName('');
    setSelectedPermissions([]);
    setError('');
  };

  const togglePermission = (name) => {
    setSelectedPermissions(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-2xl w-full rounded-lg p-6 border shadow-xl flex flex-col max-h-[90vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-md bg-blue-600/15 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Create Custom Security Role</h3>
              <p className="text-xs text-slate-400">Define dynamic RMG role with tailored access scopes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-4 overflow-y-auto flex-1">
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Security Role Name <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Pattern Maker, Chemical Dispenser, Finishing Head"
              className={`w-full px-3.5 py-2.5 rounded-md text-xs border focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium ${
                error 
                  ? 'border-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
            {error && <span className="text-[11px] text-red-500 mt-1 block font-medium">{error}</span>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Initial Permission Scopes ({selectedPermissions.length} selected)
              </label>
              <button
                type="button"
                onClick={() => setSelectedPermissions(selectedPermissions.length === allPermissions.length ? [] : allPermissions.map(p => p.name))}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                {selectedPermissions.length === allPermissions.length ? 'Clear All' : 'Select All'}
              </button>
            </div>
            
            <div className={`p-3 rounded-md border max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {allPermissions.map((p) => {
                const isSelected = selectedPermissions.includes(p.name);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePermission(p.name)}
                    className={`p-2 rounded text-[11px] font-mono text-left transition-colors flex items-center justify-between cursor-pointer border ${
                      isSelected
                        ? isDark ? 'bg-blue-950/60 border-blue-600 text-blue-300' : 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                        : isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {isSelected && <span className="text-blue-500 font-bold ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-3 border-t border-slate-700/20">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Create Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
