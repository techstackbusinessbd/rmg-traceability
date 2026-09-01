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
  Check
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const CATEGORIES = [
  { id: 'ALL', label: 'All Settings' },
  { id: 'factory', label: 'Factory & Plant', icon: Building2 },
  { id: 'qc', label: 'Quality Control', icon: CheckCircle2 },
  { id: 'shipment', label: 'Packing & Shipment', icon: PackageCheck },
  { id: 'security', label: 'Device & Security', icon: ShieldCheck },
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
      if (originalMap[key] !== value) {
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
        s.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [settings, activeCategory, searchQuery]);

  const getUnit = (key) => {
    if (key.includes('pct') || key.includes('threshold')) return '%';
    if (key.includes('hours')) return 'Hours';
    if (key.includes('min') || key.includes('timeout')) return 'Min';
    if (key.includes('kg') || key.includes('weight')) return 'KG';
    return null;
  };

  const hasChanges = dirtyKeys.size > 0;

  return (
    <div className="space-y-4">
      
      {/* Header & Controls Bar */}
      <div className={`p-4 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-blue-700/60 text-white'
                      : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={onSave} noValidate className="space-y-4">
        
        {filteredSettings.length === 0 ? (
          <div className={`p-10 text-center rounded border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No settings found matching your search.
            </p>
          </div>
        ) : (
          <div className={`rounded border overflow-hidden transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div className="divide-y divide-slate-800/40 dark:divide-slate-800/60">
              {filteredSettings.map((setting) => {
                const isModified = dirtyKeys.has(setting.key);
                const unit = getUnit(setting.key);
                const val = settingsForm[setting.key] !== undefined 
                  ? settingsForm[setting.key] 
                  : (setting.value ?? '');

                return (
                  <div 
                    key={setting.key} 
                    className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                      isModified 
                        ? (isDark ? 'bg-blue-950/20' : 'bg-blue-50/40') 
                        : (isDark ? 'hover:bg-slate-850/40' : 'hover:bg-slate-50/60')
                    }`}
                  >
                    {/* Setting Title & Description */}
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {setting.label || setting.key}
                        </span>

                        {isModified && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                            isDark 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            Modified
                          </span>
                        )}

                        {setting.is_public ? (
                          <span className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            isDark 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            <Smartphone className="h-2.5 w-2.5" />
                            <span>Floor Tablet</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            isDark 
                              ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            <Lock className="h-2.5 w-2.5" />
                            <span>Admin</span>
                          </span>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {setting.description}
                      </p>
                    </div>

                    {/* Input Control */}
                    <div className="flex items-center space-x-2 shrink-0 md:w-60">
                      <div className="relative w-full">
                        <input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          step={setting.type === 'number' ? '0.01' : undefined}
                          value={val}
                          onChange={(e) => handleChange(setting.key, e.target.value)}
                          className={`w-full px-3 py-2 rounded text-xs sm:text-sm font-medium border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                            unit ? 'pr-14 font-mono' : ''
                          } ${
                            isDark 
                              ? 'bg-slate-950 border-slate-700/80 text-white focus:border-blue-500' 
                              : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
                          }`}
                        />
                        {unit && (
                          <div className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-mono font-bold pointer-events-none border ${
                            isDark 
                              ? 'bg-slate-800 text-slate-300 border-slate-700' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {unit}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Bar (Only shows or highlights when needed) */}
        <div className={`p-4 rounded border flex items-center justify-between gap-3 sticky bottom-4 backdrop-blur-md shadow-lg transition-colors ${
          isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
        }`}>
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {hasChanges 
              ? `${dirtyKeys.size} setting${dirtyKeys.size > 1 ? 's' : ''} modified`
              : 'All settings are up to date'
            }
          </span>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
