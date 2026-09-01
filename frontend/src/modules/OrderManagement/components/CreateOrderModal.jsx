import React, { useState } from 'react';
import { X, ShoppingBag, AlertCircle, Plus, Calendar, DollarSign, Layers } from 'lucide-react';

export function CreateOrderModal({ 
  show, 
  onClose, 
  onSubmit, 
  buyers = [], 
  styles = [], 
  companies = [], 
  units = [], 
  isDark = true, 
  errors = {} 
}) {
  const [orderNumber, setOrderNumber] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [season, setSeason] = useState('SPRING-2027');
  const [merchantName, setMerchantName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  // Filter brands based on selected buyer
  const selectedBuyer = buyers.find(b => b.id === buyerId);
  const availableBrands = selectedBuyer?.brands || [];

  // Filter styles based on selected buyer
  const availableStyles = styles.filter(s => !buyerId || s.buyer_id === buyerId);

  const handleBuyerChange = (bId) => {
    setBuyerId(bId);
    setBrandId('');
    setStyleId('');
    if (!orderNumber) {
      const b = buyers.find(x => x.id === bId);
      const code = b ? b.code.replace('BUY-', '') : 'ORD';
      setOrderNumber(`${code}-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        order_number: orderNumber.trim(),
        buyer_id: buyerId,
        brand_id: brandId || null,
        style_id: styleId,
        company_id: companyId || null,
        unit_id: unitId || null,
        season,
        merchant_name: merchantName.trim(),
        currency,
        remarks: remarks.trim(),
      });
      setOrderNumber('');
      setBuyerId('');
      setBrandId('');
      setStyleId('');
      setRemarks('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-500">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Create Job Order Master Contract</h3>
              <p className="text-[11px] text-slate-400">Register new buyer contract, season, and master style mapping</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Job / Order Number *</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. ITS-26-00391"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.order_number && <p className="text-[11px] text-red-500 mt-1">{errors.order_number[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Buyer *</label>
              <select
                value={buyerId}
                onChange={(e) => handleBuyerChange(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">-- Select Buyer --</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors?.buyer_id && <p className="text-[11px] text-red-500 mt-1">{errors.buyer_id[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Brand / Label (Optional)</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                disabled={!buyerId || availableBrands.length === 0}
                className={`w-full px-3 py-2 rounded text-xs border disabled:opacity-50 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">{buyerId ? '-- Select Brand --' : '(Select Buyer First)'}</option>
                {availableBrands.map(br => (
                  <option key={br.id} value={br.id}>{br.name} ({br.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Garment Style *</label>
              <select
                value={styleId}
                onChange={(e) => setStyleId(e.target.value)}
                disabled={!buyerId}
                className={`w-full px-3 py-2 rounded text-xs border disabled:opacity-50 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">{buyerId ? '-- Select Style --' : '(Select Buyer First)'}</option>
                {availableStyles.map(st => (
                  <option key={st.id} value={st.id}>{st.style_number} - {st.style_name} ({st.garment_type})</option>
                ))}
              </select>
              {errors?.style_id && <p className="text-[11px] text-red-500 mt-1">{errors.style_id[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Season</label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value.toUpperCase())}
                placeholder="e.g. SPRING-2027"
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Merchant / Contact</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Golam Mostofa"
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Contract Remarks & Special Instructions</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              placeholder="e.g. Target packing ratio 24 pcs/carton, FOB Chittagong"
              className={`w-full px-3 py-2 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-medium border border-slate-700 hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Order...' : 'Create Job Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
