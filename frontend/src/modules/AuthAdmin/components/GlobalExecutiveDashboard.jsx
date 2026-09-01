import React from 'react';
import { 
  Building2, 
  Users, 
  Scissors, 
  ShieldCheck, 
  Activity, 
  History, 
  SlidersHorizontal, 
  Layers, 
  FileSpreadsheet, 
  CheckCircle, 
  Droplets, 
  PackageCheck, 
  Warehouse, 
  BarChart3, 
  Plus, 
  ArrowRight, 
  KeyRound, 
  Smartphone, 
  Clock, 
  Globe, 
  Server
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useThemeStore } from '../../../store/themeStore';

export default function GlobalExecutiveDashboard({
  usersCount = 0,
  devicesCount = 0,
  rolesCount = 0,
  shiftsCount = 0,
  auditLogs = [],
  companies = [],
  units = [],
  floors = [],
  lines = [],
  buyers = [],
  styles = [],
  onNavigateTab,
  onOpenCreateUser,
  onOpenCreateUnit,
  onOpenCreateLine
}) {
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  // Aggregate Metrics
  const totalMachines = lines.reduce((acc, l) => acc + (parseInt(l.total_machines, 10) || 0), 0);
  const totalManpower = lines.reduce((acc, l) => acc + (parseInt(l.estimated_manpower, 10) || 0), 0);
  const totalAuditEvents = auditLogs.length;

  const recentAudits = auditLogs.slice(0, 6);

  const getEventBadge = (event, action) => {
    const ev = (event || action || '').toUpperCase();
    if (ev.includes('CREATE')) {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (ev.includes('UPDATE')) {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    if (ev.includes('DELETE')) {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
    if (ev.includes('LOGIN') || ev.includes('SECURITY')) {
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Executive Welcome & Quick Action Banner */}
      <div className={`p-6 rounded border transition-colors relative overflow-hidden ${
        isDark 
          ? 'bg-slate-900 border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-2xs'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Enterprise Command Center</span>
              </span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>|</span>
              <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Scope: {companies[0]?.name || 'Standard Group Holdings'}
              </span>
            </div>

            <h2 className={`text-xl sm:text-2xl font-black tracking-tight mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back, <span className="text-blue-600 dark:text-blue-400">{user?.name || 'Super Administrator'}</span>
            </h2>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Global shopfloor execution overview across multi-plant manufacturing facilities, line capacities, security scopes, and compliance audit trail.
            </p>
          </div>

          {/* Flat Crisp Solid Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={onOpenCreateUnit}
              className="px-3.5 py-2 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>+ Factory Unit</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateLine}
              className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>+ Production Line</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreateUser}
              className={`px-3.5 py-2 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer border transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>+ User Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Executive KPI Metric Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Plants & Units */}
        <div 
          onClick={() => onNavigateTab('master_plant')}
          className={`p-5 rounded border transition-all cursor-pointer hover:border-blue-500 hover:shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manufacturing Plants
            </span>
            <div className={`p-2 rounded border ${
              isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className={`text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {units.length} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plants</span>
          </div>
          <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Floors: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{floors.length}</strong></span>
            <span>Companies: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{companies.length || 1}</strong></span>
          </div>
        </div>

        {/* KPI 2: Production Lines & Capacity */}
        <div 
          onClick={() => onNavigateTab('master_plant')}
          className={`p-5 rounded border transition-all cursor-pointer hover:border-emerald-500 hover:shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Lines & Workcenters
            </span>
            <div className={`p-2 rounded border ${
              isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <Scissors className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-emerald-600 dark:text-emerald-400">
            {lines.length} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lines</span>
          </div>
          <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Machines: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{totalMachines}</strong></span>
            <span>Manpower: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{totalManpower}</strong></span>
          </div>
        </div>

        {/* KPI 3: Users & Access Scopes */}
        <div 
          onClick={() => onNavigateTab('users')}
          className={`p-5 rounded border transition-all cursor-pointer hover:border-purple-500 hover:shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Active Operators
            </span>
            <div className={`p-2 rounded border ${
              isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200'
            }`}>
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-purple-600 dark:text-purple-400">
            {usersCount} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Users</span>
          </div>
          <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Roles: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{rolesCount}</strong></span>
            <span>Tablets: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{devicesCount}</strong></span>
          </div>
        </div>

        {/* KPI 4: Security & Audit Trail */}
        <div 
          onClick={() => onNavigateTab('audit')}
          className={`p-5 rounded border transition-all cursor-pointer hover:border-blue-500 hover:shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Audit Trail Ledger
            </span>
            <div className={`p-2 rounded border ${
              isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'
            }`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-3xl font-black mt-2 text-blue-600 dark:text-blue-400">
            {totalAuditEvents} <span className={`text-xs font-normal ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Logs</span>
          </div>
          <div className={`flex items-center justify-between text-xs mt-2 pt-2 border-t ${
            isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
          }`}>
            <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">100% Immutable</strong></span>
            <span>Shifts: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{shiftsCount}</strong></span>
          </div>
        </div>

      </div>

      {/* 3. Plant Hierarchy & Live Security Audit Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Manufacturing Plant Hierarchy Tree (2 Columns) */}
        <div className={`lg:col-span-2 p-5 rounded border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Enterprise Plant Structure & Workcenter Status
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('master_plant')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Plant Tree</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {units.length === 0 ? (
            <div className={`text-center py-10 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-40 text-blue-500" />
              <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No Manufacturing Units configured yet.</p>
              <p className="mt-0.5">Click "+ Factory Unit" above to setup your first factory plant.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {units.map(unit => {
                const unitFloors = floors.filter(f => f.unit_id === unit.id);
                const unitLines = lines.filter(l => l.unit_id === unit.id);
                const unitManpower = unitLines.reduce((sum, l) => sum + (parseInt(l.estimated_manpower, 10) || 0), 0);

                return (
                  <div 
                    key={unit.id}
                    className={`p-4 rounded border transition-colors ${
                      isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <span className={`p-1.5 rounded text-xs font-mono font-bold border ${
                          isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {unit.code}
                        </span>
                        <div>
                          <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {unit.name}
                          </h4>
                          <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {unit.factory_type || 'SEWING_FACTORY'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          <strong>{unitFloors.length}</strong> Floors
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
                        }`}>
                          <strong>{unitLines.length}</strong> Lines
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                          {unitManpower} Manpower
                        </span>
                      </div>
                    </div>

                    {/* Floor Pills */}
                    {unitFloors.length > 0 && (
                      <div className={`flex items-center flex-wrap gap-1.5 mt-3 pt-2.5 border-t ${
                        isDark ? 'border-slate-800/80' : 'border-slate-200'
                      }`}>
                        {unitFloors.map(fl => {
                          const flLines = lines.filter(l => l.floor_id === fl.id);
                          return (
                            <span 
                              key={fl.id} 
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border flex items-center space-x-1 ${
                                isDark 
                                  ? 'bg-slate-900 border-slate-800 text-slate-400' 
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              <span className="text-blue-600 dark:text-blue-400 font-bold">{fl.code}</span>
                              <span>{fl.name}</span>
                              <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>({flLines.length} lines)</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Real-time Security & Audit Stream (1 Column) */}
        <div className={`p-5 rounded border space-y-4 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Recent Audit Trail Events
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          {recentAudits.length === 0 ? (
            <div className={`text-center py-8 text-xs font-sans ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No recent audit trail activity recorded yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAudits.map(log => (
                <div 
                  key={log.id}
                  onClick={() => onNavigateTab('audit')}
                  className={`p-2.5 rounded border transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/60' 
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${getEventBadge(log.event, log.action)}`}>
                      {log.event || 'ACTION'}
                    </span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className={`text-xs font-medium line-clamp-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {log.action_summary || log.action}
                  </p>

                  <div className={`flex items-center justify-between text-[10px] mt-1 font-mono ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <span>Actor: <strong className={isDark ? 'text-slate-300' : 'text-slate-700'}>{log.user_name || 'System Auto'}</strong></span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{log.module}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 4. Complete 12-Module Quick Access Gateway */}
      <div className={`p-5 rounded border space-y-4 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              RMG Woven Traceability Enterprise Gateway
            </h3>
          </div>
          <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            12 Integrated Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <button
            type="button"
            onClick={() => onNavigateTab('users')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-blue-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:bg-blue-50/30'
            }`}
          >
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>01. Auth & Admin</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Users, Roles, Shifts</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('master_plant')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-emerald-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>02. Master Data</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plants, Buyers, Styles</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('orders_po')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-amber-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-amber-500 hover:bg-amber-50/30'
            }`}
          >
            <FileSpreadsheet className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>03. Order & PO</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Buyer Orders & BOM</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('planning_routing')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-cyan-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-cyan-500 hover:bg-cyan-50/30'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>04. Planning</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Line Load & Routing</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('cutting_lays')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-orange-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-orange-500 hover:bg-orange-50/30'
            }`}
          >
            <Scissors className="h-5 w-5 text-orange-600 dark:text-orange-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>05. Cutting Floor</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Lays & QR Bundling</div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('sewing_telemetry')}
            className={`p-3 rounded border text-left transition-all cursor-pointer ${
              isDark 
                ? 'bg-slate-950/60 border-slate-800 hover:border-indigo-500 hover:bg-slate-850' 
                : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30'
            }`}
          >
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-2" />
            <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>07. Sewing Floor</div>
            <div className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live Line Telemetry</div>
          </button>

        </div>
      </div>

    </div>
  );
}
