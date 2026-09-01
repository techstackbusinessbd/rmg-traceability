import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  PackageCheck, 
  ShieldCheck, 
  SlidersHorizontal, 
  Radio, 
  Search, 
  Save, 
  RotateCcw, 
  Info, 
  Lock, 
  Clock, 
  Scale, 
  Percent, 
  Activity, 
  Cpu, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const GROUP_CONFIG = {
  factory: {
    title: 'Factory & Plant Operations',
    description: 'Plant branding, operational shift timing, and line capacity parameters.',
    icon: Building2,
    badge: 'Operations'
  },
  qc: {
    title: 'Quality Control (QC) & DHU Policies',
    description: 'Defects Per Hundred Units (DHU) alert thresholds and automated rework vs reject limits.',
    icon: CheckCircle2,
    badge: 'Quality'
  },
  shipment: {
    title: 'Shipment & Carton Tolerances',
    description: 'Export short-shipment tolerance percentages and floor scale weight variance limits.',
    icon: PackageCheck,
    badge: 'Logistics'
  },
  security: {
    title: 'Tablet & Floor Terminal Security',
    description: 'Floor tablet session timeouts, PIN security, and offline IndexedDB sync duration limits.',
    icon: ShieldCheck,
    badge: 'Security'
  }
};

export default function SystemSettingsDashboard({
  settings = [],
  settingsForm = {},
  setSettingsForm,
  onSave,
  saving = false
}) {
  const { isDark } = useThemeStore();
  const [activeGroupFilter, setActiveGroupFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dirtyKeys, setDirtyKeys] = useState(new Set());

  // Original settings map to track dirty states
  const originalSettingsMap = useMemo(() => {
    const map = {};
    settings.forEach(s => {
      map[s.key] = s.value;
    });
    return map;
  }, [settings]);

  // Handle value change and track dirty keys
  const handleChange = (key, value) => {
    setSettingsForm(prev => ({
      ...prev,
      [key]: value
    }));

    setDirtyKeys(prev => {
      const next = new Set(prev);
      if (originalSettingsMap[key] !== value) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  // Revert all modified fields
  const handleReset = () => {
    setSettingsForm({ ...originalSettingsMap });
    setDirtyKeys(new Set());
  };

  // Revert single field
  const handleResetField = (key) => {
    if (originalSettingsMap[key] !== undefined) {
      handleChange(key, originalSettingsMap[key]);
    }
  };

  // Filter settings by group and search query
  const filteredSettings = useMemo(() => {
    return settings.filter(s => {
      const matchesGroup = activeGroupFilter === 'ALL' || s.group === activeGroupFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.label?.toLowerCase().includes(q) || 
        s.key?.toLowerCase().includes(q) || 
        s.description?.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [settings, activeGroupFilter, searchQuery]);

  // Group filtered settings
  const groupedSettings = useMemo(() => {
    const groups = {};
    filteredSettings.forEach(s => {
      const grp = s.group || 'general';
      if (!groups[grp]) groups[grp] = [];
      groups[grp].push(s);
    });
    return groups;
  }, [filteredSettings]);

  const totalSettingsCount = settings.length;
  const changedCount = dirtyKeys.size;

  const getUnitBadge = (setting) => {
    if (setting.key.includes('pct') || setting.key.includes('threshold')) {
      return { icon: Percent, label: '%' };
    }
    if (setting.key.includes('hours')) {
      return { icon: Clock, label: 'Hours' };
    }
    if (setting.key.includes('min') || setting.key.includes('timeout')) {
      return { icon: Clock, label: 'Min' };
    }
    if (setting.key.includes('kg') || setting.key.includes('weight')) {
      return { icon: Scale, label: 'KG' };
    }
    return null;
  };

  return (
    <div className="space-y-5">
      
      {/* Top Banner: Status & Overview */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded border ${
              isDark 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Global System Configuration
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Factory tolerances, floor terminal limits, and QC thresholds backed by in-memory Redis caching
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-xs font-mono font-medium ${
              isDark 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Radio className={`h-3.5 w-3.5 animate-pulse ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className="font-semibold">Redis Cache Synced</span>
            </div>

            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-xs font-mono font-medium ${
              isDark 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              <Cpu className="h-3.5 w-3.5" />
              <span>{totalSettingsCount} Parameters</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className={`mt-5 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          {/* Group Filter Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveGroupFilter('ALL')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeGroupFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700' 
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              All Categories ({totalSettingsCount})
            </button>
            {Object.keys(GROUP_CONFIG).map(grpKey => {
              const cfg = GROUP_CONFIG[grpKey];
              const count = settings.filter(s => s.group === grpKey).length;
              const Icon = cfg.icon;
              return (
                <button
                  key={grpKey}
                  type="button"
                  onClick={() => setActiveGroupFilter(grpKey)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                    activeGroupFilter === grpKey
                      ? 'bg-blue-600 text-white'
                      : isDark 
                        ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700' 
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cfg.title.split(' ')[0]} ({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parameter..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-colors ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Settings Form Container */}
      <form onSubmit={onSave} noValidate className="space-y-6">
        {Object.keys(groupedSettings).length === 0 ? (
          <div className={`p-12 text-center rounded border ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              No configuration parameters match your filter
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Try clearing your search query or selecting a different category tab.
            </p>
          </div>
        ) : (
          Object.keys(groupedSettings).map((grpKey) => {
            const cfg = GROUP_CONFIG[grpKey] || {
              title: grpKey.toUpperCase(),
              description: 'System configurations',
              icon: SlidersHorizontal,
              badge: 'Config'
            };
            const GroupIcon = cfg.icon;
            const items = groupedSettings[grpKey];

            return (
              <div 
                key={grpKey}
                className={`rounded border transition-colors overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                {/* Category Header */}
                <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded border ${
                      isDark 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}>
                      <GroupIcon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {cfg.title}
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {cfg.description}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isDark 
                      ? 'bg-slate-800 text-slate-300 border-slate-700' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {items.length} {items.length === 1 ? 'Parameter' : 'Parameters'}
                  </span>
                </div>

                {/* Grid of Settings in this Group */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {items.map((setting) => {
                    const isDirty = dirtyKeys.has(setting.key);
                    const unit = getUnitBadge(setting);
                    const currentVal = settingsForm[setting.key] !== undefined 
                      ? settingsForm[setting.key] 
                      : (setting.value ?? '');

                    return (
                      <div
                        key={setting.key}
                        className={`p-4 rounded-md border transition-all ${
                          isDirty
                            ? (isDark 
                                ? 'bg-blue-950/30 border-blue-500/40 ring-1 ring-blue-500/20' 
                                : 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200')
                            : (isDark 
                                ? 'bg-slate-950/50 border-slate-800/80 hover:border-slate-750' 
                                : 'bg-slate-50/80 border-slate-200 hover:border-slate-300')
                        }`}
                      >
                        {/* Title & Badges */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center space-x-2">
                            <label className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {setting.label || setting.key}
                            </label>
                            {isDirty && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${
                                isDark 
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                Modified
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 shrink-0">
                            {setting.is_public ? (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold border ${
                                isDark 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`} title="Publicly accessible by Floor Tablets">
                                Floor Public
                              </span>
                            ) : (
                              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold border flex items-center space-x-1 ${
                                isDark 
                                  ? 'bg-slate-800 text-slate-400 border-slate-700' 
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`} title="Protected Admin Parameter">
                                <Lock className="h-2.5 w-2.5" />
                                <span>Admin Only</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-xs mb-3 min-h-[30px] leading-relaxed ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {setting.description || 'Configurable operational threshold for automated calculation.'}
                        </p>

                        {/* Input Field with Unit Decorator */}
                        <div className="flex items-center space-x-2">
                          <div className="relative flex-1">
                            <input
                              type={setting.type === 'number' ? 'number' : 'text'}
                              step={setting.type === 'number' ? '0.01' : undefined}
                              value={currentVal}
                              onChange={(e) => handleChange(setting.key, e.target.value)}
                              className={`w-full px-3 py-2 text-xs sm:text-sm font-mono rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                unit ? 'pr-16' : ''
                              } ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' 
                                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                              }`}
                            />
                            {unit && (
                              <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center space-x-1 pointer-events-none ${
                                isDark 
                                  ? 'bg-slate-800 text-slate-300 border-slate-700' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                <span>{unit.label}</span>
                              </div>
                            )}
                          </div>

                          {isDirty && (
                            <button
                              type="button"
                              onClick={() => handleResetField(setting.key)}
                              title="Revert to original value"
                              className={`p-2 rounded transition-colors cursor-pointer border ${
                                isDark 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700' 
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                              }`}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className={`mt-2 text-[10px] font-mono flex items-center justify-between ${
                          isDark ? 'text-slate-500' : 'text-slate-500'
                        }`}>
                          <span>Key: <code className={isDark ? 'text-slate-400' : 'text-slate-600'}>{setting.key}</code></span>
                          <span>Type: {setting.type || 'string'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Bottom Floating/Sticky Action Bar */}
        <div className={`p-4 rounded border flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 shadow-xl backdrop-blur-md transition-colors ${
          isDark 
            ? 'bg-slate-900/95 border-slate-800' 
            : 'bg-white/95 border-slate-200 shadow-md'
        }`}>
          <div className="flex items-center space-x-2 text-xs">
            <Info className="h-4 w-4 text-blue-500" />
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              {changedCount > 0 
                ? `${changedCount} parameter${changedCount > 1 ? 's' : ''} modified. Click save to synchronize Redis cache.`
                : 'All system parameters are in sync with production storage.'
              }
            </span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            {changedCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border disabled:opacity-50 ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Discard Changes</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold flex items-center space-x-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Syncing Redis Cache...' : 'Save & Sync Configurations'}</span>
            </button>
          </div>
        </div>
      </form>

    </div>
  );
}
