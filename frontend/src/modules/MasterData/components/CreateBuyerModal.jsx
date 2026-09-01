import React, { useState } from 'react';
import { X, Building2, Plus, Save } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BDT', 'JPY'];

export default function CreateBuyerModal({
  show,
  onClose,
  onSubmit,
  buyer = null,
  isDark = true,
  errors = {}
}) {
  const [name, setName] = useState(buyer?.name || '');
  const [code, setCode] = useState(buyer?.code || '');
  const [country, setCountry] = useState(buyer?.country || 'Bangladesh');
  const [currency, setCurrency] = useState(buyer?.currency || 'USD');
  const [contactPerson, setContactPerson] = useState(buyer?.contact_person || '');
  const [email, setEmail] = useState(buyer?.email || '');
  const [phone, setPhone] = useState(buyer?.phone || '');
  const [complianceStandard, setComplianceStandard] = useState(buyer?.compliance_standard || 'Accord / BSCI');
  const [isActive, setIsActive] = useState(buyer ? Boolean(buyer.is_active) : true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (buyer) {
      setName(buyer.name || '');
      setCode(buyer.code || '');
      setCountry(buyer.country || 'Bangladesh');
      setCurrency(buyer.currency || 'USD');
      setContactPerson(buyer.contact_person || '');
      setEmail(buyer.email || '');
      setPhone(buyer.phone || '');
      setComplianceStandard(buyer.compliance_standard || 'Accord / BSCI');
      setIsActive(Boolean(buyer.is_active));
    } else {
      setName('');
      setCode('');
      setCountry('Sweden');
      setCurrency('USD');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setComplianceStandard('Accord / BSCI / WRAP');
      setIsActive(true);
    }
  }, [buyer, show]);

  if (!show) return null;

  const generateBuyerCode = (buyerName) => {
    if (!buyerName || !buyerName.trim()) return '';
    const clean = buyerName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let acronym = '';
    if (words.length === 1) {
      acronym = words[0].slice(0, 4).toUpperCase();
    } else {
      acronym = words.map(w => w[0]).join('').slice(0, 5).toUpperCase();
    }
    return `BUY-${acronym || 'GEN'}`;
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!buyer) {
      setCode(generateBuyerCode(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const finalCode = (code && code.trim()) ? code.trim().toUpperCase() : generateBuyerCode(name);
    try {
      await onSubmit({
        id: buyer?.id,
        name: name.trim(),
        code: finalCode,
        country,
        currency,
        contact_person: contactPerson,
        email,
        phone,
        compliance_standard: complianceStandard,
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
                {buyer ? 'Edit Buyer Profile' : 'Register Global Buyer'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup international buyer account and compliance parameters
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
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. American Eagle Outfitters"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold">
                  Buyer Code <span className="text-slate-400 font-normal text-[10px]">(Auto)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCode(generateBuyerCode(name))}
                  className="text-[10px] text-blue-500 hover:text-blue-600 font-mono font-bold cursor-pointer"
                >
                  ⚡ Auto-Generate
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BUY-AEO"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Sweden, Spain, USA"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Merchandiser / Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Johan Lindqvist"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. johan.l@hm.com"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Compliance Standard
            </label>
            <input
              type="text"
              value={complianceStandard}
              onChange={(e) => setComplianceStandard(e.target.value)}
              placeholder="e.g. Accord / BSCI / WRAP Certified"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
            />
            <span>Active Buyer Account</span>
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
              {buyer ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : buyer ? 'Update Buyer' : 'Save Buyer'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
