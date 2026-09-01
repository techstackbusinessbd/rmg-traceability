import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Users, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { CreatePlanModal } from './CreatePlanModal';

const API_BASE = 'http://localhost:8000/api/v1';

export function PlanningDashboard({ isDark = true }) {
  const { token } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLineFilter, setSelectedLineFilter] = useState('');
  const [feedback, setFeedback] = useState(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const [plansRes, ordersRes, linesRes] = await Promise.all([
        axios.get(`${API_BASE}/planning/plans`, config),
        axios.get(`${API_BASE}/orders`, config),
        axios.get(`${API_BASE}/master/lines`, config),
      ]);
      setPlans(plansRes.data.data || []);
      setOrders(ordersRes.data.data || []);
      setLines(linesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load planning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreatePlan = async (planData) => {
    setFormErrors({});
    try {
      await axios.post(`${API_BASE}/planning/plans`, planData, getAuthConfig());
      setShowCreateModal(false);
      fetchData();
      setFeedback({ type: 'success', message: 'Production Plan & Line Allocation scheduled successfully.' });
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Failed to schedule plan.');
      }
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to remove this line schedule plan?')) return;
    try {
      await axios.delete(`${API_BASE}/planning/plans/${planId}`, getAuthConfig());
      fetchData();
      setFeedback({ type: 'success', message: 'Plan removed.' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete plan.');
    }
  };

  const filteredPlans = plans.filter(p => {
    const matchesSearch = !searchQuery || 
      p.order?.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.purchase_order?.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.line?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLine = !selectedLineFilter || p.line_id === selectedLineFilter;
    return matchesSearch && matchesLine;
  });

  const totalPlannedQty = plans.reduce((acc, p) => acc + (Number(p.planned_quantity) || 0), 0);
  const avgHourlyTarget = plans.length > 0 
    ? Math.round(plans.reduce((acc, p) => acc + (Number(p.hourly_target) || 0), 0) / plans.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            IE & Production Planning Schedule
          </h2>
          <p className="text-xs text-slate-400">
            Capacity Math, Line Allocation Gantt & Cutting Policy Governance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Line Plan</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Scheduled Plans</span>
            <Calendar className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono">{plans.length}</div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Total Planned Volume</span>
            <Layers className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {totalPlannedQty.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Pcs</span>
          </div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Avg Line Target</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {avgHourlyTarget} <span className="text-xs text-slate-400 font-normal">Pcs/Hr</span>
          </div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Active Lines</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {new Set(plans.map(p => p.line_id)).size} <span className="text-xs text-slate-400 font-normal">Lines</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={`p-3 rounded border flex flex-col md:flex-row items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Job No, PO No, Line..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={selectedLineFilter}
            onChange={(e) => setSelectedLineFilter(e.target.value)}
            className={`px-3 py-1.5 rounded text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">All Production Lines</option>
            {lines.map(line => (
              <option key={line.id} value={line.id}>{line.code} - {line.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Plans Table */}
      <div className={`rounded border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">Line & Schedule</th>
                <th className="py-3 px-4">Job Order & PO</th>
                <th className="py-3 px-4">Buyer & Style</th>
                <th className="py-3 px-4 text-center">IE Math (Ops × SMV @ Eff%)</th>
                <th className="py-3 px-4 text-right">Hourly Target</th>
                <th className="py-3 px-4 text-right">Planned Qty</th>
                <th className="py-3 px-4 text-center">Cutting Governance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No production plans scheduled yet. Click "Schedule Line Plan" to allocate a line.
                  </td>
                </tr>
              ) : (
                filteredPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-blue-400">{plan.line?.code} - {plan.line?.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <Clock className="h-3 w-3 inline mr-1 text-slate-500" />
                        {plan.start_date} → {plan.end_date}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold font-mono text-slate-200">
                        {plan.order?.order_number}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {plan.purchase_order ? `PO #${plan.purchase_order.po_number}` : 'Full Master Order'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{plan.order?.buyer?.name}</div>
                      <div className="text-[11px] text-slate-400">Style: {plan.order?.style?.style_number}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-slate-300 font-semibold">{plan.manpower} Ops</span>
                      <span className="text-slate-500 mx-1">×</span>
                      <span className="text-slate-300">{plan.smv} SMV</span>
                      <span className="text-slate-500 mx-1">@</span>
                      <span className="text-blue-400 font-bold">{Number(plan.target_efficiency).toFixed(0)}%</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      {plan.hourly_target} <span className="text-[10px] text-slate-500">/hr</span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {Number(plan.planned_quantity).toLocaleString()} <span className="text-[10px] text-slate-500">Pcs</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {plan.cutting_mode === 'INDEPENDENT' ? (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ⚡ Independent
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          🔒 Strict FIFO (Ship Date)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                        {plan.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Plan Modal */}
      <CreatePlanModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePlan}
        orders={orders}
        lines={lines}
        isDark={isDark}
        errors={formErrors}
      />
    </div>
  );
}
