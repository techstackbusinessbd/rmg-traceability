import React, { useState } from 'react';
import { X, Palette, Ruler, AlertTriangle, Plus } from 'lucide-react';

export function CreateColorModal({ show, onClose, onSubmit, isDark = true, errors = {} }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hexCode, setHexCode] = useState('#1E3A8A');
  const [pantoneRef, setPantoneRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const generateColorCode = (colorName) => {
    if (!colorName || !colorName.trim()) return '';
    const clean = colorName.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = clean.split(/\s+/).filter(Boolean);
    let acronym = '';
    if (words.length === 1) {
      acronym = words[0].slice(0, 4).toUpperCase();
    } else {
      acronym = words.map(w => w[0]).join('').slice(0, 5).toUpperCase();
    }
    return `COL-${acronym || 'SHD'}`;
  };

  const handleNameChange = (val) => {
    setName(val);
    setCode(generateColorCode(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const finalCode = (code && code.trim()) ? code.trim().toUpperCase() : generateColorCode(name);
    try {
      await onSubmit({ 
        name: name.trim(), 
        code: finalCode, 
        hex_code: hexCode, 
        pantone_ref: pantoneRef 
      });
      setName('');
      setCode('');
      setPantoneRef('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold">Add Colorway Shade</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1">Color Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Heather Navy"
              className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold">Color Code *</label>
                <button
                  type="button"
                  onClick={() => setCode(generateColorCode(name))}
                  className="text-[10px] text-blue-500 hover:text-blue-600 font-mono font-bold cursor-pointer"
                >
                  ⚡ Auto
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. COL-HN"
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Hex Swatch</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className="h-7 w-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={hexCode}
                  onChange={(e) => setHexCode(e.target.value)}
                  className={`w-full px-2 py-1.5 rounded text-xs font-mono border ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Pantone Reference</label>
            <input
              type="text"
              value={pantoneRef}
              onChange={(e) => setPantoneRef(e.target.value)}
              placeholder="e.g. 19-4024 TCX"
              className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/20">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-xs border cursor-pointer">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer">
              {submitting ? 'Saving...' : 'Save Color'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateSizeModal({ show, onClose, onSubmit, isDark = true, errors = {} }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('ALPHA');
  const [sortOrder, setSortOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const generateSizeCode = (sizeName) => {
    if (!sizeName || !sizeName.trim()) return '';
    const clean = sizeName.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    return `SZ-${clean}`;
  };

  const handleNameChange = (val) => {
    setName(val);
    setCode(generateSizeCode(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const finalCode = (code && code.trim()) ? code.trim().toUpperCase() : generateSizeCode(name);
    try {
      await onSubmit({ 
        name: name.trim(), 
        code: finalCode, 
        category, 
        sort_order: parseInt(sortOrder, 10) || 1 
      });
      setName('');
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ruler className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-bold">Add Size Scale</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Size Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. XL or 34"
                className={`w-full px-2.5 py-1.5 rounded text-xs font-bold font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold">Size Code *</label>
                <button
                  type="button"
                  onClick={() => setCode(generateSizeCode(name))}
                  className="text-[10px] text-blue-500 hover:text-blue-600 font-mono font-bold cursor-pointer"
                >
                  ⚡ Auto
                </button>
              </div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SZ-XL"
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-50 border-slate-300 text-blue-700'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALPHA">Alpha (S, M, L, XL)</option>
                <option value="NUMERIC">Numeric (28, 30, 32)</option>
                <option value="INSEAM">Inseam (30L, 32L)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/20">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-xs border">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
              {submitting ? 'Saving...' : 'Save Size'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CreateDefectModal({ show, onClose, onSubmit, isDark = true, errors = {} }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [stage, setStage] = useState('SEWING');
  const [severity, setSeverity] = useState('MAJOR');
  const [penaltyPoints, setPenaltyPoints] = useState('3');
  const [submitting, setSubmitting] = useState(false);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ code, name, process_stage: stage, severity, standard_penalty_points: penaltyPoints });
      setCode('');
      setName('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-md rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold">Add Quality Defect Code</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Defect Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. DEF-SEW-07"
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Process Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="CUTTING">Cutting</option>
                <option value="SEWING">SewING</option>
                <option value="FINISHING">Finishing</option>
                <option value="PACKING">Packing</option>
                <option value="FABRIC">Fabric</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Defect Description *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Low Collar Point"
              className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Severity Rating</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="MINOR">Minor</option>
                <option value="MAJOR">Major</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Penalty Points</label>
              <input
                type="number"
                value={penaltyPoints}
                onChange={(e) => setPenaltyPoints(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded text-xs font-mono border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-700/20">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded text-xs border">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold">
              {submitting ? 'Saving...' : 'Save Defect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
