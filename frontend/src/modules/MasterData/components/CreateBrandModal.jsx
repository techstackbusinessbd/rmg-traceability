import React, { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

export default function CreateBrandModal({
  show,
  onClose,
  onSubmit,
  buyer = null,
  isDark = true,
  errors = {}
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setName('');
    setCode('');
    setDescription('');
    setIsActive(true);
  }, [show, buyer]);

  if (!show || !buyer) return null;

  const generateBrandCode = (brandName) => {
    if (!brandName || !brandName.trim()) return '';
    const clean = brandName.trim().replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '-').toUpperCase();
    return `BR-${clean || 'LABEL'}`;
  };

  const handleNameChange = (val) => {
    setName(val);
    setCode(generateBrandCode(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const finalCode = (code && code.trim()) ? code.trim().toUpperCase() : generateBrandCode(name);
    try {
      await onSubmit({
        buyer_id: buyer.id,
        name: name.trim(),
        code: finalCode,
        description,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Add Brand Label
              </h3>
              <p className="text-xs text-slate-400">
                For Buyer: <strong className="text-blue-400">{buyer.name}</strong>
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
          
          <div>
            <label className="block text-xs font-bold mb-1.5">
              Brand / Label Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Divided, AEO, Zara Man, COS"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold">
                Brand Code <span className="text-slate-400 font-normal text-[10px]">(Auto)</span>
              </label>
              <button
                type="button"
                onClick={() => setCode(generateBrandCode(name))}
                className="text-[10px] text-blue-500 hover:text-blue-600 font-mono font-bold cursor-pointer"
              >
                ⚡ Auto-Generate
              </button>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. BR-AEO"
              className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
              }`}
            />
            {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Fast-fashion young adult division"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
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
              <Plus className="h-4 w-4" />
              <span>{submitting ? 'Adding...' : 'Save Brand'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
