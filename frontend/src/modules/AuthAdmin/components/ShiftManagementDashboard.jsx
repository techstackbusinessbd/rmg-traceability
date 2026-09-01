import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Building2, 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Power, 
  CheckCircle2, 
  XCircle, 
  Coffee, 
  Sun, 
  Moon, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const UNITS = ['ALL', 'Unit 01', 'Unit 02', 'Unit 03', 'Washing Plant', 'Cutting Facility'];
const FLOORS = ['ALL', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor'];

export default function ShiftManagementDashboard({
  shifts = [],
  loading = false,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleStatus,
  onDeleteShift
}) {
  const { isDark } = useThemeStore();
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchUnit = selectedUnit === 'ALL' || s.unit_name === selectedUnit;
      const matchFloor = selectedFloor === 'ALL' || s.floor_name === selectedFloor;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        s.shift_name?.toLowerCase().includes(q) || 
        s.shift_code?.toLowerCase().includes(q) || 
        s.unit_name?.toLowerCase().includes(q) || 
        s.floor_name?.toLowerCase().includes(q);
      return matchUnit && matchFloor && matchSearch;
    });
  }, [shifts, selectedUnit, selectedFloor, searchQuery]);

  const activeCount = shifts.filter(s => s.is_active).length;

  const formatTime = (timeStr) => {
    if (!timeStr) return '—';
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const mins = parts[1] || '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${mins} ${ampm}`;
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Action Bar */}
      <div className={`p-4 sm:p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className={`p-2 rounded border ${
                isDark 
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                  : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Unit & Floor Shift Schedules
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Staggered in-times, lunch break windows, and floor operating rosters
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Configure New Shift</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className={`mt-4 pt-3.5 border-t flex flex-col md:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Unit Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Unit:
              </span>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className={`px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u === 'ALL' ? 'All Units' : u}</option>
                ))}
              </select>
            </div>

            {/* Floor Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Floor:
              </span>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className={`px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {FLOORS.map(f => (
                  <option key={f} value={f}>{f === 'ALL' ? 'All Floors' : f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-60">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shift name or code..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Shifts Grid */}
      {filteredShifts.length === 0 ? (
        <div className={`p-12 text-center rounded border ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            No shifts found for selected unit or floor.
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Click "Configure New Shift" above to add a floor shift schedule.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShifts.map((shift) => (
            <div
              key={shift.id}
              className={`p-4 rounded-md border transition-all flex flex-col justify-between ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-blue-500 px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20">
                      {shift.shift_code}
                    </span>
                    <h4 className={`text-sm font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {shift.shift_name}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    shift.is_active 
                      ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                      : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200')
                  }`}>
                    {shift.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Location Badges */}
                <div className="flex items-center space-x-2 text-xs mb-3 text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{shift.unit_name}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{shift.floor_name}</span>
                  </div>
                </div>

                {/* In-Time & Out-Time Big Display */}
                <div className={`p-3 rounded border mb-3 ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">IN-TIME (START)</span>
                      <span className="text-base font-black font-mono text-emerald-500">
                        {formatTime(shift.start_time)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-medium">OUT-TIME (END)</span>
                      <span className="text-base font-black font-mono text-blue-500">
                        {formatTime(shift.end_time)}
                      </span>
                    </div>
                  </div>

                  {shift.grace_period_mins > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/20 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Grace Window:</span>
                      <span className="font-mono font-semibold text-amber-400">
                        +{shift.grace_period_mins} mins
                      </span>
                    </div>
                  )}
                </div>

                {/* Break & OT Details */}
                <div className="space-y-1.5 text-xs text-slate-400 mb-2">
                  {shift.break_start_time && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Coffee className="h-3 w-3 text-amber-500" />
                        <span>Lunch Break:</span>
                      </span>
                      <span className={`font-mono ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {formatTime(shift.break_start_time)} - {formatTime(shift.break_end_time)}
                      </span>
                    </div>
                  )}

                  {shift.overtime_start_time && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Flame className="h-3 w-3 text-orange-400" />
                        <span>Overtime (OT) Starts:</span>
                      </span>
                      <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {formatTime(shift.overtime_start_time)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span>Effective Working Hours:</span>
                    <span className="font-mono font-bold text-blue-400">
                      {shift.net_work_hours || '8.00'} Hrs/Day
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className={`mt-3 pt-2.5 border-t flex items-center justify-end space-x-1.5 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => onToggleStatus(shift)}
                  title={shift.is_active ? 'Deactivate Shift' : 'Activate Shift'}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${
                    shift.is_active 
                      ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-500' 
                      : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  <Power className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEditModal(shift)}
                  title="Edit Shift Timings"
                  className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteShift(shift)}
                  title="Delete Shift Schedule"
                  className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
