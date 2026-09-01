import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  Grid, 
  Eye, 
  AlertCircle,
  X 
} from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { CreateOrderModal } from './CreateOrderModal';
import { CreatePoModal } from './CreatePoModal';
import { PoExcelImportModal } from './PoExcelImportModal';
import { PoMatrixEditorPage } from '../pages/PoMatrixEditorPage';

const API_BASE = 'http://localhost:8000/api/v1';

export function OrdersDashboard({ isDark = true }) {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuyerFilter, setSelectedBuyerFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [expandedOrders, setExpandedOrders] = useState({});

  // Modals state
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showCreatePo, setShowCreatePo] = useState(false);
  const [selectedOrderForPo, setSelectedOrderForPo] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  
  // Full-page Matrix Editor State
  const [editingPoMatrix, setEditingPoMatrix] = useState(null);

  // Errors & Feedback
  const [formErrors, setFormErrors] = useState({});
  const [actionFeedback, setActionFeedback] = useState(null);

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const [ordersRes, buyersRes, stylesRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`, config),
        axios.get(`${API_BASE}/master/buyers`, config),
        axios.get(`${API_BASE}/master/styles`, config),
      ]);
      setOrders(ordersRes.data.data || []);
      setBuyers(buyersRes.data.data || []);
      setStyles(stylesRes.data.data || []);
    } catch (err) {
      console.error('Failed to load orders or master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // 1. Create Order Handler
  const handleCreateOrder = async (orderData) => {
    setFormErrors({});
    try {
      await axios.post(`${API_BASE}/orders`, orderData, getAuthConfig());
      setShowCreateOrder(false);
      fetchOrders();
      setActionFeedback({ type: 'success', message: 'Job Order master created successfully.' });
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Failed to create order.');
      }
    }
  };

  // 2. Add PO Line Handler
  const handleCreatePo = async (poData) => {
    if (!selectedOrderForPo) return;
    setFormErrors({});
    try {
      await axios.post(`${API_BASE}/orders/${selectedOrderForPo.id}/pos`, poData, getAuthConfig());
      setShowCreatePo(false);
      fetchOrders();
      setActionFeedback({ type: 'success', message: 'Purchase Order line added successfully.' });
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      } else {
        alert(err.response?.data?.message || 'Failed to add PO.');
      }
    }
  };

  // 3. Confirm Order Handler
  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to lock and confirm this order for production scheduling?')) return;
    try {
      await axios.post(`${API_BASE}/orders/${orderId}/confirm`, {}, getAuthConfig());
      fetchOrders();
      setActionFeedback({ type: 'success', message: 'Job Order confirmed and locked for floor execution.' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm order.');
    }
  };

  // 4. Delete Order Handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this Job Order and all its PO lines?')) return;
    try {
      await axios.delete(`${API_BASE}/orders/${orderId}`, getAuthConfig());
      fetchOrders();
      setActionFeedback({ type: 'success', message: 'Job Order removed.' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order.');
    }
  };

  // 5. Excel Import Handlers
  const handleExcelPreview = async (formData) => {
    return await axios.post(`${API_BASE}/orders/import/preview`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleExcelCommit = async (stagingData) => {
    const res = await axios.post(`${API_BASE}/orders/import/commit`, stagingData, getAuthConfig());
    fetchOrders();
    setActionFeedback({ type: 'success', message: res.data?.message || 'Excel PO sheet imported successfully.' });
  };

  // 6. Matrix Editor Handlers
  const handleOpenMatrix = async (po) => {
    try {
      const res = await axios.get(`${API_BASE}/pos/${po.id}/matrix`, getAuthConfig());
      setEditingPoMatrix(res.data.data.purchase_order);
    } catch (err) {
      alert('Failed to load matrix data.');
    }
  };

  const handleSaveMatrix = async (poId, breakdowns) => {
    await axios.put(`${API_BASE}/pos/${poId}/matrix`, { breakdowns }, getAuthConfig());
    fetchOrders();
  };

  // Filter Orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.style?.style_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.purchase_orders?.some(p => p.po_number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBuyer = !selectedBuyerFilter || order.buyer_id === selectedBuyerFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || order.status === selectedStatusFilter;

    return matchesSearch && matchesBuyer && matchesStatus;
  });

  // Calculate High-level KPIs
  const totalOrderCount = orders.length;
  const totalPoCount = orders.reduce((acc, o) => acc + (o.purchase_orders?.length || 0), 0);
  const totalGrossPieces = orders.reduce((acc, o) => acc + (parseInt(o.total_quantity, 10) || 0), 0);
  const totalGrossValueUsd = orders.reduce((acc, o) => acc + (parseFloat(o.total_value) || 0), 0);

  // If in Matrix Editor Mode, show full-page Matrix Editor Workspace
  if (editingPoMatrix) {
    return (
      <PoMatrixEditorPage
        po={editingPoMatrix}
        onBack={() => setEditingPoMatrix(null)}
        onSaveMatrix={handleSaveMatrix}
        isDark={isDark}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded border shadow-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Job Orders</span>
            <div className="p-2 rounded bg-blue-500/10 text-blue-500"><ShoppingBag className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">{totalOrderCount}</p>
          <span className="text-[11px] text-slate-400">Active contracts & jobs</span>
        </div>

        <div className={`p-4 rounded border shadow-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Purchase Orders (POs)</span>
            <div className="p-2 rounded bg-purple-500/10 text-purple-500"><Layers className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-bold font-mono mt-2">{totalPoCount}</p>
          <span className="text-[11px] text-slate-400">Individual delivery lines</span>
        </div>

        <div className={`p-4 rounded border shadow-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Order Volume</span>
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-emerald-400">
            {totalGrossPieces.toLocaleString()} <span className="text-xs text-slate-400 font-normal">Pcs</span>
          </p>
          <span className="text-[11px] text-slate-400">Gross order book pieces</span>
        </div>

        <div className={`p-4 rounded border shadow-xs transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Commercial Value</span>
            <div className="p-2 rounded bg-amber-500/10 text-amber-500"><DollarSign className="h-4 w-4" /></div>
          </div>
          <p className="text-2xl font-bold font-mono mt-2 text-amber-400">
            ${totalGrossValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-400">FOB Contract Total</span>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Filter and Actions Bar */}
      <div className={`p-4 rounded border shadow-xs flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
          {/* Live Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Job No, PO, Buyer, Style..."
              className={`w-full pl-9 pr-3 py-1.5 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Buyer Filter */}
          <select
            value={selectedBuyerFilter}
            onChange={(e) => setSelectedBuyerFilter(e.target.value)}
            className={`px-3 py-1.5 rounded text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="">All Buyers</option>
            {buyers.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className={`px-3 py-1.5 rounded text-xs border ${
              isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="IN_PRODUCTION">IN PRODUCTION</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExcelImport(true)}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel PO Ingest Engine</span>
          </button>

          <button
            onClick={() => setShowCreateOrder(true)}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Job Order</span>
          </button>
        </div>
      </div>

      {/* Orders Master Data Table */}
      <div className={`rounded border overflow-hidden shadow-xs ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className={`text-[11px] font-mono border-b ${
              isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3 font-bold">Job / Order No</th>
                <th className="p-3">Buyer & Brand</th>
                <th className="p-3">Style Reference</th>
                <th className="p-3">Season</th>
                <th className="p-3 text-right font-bold">Gross Qty (Pcs)</th>
                <th className="p-3 text-right">Total Value</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 font-mono">
                    Loading Order Book Data...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-500 font-mono">
                    No matching orders found. Create a new Job Order or import an Excel PO sheet.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isExpanded = !!expandedOrders[order.id];
                  const poList = order.purchase_orders || [];

                  return (
                    <React.Fragment key={order.id}>
                      {/* Master Order Row */}
                      <tr className={`transition-colors hover:bg-slate-800/30 ${
                        isExpanded ? (isDark ? 'bg-slate-800/40' : 'bg-slate-50') : ''
                      }`}>
                        <td className="p-3 text-center cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-blue-400" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                        </td>
                        <td className="p-3 font-mono font-bold text-blue-400 cursor-pointer" onClick={() => toggleExpand(order.id)}>
                          {order.order_number}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">{order.buyer?.name || 'N/A'}</span>
                          {order.brand && <span className="text-[11px] text-slate-400 block">{order.brand.name}</span>}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-200">{order.style?.style_number}</span>
                          <span className="text-[11px] text-slate-400 block">{order.style?.style_name}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-300">{order.season}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">
                          {Number(order.total_quantity).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-amber-400">
                          ${Number(order.total_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            order.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : order.status === 'IN_PRODUCTION'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setSelectedOrderForPo(order);
                                setShowCreatePo(true);
                              }}
                              title="Add Purchase Order (PO)"
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[11px] font-bold border border-blue-500/30 flex items-center space-x-1 cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                              <span>PO</span>
                            </button>

                            {order.status === 'DRAFT' && (
                              <button
                                onClick={() => handleConfirmOrder(order.id)}
                                title="Confirm Order"
                                className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 cursor-pointer"
                              >
                                Confirm
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              title="Delete Order"
                              className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Child POs Accordion Sub-Table */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="9" className={`p-4 ${isDark ? 'bg-slate-950/60' : 'bg-slate-100/60'}`}>
                            <div className="pl-6 space-y-2">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                                  <Layers className="h-3.5 w-3.5 text-blue-400" />
                                  <span>Child Purchase Orders ({poList.length} PO Lines)</span>
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedOrderForPo(order);
                                    setShowCreatePo(true);
                                  }}
                                  className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer"
                                >
                                  + Add PO Line
                                </button>
                              </div>

                              {poList.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No Purchase Orders logged yet.</p>
                              ) : (
                                <div className="rounded border overflow-x-auto border-slate-800/80">
                                  <table className="w-full text-xs text-left border-collapse">
                                    <thead className={`text-[10px] font-mono border-b ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-200 text-slate-600'}`}>
                                      <tr>
                                        <th className="p-2">PO Number</th>
                                        <th className="p-2">Destination Market</th>
                                        <th className="p-2 text-right">Order Qty (Pcs)</th>
                                        <th className="p-2">Ship Date</th>
                                        <th className="p-2 text-right">FOB Price</th>
                                        <th className="p-2 text-right">SMV</th>
                                        <th className="p-2 text-center">Status</th>
                                        <th className="p-2 text-right">Ratio Matrix</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/40 font-mono">
                                      {poList.map((po) => (
                                        <tr key={po.id} className="hover:bg-slate-800/20">
                                          <td className="p-2 font-bold text-blue-400">{po.po_number}</td>
                                          <td className="p-2">{po.destination_market}</td>
                                          <td className="p-2 text-right font-bold text-emerald-400">{Number(po.order_quantity).toLocaleString()}</td>
                                          <td className="p-2 text-slate-300">{po.ship_date}</td>
                                          <td className="p-2 text-right">${Number(po.unit_price).toFixed(2)}</td>
                                          <td className="p-2 text-right">{Number(po.smv).toFixed(2)}</td>
                                          <td className="p-2 text-center">
                                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                                              {po.status}
                                            </span>
                                          </td>
                                          <td className="p-2 text-right">
                                            <button
                                              onClick={() => handleOpenMatrix(po)}
                                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center space-x-1 ml-auto cursor-pointer"
                                            >
                                              <Grid className="h-3 w-3" />
                                              <span>Edit Matrix ({po.breakdowns?.length || 0})</span>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateOrderModal
        show={showCreateOrder}
        onClose={() => setShowCreateOrder(false)}
        onSubmit={handleCreateOrder}
        buyers={buyers}
        styles={styles}
        isDark={isDark}
        errors={formErrors}
      />

      <CreatePoModal
        show={showCreatePo}
        onClose={() => {
          setShowCreatePo(false);
          setSelectedOrderForPo(null);
        }}
        onSubmit={handleCreatePo}
        order={selectedOrderForPo}
        isDark={isDark}
        errors={formErrors}
      />

      <PoExcelImportModal
        show={showExcelImport}
        onClose={() => setShowExcelImport(false)}
        onPreview={handleExcelPreview}
        onCommit={handleExcelCommit}
        buyers={buyers}
        isDark={isDark}
      />
    </div>
  );
}
