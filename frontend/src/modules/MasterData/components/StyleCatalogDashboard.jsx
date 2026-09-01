import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Clock, 
  Scissors, 
  Building2, 
  ListTree,
  FileSpreadsheet
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

const GARMENT_TYPES = ['ALL', 'SHIRT', 'PANT', 'POLO', 'TEE', 'JACKET', 'DENIM', 'TROUSER'];

export default function StyleCatalogDashboard({
  styles = [],
  buyers = [],
  loading = false,
  onOpenCreateStyle,
  onOpenOperationBulletin,
  onEditStyle,
  onDeleteStyle,
}) {
  const { isDark } = useThemeStore();
  const [selectedBuyerId, setSelectedBuyerId] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStyles = useMemo(() => {
    return styles.filter(s => {
      const matchBuyer = selectedBuyerId === 'ALL' || s.buyer_id === selectedBuyerId;
      const matchType = selectedType === 'ALL' || s.garment_type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        s.style_number?.toLowerCase().includes(q) || 
        s.style_name?.toLowerCase().includes(q) || 
        s.fabric_type?.toLowerCase().includes(q) ||
        s.season?.toLowerCase().includes(q);
      return matchBuyer && matchType && matchSearch;
    });
  }, [styles, selectedBuyerId, selectedType, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Top Header & Actions */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Garment Style Library & Operation Bulletin (SMV)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Technical specifications, total SMV calculation, operation breakdown, and machine routing
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenCreateStyle}
              className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Style</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/20 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
            {/* Buyer Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400 font-semibold">Buyer:</span>
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className={`px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Buyers</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Garment Type Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-slate-400 font-semibold">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {GARMENT_TYPES.map(t => (
                  <option key={t} value={t}>{t === 'ALL' ? 'All Garment Types' : t}</option>
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
              placeholder="Search style no, fabric, season..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStyles.map((style) => (
          <div key={style.id} className={`p-4 rounded border flex flex-col justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-blue-500 px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20">
                    {style.style_number}
                  </span>
                  <h4 className={`text-sm font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {style.style_name}
                  </h4>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {style.garment_type}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-slate-400 my-3">
                <div className="flex items-center justify-between">
                  <span>Buyer / Brand:</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {style.buyer?.name || 'N/A'} {style.brand?.name ? `(${style.brand.name})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Season:</span>
                  <span className="font-mono">{style.season || 'SS-2026'}</span>
                </div>

                {style.fabric_type && (
                  <div className="text-[11px] text-slate-400 truncate">
                    Fabric: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{style.fabric_type}</strong>
                  </div>
                )}
              </div>

              {/* SMV & Operations Metric Box */}
              <div className={`p-3 rounded border my-3 flex items-center justify-between ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">TOTAL SMV</span>
                  <span className="text-lg font-black font-mono text-emerald-500">
                    {style.total_smv} <span className="text-xs font-normal text-slate-400">min</span>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">OPERATIONS</span>
                  <span className="text-lg font-black font-mono text-blue-400">
                    {style.operations?.length || 0} <span className="text-xs font-normal text-slate-400">ops</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions & OB Button */}
            <div className="mt-3 pt-2.5 border-t border-slate-700/20 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onOpenOperationBulletin(style)}
                className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <ListTree className="h-3.5 w-3.5" />
                <span>Operation Bulletin (OB)</span>
              </button>

              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onEditStyle(style)}
                  className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                  title="Edit Style"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteStyle(style)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Delete Style"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
