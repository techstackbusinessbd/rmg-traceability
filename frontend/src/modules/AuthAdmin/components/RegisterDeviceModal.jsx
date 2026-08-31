import React from 'react';

export default function RegisterDeviceModal({
  show,
  onClose,
  onSubmit,
  isDark,
  devName,
  setDevName,
  devCode,
  setDevCode,
  devPin,
  setDevPin,
  devLine,
  setDevLine,
  errors = {}
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg p-6 sm:p-7 border shadow-xl relative ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <h3 className="text-base font-bold tracking-tight mb-1">Register Floor Tablet</h3>
        <p className="text-xs text-slate-400 mb-5">Lock device to a production line with 6-digit PIN</p>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Device Name <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={devName}
              onChange={(e) => setDevName(e.target.value)}
              placeholder="e.g. Sewing Line 02 Tablet"
              className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 font-medium ${
                errors.device_name 
                  ? 'border-red-500 focus:ring-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-600'
              }`}
            />
            {errors.device_name && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {errors.device_name[0]}
              </span>
            )}
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Device Code (Unique) <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={devCode}
              onChange={(e) => setDevCode(e.target.value)}
              placeholder="TAB-SEW-L02"
              className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 font-medium font-mono ${
                errors.device_code 
                  ? 'border-red-500 focus:ring-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-600'
              }`}
            />
            {errors.device_code && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {errors.device_code[0]}
              </span>
            )}
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              6-Digit Security PIN <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={devPin}
              onChange={(e) => setDevPin(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 font-mono tracking-widest ${
                errors.pin_code 
                  ? 'border-red-500 focus:ring-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-600'
              }`}
            />
            {errors.pin_code && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {errors.pin_code[0]}
              </span>
            )}
          </div>

          <div>
            <label className={`text-xs font-bold block mb-1.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              Lock to Production Line <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={devLine}
              onChange={(e) => setDevLine(e.target.value)}
              placeholder="Sewing Line 02"
              className={`w-full px-3.5 py-2.5 rounded-md text-sm border focus:outline-none focus:ring-2 font-medium ${
                errors.line_name 
                  ? 'border-red-500 focus:ring-red-500 bg-red-500/5 text-red-400' 
                  : isDark ? 'bg-slate-950 border-slate-800 text-white focus:ring-blue-600' : 'bg-white border-slate-300 text-slate-900 focus:ring-blue-600'
              }`}
            />
            {errors.line_name && (
              <span className="text-[11px] text-red-500 mt-1 block font-medium">
                {errors.line_name[0]}
              </span>
            )}
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
              Register Tablet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
