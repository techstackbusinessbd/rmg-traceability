import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Zap, ShieldCheck, AlertTriangle, Layers, Clock, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';

const API_BASE = 'http://localhost:8000/api/v1';

export function CreatePlanModal({
  show,
  onClose,
  onSubmit,
  orders = [],
  lines = [],
  isDark = true,
  errors = {}
}) {
  const { token } = useAuthStore();
  const [orderId, setOrderId] = useState('');
  const [purchaseOrderId, setPurchaseOrderId] = useState('');
  const [lineId, setLineId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]);
  
  // IE Target Math Fields
  const [smv, setSmv] = useState(20.00);
  const [manpower, setManpower] = useState(30);
  const [targetEff, setTargetEff] = useState(60.00);
  const [hourlyTarget, setHourlyTarget] = useState(72);
  const [plannedQty, setPlannedQty] = useState(1000);

  // Cutting Governance Policy
  const [cuttingMode, setCuttingMode] = useState('DEPENDENT');
  const [materialReady, setMaterialReady] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = orders.find(o => o.id === orderId);
  const poList = selectedOrder?.purchase_orders || [];

  // Recalculate Hourly Target Math in Real-Time
  useEffect(() => {
    const numManpower = Number(manpower) || 0;
    const numSmv = Number(smv) || 1;
    const numEff = Number(targetEff) || 0;

    if (numSmv > 0 && numManpower > 0) {
      const calculated = Math.round(((numManpower * 60) / numSmv) * (numEff / 100));
      setHourlyTarget(Math.max(1, calculated));
    }
  }, [smv, manpower, targetEff]);

  // When PO or Order changes, auto-populate SMV and Planned Qty
  useEffect(() => {
    if (purchaseOrderId) {
      const po = poList.find(p => p.id === purchaseOrderId);
      if (po) {
        if (po.smv) setSmv(Number(po.smv));
        if (po.order_quantity) setPlannedQty(Number(po.order_quantity));
      }
    } else if (selectedOrder) {
      if (selectedOrder.style?.total_smv) setSmv(Number(selectedOrder.style.total_smv));
      if (selectedOrder.total_quantity) setPlannedQty(Number(selectedOrder.total_quantity));
    }
  }, [purchaseOrderId, orderId]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        order_id: orderId,
        purchase_order_id: purchaseOrderId || null,
        line_id: lineId,
        start_date: startDate,
        end_date: endDate,
        smv: Number(smv),
        manpower: Number(manpower),
        target_efficiency: Number(targetEff),
        hourly_target: Number(hourlyTarget),
        planned_quantity: Number(plannedQty),
        cutting_mode: cuttingMode,
        material_ready: materialReady,
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
            <div className="p-2 rounded bg-blue-500/10 text-blue-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Schedule Production Plan</h3>
              <p className="text-[11px] text-slate-400">IE Line Allocation, Target DHU Math & Cutting Governance</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Order & PO Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Job Order Master <span className="text-red-500">*</span>
              </label>
              <select
                value={orderId}
                onChange={(e) => {
                  setOrderId(e.target.value);
                  setPurchaseOrderId('');
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
              {errors.order_id && <p className="text-red-500 text-[11px] mt-1">{errors.order_id[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Child PO Line (Optional)
              </label>
              <select
                value={purchaseOrderId}
                onChange={(e) => setPurchaseOrderId(e.target.value)}
                disabled={!orderId || poList.length === 0}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                } disabled:opacity-50`}
              >
                <option value="">-- All POs in Job Order --</option>
                {poList.map(po => (
                  <option key={po.id} value={po.id}>
                    PO #{po.po_number} - {po.order_quantity} Pcs (Ship: {po.ship_date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Line & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Sewing Line <span className="text-red-500">*</span>
              </label>
              <select
                value={lineId}
                onChange={(e) => setLineId(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="">-- Select Sewing Line --</option>
                {lines.map(line => (
                  <option key={line.id} value={line.id}>
                    {line.code} - {line.name} (Cap: {line.hourly_target}/hr)
                  </option>
                ))}
              </select>
              {errors.line_id && <p className="text-red-500 text-[11px] mt-1">{errors.line_id[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors.start_date && <p className="text-red-500 text-[11px] mt-1">{errors.start_date[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 uppercase tracking-wider">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors.end_date && <p className="text-red-500 text-[11px] mt-1">{errors.end_date[0]}</p>}
            </div>
          </div>

          {/* IE Capacity & Target Math Formula Card */}
          <div className="p-4 rounded border bg-blue-500/5 border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                IE Capacity & Hourly Target Math: ((Manpower × 60) ÷ SMV) × (Eff % ÷ 100)
              </span>
              <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                Target: {hourlyTarget} Pcs/Hr
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Manpower (Ops)</label>
                <input
                  type="number"
                  min="1"
                  max="150"
                  value={manpower}
                  onChange={(e) => setManpower(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Garment SMV</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={smv}
                  onChange={(e) => setSmv(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Target Efficiency %</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="120"
                  value={targetEff}
                  onChange={(e) => setTargetEff(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-mono">Planned Total Qty</label>
                <input
                  type="number"
                  min="1"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Cutting Execution Governance Selector */}
          <div className="p-4 rounded border bg-slate-950/40 border-slate-800 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Cutting Execution Governance Policy</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">(Planning Authority Gate)</span>
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className={`p-3 rounded border cursor-pointer transition-all flex items-start space-x-3 ${
                cuttingMode === 'DEPENDENT'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="cutting_mode"
                  value="DEPENDENT"
                  checked={cuttingMode === 'DEPENDENT'}
                  onChange={() => setCuttingMode('DEPENDENT')}
                  className="mt-0.5 text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold flex items-center">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-400 mr-1" />
                    Dependent Mode (Strict FIFO)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enforces Earliest PO Ship Date. Cutting room is blocked from cutting future POs before earlier ones.
                  </p>
                </div>
              </label>

              <label className={`p-3 rounded border cursor-pointer transition-all flex items-start space-x-3 ${
                cuttingMode === 'INDEPENDENT'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}>
                <input
                  type="radio"
                  name="cutting_mode"
                  value="INDEPENDENT"
                  checked={cuttingMode === 'INDEPENDENT'}
                  onChange={() => setCuttingMode('INDEPENDENT')}
                  className="mt-0.5 text-emerald-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-bold flex items-center text-emerald-400">
                    <Zap className="h-3.5 w-3.5 mr-1" />
                    Independent Mode (Flexible)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Planning grants override. Cutting room can cut any PO regardless of PO ship dates.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer Buttons */}
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
              disabled={submitting}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Allocating Line...' : '✓ Confirm & Allocate Line'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
