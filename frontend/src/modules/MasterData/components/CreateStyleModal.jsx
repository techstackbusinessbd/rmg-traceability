import React, { useState } from 'react';
import { X, Layers, Plus, Save, Trash2 } from 'lucide-react';

const GARMENT_TYPES = ['SHIRT', 'PANT', 'POLO', 'TEE', 'JACKET', 'DENIM', 'TROUSER', 'OTHER'];

export default function CreateStyleModal({
  show,
  onClose,
  onSubmit,
  buyers = [],
  style = null,
  isDark = true,
  errors = {}
}) {
  const [buyerId, setBuyerId] = useState(style?.buyer_id || buyers[0]?.id || '');
  const [brandId, setBrandId] = useState(style?.brand_id || '');
  const [styleNumber, setStyleNumber] = useState(style?.style_number || '');
  const [styleName, setStyleName] = useState(style?.style_name || '');
  const [garmentType, setGarmentType] = useState(style?.garment_type || 'SHIRT');
  const [season, setSeason] = useState(style?.season || 'SS-2026');
  const [fabricType, setFabricType] = useState(style?.fabric_type || '');
  const [totalSmv, setTotalSmv] = useState(style?.total_smv || 14.50);
  const [isActive, setIsActive] = useState(style ? Boolean(style.is_active) : true);
  
  // Dynamic Initial Operations
  const [operations, setOperations] = useState([
    { sequence_no: 1, operation_name: 'Front Placket Attach', section: 'SEWING', smv: 1.20, machine_type: 'SNLS' },
    { sequence_no: 2, operation_name: 'Back Yoke Join', section: 'SEWING', smv: 1.40, machine_type: 'Feed Off Arm' },
    { sequence_no: 3, operation_name: 'Collar Band Making', section: 'SEWING', smv: 0.90, machine_type: 'SNLS' },
  ]);

  const [submitting, setSubmitting] = useState(false);

  // Available brands for selected buyer
  const availableBrands = React.useMemo(() => {
    const selectedBuyer = buyers.find(b => b.id === buyerId);
    return selectedBuyer?.brands || [];
  }, [buyers, buyerId]);

  React.useEffect(() => {
    if (style) {
      setBuyerId(style.buyer_id);
      setBrandId(style.brand_id || '');
      setStyleNumber(style.style_number || '');
      setStyleName(style.style_name || '');
      setGarmentType(style.garment_type || 'SHIRT');
      setSeason(style.season || 'SS-2026');
      setFabricType(style.fabric_type || '');
      setTotalSmv(style.total_smv || 14.50);
      setIsActive(Boolean(style.is_active));
    } else {
      const firstBuyer = buyers[0]?.id || '';
      setBuyerId(firstBuyer);
      setBrandId('');
      setStyleNumber('');
      setStyleName('');
      setGarmentType('SHIRT');
      setSeason('SS-2026');
      setFabricType('');
      setTotalSmv(14.50);
      setIsActive(true);
    }
  }, [style, show, buyers]);

  if (!show) return null;

  const handleAddOpRow = () => {
    setOperations(prev => [
      ...prev,
      { sequence_no: prev.length + 1, operation_name: '', section: 'SEWING', smv: 1.0, machine_type: 'SNLS' }
    ]);
  };

  const handleRemoveOpRow = (idx) => {
    setOperations(prev => prev.filter((_, i) => i !== idx));
  };

  const handleOpChange = (idx, field, val) => {
    setOperations(prev => {
      const copy = [...prev];
      copy[idx][field] = val;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: style?.id,
        buyer_id: buyerId,
        brand_id: brandId || null,
        style_number: styleNumber,
        style_name: styleName,
        garment_type: garmentType,
        season,
        fabric_type: fabricType,
        total_smv: parseFloat(totalSmv) || 0,
        operations: !style ? operations : undefined,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {style ? 'Edit Garment Style' : 'Create Garment Style & Operation Bulletin'}
              </h3>
              <p className="text-xs text-slate-400">
                Setup style tech specifications, garment category, and operation breakdowns
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Target Buyer <span className="text-red-500">*</span>
              </label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors?.buyer_id && <p className="text-[11px] text-red-500 mt-1">{errors.buyer_id[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Brand Label (Optional)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">No specific brand</option>
                {availableBrands.map(br => (
                  <option key={br.id} value={br.id}>{br.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Style Number / Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={styleNumber}
                onChange={(e) => setStyleNumber(e.target.value)}
                placeholder="e.g. STY-2026-OXFORD-01"
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.style_number && <p className="text-[11px] text-red-500 mt-1">{errors.style_number[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Style Description Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                placeholder="e.g. Men's Oxford Long Sleeve Shirt"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.style_name && <p className="text-[11px] text-red-500 mt-1">{errors.style_name[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Garment Category <span className="text-red-500">*</span>
              </label>
              <select
                value={garmentType}
                onChange={(e) => setGarmentType(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {GARMENT_TYPES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Season
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. SS-2026"
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Total SMV (Minutes)
              </label>
              <input
                type="number"
                step="0.01"
                value={totalSmv}
                onChange={(e) => setTotalSmv(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold text-emerald-500 border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5">
              Fabric Composition & Specs
            </label>
            <input
              type="text"
              value={fabricType}
              onChange={(e) => setFabricType(e.target.value)}
              placeholder="e.g. 100% Cotton Poplin 130 GSM Yarn Dyed"
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Initial Operation Breakdown (Only when creating new style) */}
          {!style && (
            <div className="p-3.5 rounded border border-blue-500/20 bg-blue-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-400">
                  Initial Operation Bulletin Breakdown
                </h4>
                <button
                  type="button"
                  onClick={handleAddOpRow}
                  className="text-[11px] font-bold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  + Add Operation Row
                </button>
              </div>

              <div className="space-y-2">
                {operations.map((op, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-slate-500 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder="Operation Name"
                      value={op.operation_name}
                      onChange={(e) => handleOpChange(idx, 'operation_name', e.target.value)}
                      className={`flex-1 px-2 py-1 rounded text-xs border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <input
                      type="number"
                      step="0.05"
                      placeholder="SMV"
                      value={op.smv}
                      onChange={(e) => handleOpChange(idx, 'smv', parseFloat(e.target.value) || 0)}
                      className={`w-20 px-2 py-1 rounded text-xs font-mono font-bold text-emerald-500 border ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Machine"
                      value={op.machine_type}
                      onChange={(e) => handleOpChange(idx, 'machine_type', e.target.value)}
                      className={`w-32 px-2 py-1 rounded text-xs border ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOpRow(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              {style ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : style ? 'Update Style' : 'Save Garment Style'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
