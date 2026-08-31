import React, { useState } from 'react';
import { 
  Users, 
  Smartphone, 
  KeyRound, 
  History, 
  Database,
  Layers,
  Scissors,
  Activity,
  CheckCircle,
  Droplets,
  PackageCheck,
  Warehouse,
  BarChart3,
  LogOut, 
  UserCheck, 
  Sun, 
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  SlidersHorizontal,
  Shield,
  HelpCircle,
  Building2,
  Cpu,
  Radio,
  FileSpreadsheet,
  Settings
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const navigationGroups = [
  {
    category: 'IDENTITY & SECURITY',
    items: [
      { id: 'users', label: 'Users & Operators', icon: Users, badge: 'Protected', sub: 'Accounts & Access' },
      { id: 'devices', label: 'Floor Tablets & Terminals', icon: Smartphone, badge: 'Line-Locked', sub: 'Hardware Binding' },
      { id: 'roles', label: 'Role Permissions & Gates', icon: KeyRound, sub: 'Spatie RBAC' },
      { id: 'audit', label: 'System Audit Logs', icon: History, sub: 'Tamper-Proof Trail' },
    ]
  },
  {
    category: 'MASTER DATA ENGINE',
    items: [
      { id: 'master_buyers', label: 'Buyers & Brands', icon: Building2, sub: 'Customer Profiles' },
      { id: 'master_styles', label: 'Styles & SMV Library', icon: Layers, sub: 'Garment Specs' },
      { id: 'master_lines', label: 'Production Lines', icon: SlidersHorizontal, sub: 'Capacity & Routing' },
      { id: 'master_attributes', label: 'Colors & Size Matrix', icon: Database, sub: 'Variant Matrix' },
    ]
  },
  {
    category: 'SHOP FLOOR EXECUTION',
    items: [
      { id: 'orders', label: 'Orders & PO Master', icon: FileSpreadsheet, sub: 'Breakdown & BOM' },
      { id: 'cutting', label: 'Cutting & Bundle QRs', icon: Scissors, sub: 'Piece-Rate Generation' },
      { id: 'sewing', label: 'Sewing Floor Telemetry', icon: Activity, badge: 'Live', sub: 'Line In/Out Tracking' },
      { id: 'qc', label: 'Quality Control & DHU', icon: CheckCircle, sub: 'Defect Heatmaps' },
      { id: 'finishing', label: 'Washing & Finishing', icon: Droplets, sub: 'Batch Processing' },
      { id: 'packing', label: 'Packing & Carton QRs', icon: PackageCheck, sub: 'Final Packaging' },
      { id: 'inventory', label: 'Fabric & Trims Warehouse', icon: Warehouse, sub: 'Ledger Balances' },
      { id: 'analytics', label: 'Executive BI & Insights', icon: BarChart3, sub: 'Operational KPIs' },
    ]
  }
];

export function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange,
  breadcrumbs = ['Administration', 'Users & Access']
}) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-150 antialiased ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-800'
    }`}>
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
        ></div>
      )}

      {/* Left Fixed Sidebar (w-64) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        
        {/* Enterprise Brand Header */}
        <div className={`h-14 px-4 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/50'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 bg-blue-600 rounded flex items-center justify-center font-black text-white text-xs shadow-xs tracking-wider">
              R
            </div>
            <div>
              <div className={`font-black text-xs leading-none tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                RMG TRACEABILITY
              </div>
              <div className="text-[9px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">
                Enterprise Core v1.0
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <button 
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Global Plant / Unit Indicator */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
          isDark ? 'border-slate-800/80 bg-slate-900/60 text-slate-400' : 'border-slate-200/80 bg-white text-slate-600'
        }`}>
          <div className="flex items-center space-x-1.5 truncate">
            <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="font-semibold truncate">Standard Unit 01 (Factory)</span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 shrink-0">
            ONLINE
          </span>
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5 custom-scrollbar">
          {navigationGroups.map((grp, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="px-2 text-[9px] font-bold tracking-wider text-slate-400 mb-1.5 uppercase font-mono">
                {grp.category}
              </div>
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isActive
                        ? isDark 
                          ? 'bg-blue-600 text-white shadow-2xs font-bold'
                          : 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs'
                        : isDark
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? (isDark ? 'text-white' : 'text-blue-600') : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[8px] font-mono uppercase px-1 py-0.2 rounded font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Account Info & Footer */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-blue-400 truncate font-mono">
                  {user?.roles?.[0] || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area (offset by sidebar w-64 on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Navbar */}
        <header className={`h-14 border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 backdrop-blur-md transition-colors ${
          isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-2xs'
        }`}>
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded border text-slate-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-400">System</span>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span className={`font-semibold ${i === breadcrumbs.length - 1 ? (isDark ? 'text-white font-bold' : 'text-slate-900 font-bold') : ''}`}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Center/Right: Quick Search Bar & Global Status */}
          <div className="flex items-center space-x-3">
            
            {/* Realtime Telemetry Badge */}
            <div className={`hidden md:flex items-center space-x-2 text-[11px] px-2.5 py-1 rounded border font-mono ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>Redis Horizon: Active</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-1.5 rounded border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-xs'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            {/* User Profile Summary */}
            <div className={`hidden sm:flex items-center space-x-2 text-xs pl-2 border-l ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}>
              <div className="text-right">
                <div className={`text-xs font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {user?.roles?.[0] || 'Super Admin'}
                </div>
              </div>
            </div>

          </div>

        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-6 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
