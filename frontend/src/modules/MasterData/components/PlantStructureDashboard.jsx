import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  Activity, 
  Cpu, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

export default function PlantStructureDashboard({
  units = [],
  floors = [],
  lines = [],
  loading = false,
  onOpenCreateUnit,
  onOpenCreateFloor,
  onOpenCreateLine,
  onEditUnit,
  onEditFloor,
  onEditLine,
  onDeleteUnit,
  onDeleteFloor,
  onDeleteLine,
}) {
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNITS' | 'FLOORS' | 'LINES'
  const [selectedUnitId, setSelectedUnitId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Total metrics
  const totalMachines = useMemo(() => lines.reduce((acc, l) => acc + (l.total_machines || 0), 0), [lines]);
  const totalHourlyCapacity = useMemo(() => lines.reduce((acc, l) => acc + (l.hourly_target || 0), 0), [lines]);

  // Filtered Lines
  const filteredLines = useMemo(() => {
    return lines.filter(l => {
      const matchUnit = selectedUnitId === 'ALL' || l.unit_id === selectedUnitId;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        l.name?.toLowerCase().includes(q) || 
        l.code?.toLowerCase().includes(q) || 
        l.section?.toLowerCase().includes(q) ||
        l.supervisor_name?.toLowerCase().includes(q);
      return matchUnit && matchSearch;
    });
  }, [lines, selectedUnitId, searchQuery]);

  // Filtered Floors
  const filteredFloors = useMemo(() => {
    return floors.filter(f => {
      const matchUnit = selectedUnitId === 'ALL' || f.unit_id === selectedUnitId;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        f.name?.toLowerCase().includes(q) || 
        f.code?.toLowerCase().includes(q) || 
        f.process_type?.toLowerCase().includes(q);
      return matchUnit && matchSearch;
    });
  }, [floors, selectedUnitId, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Top Plant KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Manufacturing Units</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1">{units.length}</div>
          <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Active Plant Locations</span>
          </div>
        </div>

        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Factory Floors</span>
            <Layers className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-1">{floors.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            Cutting, Sewing & Finishing
          </div>
        </div>

        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Production Lines</span>
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1">{lines.length}</div>
          <div className="text-xs text-blue-400 font-mono mt-1">
            {totalMachines} Machines Total
          </div>
        </div>

        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Total Plant Capacity</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-emerald-500">
            {totalHourlyCapacity} <span className="text-xs font-normal text-slate-400 font-sans">Pcs/Hr</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Standard Line Hourly Targets
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* Header & Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/20">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Factory Plant Structure & Work Centers
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage hierarchical Manufacturing Units, Process Floors, and Sewing/Finishing Production Lines
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenCreateUnit}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Unit</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateFloor}
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Floor</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateLine}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Production Line</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 pb-3">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            {/* View Tabs */}
            <div className="flex items-center space-x-1">
              {['ALL', 'UNITS', 'FLOORS', 'LINES'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'ALL' ? 'Plant Hierarchy Tree' : tab}
                </button>
              ))}
            </div>

            {/* Filter by Unit */}
            <div className="flex items-center space-x-1.5 pl-2 border-l border-slate-700/30">
              <span className="text-xs text-slate-400">Unit:</span>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className={`px-2 py-1 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Units</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search units, floors, lines..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Tree View Display (ALL) */}
        {activeTab === 'ALL' && (
          <div className="space-y-4 mt-2">
            {units.filter(u => selectedUnitId === 'ALL' || u.id === selectedUnitId).map(unit => {
              const unitFloors = floors.filter(f => f.unit_id === unit.id);

              return (
                <div key={unit.id} className={`rounded-md border p-4 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  {/* Unit Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="h-5 w-5 text-blue-500 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm">{unit.name}</span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {unit.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {unit.address || 'CEPZ Industrial Complex'} • Contact: {unit.contact_person || 'Plant GM'} ({unit.contact_phone || 'N/A'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onEditUnit(unit)}
                        className="p-1 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                        title="Edit Unit"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteUnit(unit)}
                        className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete Unit"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Floors under Unit */}
                  <div className="mt-3 pl-3 space-y-3">
                    {unitFloors.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No floors configured for this unit yet.</p>
                    ) : (
                      unitFloors.map(floor => {
                        const floorLines = lines.filter(l => l.floor_id === floor.id);

                        return (
                          <div key={floor.id} className={`p-3 rounded border ${
                            isDark ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700/15">
                              <div className="flex items-center space-x-2">
                                <Layers className="h-4 w-4 text-purple-400" />
                                <span className="font-semibold text-xs">{floor.name}</span>
                                <span className="text-[10px] font-mono text-slate-400">({floor.code})</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  {floor.process_type}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => onEditFloor(floor)}
                                  className="p-1 rounded text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
                                  title="Edit Floor"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteFloor(floor)}
                                  className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Delete Floor"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Production Lines Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                              {floorLines.map(line => (
                                <div key={line.id} className={`p-2.5 rounded border text-xs flex flex-col justify-between ${
                                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                                }`}>
                                  <div>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono font-bold text-blue-500">{line.code}</span>
                                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        {line.hourly_target} pcs/hr
                                      </span>
                                    </div>
                                    <div className="font-bold text-xs">{line.name}</div>
                                    <div className="text-[11px] text-slate-400 mt-1">
                                      Machines: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{line.total_machines}</strong> • Sup: {line.supervisor_name || 'N/A'}
                                    </div>
                                  </div>

                                  <div className="mt-2 pt-1.5 border-t border-slate-700/20 flex items-center justify-end space-x-1">
                                    <button
                                      type="button"
                                      onClick={() => onEditLine(line)}
                                      className="p-1 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                                      title="Edit Line"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteLine(line)}
                                      className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete Line"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lines Tab */}
        {activeTab === 'LINES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {filteredLines.map(line => (
              <div key={line.id} className={`p-4 rounded border ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-blue-500 text-xs">{line.code}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {line.section}
                  </span>
                </div>
                <div className="font-bold text-sm">{line.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  Target: <strong className="text-emerald-500">{line.hourly_target} pcs/hr</strong> • Machines: {line.total_machines}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Supervisor: {line.supervisor_name || 'N/A'}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/20 flex items-center justify-end space-x-1">
                  <button
                    type="button"
                    onClick={() => onEditLine(line)}
                    className="p-1 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLine(line)}
                    className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
