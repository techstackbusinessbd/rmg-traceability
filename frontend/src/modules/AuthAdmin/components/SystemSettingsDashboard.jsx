import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  PackageCheck, 
  ShieldCheck, 
  SlidersHorizontal, 
  Search, 
  Save, 
  RotateCcw, 
  Clock, 
  Globe, 
  Scissors, 
  Server, 
  Check, 
  Info,
  Layers,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const CATEGORIES = [
  { 
    id: 'ALL', 
    label: 'All Global Settings', 
    desc: 'Complete overview of system configuration', 
    icon: SlidersHorizontal 
  },
  { 
    id: 'enterprise', 
    label: 'Enterprise & Localization', 
    desc: 'Branding, timezone, currency & UoM standards', 
    icon: Globe 
  },
  { 
    id: 'production', 
    label: 'Production & Shopfloor (IE)', 
    desc: 'IE workflow mode, line shift hours & sequence rules', 
    icon: Scissors 
  },
  { 
    id: 'qc', 
    label: 'Quality Assurance (QC)', 
    desc: 'DHU alert thresholds, rework signoff & limits', 
    icon: CheckCircle2 
  },
  { 
    id: 'shipment', 
    label: 'Packing & Compliance', 
    desc: 'Carton tare tolerances & shipment thresholds', 
    icon: PackageCheck 
  },
  { 
    id: 'security', 
    label: 'Security & Access Control', 
    desc: 'Shopfloor tablet PIN lock & session timeouts', 
    icon: ShieldCheck 
  },
  { 
    id: 'system', 
    label: 'System & Engine Cache', 
    desc: 'Redis TTL, audit retention & worker sync', 
    icon: Server 
  },
];

export default function SystemSettingsDashboard({
  settings = [],
  settingsForm = {},
  setSettingsForm,
  onSave,
  saving = false
}) {
  const { isDark } = useThemeStore();
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dirtyKeys, setDirtyKeys] = useState(new Set());

  // Original settings map to track dirty states
  const originalMap = useMemo(() => {
    const map = {};
    settings.forEach(s => {
      map[s.key] = s.value;
    });
    return map;
  }, [settings]);

  const handleChange = (key, value) => {
    setSettingsForm(prev => ({ ...prev, [key]: value }));
    setDirtyKeys(prev => {
      const next = new Set(prev);
      if (String(originalMap[key]) !== String(value)) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const handleReset = () => {
    setSettingsForm({ ...originalMap });
    setDirtyKeys(new Set());
  };

  const filteredSettings = useMemo(() => {
    return settings.filter(s => {
      const matchesCategory = activeCategory === 'ALL' || s.group === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.label?.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q) ||
        s.key?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [settings, activeCategory, searchQuery]);

  // Group settings by category
  const groupedSettings = useMemo(() => {
    const groups = {};
    filteredSettings.forEach(s => {
      const groupKey = s.group || 'system';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(s);
    });
    return groups;
  }, [filteredSettings]);

  const getUnit = (key) => {
    if (key.includes('pct') || key.includes('threshold') || key.includes('variance')) return '%';
    if (key.includes('hours')) return 'Hours';
    if (key.includes('mins') || key.includes('min') || key.includes('timeout')) return 'Mins';
    if (key.includes('kg') || key.includes('weight')) return 'KG';
    if (key.includes('days')) return 'Days';
    if (key.includes('seconds')) return 'Sec';
    return null;
  };

  const hasChanges = dirtyKeys.size > 0;

  return (
    <div className="space-y-4">
      
      {/* Top Header & Search */}
      <div className={`p-4 sm:p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded bg-blue-600 text-white shadow-2xs">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Global System Configuration
              </h3>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                isDark ? 'bg-blue-950/80 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {settings.length} Parameters
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage Industrial Engineering (IE) operational mode, shift durations, QC DHU tolerances, and tablet security parameters.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Field */}
            <div className="relative w-full md:w-80">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parameter, key or description..."
                className={`w-full pl-9 pr-3 py-2 rounded text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium ${
                  isDark 
                    ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save / Discard Sticky Bar */}
      {hasChanges && (
        <div className={`p-4 rounded border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg sticky top-3 z-30 animate-in fade-in slide-in-from-top-2 duration-150 ${
          isDark 
            ? 'bg-blue-950 border-blue-500/50 text-blue-100 shadow-blue-950/50' 
            : 'bg-blue-50 border-blue-300 text-blue-950 shadow-slate-300/50'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-bold">
                {dirtyKeys.size} Configuration Parameter{dirtyKeys.size > 1 ? 's' : ''} Modified
              </span>
              <span className={`text-xs block sm:inline sm:ml-2 font-medium ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                — Click save to apply changes and invalidate Redis cache.
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 border cursor-pointer transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Saving...' : 'Save & Sync Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Navigation: Categories */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          <div className={`p-2 rounded border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 font-mono ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Configuration Categories
            </div>

            <div className="space-y-1">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const count = cat.id === 'ALL' 
                  ? settings.length 
                  : settings.filter(s => s.group === cat.id).length;
                const dirtyInCat = cat.id === 'ALL'
                  ? dirtyKeys.size
                  : settings.filter(s => s.group === cat.id && dirtyKeys.has(s.key)).length;

                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full text-left p-2.5 rounded text-xs transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                      isActive
                        ? isDark
                          ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                          : 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : isDark
                          ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800'
                          : 'border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className="truncate">{cat.label}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {dirtyInCat > 0 && (
                        <span className="h-2 w-2 rounded-full bg-amber-400" title={`${dirtyInCat} modified`} />
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : isDark 
                            ? 'bg-slate-800 text-slate-400' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architecture Policy Notice */}
          <div className={`p-3.5 rounded border text-xs space-y-1.5 ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <div className="flex items-center space-x-1.5 font-bold text-blue-600 dark:text-blue-400">
              <Info className="h-4 w-4 shrink-0" />
              <span>Zero Hardcode Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Values updated here are dynamically propagated across Shopfloor Tablets, Line Scanners, and Backend Services.
            </p>
          </div>
        </div>

        {/* Right Settings Rows */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          
          {Object.keys(groupedSettings).length === 0 ? (
            <div className={`p-10 rounded border text-center ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-2xs'
            }`}>
              <Search className="h-8 w-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No parameters matched your search</p>
              <p className="text-xs mt-1">Try clearing the search query or selecting another category.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
                className="mt-3.5 px-3.5 py-1.5 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-xs transition-colors"
              >
                Clear Search Filter
              </button>
            </div>
          ) : (
            Object.entries(groupedSettings).map(([groupKey, groupItems]) => {
              const catMeta = CATEGORIES.find(c => c.id === groupKey) || {
                label: groupKey.toUpperCase(),
                desc: 'System group parameters',
                icon: Layers
              };
              const CatIcon = catMeta.icon;

              return (
                <div 
                  key={groupKey}
                  className={`rounded border transition-colors overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  {/* Category Title Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1 rounded ${isDark ? 'bg-slate-800 text-blue-400' : 'bg-white text-blue-600 border border-slate-200'}`}>
                        <CatIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold uppercase tracking-wider font-mono ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}>
                          {catMeta.label}
                        </h4>
                        <span className={`text-[11px] hidden sm:inline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {catMeta.desc}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                    }`}>
                      {groupItems.length} {groupItems.length > 1 ? 'Parameters' : 'Parameter'}
                    </span>
                  </div>

                  {/* Setting Rows */}
                  <div className={isDark ? 'divide-y divide-slate-800' : 'divide-y divide-slate-200'}>
                    {groupItems.map(setting => {
                      const isDirty = dirtyKeys.has(setting.key);
                      const currentValue = settingsForm[setting.key] !== undefined ? settingsForm[setting.key] : setting.value;
                      const unit = getUnit(setting.key);
                      const isBoolean = setting.type === 'boolean';
                      const isSelect = setting.type === 'select' && Array.isArray(setting.options);
                      const isNumber = setting.type === 'number';
                      const isBoolActive = currentValue === 'true' || currentValue === true;

                      return (
                        <div 
                          key={setting.key}
                          className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isDirty 
                              ? (isDark ? 'bg-blue-950/25' : 'bg-blue-50/50')
                              : (isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/70')
                          }`}
                        >
                          {/* Left: Label & Description */}
                          <div className="md:w-7/12 space-y-1.5">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {setting.label || setting.key}
                              </span>
                              
                              {isDirty && (
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                                  isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  Modified
                                </span>
                              )}

                              <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border uppercase ${
                                setting.is_public 
                                  ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                  : (isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200')
                              }`}>
                                {setting.is_public ? 'Tablet Sync' : 'Internal'}
                              </span>
                            </div>

                            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {setting.description}
                            </p>

                            <div className={`text-[10px] font-mono flex items-center space-x-1.5 pt-0.5 ${
                              isDark ? 'text-slate-500' : 'text-slate-500'
                            }`}>
                              <span>key:</span>
                              <code className={`px-1 rounded ${
                                isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {setting.key}
                              </code>
                            </div>
                          </div>

                          {/* Right: Controls */}
                          <div className="md:w-5/12 flex items-center justify-end shrink-0">
                            {isBoolean ? (
                              <button
                                type="button"
                                onClick={() => handleChange(setting.key, !isBoolActive)}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded border transition-all cursor-pointer ${
                                  isBoolActive
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs font-bold'
                                    : isDark
                                      ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700 font-semibold'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 font-semibold'
                                }`}
                              >
                                {isBoolActive ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                                    <span className="text-xs">ENABLED</span>
                                  </>
                                ) : (
                                  <span className="text-xs">DISABLED</span>
                                )}
                              </button>
                            ) : isSelect ? (
                              <div className="w-full sm:w-60">
                                <select
                                  value={currentValue}
                                  onChange={(e) => handleChange(setting.key, e.target.value)}
                                  className={`w-full px-3 py-1.5 rounded text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                    isDark 
                                      ? 'bg-slate-950 border-slate-700 text-white' 
                                      : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                                  }`}
                                >
                                  {setting.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            ) : (
                              <div className="relative w-full sm:w-60">
                                <input
                                  type={isNumber ? 'number' : 'text'}
                                  step={isNumber ? '0.1' : undefined}
                                  value={currentValue}
                                  onChange={(e) => handleChange(setting.key, e.target.value)}
                                  className={`w-full px-3 py-1.5 rounded text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isNumber ? 'font-mono font-bold pr-12 text-right' : ''
                                  } ${
                                    isDark 
                                      ? 'bg-slate-950 border-slate-700 text-white' 
                                      : 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                                  }`}
                                />
                                {unit && (
                                  <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold pointer-events-none ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  }`}>
                                    {unit}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}

        </div>
      </div>

    </div>
  );
}


