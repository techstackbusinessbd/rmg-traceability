import React, { useState } from 'react';
import { X, SlidersHorizontal, Plus, Save } from 'lucide-react';

const SECTIONS = ['SEWING', 'CUTTING', 'FINISHING', 'PACKING'];

export default function CreateLineModal({
  show,
  onClose,
  onSubmit,
  units = [],
  floors = [],
  line = null,
  isDark = true,
  errors = {}
}) {
  const [unitId, setUnitId] = useState(line?.unit_id || units[0]?.id || '');
  const [floorId, setFloorId] = useState(line?.floor_id || floors[0]?.id || '');
  const [name, setName] = useState(line?.name || '');
  const [code, setCode] = useState(line?.code || '');
  const [section, setSection] = useState(line?.section || 'SEWING');
  const [totalMachines, setTotalMachines] = useState(line?.total_machines || 36);
  const [hourlyTarget, setHourlyTarget] = useState(line?.hourly_target || 120);
  const [supervisorName, setSupervisorName] = useState(line?.supervisor_name || '');
  const [isActive, setIsActive] = useState(line ? Boolean(line.is_active) : true);
  const [submitting, setSubmitting] = useState(false);

  // Filter floors belonging to selected unit
  const availableFloors = React.useMemo(() => {
    return floors.filter(f => f.unit_id === unitId);
  }, [floors, unitId]);

  React.useEffect(() => {
    if (line) {
      setUnitId(line.unit_id);
      setFloorId(line.floor_id);
      setName(line.name || '');
      setCode(line.code || '');
      setSection(line.section || 'SEWING');
      setTotalMachines(line.total_machines || 36);
      setHourlyTarget(line.hourly_target || 120);
      setSupervisorName(line.supervisor_name || '');
      setIsActive(Boolean(line.is_active));
    } else {
      const firstUnit = units[0]?.id || '';
      setUnitId(firstUnit);
      const firstFloor = floors.find(f => f.unit_id === firstUnit)?.id || floors[0]?.id || '';
      setFloorId(firstFloor);
      setName('');
      setCode('');
      setSection('SEWING');
      setTotalMachines(36);
      setHourlyTarget(120);
      setSupervisorName('');
      setIsActive(true);
    }
  }, [line, show, units, floors]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: line?.id,
        unit_id: unitId,
        floor_id: floorId,
        name,
        code: code ? code.toUpperCase().trim() : null,
        section,
        total_machines: parseInt(totalMachines, 10) || 30,
        hourly_target: parseInt(hourlyTarget, 10) || 100,
        supervisor_name: supervisorName,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {line ? 'Edit Production Line' : 'Register Production Line'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup work center capacity, machines, and target output
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
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Target Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={unitId}
                onChange={(e) => {
                  setUnitId(e.target.value);
                  const matchingFloor = floors.find(f => f.unit_id === e.target.value);
                  if (matchingFloor) setFloorId(matchingFloor.id);
                }}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Target Floor <span className="text-red-500">*</span>
              </label>
              <select
                value={floorId}
                onChange={(e) => setFloorId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {availableFloors.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
              {errors?.floor_id && <p className="text-[11px] text-red-500 mt-1">{errors.floor_id[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Line Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sewing Line 01 (Woven)"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Line Code <span className="text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Auto (e.g. L-01)"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400 placeholder-slate-500' : 'bg-white border-slate-300 text-blue-600 placeholder-slate-400'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Section / Process
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {SECTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Total Machines
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={totalMachines}
                onChange={(e) => setTotalMachines(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Hourly Target (Pcs)
              </label>
              <input
                type="number"
                min="1"
                max="2000"
                value={hourlyTarget}
                onChange={(e) => setHourlyTarget(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold text-emerald-500 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Assigned Line Supervisor
            </label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              placeholder="e.g. Md. Anwar Hossain"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
            />
            <span>Active Production Line</span>
          </label>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-700/30">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {line ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : line ? 'Update Line' : 'Save Line'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
