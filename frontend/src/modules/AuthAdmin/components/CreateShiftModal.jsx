import React, { useState } from 'react';
import { X, Clock, Building2, Layers, AlertCircle, Plus, Sparkles } from 'lucide-react';

const COMMON_UNITS = ['Unit 01', 'Unit 02', 'Unit 03', 'Washing Plant', 'Cutting Facility'];
const COMMON_FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];

export default function CreateShiftModal({
  show,
  onClose,
  onSubmit,
  isDark = true,
  errors = {}
}) {
  const [shiftName, setShiftName] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [unitName, setUnitName] = useState('Unit 01');
  const [floorName, setFloorName] = useState('1st Floor');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [gracePeriod, setGracePeriod] = useState(10);
  const [breakStartTime, setBreakStartTime] = useState('13:00');
  const [breakEndTime, setBreakEndTime] = useState('14:00');
  const [netHours, setNetHours] = useState(8.00);
  const [overtimeStartTime, setOvertimeStartTime] = useState('17:30');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        shift_name: shiftName,
        shift_code: shiftCode,
        unit_name: unitName,
        floor_name: floorName,
        start_time: startTime ? `${startTime}:00` : '',
        end_time: endTime ? `${endTime}:00` : '',
        grace_period_mins: parseInt(gracePeriod, 10) || 0,
        break_start_time: breakStartTime ? `${breakStartTime}:00` : null,
        break_end_time: breakEndTime ? `${breakEndTime}:00` : null,
        net_work_hours: parseFloat(netHours) || 8.0,
        overtime_start_time: overtimeStartTime ? `${overtimeStartTime}:00` : null,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
  };

  const autoGenerateCode = () => {
    const uCode = unitName.replace(/\s+/g, '').slice(0, 3).toUpperCase();
    const fCode = floorName.replace(/\s+/g, '').slice(0, 2).toUpperCase();
    const sCode = shiftName.slice(0, 3).toUpperCase() || 'SH';
    setShiftCode(`SH-${uCode}-${fCode}-${sCode}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-600/10 text-blue-500 border border-blue-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Configure Floor Shift Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Define unit and floor-specific in-times, staggered lunch breaks, and work hours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Unit & Floor Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Manufacturing Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {errors?.unit_name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.unit_name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Target Floor <span className="text-red-500">*</span>
              </label>
              <select
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {COMMON_FLOORS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              {errors?.floor_name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.floor_name[0]}</p>
              )}
            </div>
          </div>

          {/* Shift Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Shift Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="e.g. Day Shift - Sewing Floor 1"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.shift_name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.shift_name[0]}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold">
                  Shift Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={autoGenerateCode}
                  className="text-[10px] font-mono text-blue-500 hover:underline cursor-pointer"
                >
                  Auto-Gen Code
                </button>
              </div>
              <input
                type="text"
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value)}
                placeholder="e.g. SH-U1-F1-MORN"
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.shift_code && (
                <p className="text-[11px] text-red-500 mt-1">{errors.shift_code[0]}</p>
              )}
            </div>
          </div>

          {/* Staggered Timings: In-Time & Out-Time */}
          <div className="p-3.5 rounded border border-blue-500/20 bg-blue-500/5">
            <h4 className="text-xs font-bold text-blue-400 mb-3 flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Floor In-Time & Out-Time (Stagger Schedule)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  In-Time (Start) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {errors?.start_time && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.start_time[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Out-Time (End) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                {errors?.end_time && (
                  <p className="text-[11px] text-red-500 mt-1">{errors.end_time[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Late Grace Window (Mins)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Break & Overtime Timings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">
                Lunch/Tiffin Start
              </label>
              <input
                type="time"
                value={breakStartTime}
                onChange={(e) => setBreakStartTime(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Lunch/Tiffin End
              </label>
              <input
                type="time"
                value={breakEndTime}
                onChange={(e) => setBreakEndTime(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">
                Overtime (OT) Start
              </label>
              <input
                type="time"
                value={overtimeStartTime}
                onChange={(e) => setOvertimeStartTime(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Net Work Hours & Active Status */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium">Effective Work Hours:</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="24"
                value={netHours}
                onChange={(e) => setNetHours(e.target.value)}
                className={`w-20 px-2 py-1 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <span className="text-xs text-slate-400">Hours/Day</span>
            </div>

            <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
              />
              <span>Active Schedule</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-700/30">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{submitting ? 'Creating...' : 'Save Shift Schedule'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
