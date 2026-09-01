import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, Database, Sparkles, Layers } from 'lucide-react';

export function PoExcelImportModal({ 
  show, 
  onClose, 
  onPreview, 
  onCommit, 
  buyers = [], 
  isDark = true 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [stagingData, setStagingData] = useState(null);
  const [autoCreateMissing, setAutoCreateMissing] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!show) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handlePreviewUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedBuyerId) formData.append('buyer_id', selectedBuyerId);

      const res = await onPreview(formData);
      const stagingPayload = res?.data?.data || res?.data;
      if (stagingPayload && stagingPayload.order_summary) {
        setStagingData(stagingPayload);
      } else {
        setErrorMsg('Invalid response format from server.');
      }
    } catch (err) {
      const serverErr = err?.response?.data?.errors?.excel_file?.[0] || err?.response?.data?.message;
      setErrorMsg(serverErr || 'Failed to parse Excel sheet. Ensure file is valid XLSX.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitOrder = async () => {
    if (!stagingData) return;

    setCommitting(true);
    setErrorMsg(null);
    try {
      await onCommit({
        ...stagingData,
        auto_create_missing: autoCreateMissing,
      });
      setStagingData(null);
      setSelectedFile(null);
      onClose();
    } catch (err) {
      const serverErr = err?.response?.data?.errors?.['order_summary.job_number']?.[0]
        || err?.response?.data?.errors?.job_number?.[0]
        || err?.response?.data?.errors?.order_summary?.[0]
        || err?.response?.data?.message
        || 'Failed to commit staging order to database.';
      setErrorMsg(serverErr);
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded border shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Enterprise Buyer PO Excel Ingestion Engine</h3>
              <p className="text-[11px] text-slate-400">Intelligent auto-parser for AEO Matrix, H&M Flat, and custom buyer PO sheets</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!stagingData ? (
            /* Upload Screen */
            <form onSubmit={handlePreviewUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Target Buyer (Optional - Auto-Detect Available)</label>
                  <select
                    value={selectedBuyerId}
                    onChange={(e) => setSelectedBuyerId(e.target.value)}
                    className={`w-full px-3 py-2 rounded text-xs border ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">⚡ Auto-Detect from Excel Header</option>
                    {buyers.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Parser Strategy</label>
                  <div className={`px-3 py-2 rounded text-xs border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    AEO_MATRIX_GRID_V1 & FLAT_TABULAR_AUTO
                  </div>
                </div>
              </div>

              {/* Drag & Drop Box */}
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDark ? 'border-slate-700 hover:border-blue-500 bg-slate-950/50' : 'border-slate-300 hover:border-blue-500 bg-slate-50'
              }`}>
                <input
                  type="file"
                  id="excel-po-upload"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="excel-po-upload" className="cursor-pointer block">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-blue-400 animate-bounce" />
                  <p className="text-sm font-bold">Click to choose Excel sheet or Drag & Drop here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports standard .XLSX files (e.g. AEO PO.xlsx)</p>
                  {selectedFile && (
                    <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 rounded bg-blue-600/20 text-blue-400 text-xs font-mono font-bold border border-blue-500/30">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="px-6 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Parsing Excel Sheet...' : 'Parse & Preview Staging Data'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Staging Preview Screen */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Top Summary Banner */}
              <div className="grid grid-cols-4 gap-3 p-4 rounded bg-blue-500/10 border border-blue-500/20">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Job Order</span>
                  <p className="text-sm font-bold font-mono text-blue-400">{stagingData.order_summary.job_number}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Buyer & Brand</span>
                  <p className="text-sm font-bold">{stagingData.order_summary.buyer_name} ({stagingData.order_summary.brand_name})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Total Job Qty</span>
                  <p className="text-sm font-bold font-mono text-emerald-400">
                    {Number(stagingData.order_summary.total_calculated_quantity).toLocaleString()} Pcs
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Est. Contract Value</span>
                  <p className="text-sm font-bold font-mono text-amber-400">
                    ${Number(stagingData.order_summary.total_estimated_value).toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
                  </p>
                </div>
              </div>

              {/* Master Data Reconciliation Audit Card */}
              <div className={`p-4 rounded border ${
                stagingData.reconciliation_audit.ready_for_direct_commit
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-amber-500/5 border-amber-500/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold">Master Data Cross-Check Audit</h4>
                  </div>
                  <label className="flex items-center space-x-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCreateMissing}
                      onChange={(e) => setAutoCreateMissing(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span className="font-semibold text-blue-400">⚡ Auto-Create Missing Master Attributes</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded font-mono ${
                    stagingData.reconciliation_audit.buyer_found ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    Buyer: {stagingData.reconciliation_audit.buyer_found ? '✓ Matched' : '+ Will Auto-Create'}
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono ${
                    stagingData.reconciliation_audit.style_found ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    Style Ref: {stagingData.order_summary.style_reference} ({stagingData.reconciliation_audit.style_found ? '✓ Matched' : '+ Will Auto-Create'})
                  </span>
                  <span className="px-2 py-0.5 rounded font-mono bg-blue-500/20 text-blue-400">
                    Sizes: {stagingData.size_scale_headers.length} Distinct Sizes Found
                  </span>
                  {stagingData.reconciliation_audit.order_already_exists && (
                    <span className="px-2 py-0.5 rounded font-mono bg-red-500/20 text-red-400 font-bold flex items-center space-x-1">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      Job #{stagingData.order_summary.job_number} Already Exists in Database
                    </span>
                  )}
                </div>
              </div>

              {/* Parsed POs Table Preview */}
              <div>
                <h4 className="text-xs font-bold mb-2 flex items-center justify-between">
                  <span>Detected Purchase Order Lines ({stagingData.purchase_orders.length} POs)</span>
                  <span className="text-[11px] text-slate-400">Season: {stagingData.order_summary.season}</span>
                </h4>
                <div className="rounded border overflow-x-auto border-slate-800">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className={`text-[11px] font-mono border-b ${isDark ? 'bg-slate-950 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">PO Number</th>
                        <th className="p-2">Color</th>
                        <th className="p-2">Destination</th>
                        <th className="p-2 text-right">Order Qty (Pcs)</th>
                        <th className="p-2">Ship Date</th>
                        <th className="p-2 text-right">FOB Price</th>
                        <th className="p-2 text-center">Matrix Sizes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 font-mono">
                      {stagingData.purchase_orders.map((po, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="p-2 text-slate-400">{idx + 1}</td>
                          <td className="p-2 font-bold text-blue-400">{po.po_number}</td>
                          <td className="p-2">{po.color_name}</td>
                          <td className="p-2">{po.destination_market}</td>
                          <td className="p-2 text-right font-bold text-emerald-400">{Number(po.order_quantity).toLocaleString()}</td>
                          <td className="p-2 text-slate-300">{po.ship_date}</td>
                          <td className="p-2 text-right">${Number(po.unit_price).toFixed(2)}</td>
                          <td className="p-2 text-center text-slate-400">{po.breakdowns?.length || 0} items</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/20">
                <button
                  type="button"
                  onClick={() => setStagingData(null)}
                  className="px-4 py-2 rounded text-xs font-medium border border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  ← Re-Upload Different File
                </button>

                <button
                  type="button"
                  onClick={handleCommitOrder}
                  disabled={committing}
                  className="px-6 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{committing ? 'Committing to Production...' : '1-Click Commit to Live Production Order'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
