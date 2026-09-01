import React, { useState } from 'react';
import { X, FileText, Calendar, DollarSign, Globe, Plus } from 'lucide-react';

export function CreatePoModal({ show, onClose, onSubmit, order, isDark = true, errors = {} }) {
  const [poNumber, setPoNumber] = useState('');
  const [destinationMarket, setDestinationMarket] = useState('USA [USA]');
  const [shipDate, setShipDate] = useState(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [phdDate, setPhdDate] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1000);
  const [unitPrice, setUnitPrice] = useState(15.00);
  const [smv, setSmv] = useState(order?.style?.total_smv || 20.00);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!show || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        po_number: poNumber.trim().toUpperCase(),
        destination_market: destinationMarket.trim(),
        ship_date: shipDate,
        phd_date: phdDate || null,
        order_quantity: parseInt(orderQuantity, 10) || 0,
        unit_price: parseFloat(unitPrice) || 0.00,
        smv: parseFloat(smv) || 0.00,
        notes: notes.trim(),
      });
      setPoNumber('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold">Add Purchase Order (PO) Line</h3>
              <p className="text-[11px] text-slate-400">Order: {order.order_number} ({order.buyer?.name})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">PO Number *</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 1394275"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.po_number && <p className="text-[11px] text-red-500 mt-1">{errors.po_number[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Destination Market</label>
              <input
                type="text"
                value={destinationMarket}
                onChange={(e) => setDestinationMarket(e.target.value.toUpperCase())}
                placeholder="e.g. USA [USA] or WEB [WEB]"
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">Ship Date *</label>
              <input
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.ship_date && <p className="text-[11px] text-red-500 mt-1">{errors.ship_date[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Order Quantity (Pcs) *</label>
              <input
                type="number"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-white border-slate-300 text-emerald-700'
                }`}
              />
              {errors?.order_quantity && <p className="text-[11px] text-red-500 mt-1">{errors.order_quantity[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1">FOB Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Target SMV (Mins)</label>
              <input
                type="number"
                step="0.01"
                value={smv}
                onChange={(e) => setSmv(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Notes / Packing Style</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Solid Color Solid Size (SCSS)"
              className={`w-full px-3 py-2 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

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
              className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
