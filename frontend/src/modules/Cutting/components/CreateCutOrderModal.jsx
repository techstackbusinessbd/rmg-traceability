import React, { useState, useEffect } from 'react';
import { X, Scissors, Layers, ShieldCheck, AlertTriangle, Zap, CheckCircle2, QrCode } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';

const API_BASE = 'http://localhost:8000/api/v1';

export function CreateCutOrderModal({
  show,
  onClose,
  onSubmit,
  orders = [],
  isDark = true,
  errors = {}
}) {
  const { token } = useAuthStore();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedPoId, setSelectedPoId] = useState('');
  
  // Policy Check State
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState(null);

  // Lay Chart & Matrix Inputs
  const [colorName, setColorName] = useState('OG KHAKI');
  const [sizeName, setSizeName] = useState('32X30');
  const [totalPlies, setTotalPlies] = useState(50);
  const [markerLength, setMarkerLength] = useState(4.5);
  const [plannedCutQty, setPlannedCutQty] = useState(500);
  const [actualCutQty, setActualCutQty] = useState(500);
  const [pcsPerBundle, setPcsPerBundle] = useState(50);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const poList = selectedOrder?.purchase_orders || [];
  const selectedPo = poList.find(p => p.id === selectedPoId);

  // When PO changes, check Cutting Dependency Policy
  useEffect(() => {
    if (!selectedPoId) {
      setEligibilityResult(null);
      return;
    }

    const checkPolicy = async () => {
      setCheckingEligibility(true);
      try {
        const res = await axios.get(`${API_BASE}/cutting/check-eligibility/${selectedPoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEligibilityResult(res.data.data);
      } catch (err) {
        console.error('Failed to check cutting policy eligibility:', err);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkPolicy();
  }, [selectedPoId, token]);

  // When PO is selected, pick its first breakdown color/size if available
  useEffect(() => {
    if (selectedPo?.breakdowns && selectedPo.breakdowns.length > 0) {
      setColorName(selectedPo.breakdowns[0].color_name);
      setSizeName(selectedPo.breakdowns[0].size_name);
      const targetQty = selectedPo.breakdowns[0].quantity || selectedPo.order_quantity;
      setPlannedCutQty(targetQty);
      setActualCutQty(targetQty);
    }
  }, [selectedPo]);

  if (!show) return null;

  const totalBundles = Math.ceil(Number(actualCutQty) / Math.max(1, Number(pcsPerBundle)));
  const isBlocked = eligibilityResult && !eligibilityResult.allowed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) return;

    setSubmitting(true);
    try {
      await onSubmit({
        purchase_order_id: selectedPoId,
        color_name: colorName,
        size_name: sizeName,
        total_plies: Number(totalPlies),
        marker_length: Number(markerLength),
        planned_cut_qty: Number(plannedCutQty),
        actual_cut_qty: Number(actualCutQty),
        pcs_per_bundle: Number(pcsPerBundle),
        remarks: remarks || null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl rounded border shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Create Cut Order & Lay Plan</h3>
              <p className="text-[11px] text-slate-400">Fabric Lay Chart, Cutting Tolerance & QR Bundle Ticket Generator</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Order & PO Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Job Order Master <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedPoId('');
                }}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">-- Select Job Order --</option>
                {orders.map(order => (
                  <option key={order.id} value={order.id}>
                    {order.order_number} - {order.buyer?.name} ({order.style?.style_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Target Purchase Order (PO) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                disabled={!selectedOrderId || poList.length === 0}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                } disabled:opacity-50`}
              >
                <option value="">-- Select PO Line --</option>
                {poList.map(po => (
                  <option key={po.id} value={po.id}>
                    PO #{po.po_number} (Order: {po.order_quantity} | Cut: {po.cut_quantity} | Ship: {po.ship_date})
                  </option>
                ))}
              </select>
              {errors.purchase_order_id && <p className="text-red-500 text-[11px] mt-1">{errors.purchase_order_id[0]}</p>}
            </div>
          </div>

          {/* Cutting Dependency Policy Banner */}
          {checkingEligibility && (
            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center space-x-2">
              <span className="animate-spin">⏳</span>
              <span>Verifying Planning Team Cutting Policy & Earliest Ship Date FIFO...</span>
            </div>
          )}

          {eligibilityResult && (
            <div className={`p-3 rounded border text-xs flex items-start space-x-2 ${
              eligibilityResult.allowed
                ? eligibilityResult.mode === 'INDEPENDENT'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-red-500/10 border-red-500/40 text-red-400'
            }`}>
              {eligibilityResult.allowed ? (
                eligibilityResult.mode === 'INDEPENDENT' ? (
                  <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                )
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {eligibilityResult.allowed 
                    ? (eligibilityResult.mode === 'INDEPENDENT' ? '⚡ Independent Cutting Allowed' : '✓ Strict FIFO Verified (Earliest Ship Date)')
                    : '⛔ Cutting Policy Restriction (Strict FIFO Enforced)'
                  }
                </div>
                <p className="text-[11px] opacity-90 mt-0.5">{eligibilityResult.message}</p>
              </div>
            </div>
          )}

          {/* Color, Size & Plies */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Fabric Colorway <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
                placeholder="e.g. OG KHAKI"
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Garment Size <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sizeName}
                onChange={(e) => setSizeName(e.target.value)}
                placeholder="e.g. 32X30"
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Total Plies (Layers)
              </label>
              <input
                type="number"
                min="1"
                value={totalPlies}
                onChange={(e) => setTotalPlies(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Cut Quantity & Bundle Partitioning Card */}
          <div className="p-4 rounded border bg-slate-950/40 border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center">
                <QrCode className="h-4 w-4 mr-1 text-emerald-400" />
                Mathematical Bundle & QR Partitioning
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {totalBundles} Bundles ({actualCutQty} Single Pieces)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Planned Cut Qty</label>
                <input
                  type="number"
                  min="1"
                  value={plannedCutQty}
                  onChange={(e) => setPlannedCutQty(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Actual Cut Qty (Pcs)</label>
                <input
                  type="number"
                  min="1"
                  value={actualCutQty}
                  onChange={(e) => setActualCutQty(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold text-emerald-400 border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
                {errors.actual_cut_qty && <p className="text-red-500 text-[10px] mt-0.5">{errors.actual_cut_qty[0]}</p>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Pieces per Bundle</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={pcsPerBundle}
                  onChange={(e) => setPcsPerBundle(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded font-mono">
              💡 System will create <strong>{totalBundles}</strong> unique QR Code Bundle Tickets (numbered 1 to {totalBundles}) and concurrently generate <strong>{actualCutQty}</strong> Single Piece Sub-QRs for individual garment tracking at sewing assembly.
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isBlocked || !selectedPoId}
              className={`px-5 py-2 rounded text-xs font-bold transition-all shadow-sm flex items-center space-x-2 ${
                isBlocked
                  ? 'bg-red-900/50 text-red-300 border border-red-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50'
              }`}
            >
              <Scissors className="h-4 w-4" />
              <span>{submitting ? 'Generating Bundles & QRs...' : '✓ Generate Cut & Bundle QRs'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
