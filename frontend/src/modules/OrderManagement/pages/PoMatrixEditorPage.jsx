import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, CheckCircle2, AlertTriangle, RefreshCw, Layers, Plus, Trash2 } from 'lucide-react';

export function PoMatrixEditorPage({ 
  po, 
  onBack, 
  onSaveMatrix, 
  masterColors = [], 
  masterSizes = [], 
  isDark = true 
}) {
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [grid, setGrid] = useState({}); // key: `${color}_${size}` => qty
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Initialize matrix from PO breakdowns
  useEffect(() => {
    if (!po) return;

    const detectedColors = new Set();
    const detectedSizes = new Set();
    const initialGrid = {};

    if (po.breakdowns && po.breakdowns.length > 0) {
      po.breakdowns.forEach(b => {
        const c = b.color_name || 'DEFAULT';
        const s = b.size_name || 'FREE';
        detectedColors.add(c);
        detectedSizes.add(s);
        initialGrid[`${c}_${s}`] = b.quantity;
      });
    } else {
      // Default fallbacks if empty
      detectedColors.add('OG KHAKI');
      ['28X30', '30X30', '32X30', '34X30', '36X30'].forEach(s => detectedSizes.add(s));
    }

    setColors(Array.from(detectedColors));
    setSizes(Array.from(detectedSizes));
    setGrid(initialGrid);
  }, [po]);

  // Calculate row total
  const getRowTotal = (color) => {
    return sizes.reduce((acc, s) => acc + (parseInt(grid[`${color}_${s}`], 10) || 0), 0);
  };

  // Calculate column total
  const getColTotal = (size) => {
    return colors.reduce((acc, c) => acc + (parseInt(grid[`${c}_${size}`], 10) || 0), 0);
  };

  // Calculate grand matrix total
  const grandMatrixTotal = colors.reduce((acc, c) => acc + getRowTotal(c), 0);
  const targetPoTotal = parseInt(po?.order_quantity, 10) || 0;
  const isMatch = grandMatrixTotal === targetPoTotal;
  const diff = grandMatrixTotal - targetPoTotal;

  const handleCellChange = (color, size, val) => {
    const num = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setGrid(prev => ({
      ...prev,
      [`${color}_${size}`]: num,
    }));
    setFeedback(null);
  };

  const handleAddColor = () => {
    const newColor = prompt('Enter new Color Name (e.g. DARK INDIGO):');
    if (newColor && newColor.trim()) {
      const clean = newColor.trim().toUpperCase();
      if (!colors.includes(clean)) {
        setColors([...colors, clean]);
      }
    }
  };

  const handleAddSize = () => {
    const newSize = prompt('Enter new Size Scale (e.g. 38X32 or XXL):');
    if (newSize && newSize.trim()) {
      const clean = newSize.trim().toUpperCase();
      if (!sizes.includes(clean)) {
        setSizes([...sizes, clean]);
      }
    }
  };

  const handleSave = async () => {
    if (!isMatch && targetPoTotal > 0) {
      setFeedback({
        type: 'error',
        message: `Golden Rule Validation Mismatch: Matrix Total (${grandMatrixTotal.toLocaleString()} Pcs) must equal PO Target (${targetPoTotal.toLocaleString()} Pcs).`,
      });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const payload = [];
      colors.forEach(c => {
        sizes.forEach(s => {
          const q = parseInt(grid[`${c}_${s}`], 10) || 0;
          if (q > 0) {
            payload.push({
              color_name: c,
              size_name: s,
              quantity: q,
            });
          }
        });
      });

      await onSaveMatrix(po.id, payload);
      setFeedback({
        type: 'success',
        message: 'Color-Size matrix ratio updated and saved successfully.',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to save matrix.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className={`p-2 rounded border transition-colors cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold">Color-Size Ratio Matrix Editor</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-400">
                PO #{po?.po_number}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Order: <span className="font-bold text-slate-300">{po?.order?.order_number}</span> | 
              Buyer: <span className="font-bold text-slate-300">{po?.order?.buyer?.name}</span> | 
              Destination: <span className="font-bold text-slate-300">{po?.destination_market}</span>
            </p>
          </div>
        </div>

        {/* Live Mathematical Reconciler Status Widget */}
        <div className="flex items-center space-x-4">
          <div className={`px-4 py-2 rounded border flex items-center space-x-3 ${
            isMatch
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {isMatch ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider">
                {isMatch ? 'Math Reconciled (100%)' : `Mismatch: ${diff > 0 ? `+${diff}` : diff} Pcs`}
              </div>
              <div className="text-sm font-mono font-bold">
                Matrix: {grandMatrixTotal.toLocaleString()} / Target: {targetPoTotal.toLocaleString()} Pcs
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || (!isMatch && targetPoTotal > 0)}
            className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Reconciling...' : 'Save & Lock Ratio Matrix'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded text-xs flex items-center space-x-2 border animate-in fade-in duration-150 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grid Controls Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddColor}
            className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center space-x-1 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-blue-400" />
            <span>Add Color Row</span>
          </button>

          <button
            onClick={handleAddSize}
            className={`px-3 py-1.5 rounded text-xs font-bold border flex items-center space-x-1 cursor-pointer ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>Add Size Column</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          💡 Tip: Type values in cells to calculate cutting ratio bundles.
        </p>
      </div>

      {/* The 2D SpreadSheet Matrix Grid */}
      <div className={`rounded border overflow-x-auto shadow-xl ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-xs text-left border-collapse font-mono">
          {/* Header row with Size Scales */}
          <thead>
            <tr className={`border-b ${isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              <th className="p-3 font-bold sticky left-0 z-10 bg-inherit border-r border-slate-800/40 min-w-[180px]">
                Colorway Shade \ Size
              </th>
              {sizes.map((size) => (
                <th key={size} className="p-2.5 text-center font-bold min-w-[70px] border-r border-slate-800/20">
                  {size}
                </th>
              ))}
              <th className="p-3 text-right font-bold bg-blue-500/10 text-blue-400 min-w-[100px]">
                Color Total
              </th>
            </tr>
          </thead>

          {/* Body with Color Rows */}
          <tbody className="divide-y divide-slate-800/30">
            {colors.map((color) => {
              const rowTotal = getRowTotal(color);
              return (
                <tr key={color} className="hover:bg-slate-800/20">
                  <td className="p-3 font-bold sticky left-0 z-10 bg-inherit border-r border-slate-800/40 text-blue-400">
                    {color}
                  </td>
                  {sizes.map((size) => {
                    const cellVal = grid[`${color}_${size}`] ?? '';
                    return (
                      <td key={size} className="p-1 border-r border-slate-800/20 text-center">
                        <input
                          type="number"
                          min="0"
                          value={cellVal}
                          onChange={(e) => handleCellChange(color, size, e.target.value)}
                          placeholder="0"
                          className={`w-full py-1 px-1 text-center font-mono text-xs rounded border transition-all focus:ring-1 focus:ring-blue-500 ${
                            parseInt(cellVal, 10) > 0
                              ? isDark ? 'bg-blue-950/40 border-blue-600/50 text-blue-200 font-bold' : 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                              : isDark ? 'bg-slate-950/60 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="p-3 text-right font-bold text-emerald-400 bg-blue-500/5">
                    {rowTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {/* Bottom Column Sum Row */}
            <tr className={`font-bold border-t-2 ${
              isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <td className="p-3 sticky left-0 z-10 bg-inherit border-r border-slate-800/40 text-slate-400">
                Size Total (Pcs)
              </td>
              {sizes.map((size) => {
                const colTotal = getColTotal(size);
                return (
                  <td key={size} className="p-2.5 text-center border-r border-slate-800/20 text-emerald-400">
                    {colTotal.toLocaleString()}
                  </td>
                );
              })}
              <td className="p-3 text-right font-black text-sm bg-blue-600/20 text-blue-300">
                {grandMatrixTotal.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
