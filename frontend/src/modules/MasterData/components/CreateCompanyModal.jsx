import React, { useState } from 'react';
import { X, Building2, Plus, Save } from 'lucide-react';

export default function CreateCompanyModal({
  show,
  onClose,
  onSubmit,
  company = null,
  isDark = true,
  errors = {}
}) {
  const [name, setName] = useState(company?.name || '');
  const [code, setCode] = useState(company?.code || '');
  const [address, setAddress] = useState(company?.address || '');
  const [contactEmail, setContactEmail] = useState(company?.contact_email || '');
  const [contactPhone, setContactPhone] = useState(company?.contact_phone || '');
  const [tradeLicense, setTradeLicense] = useState(company?.trade_license || '');
  const [tinBin, setTinBin] = useState(company?.tin_bin || '');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (company) {
      setName(company.name || '');
      setCode(company.code || '');
      setAddress(company.address || '');
      setContactEmail(company.contact_email || '');
      setContactPhone(company.contact_phone || '');
      setTradeLicense(company.trade_license || '');
      setTinBin(company.tin_bin || '');
    } else {
      setName('');
      setCode('');
      setAddress('');
      setContactEmail('');
      setContactPhone('');
      setTradeLicense('');
      setTinBin('');
    }
  }, [company, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: company?.id,
        name,
        code: code || `GRP-${Math.floor(10 + Math.random() * 90)}`,
        address,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        trade_license: tradeLicense,
        tin_bin: tinBin,
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
                {company ? 'Edit Group of Companies' : 'Register Group of Companies'}
              </h3>
              <p className="text-xs text-slate-400">
                Top-level enterprise parent holding multiple specialized manufacturing factories
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
                Group / Enterprise Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Group of Companies"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Group Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. GRP-STD"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-white border-slate-300 text-blue-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Corporate Headquarters Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Standard Corporate Tower, Banani C/A, Dhaka"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Corporate Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. info@standard-group.com"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Head Office Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. +880 2 9820001"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Trade License No.
              </label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="e.g. TRAD/DNCC/012948"
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                BIN / Tax Registration
              </label>
              <input
                type="text"
                value={tinBin}
                onChange={(e) => setTinBin(e.target.value)}
                placeholder="e.g. BIN-1294029482"
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

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
              {company ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : company ? 'Update Group' : 'Save Group Profile'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
