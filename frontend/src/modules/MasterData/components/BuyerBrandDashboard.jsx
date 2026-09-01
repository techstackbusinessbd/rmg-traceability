import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Globe, 
  Mail, 
  Phone,
  Tag
} from 'lucide-react';
import { useThemeStore } from '../../../store/themeStore';

export default function BuyerBrandDashboard({
  buyers = [],
  loading = false,
  onOpenCreateBuyer,
  onOpenCreateBrand,
  onEditBuyer,
  onDeleteBuyer,
}) {
  const { isDark } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const q = searchQuery.toLowerCase().trim();
      return !q || 
        b.name?.toLowerCase().includes(q) || 
        b.code?.toLowerCase().includes(q) || 
        b.country?.toLowerCase().includes(q) || 
        b.compliance_standard?.toLowerCase().includes(q);
    });
  }, [buyers, searchQuery]);

  return (
    <div className="space-y-5">
      
      {/* Top Header & Actions */}
      <div className={`p-5 rounded border transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Global Buyers & Brand Label Directory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Authorized buyers, merchandiser contacts, compliance standards, and associated brand divisions
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onOpenCreateBuyer}
              className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Register Buyer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-700/20 flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search buyer by name, code or country..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="text-xs text-slate-400 font-mono font-medium">
            Total Buyers: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{buyers.length}</strong>
          </div>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer) => (
          <div key={buyer.id} className={`p-4 rounded border flex flex-col justify-between ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}>
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-blue-500 px-1.5 py-0.2 rounded bg-blue-500/10 border border-blue-500/20">
                    {buyer.code}
                  </span>
                  <h4 className={`text-sm font-bold mt-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {buyer.name}
                  </h4>
                </div>

                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {buyer.currency || 'USD'}
                </span>
              </div>

              {/* Country & Contact */}
              <div className="space-y-1 text-xs text-slate-400 my-3">
                <div className="flex items-center space-x-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{buyer.country || 'Global'}</span>
                </div>
                {buyer.contact_person && (
                  <div className="text-[11px] text-slate-400">
                    Merchandiser: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{buyer.contact_person}</strong>
                  </div>
                )}
                {buyer.email && (
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <Mail className="h-3 w-3 text-slate-500" />
                    <span>{buyer.email}</span>
                  </div>
                )}
              </div>

              {/* Compliance Standard */}
              <div className="p-2 rounded bg-blue-500/5 border border-blue-500/15 flex items-center space-x-1.5 text-[11px] mb-3">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-blue-300 truncate font-medium">
                  {buyer.compliance_standard || 'Accord / BSCI Certified'}
                </span>
              </div>

              {/* Associated Brands List */}
              <div className="pt-2 border-t border-slate-700/20">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="font-semibold text-slate-400 flex items-center space-x-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>Brand Labels ({buyer.brands?.length || 0}):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenCreateBrand(buyer)}
                    className="text-[10px] text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    + Add Brand
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {buyer.brands && buyer.brands.length > 0 ? (
                    buyer.brands.map(brand => (
                      <span key={brand.id} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {brand.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No specific sub-brands</span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-2.5 border-t border-slate-700/20 flex items-center justify-end space-x-1.5">
              <button
                type="button"
                onClick={() => onEditBuyer(buyer)}
                className="p-1.5 rounded hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                title="Edit Buyer"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onDeleteBuyer(buyer)}
                className="p-1.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                title="Delete Buyer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
