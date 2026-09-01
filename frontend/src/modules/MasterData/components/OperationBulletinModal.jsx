import React, { useState } from 'react';
import { X, ListTree, Plus, Clock, Cpu, Trash2 } from 'lucide-react';

export default function OperationBulletinModal({
  show,
  onClose,
  style = null,
  onAddOperation,
  isDark = true
}) {
  const [sequenceNo, setSequenceNo] = useState(1);
  const [opName, setOpName] = useState('');
  const [opCode, setOpCode] = useState('');
  const [section, setSection] = useState('SEWING');
  const [smv, setSmv] = useState(0.85);
  const [machineType, setMachineType] = useState('Single Needle Lockstitch (SNLS)');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (style && style.operations) {
      setSequenceNo((style.operations.length || 0) + 1);
    }
  }, [style, show]);

  if (!show || !style) return null;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!opName) return;
    setSubmitting(true);
    try {
      await onAddOperation(style.id, {
        sequence_no: parseInt(sequenceNo, 10),
        operation_name: opName,
        operation_code: opCode || null,
        section,
        smv: parseFloat(smv) || 0.5,
        machine_type: machineType
      });
      setOpName('');
      setOpCode('');
      setSequenceNo(prev => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalculatedSmv = style.operations?.reduce((acc, o) => acc + parseFloat(o.smv || 0), 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-3xl rounded border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ListTree className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operation Bulletin (OB) & Machine Routing
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {style.style_number} • {style.style_name}
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Summary Box */}
          <div className={`p-3 rounded border flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <span className="text-slate-400">Total Operations: </span>
              <strong className={isDark ? 'text-white' : 'text-slate-900'}>{style.operations?.length || 0}</strong>
            </div>
            <div>
              <span className="text-slate-400">Target Daily Output: </span>
              <strong className="text-emerald-500 font-mono">1,200 pcs / Line</strong>
            </div>
            <div>
              <span className="text-slate-400">Calculated SMV: </span>
              <strong className="text-emerald-500 font-mono font-bold text-sm">
                {totalCalculatedSmv.toFixed(2)} min
              </strong>
            </div>
          </div>

          {/* Operations Table */}
          <div className="border border-slate-700/30 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className={`text-[10px] uppercase font-mono tracking-wider border-b ${
                isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Operation Name</th>
                  <th className="py-2 px-3">Section</th>
                  <th className="py-2 px-3">Machine Type</th>
                  <th className="py-2 px-3 text-right">SMV</th>
                  <th className="py-2 px-3 text-right">Tgt/Hr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {style.operations && style.operations.length > 0 ? (
                  style.operations.map((op) => (
                    <tr key={op.id || op.sequence_no} className="hover:bg-slate-800/20">
                      <td className="py-2 px-3 font-mono font-bold text-blue-400">{op.sequence_no}</td>
                      <td className="py-2 px-3 font-medium">{op.operation_name}</td>
                      <td className="py-2 px-3">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {op.section}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{op.machine_type}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{op.smv} min</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-400">{op.target_hourly_pcs || 80} pcs</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-slate-500 italic">No operations added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Add Operation Inline Form */}
          <form onSubmit={handleAdd} className={`p-4 rounded border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <h4 className="text-xs font-bold text-blue-400 mb-3 flex items-center space-x-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Operation to Bulletin</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium mb-1">Operation Name</label>
                <input
                  type="text"
                  value={opName}
                  onChange={(e) => setOpName(e.target.value)}
                  placeholder="e.g. Sleeve Armhole Overlock"
                  className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1">SMV (Min)</label>
                <input
                  type="number"
                  step="0.01"
                  value={smv}
                  onChange={(e) => setSmv(e.target.value)}
                  className={`w-full px-2.5 py-1.5 rounded text-xs font-mono font-bold text-emerald-500 border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1">Machine Type</label>
                <input
                  type="text"
                  value={machineType}
                  onChange={(e) => setMachineType(e.target.value)}
                  placeholder="e.g. Overlock 4T"
                  className={`w-full px-2.5 py-1.5 rounded text-xs border ${
                    isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end mt-3">
              <button
                type="submit"
                disabled={submitting || !opName}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Operation'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
