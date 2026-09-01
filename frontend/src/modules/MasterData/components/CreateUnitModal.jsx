import React, { useState } from 'react';
import { X, Building2, Plus, Save } from 'lucide-react';

export default function CreateUnitModal({
  show,
  onClose,
  onSubmit,
  unit = null,
  isDark = true,
  errors = {}
}) {
  const [name, setName] = useState(unit?.name || '');
  const [code, setCode] = useState(unit?.code || '');
  const [address, setAddress] = useState(unit?.address || '');
  const [contactPerson, setContactPerson] = useState(unit?.contact_person || '');
  const [contactPhone, setContactPhone] = useState(unit?.contact_phone || '');
  const [isActive, setIsActive] = useState(unit ? Boolean(unit.is_active) : true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (unit) {
      setName(unit.name || '');
      setCode(unit.code || '');
      setAddress(unit.address || '');
      setContactPerson(unit.contact_person || '');
      setContactPhone(unit.contact_phone || '');
      setIsActive(Boolean(unit.is_active));
    } else {
      setName('');
      setCode('');
      setAddress('');
      setContactPerson('');
      setContactPhone('');
      setIsActive(true);
    }
  }, [unit, show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: unit?.id,
        name,
        code,
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
                {unit ? 'Edit Manufacturing Unit' : 'Register Manufacturing Unit'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup factory complex location and facility parameters
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
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Unit 01 (Factory)"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Unit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. UNIT-01"
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Plant Location / Address
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
                Plant Head / Contact Person
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam"
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
              <span>{submitting ? 'Saving...' : unit ? 'Update Unit' : 'Save Unit'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
