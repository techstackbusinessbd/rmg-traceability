import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Smartphone, 
  KeyRound, 
  History, 
  Database,
  Layers,
  Scissors,
  Sparkles,
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
  Search,
  Bell,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

const navigationGroups = [
  {
    title: 'Administration & Core',
    items: [
      { id: 'users', label: 'Users Management', icon: Users, badge: 'RBAC', module: '01' },
      { id: 'devices', label: 'Floor Tablets', icon: Smartphone, badge: 'PIN Locked', module: '01' },
      { id: 'roles', label: 'Roles & Scopes', icon: KeyRound, module: '01' },
      { id: 'audit', label: 'Security Audit Logs', icon: History, module: '01' },
    ]
  },
  {
    title: 'Master Data Setup',
    items: [
      { id: 'master_buyers', label: 'Buyers & Brands', icon: Database, module: '02' },
      { id: 'master_styles', label: 'Styles & SMV', icon: Layers, module: '02' },
      { id: 'master_lines', label: 'Factory Production Lines', icon: SlidersHorizontal, module: '02' },
      { id: 'master_attributes', label: 'Colors & Sizes Matrix', icon: SlidersHorizontal, module: '02' },
    ]
  },
  {
    title: 'Manufacturing & Tracking',
    items: [
      { id: 'orders', label: 'Orders & PO Master', icon: Layers, module: '03' },
      { id: 'cutting', label: 'Cutting & Bundle QRs', icon: Scissors, module: '05' },
      { id: 'sewing', label: 'Sewing Floor Telemetry', icon: Activity, module: '07' },
      { id: 'qc', label: 'Quality Control & DHU', icon: CheckCircle, module: '08' },
      { id: 'finishing', label: 'Washing & Finishing', icon: Droplets, module: '09' },
      { id: 'packing', label: 'Packing & Carton QRs', icon: PackageCheck, module: '10' },
      { id: 'inventory', label: 'Fabric & Trims Store', icon: Warehouse, module: '11' },
      { id: 'analytics', label: 'Executive Analytics', icon: BarChart3, module: '12' },
    ]
  }
];

export function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange,
  breadcrumbs = ['Admin', 'Security & Access', 'Overview']
}) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
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
        
        {/* Brand Header */}
        <div className={`h-16 px-5 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center font-black text-white text-sm shadow-xs">
              R
            </div>
            <div>
              <div className={`font-bold text-sm leading-tight tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                RMG TRACE
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest">
                ENTERPRISE ERP
              </div>
            </div>
          </Link>

          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((grp, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {grp.title}
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer text-left ${
                      isActive
                        ? isDark 
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80'
                        : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? (isDark ? 'text-white' : 'text-blue-600') : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDark
                            ? 'bg-slate-800 text-slate-400'
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

        {/* User Account Info & Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="h-8 w-8 rounded bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  {user?.roles?.[0] || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area (offset by sidebar w-64 on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* Top Navbar */}
        <header className={`h-16 border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors ${
          isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-2xs'
        }`}>
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md border text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Link to="/" className="hover:text-blue-500 flex items-center space-x-1">
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span className={`font-medium ${i === breadcrumbs.length - 1 ? (isDark ? 'text-white font-bold' : 'text-slate-900 font-bold') : ''}`}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Quick Search, Notifications & Theme Toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-xs'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
