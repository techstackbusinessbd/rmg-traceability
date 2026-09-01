import React, { useState } from 'react';
import { X, Building2, Plus, Save, Sparkles, Shirt, Droplet, Printer, Scissors, Warehouse } from 'lucide-react';

const FACTORY_TYPES = [
  { value: 'SEWING_FACTORY', label: 'Sewing & Apparel Factory', prefix: 'FACT-SEW', icon: Shirt },
  { value: 'WASHING_FACTORY', label: 'Washing & Laundry Plant', prefix: 'FACT-WASH', icon: Droplet },
  { value: 'PRINTING_FACTORY', label: 'Screen & Rotary Printing Plant', prefix: 'FACT-PRN', icon: Printer },
  { value: 'EMBROIDERY_FACTORY', label: 'Computerized Embroidery Plant', prefix: 'FACT-EMB', icon: Scissors },
  { value: 'CENTRAL_WAREHOUSE', label: 'Central Finishing & Bonded Warehouse', prefix: 'FACT-WH', icon: Warehouse },
  { value: 'KNITTING_WEAVING', label: 'Textile Knitting & Fabric Mill', prefix: 'FACT-TEX', icon: Building2 },
];

export default function CreateUnitModal({
  show,
  onClose,
  onSubmit,
  companies = [],
  unit = null,
  isDark = true,
  errors = {}
}) {
  const [companyId, setCompanyId] = useState(unit?.company_id || companies[0]?.id || '');
  const [name, setName] = useState(unit?.name || '');
  const [factoryType, setFactoryType] = useState(unit?.factory_type || 'SEWING_FACTORY');
  const [code, setCode] = useState(unit?.code || '');
  const [address, setAddress] = useState(unit?.address || '');
  const [contactPerson, setContactPerson] = useState(unit?.contact_person || '');
  const [contactPhone, setContactPhone] = useState(unit?.contact_phone || '');
  const [isActive, setIsActive] = useState(unit ? Boolean(unit.is_active) : true);
  const [isManualCode, setIsManualCode] = useState(Boolean(unit));
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate code from factory name acronym and number
  const generateCode = (type, unitName) => {
    if (!unitName || !unitName.trim()) {
      const typeObj = FACTORY_TYPES.find(t => t.value === type);
      return `${typeObj ? typeObj.prefix : 'FACT-SEW'}-01`;
    }
    
    const clean = unitName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const stopWords = ['ltd', 'limited', 'pvt', 'inc', 'corp', 'factory', 'plant', 'unit', 'mills', 'apparel', 'textiles', 'garments'];
    const rawWords = clean.split(/\s+/).filter(Boolean);
    const words = rawWords.filter(w => !stopWords.includes(w.toLowerCase()));
    const finalWords = words.length > 0 ? words : rawWords;

    let acronym = '';
    if (finalWords.length === 1) {
      acronym = finalWords[0].slice(0, 4).toUpperCase();
    } else {
      acronym = finalWords.map(w => w[0]).join('').slice(0, 5).toUpperCase();
    }

    const numMatch = (unitName || '').match(/\d+/);
    const suffix = numMatch ? `-${String(numMatch[0]).padStart(2, '0')}` : '';

    return `FACT-${acronym || 'UNIT'}${suffix}`;
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFactoryType(newType);
    if (!isManualCode && !unit) {
      setCode(generateCode(newType, name));
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    if (!isManualCode && !unit) {
      setCode(generateCode(factoryType, newName));
    }
  };

  const handleAutoGenerateClick = () => {
    const autoCode = generateCode(factoryType, name);
    setCode(autoCode);
    setIsManualCode(false);
  };

  React.useEffect(() => {
    if (unit) {
      setCompanyId(unit.company_id || companies[0]?.id || '');
      setName(unit.name || '');
      setFactoryType(unit.factory_type || 'SEWING_FACTORY');
      setCode(unit.code || '');
      setAddress(unit.address || '');
      setContactPerson(unit.contact_person || '');
      setContactPhone(unit.contact_phone || '');
      setIsActive(Boolean(unit.is_active));
      setIsManualCode(true);
    } else {
      setCompanyId(companies[0]?.id || '');
      setName('');
      setFactoryType('SEWING_FACTORY');
      setCode('');
      setAddress('');
      setContactPerson('');
      setContactPhone('');
      setIsActive(true);
      setIsManualCode(false);
    }
  }, [unit, show, companies]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: unit?.id,
        company_id: companyId || null,
        name,
        factory_type: factoryType,
        code: code || generateCode(factoryType, name),
        address,
        contact_person: contactPerson,
        contact_phone: contactPhone,
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
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {unit ? 'Edit Factory Plant Profile' : 'Register Factory Plant / Unit'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup Sewing, Washing, Printing or Embroidery Factory under Group of Companies
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
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Company Selection */}
          {companies.length > 0 && (
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Parent Group of Companies
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Factory Type / Nature */}
          <div>
            <label className="block text-xs font-bold mb-1.5">
              Factory Nature / Specialty <span className="text-red-500">*</span>
            </label>
            <select
              value={factoryType}
              onChange={handleTypeChange}
              className={`w-full px-3 py-2 rounded text-xs font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-white border-slate-300 text-blue-600'
              }`}
            >
              {FACTORY_TYPES.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Factory Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Standard Sewing Complex Unit 01"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold">
                  Factory Code <span className="text-xs text-emerald-500 font-normal">(Auto)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoGenerateClick}
                  className="text-[10px] font-mono text-blue-400 hover:underline cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Auto-Gen</span>
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setIsManualCode(true);
                }}
                placeholder="Auto e.g. FACT-SEW-01"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-white border-slate-300 text-blue-600'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Plant Physical Location / Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 45-48, Sector 02, CEPZ, Chattogram"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Plant Head / General Manager
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam (GM)"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +880 1711-000101"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
            />
            <span>Active Manufacturing Facility</span>
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
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {unit ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : unit ? 'Update Factory' : 'Save Factory'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
