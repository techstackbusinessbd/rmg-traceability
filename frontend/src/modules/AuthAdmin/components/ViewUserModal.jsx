import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, IdCard, Calendar, CheckCircle2, XCircle, KeyRound, Clock } from 'lucide-react';

export default function ViewUserModal({
  show,
  onClose,
  user,
  isDark,
  onEdit
}) {
  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg p-6 sm:p-7 border shadow-xl relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-700/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-md bg-blue-600/15 text-blue-500 flex items-center justify-center font-bold text-base">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">{user.name}</h3>
              <p className="text-xs text-slate-400 font-mono">{user.emp_id || 'NO EMP ID'}</p>
            </div>
          </div>
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-bold ${
            user.is_active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {user.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            <span>{user.is_active ? 'ACTIVE' : 'SUSPENDED'}</span>
          </span>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded bg-slate-500/5 border border-slate-700/15">
            <span className="text-slate-400 flex items-center space-x-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span>Email Address</span>
            </span>
            <span className="font-mono font-medium">{user.email || '—'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-500/5 border border-slate-700/15">
            <span className="text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <span>Assigned Role</span>
            </span>
            <span className="font-mono font-bold text-blue-500 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
              {user.roles?.[0]?.name || 'Standard User'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded bg-slate-500/5 border border-slate-700/15">
            <span className="text-slate-400 flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Registered On</span>
            </span>
            <span className="font-mono">{new Date(user.created_at).toLocaleString()}</span>
          </div>

          {user.roles?.[0]?.permissions && (
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Assigned Permissions ({user.roles[0].permissions.length})
              </label>
              <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-2 rounded bg-slate-950/20 border border-slate-700/15">
                {user.roles[0].permissions.map((p) => (
                  <span key={p.id} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-300 border border-slate-700/30">
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3 pt-5 mt-3 border-t border-slate-700/20">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-2.5 rounded-md text-sm font-semibold border transition-colors cursor-pointer ${
              isDark ? 'border-slate-800 hover:bg-slate-800 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(user);
              }}
              className="flex-1 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-bold shadow-xs cursor-pointer transition-colors"
            >
              Edit User
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
