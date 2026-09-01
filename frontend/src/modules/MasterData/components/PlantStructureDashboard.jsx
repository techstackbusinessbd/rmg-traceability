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
  Shirt, 
  Droplet, 
  Printer, 
  Scissors, 
  Warehouse,
  CheckCircle2,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const FACTORY_TYPE_META = {
  SEWING_FACTORY: { label: 'Sewing & Apparel Factory', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Shirt },
  WASHING_FACTORY: { label: 'Washing & Laundry Plant', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: Droplet },
  PRINTING_FACTORY: { label: 'Screen & Rotary Printing', badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Printer },
  EMBROIDERY_FACTORY: { label: 'Computerized Embroidery', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Scissors },
  CENTRAL_WAREHOUSE: { label: 'Central Finishing & WH', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Warehouse },
  KNITTING_WEAVING: { label: 'Textile Fabric Mill', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Building2 },
};

export default function PlantStructureDashboard({
  companies = [],
  units = [],
  floors = [],
  lines = [],
  loading = false,
  onOpenCreateCompany,
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
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCompanyId, setSelectedCompanyId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Total metrics
  const totalMachines = useMemo(() => lines.reduce((acc, l) => acc + (l.total_machines || 0), 0), [lines]);
  const totalManpower = useMemo(() => lines.reduce((acc, l) => acc + (l.estimated_manpower || 0), 0), [lines]);

  // Filtered Units
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchCompany = selectedCompanyId === 'ALL' || u.company_id === selectedCompanyId;
      const matchType = selectedType === 'ALL' || u.factory_type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        u.name?.toLowerCase().includes(q) || 
        u.code?.toLowerCase().includes(q) || 
        u.address?.toLowerCase().includes(q) ||
        u.contact_person?.toLowerCase().includes(q);
      return matchCompany && matchType && matchSearch;
    });
  }, [units, selectedCompanyId, selectedType, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Enterprise Business Flow Banner */}
      <div className={`p-4 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-700/20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Enterprise Architecture</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Group & Multi-Factory Hierarchy
                </span>
              </div>
              <h3 className={`text-base font-bold tracking-tight mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {companies[0]?.name || 'No Corporate Group Registered Yet'}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenCreateCompany}
              className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Plus className="h-3.5 w-3.5 inline mr-1" />
              <span>Add Group / Company</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateUnit}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Factory Plant</span>
            </button>
          </div>
        </div>

        {/* Inter-Factory Process Flow Pipeline */}
        <div className="mt-3 pt-1 flex items-center overflow-x-auto no-scrollbar pb-1 text-[11px] font-medium text-slate-400 gap-2">
          <span className="shrink-0 font-bold text-slate-300 uppercase text-[10px] font-mono">Traceability Flow:</span>
          
          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-blue-500/5 border border-blue-500/15 text-blue-400">
            <Shirt className="h-3.5 w-3.5" />
            <span>1. Cutting (Sewing Factory)</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-amber-500/5 border border-amber-500/15 text-amber-400">
            <Printer className="h-3.5 w-3.5" />
            <span>2. Screen / Rotary Printing</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-purple-500/5 border border-purple-500/15 text-purple-400">
            <Scissors className="h-3.5 w-3.5" />
            <span>3. Multi-Head Embroidery</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-blue-500/5 border border-blue-500/15 text-blue-400">
            <Shirt className="h-3.5 w-3.5" />
            <span>4. Line Sewing Assembly</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-cyan-500/5 border border-cyan-500/15 text-cyan-400">
            <Droplet className="h-3.5 w-3.5" />
            <span>5. Denim Laundry / Wash</span>
          </div>

          <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />

          <div className="flex items-center space-x-1.5 shrink-0 px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/15 text-emerald-400">
            <Warehouse className="h-3.5 w-3.5" />
            <span>6. Central Finishing & Packing</span>
          </div>
        </div>
      </div>

      {/* Top Plant KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Specialized Factories</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1">{units.length}</div>
          <div className="text-xs text-emerald-500 font-semibold flex items-center space-x-1 mt-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Sewing, Wash, Print & Emb</span>
          </div>
        </div>

        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Plant Floors / Sections</span>
            <Layers className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-1">{floors.length}</div>
          <div className="text-xs text-slate-400 mt-1">
            Process Work Centers
          </div>
        </div>

        <div className={`p-4 rounded border transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase font-mono">
            <span>Production Lines / Workstations</span>
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
            <span>Total Allocated Manpower</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black mt-1 font-mono text-emerald-500">
            {totalManpower} <span className="text-xs font-normal text-slate-400 font-sans">Persons</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Planned Operators & Helpers
          </div>
        </div>

      </div>

      {/* Main Container */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/20">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Factory Work Centers & Processing Units
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage multi-plant factory nodes, process floors, and production lines under Group of Companies
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenCreateFloor}
              className="px-3 py-1.5 rounded bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Floor / Section</span>
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

        {/* Filter Bar: Factory Types & Search */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 pb-3">
          
          {/* Factory Type Filter Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 w-full md:w-auto">
            {[
              { id: 'ALL', label: 'All Factories', icon: Building2 },
              { id: 'SEWING_FACTORY', label: 'Sewing Factories', icon: Shirt },
              { id: 'WASHING_FACTORY', label: 'Washing Plants', icon: Droplet },
              { id: 'PRINTING_FACTORY', label: 'Printing Units', icon: Printer },
              { id: 'EMBROIDERY_FACTORY', label: 'Embroidery Units', icon: Scissors },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    selectedType === tab.id
                      ? 'bg-blue-600 text-white'
                      : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search factory, floors, lines..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Tree View Display */}
        <div className="space-y-4 mt-2">
          {filteredUnits.map(unit => {
            const unitFloors = floors.filter(f => f.unit_id === unit.id);
            const typeMeta = FACTORY_TYPE_META[unit.factory_type] || FACTORY_TYPE_META.SEWING_FACTORY;
            const TypeIcon = typeMeta.icon;

            return (
              <div key={unit.id} className={`rounded-md border p-4 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {/* Unit / Factory Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/20">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-blue-400 shrink-0">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{unit.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {unit.code}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded border ${typeMeta.badgeColor}`}>
                          {typeMeta.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {unit.address || 'CEPZ Industrial Complex'} • Plant Head: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{unit.contact_person || 'Plant GM'}</strong> ({unit.contact_phone || 'N/A'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onEditUnit(unit)}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                      title="Edit Factory"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteUnit(unit)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Factory"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Floors under Unit */}
                <div className="mt-3 pl-3 space-y-3">
                  {unitFloors.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No floors or work sections configured for this factory yet.</p>
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
                                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                      {line.estimated_manpower || 40} Manpower
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

      </div>
    </div>
  );
}
