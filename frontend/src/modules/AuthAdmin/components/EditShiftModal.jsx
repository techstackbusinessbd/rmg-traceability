import React, { useState, useEffect } from 'react';
import { X, Clock, Sun, Moon, Flame, Save } from 'lucide-react';

export default function EditShiftModal({
  show,
  onClose,
  onSubmit,
  shift,
  units = [],
  floors = [],
  isDark = true,
  errors = {}
}) {
  const [shiftName, setShiftName] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [shiftType, setShiftType] = useState('DAY');
  const [unitName, setUnitName] = useState('');
  const [floorName, setFloorName] = useState('All Floors (Entire Plant)');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [gracePeriod, setGracePeriod] = useState(10);
  const [breakStartTime, setBreakStartTime] = useState('13:00');
  const [breakEndTime, setBreakEndTime] = useState('14:00');
  const [netHours, setNetHours] = useState(8.00);

  // Overtime facilities
  const [allowsOvertime, setAllowsOvertime] = useState(false);
  const [maxOtHours, setMaxOtHours] = useState(2.00);
  const [tiffinBreakStart, setTiffinBreakStart] = useState('17:00');
  const [tiffinBreakEnd, setTiffinBreakEnd] = useState('17:30');
  const [overtimeStartTime, setOvertimeStartTime] = useState('17:30');

  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter floors belonging to selected unit
  const availableFloors = React.useMemo(() => {
    if (!unitName) return floors;
    const matchingUnit = units.find(u => u.name === unitName);
    if (!matchingUnit) return floors;
    return floors.filter(f => f.unit_id === matchingUnit.id);
  }, [units, floors, unitName]);

  useEffect(() => {
    if (shift) {
      setShiftName(shift.shift_name || '');
      setShiftCode(shift.shift_code || '');
      setShiftType(shift.shift_type || 'DAY');
      setUnitName(shift.unit_name || units[0]?.name || 'Default Factory Unit');
      setFloorName(shift.floor_name || 'All Floors (Entire Plant)');
      setStartTime(shift.start_time ? shift.start_time.slice(0, 5) : '08:00');
      setEndTime(shift.end_time ? shift.end_time.slice(0, 5) : '17:00');
      setGracePeriod(shift.grace_period_mins ?? 10);
      setBreakStartTime(shift.break_start_time ? shift.break_start_time.slice(0, 5) : '');
      setBreakEndTime(shift.break_end_time ? shift.break_end_time.slice(0, 5) : '');
      setNetHours(shift.net_work_hours || 8.00);
      setAllowsOvertime(Boolean(shift.allows_overtime));
      setMaxOtHours(shift.max_ot_hours || 2.00);
      setTiffinBreakStart(shift.tiffin_break_start ? shift.tiffin_break_start.slice(0, 5) : '17:00');
      setTiffinBreakEnd(shift.tiffin_break_end ? shift.tiffin_break_end.slice(0, 5) : '17:30');
      setOvertimeStartTime(shift.overtime_start_time ? shift.overtime_start_time.slice(0, 5) : '17:30');
      setIsActive(shift.is_active ?? true);
    }
  }, [shift, units]);

  if (!show || !shift) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: shift.id,
        shift_name: shiftName,
        shift_code: shiftCode ? shiftCode.toUpperCase().trim() : null,
        shift_type: shiftType,
        unit_name: unitName || 'Default Factory Unit',
        floor_name: floorName || 'All Floors (Entire Plant)',
        start_time: startTime ? `${startTime}:00` : '',
        end_time: endTime ? `${endTime}:00` : '',
        grace_period_mins: parseInt(gracePeriod, 10) || 0,
        break_start_time: breakStartTime ? `${breakStartTime}:00` : null,
        break_end_time: breakEndTime ? `${breakEndTime}:00` : null,
        net_work_hours: parseFloat(netHours) || 8.0,
        allows_overtime: allowsOvertime,
        max_ot_hours: allowsOvertime ? (parseFloat(maxOtHours) || 0) : 0,
        overtime_start_time: allowsOvertime && overtimeStartTime ? `${overtimeStartTime}:00` : null,
        tiffin_break_start: allowsOvertime && tiffinBreakStart ? `${tiffinBreakStart}:00` : null,
        tiffin_break_end: allowsOvertime && tiffinBreakEnd ? `${tiffinBreakEnd}:00` : null,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
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
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Edit Floor Shift Schedule
              </h3>
              <p className="text-xs text-slate-400">
                Update shift timings, break periods and overtime boundaries
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
                {units.length > 0 ? (
                  units.map(u => (
                    <option key={u.id} value={u.name}>{u.name} ({u.code})</option>
                  ))
                ) : (
                  <option value="Default Factory Unit">Default Factory Unit (All Units)</option>
                )}
              </select>
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
                <option value="All Floors (Entire Plant)">All Floors (Entire Plant)</option>
                {availableFloors.map(f => (
                  <option key={f.id} value={f.name}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Shift Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Shift Code <span className="text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <input
                type="text"
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400 placeholder-slate-500' : 'bg-white border-slate-300 text-blue-600 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          {/* Staggered Timings: In-Time & Out-Time */}
          <div className="p-3.5 rounded border border-blue-500/20 bg-blue-500/5">
            <h4 className="text-xs font-bold text-blue-400 mb-3 flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Floor In-Time, Out-Time & Meal Break</span>
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

            {/* Meal / Lunch Break */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-slate-700/20">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Meal / Lunch Break Start
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
                  Meal / Lunch Break End
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
            </div>
          </div>

          {/* Overtime (OT) Facilities Section */}
          <div className={`p-4 rounded border transition-colors ${
            allowsOvertime 
              ? (isDark ? 'bg-orange-950/20 border-orange-500/30' : 'bg-orange-50/50 border-orange-200')
              : (isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200')
          }`}>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowsOvertime}
                  onChange={(e) => setAllowsOvertime(e.target.checked)}
                  className="h-4 w-4 rounded text-orange-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
                />
                <span className="flex items-center space-x-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span>Enable Overtime (OT) Facility (Day Shift Floor)</span>
                </span>
              </label>

              {allowsOvertime && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  OT Active
                </span>
              )}
            </div>

            {allowsOvertime && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Max OT Allowed (Hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="8"
                      value={maxOtHours}
                      onChange={(e) => setMaxOtHours(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Evening Tiffin Start
                    </label>
                    <input
                      type="time"
                      value={tiffinBreakStart}
                      onChange={(e) => setTiffinBreakStart(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">
                      OT Production Start
                    </label>
                    <input
                      type="time"
                      value={overtimeStartTime}
                      onChange={(e) => setOvertimeStartTime(e.target.value)}
                      className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Net Work Hours & Active Status */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium">Regular Work Hours:</label>
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
              <span>Active Shift</span>
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
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Saving...' : 'Update Shift Schedule'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
