import React, { useState } from 'react';
import { X, Layers, Plus, Save } from 'lucide-react';

const PROCESS_TYPES = ['CUTTING', 'SEWING', 'FINISHING', 'PACKING', 'QC', 'STORE', 'OTHER'];

export default function CreateFloorModal({
  show,
  onClose,
  onSubmit,
  units = [],
  floor = null,
  isDark = true,
  errors = {}
}) {
  const [unitId, setUnitId] = useState(floor?.unit_id || units[0]?.id || '');
  const [name, setName] = useState(floor?.name || '');
  const [code, setCode] = useState(floor?.code || '');
  const [processType, setProcessType] = useState(floor?.process_type || 'SEWING');
  const [sequenceOrder, setSequenceOrder] = useState(floor?.sequence_order || 1);
  const [isActive, setIsActive] = useState(floor ? Boolean(floor.is_active) : true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (floor) {
      setUnitId(floor.unit_id);
      setName(floor.name || '');
      setCode(floor.code || '');
      setProcessType(floor.process_type || 'SEWING');
      setSequenceOrder(floor.sequence_order || 1);
      setIsActive(Boolean(floor.is_active));
    } else {
      setUnitId(units[0]?.id || '');
      setName('');
      setCode('');
      setProcessType('SEWING');
      setSequenceOrder(1);
      setIsActive(true);
    }
  }, [floor, show, units]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        id: floor?.id,
        unit_id: unitId,
        name,
        code: code ? code.toUpperCase().trim() : null,
        process_type: processType,
        sequence_order: parseInt(sequenceOrder, 10) || 1,
        is_active: isActive
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-lg rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {floor ? 'Edit Factory Floor' : 'Add Factory Floor'}
              </h3>
              <p className="text-xs text-slate-400">
                Map production floor and core manufacturing department
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-bold mb-1.5">
              Manufacturing Unit <span className="text-red-500">*</span>
            </label>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
              ))}
            </select>
            {errors?.unit_id && <p className="text-[11px] text-red-500 mt-1">{errors.unit_id[0]}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Floor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 10th Floor or Sewing A"
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              {errors?.name && <p className="text-[11px] text-red-500 mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Floor Code <span className="text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Auto (e.g. FL-01)"
                className={`w-full px-3 py-2 rounded text-xs font-mono font-bold border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-blue-400 placeholder-slate-500' : 'bg-white border-slate-300 text-blue-600 placeholder-slate-400'
                }`}
              />
              {errors?.code && <p className="text-[11px] text-red-500 mt-1">{errors.code[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Process Department <span className="text-red-500">*</span>
              </label>
              <select
                value={processType}
                onChange={(e) => setProcessType(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {PROCESS_TYPES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                Sequence Order
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={sequenceOrder}
                onChange={(e) => setSequenceOrder(e.target.value)}
                className={`w-full px-3 py-2 rounded text-xs font-mono border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-0 border-slate-700 bg-slate-950 cursor-pointer"
            />
            <span>Active Production Floor</span>
          </label>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-700/30">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {floor ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{submitting ? 'Saving...' : floor ? 'Update Floor' : 'Save Floor'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
