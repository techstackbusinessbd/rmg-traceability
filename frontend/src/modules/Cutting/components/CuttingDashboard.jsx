import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Layers, 
  QrCode, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  AlertTriangle,
  Tag
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { CreateCutOrderModal } from './CreateCutOrderModal';
import { BundleTicketPrintModal } from './BundleTicketPrintModal';

const API_BASE = 'http://localhost:8000/api/v1';

export function CuttingDashboard({ isDark = true }) {
  const { token } = useAuthStore();
  const [cuts, setCuts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCutForPrint, setSelectedCutForPrint] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const [cutsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE}/cutting/cuts`, config),
        axios.get(`${API_BASE}/orders`, config),
      ]);
      setCuts(cutsRes.data.data || []);
      setOrders(ordersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load cutting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCreateCut = async (cutData) => {
    setFormErrors({});
    try {
      const res = await axios.post(`${API_BASE}/cutting/cuts`, cutData, getAuthConfig());
      setShowCreateModal(false);
      fetchData();
      setFeedback({ 
        type: 'success', 
        message: res.data?.message || 'Cut Order logged and Bundle Tickets generated.' 
      });
      // Automatically open print modal for convenience
      if (res.data?.data) {
        setSelectedCutForPrint(res.data.data);
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Failed to create cut order.');
      }
    }
  };

  const handleDeleteCut = async (cutId) => {
    if (!window.confirm('Are you sure you want to delete this Cut Order and all associated bundle tickets?')) return;
    try {
      await axios.delete(`${API_BASE}/cutting/cuts/${cutId}`, getAuthConfig());
      fetchData();
      setFeedback({ type: 'success', message: 'Cut Order removed.' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete cut order.');
    }
  };

  const handleOpenPrint = async (cutId) => {
    try {
      const res = await axios.get(`${API_BASE}/cutting/cuts/${cutId}`, getAuthConfig());
      setSelectedCutForPrint(res.data.data);
    } catch (err) {
      alert('Failed to load bundle tickets.');
    }
  };

  const filteredCuts = cuts.filter(c => {
    const matchesSearch = !searchQuery || 
      c.cut_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.purchase_order?.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.color_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.size_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalCutPcs = cuts.reduce((acc, c) => acc + (Number(c.actual_cut_qty) || 0), 0);
  const totalBundlesCount = cuts.reduce((acc, c) => acc + (Number(c.total_bundles) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Cutting Room & Bundle Ticket Generator
          </h2>
          <p className="text-xs text-slate-400">
            Fabric Lay Charts, FIFO Dependency Enforcement & Thermal QR Bundle Tickets
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Scissors className="h-4 w-4" />
            <span>Create Cut Order (Lay Plan)</span>
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
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Cut Orders Logged</span>
            <Scissors className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono">{cuts.length}</div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Total Pieces Cut</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">
            {totalCutPcs.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Pcs</span>
          </div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Total QR Bundles</span>
            <Tag className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {totalBundlesCount} <span className="text-xs text-slate-400 font-normal">Bundles</span>
          </div>
        </div>

        <div className={`p-4 rounded border ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Single Piece QRs</span>
            <QrCode className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            {totalCutPcs.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Sub-QRs</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className={`p-3 rounded border flex items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Cut No, PO No, Color, Size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Cut Orders Table */}
      <div className={`rounded border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] uppercase font-mono tracking-wider ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-4">Cut Number</th>
                <th className="py-3 px-4">Job Order & PO</th>
                <th className="py-3 px-4">Colorway & Size</th>
                <th className="py-3 px-4 text-center">Plies & Marker</th>
                <th className="py-3 px-4 text-right">Cut Quantity</th>
                <th className="py-3 px-4 text-center">Bundles & Pcs/Bnd</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredCuts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No cut orders recorded yet. Click "Create Cut Order (Lay Plan)" to start fabric spreading.
                  </td>
                </tr>
              ) : (
                filteredCuts.map(cut => (
                  <tr key={cut.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-black text-emerald-400 flex items-center space-x-1.5">
                        <Scissors className="h-3.5 w-3.5" />
                        <span>{cut.cut_number}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(cut.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold font-mono text-slate-200">
                        {cut.purchase_order?.order?.order_number}
                      </div>
                      <div className="text-[11px] font-mono text-blue-400 font-semibold">
                        PO #{cut.purchase_order?.po_number}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{cut.color_name}</div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold">{cut.size_name}</div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-[11px]">
                      <div>{cut.total_plies} Plies</div>
                      <div className="text-slate-500">{cut.marker_length} yds</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {Number(cut.actual_cut_qty).toLocaleString()} <span className="text-[10px] text-slate-500">Pcs</span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="font-bold text-purple-400">{cut.total_bundles} Bundles</span>
                      <div className="text-[10px] text-slate-500">({cut.pcs_per_bundle} Pcs/Bnd)</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        ✓ {cut.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenPrint(cut.id)}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-mono text-[11px] font-bold transition-colors cursor-pointer"
                          title="Print Bundle Tickets & Single Piece QRs"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          <span>Print Tickets</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCut(cut.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Cut Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Cut Order Modal */}
      <CreateCutOrderModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateCut}
        orders={orders}
        isDark={isDark}
        errors={formErrors}
      />

      {/* Thermal Bundle Ticket Print Modal */}
      <BundleTicketPrintModal
        show={Boolean(selectedCutForPrint)}
        onClose={() => setSelectedCutForPrint(null)}
        cut={selectedCutForPrint}
        isDark={isDark}
      />
    </div>
  );
}
