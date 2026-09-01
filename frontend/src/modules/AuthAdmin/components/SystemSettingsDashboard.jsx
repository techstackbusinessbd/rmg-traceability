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
  Percent, 
  Clock, 
  Scale, 
  Lock,
  Smartphone,
  Check,
  Globe,
  Cpu,
  Scissors,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const CATEGORIES = [
  { id: 'ALL', label: 'All Enterprise Settings' },
  { id: 'enterprise', label: 'Enterprise & Localization', icon: Globe },
  { id: 'production', label: 'Production & Shopfloor', icon: Scissors },
  { id: 'qc', label: 'Quality Assurance (QC)', icon: CheckCircle2 },
  { id: 'shipment', label: 'Packing & Compliance', icon: PackageCheck },
  { id: 'security', label: 'Security & Access Control', icon: ShieldCheck },
  { id: 'system', label: 'System & Cache Engine', icon: Server },
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
    <div className="space-y-5">
      
      {/* Category Navigation & Search Header */}
      <div className={`p-4 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center flex-wrap gap-1.5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = cat.id === 'ALL' 
                ? settings.length 
                : settings.filter(s => s.group === cat.id).length;

              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750 border-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search global settings..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Floating Save / Revert Bar */}
      {hasChanges && (
        <div className={`p-3.5 rounded border flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-150 ${
          isDark ? 'bg-blue-950/80 border-blue-500/40 text-blue-100' : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-bold">
              {dirtyKeys.size} setting{dirtyKeys.size > 1 ? 's' : ''} modified. Don't forget to save your changes to invalidate Redis cache.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center space-x-1 border cursor-pointer transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50 transition-colors"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? 'Synchronizing...' : 'Save & Sync Settings'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSettings.map(setting => {
          const isDirty = dirtyKeys.has(setting.key);
          const currentValue = settingsForm[setting.key] !== undefined ? settingsForm[setting.key] : setting.value;
          const unit = getUnit(setting.key);
          const isBoolean = setting.type === 'boolean';
          const isSelect = setting.type === 'select' && Array.isArray(setting.options);
          const isNumber = setting.type === 'number';

          return (
            <div 
              key={setting.key}
              className={`p-4 rounded border transition-all ${
                isDirty 
                  ? (isDark ? 'bg-slate-900 border-blue-500/50 shadow-md ring-1 ring-blue-500/20' : 'bg-white border-blue-400 shadow-md ring-1 ring-blue-400/20')
                  : (isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs')
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className={`text-xs font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {setting.label || setting.key}
                    </h4>
                    {isDirty && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Modified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {setting.description}
                  </p>
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                    setting.is_public 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {setting.is_public ? 'Public Tablet' : 'Internal'}
                  </span>
                </div>
              </div>

              {/* Input Control */}
              <div className="pt-2">
                {isBoolean ? (
                  <div className="flex items-center justify-between p-2 rounded border bg-slate-950/40 border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">
                      Feature Status: <span className={currentValue === 'true' || currentValue === true ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {currentValue === 'true' || currentValue === true ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleChange(setting.key, !(currentValue === 'true' || currentValue === true))}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                        currentValue === 'true' || currentValue === true
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      {currentValue === 'true' || currentValue === true ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <span>Disabled</span>
                      )}
                    </button>
                  </div>
                ) : isSelect ? (
                  <select
                    value={currentValue}
                    onChange={(e) => handleChange(setting.key, e.target.value)}
                    className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-white border-slate-300 text-blue-600'
                    }`}
                  >
                    {setting.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={isNumber ? 'number' : 'text'}
                      step={isNumber ? '0.1' : undefined}
                      value={currentValue}
                      onChange={(e) => handleChange(setting.key, e.target.value)}
                      className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isNumber ? 'font-mono font-bold text-blue-400 pr-12' : ''
                      } ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    {unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400 pointer-events-none">
                        {unit}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-0.5">
                  <span>Key: {setting.key}</span>
                  <span>Group: {setting.group}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
