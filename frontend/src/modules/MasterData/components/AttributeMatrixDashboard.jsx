import React, { useState, useMemo } from 'react';
import { 
  Palette, 
  Ruler, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Search,
  CheckCircle
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

export default function AttributeMatrixDashboard({
  colors = [],
  sizes = [],
  defects = [],
  loading = false,
  onOpenCreateColor,
  onOpenCreateSize,
  onOpenCreateDefect,
  onDeleteColor,
  onDeleteSize,
  onDeleteDefect,
}) {
  const { isDark } = useThemeStore();
  const [activeTab, setActiveTab] = useState('COLORS'); // 'COLORS' | 'SIZES' | 'DEFECTS'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  // Filtered lists
  const filteredColors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return colors.filter(c => !q || c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.pantone_ref?.toLowerCase().includes(q));
  }, [colors, searchQuery]);

  const filteredSizes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return sizes.filter(s => !q || s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q));
  }, [sizes, searchQuery]);

  const filteredDefects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return defects.filter(d => {
      const matchStage = selectedStage === 'ALL' || d.process_stage === selectedStage;
      const matchSearch = !q || d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q) || d.severity?.toLowerCase().includes(q);
      return matchStage && matchSearch;
    });
  }, [defects, selectedStage, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Top Bar */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Production Attributes & Quality Codebook
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Standard Colorways (Pantone), Size scales, and 4-Point System Defect classification matrix
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('COLORS')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'COLORS'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Colorways ({colors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SIZES')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'SIZES'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Ruler className="h-3.5 w-3.5" />
              <span>Size Scales ({sizes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DEFECTS')}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                activeTab === 'DEFECTS'
                  ? 'bg-blue-600 text-white'
                  : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Defect Codebook ({defects.length})</span>
            </button>
          </div>
        </div>

        {/* Action & Filter Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {activeTab === 'DEFECTS' && (
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className={`px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Stages</option>
                <option value="CUTTING">Cutting</option>
                <option value="SEWING">Sewing</option>
                <option value="FINISHING">Finishing</option>
                <option value="PACKING">Packing</option>
                <option value="FABRIC">Fabric</option>
              </select>
            )}

            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.toLowerCase()}...`}
                className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div>
            {activeTab === 'COLORS' && (
              <button
                type="button"
                onClick={onOpenCreateColor}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Colorway</span>
              </button>
            )}

            {activeTab === 'SIZES' && (
              <button
                type="button"
                onClick={onOpenCreateSize}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Size Scale</span>
              </button>
            )}

            {activeTab === 'DEFECTS' && (
              <button
                type="button"
                onClick={onOpenCreateDefect}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Defect Code</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content: COLORS */}
      {activeTab === 'COLORS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredColors.map((color) => (
            <div key={color.id} className={`p-3.5 rounded border flex items-center justify-between ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="flex items-center space-x-3 min-w-0">
                <div 
                  className="h-8 w-8 rounded-full border border-slate-700/50 shadow-inner shrink-0" 
                  style={{ backgroundColor: color.hex_code || '#000' }}
                />
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">{color.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {color.code} {color.pantone_ref ? `• ${color.pantone_ref}` : ''}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteColor(color)}
                className="p-1 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                title="Delete Color"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: SIZES */}
      {activeTab === 'SIZES' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredSizes.map((size) => (
            <div key={size.id} className={`p-3 rounded border text-center relative ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div className="text-lg font-black font-mono text-blue-400">{size.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{size.code} • {size.category}</div>
              <button
                type="button"
                onClick={() => onDeleteSize(size)}
                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                title="Delete Size"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: DEFECTS */}
      {activeTab === 'DEFECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredDefects.map((defect) => (
            <div key={defect.id} className={`p-3.5 rounded border flex flex-col justify-between ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-bold text-xs text-red-400">{defect.code}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                    defect.severity === 'CRITICAL' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                      : defect.severity === 'MAJOR' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {defect.severity} ({defect.standard_penalty_points} pts)
                  </span>
                </div>

                <div className="font-bold text-xs">{defect.name}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Process Stage: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{defect.process_stage}</strong>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/20 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => onDeleteDefect(defect)}
                  className="p-1 rounded text-slate-400 hover:text-red-400 cursor-pointer"
                  title="Delete Defect Code"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
