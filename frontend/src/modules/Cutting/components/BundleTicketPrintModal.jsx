import React, { useState } from 'react';
import { X, Printer, QrCode, Layers, Tag, CheckCircle2 } from 'lucide-react';

export function BundleTicketPrintModal({
  show,
  onClose,
  cut = null,
  isDark = true
}) {
  const [activeTab, setActiveTab] = useState('bundle_tickets'); // 'bundle_tickets' or 'single_piece_stickers'

  if (!show || !cut) return null;

  const bundles = cut.bundles || [];
  const po = cut.purchase_order;
  const order = po?.order;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded border shadow-2xl overflow-hidden flex flex-col transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between no-print">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-blue-500/10 text-blue-500">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Print Bundle Tickets & Single Piece QRs</h3>
              <p className="text-[11px] text-slate-400">
                Cut #{cut.cut_number} | PO #{po?.po_number} | {cut.color_name} - {cut.size_name} ({cut.actual_cut_qty} Pcs / {bundles.length} Bundles)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print to Thermal Printer</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="px-6 py-2 border-b bg-slate-950/40 flex items-center space-x-4 text-xs font-bold no-print">
          <button
            onClick={() => setActiveTab('bundle_tickets')}
            className={`py-2 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'bundle_tickets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className="h-4 w-4" />
            <span>Bundle Master Tickets ({bundles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('single_piece_stickers')}
            className={`py-2 border-b-2 transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'single_piece_stickers'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>Single Piece Garment QR Stickers ({cut.actual_cut_qty})</span>
          </button>
        </div>

        {/* Printable Preview Area */}
        <div className="p-6 overflow-y-auto max-h-[70vh] bg-slate-950/60 print:bg-white print:p-0">
          {activeTab === 'bundle_tickets' ? (
            /* Bundle Master Tickets Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
              {bundles.map((bundle) => (
                <div 
                  key={bundle.id}
                  className="p-4 rounded border bg-white text-slate-900 border-slate-300 shadow-xs flex flex-col justify-between font-mono break-inside-avoid print:border-black"
                >
                  <div>
                    {/* Top Header */}
                    <div className="border-b-2 border-black pb-2 mb-2 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">RMG TRACEABILITY TICKET</span>
                        <h4 className="text-lg font-black">{bundle.bundle_code}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                          BUNDLE #{bundle.bundle_number}/{bundles.length}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">JOB ORDER</span>
                        <strong className="text-sm font-black">{order?.order_number || 'ORD-001'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">PO NUMBER</span>
                        <strong className="text-sm font-black text-blue-800">#{po?.po_number}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">BUYER / STYLE</span>
                        <strong>{order?.buyer?.name || 'AEO'} ({order?.style?.style_number || '5481'})</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">CUT NUMBER</span>
                        <strong>{cut.cut_number}</strong>
                      </div>
                    </div>

                    {/* Color & Size Callout */}
                    <div className="p-2 bg-slate-100 border border-slate-300 rounded mb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block">COLORWAY</span>
                        <span className="text-sm font-black">{cut.color_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">GARMENT SIZE</span>
                        <span className="text-lg font-black text-emerald-800">{cut.size_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom QR & Serial Range */}
                  <div className="border-t-2 border-dashed border-slate-300 pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">PIECE SERIAL RANGE</span>
                      <div className="text-base font-black">
                        Pcs {bundle.start_piece_no} - {bundle.end_piece_no}
                      </div>
                      <span className="text-xs font-bold text-slate-700 font-sans">
                        Qty: {bundle.quantity} Pcs
                      </span>
                    </div>

                    {/* Simulated High-Res QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="p-1 bg-white border border-black rounded">
                        <QrCode className="h-14 w-14 text-black" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-500 mt-0.5 truncate max-w-[100px]">
                        {bundle.qr_code_hash?.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Single Piece QR Sticker Sheet */
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 print:grid-cols-6 print:gap-1">
              {bundles.flatMap(b => b.singlePieceQrs || []).slice(0, 120).map((piece, idx) => (
                <div 
                  key={piece.id || idx}
                  className="p-2 rounded border bg-white text-slate-900 border-slate-300 shadow-2xs text-center font-mono break-inside-avoid print:border-black"
                >
                  <div className="text-[9px] font-bold truncate">{order?.order_number}</div>
                  <div className="text-[8px] text-slate-600">PO #{po?.po_number}</div>
                  <div className="p-1 my-1 bg-white border border-black rounded inline-block">
                    <QrCode className="h-10 w-10 text-black mx-auto" />
                  </div>
                  <div className="text-xs font-black">Piece #{piece.piece_number}</div>
                  <div className="text-[9px] font-bold text-emerald-800">{cut.size_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
