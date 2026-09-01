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
  Sun, 
  Moon,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  SlidersHorizontal,
  FolderTree,
  Radio,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

// Official 12-Module ERP Structure
const navigationGroups = [
  {
    category: 'SYSTEM & MASTER DATA',
    modules: [
      {
        id: 'mod_01',
        code: 'MOD 01',
        label: 'Auth & Administration',
        icon: ShieldCheck,
        badge: 'Protected',
        children: [
          { id: 'users', label: 'Users & Operators', icon: Users },
          { id: 'devices', label: 'Floor Tablets', icon: Smartphone, badge: 'PIN Locked' },
          { id: 'roles', label: 'Roles & Scopes', icon: KeyRound },
          { id: 'shifts', label: 'Unit & Floor Shifts', icon: Clock },
          { id: 'audit', label: 'Audit Logs', icon: History },
          { id: 'settings', label: 'System Configuration', icon: SlidersHorizontal },
        ]
      },
      {
        id: 'mod_02',
        code: 'MOD 02',
        label: 'Master Data Setup',
        icon: Database,
        children: [
          { id: 'master_plant', label: 'Factory Plant Structure', icon: Building2 },
          { id: 'master_buyers', label: 'Buyers & Brand Labels', icon: ShieldCheck },
          { id: 'master_styles', label: 'Styles & SMV Library', icon: Layers },
          { id: 'master_attributes', label: 'Colors, Sizes & Defects', icon: Database },
        ]
      },
      {
        id: 'mod_03',
        code: 'MOD 03',
        label: 'Order Management (PO)',
        icon: FileSpreadsheet,
        children: [
          { id: 'orders_po', label: 'Purchase Orders (PO)', icon: FileSpreadsheet },
          { id: 'orders_bom', label: 'BOM Costing', icon: Layers },
        ]
      },
      {
        id: 'mod_04',
        code: 'MOD 04',
        label: 'Production Planning',
        icon: SlidersHorizontal,
        children: [
          { id: 'planning_routing', label: 'Line Load & Routing', icon: SlidersHorizontal },
          { id: 'planning_targets', label: 'Target Output Plans', icon: Activity },
        ]
      }
    ]
  },
  {
    category: 'FACTORY FLOOR TRACEABILITY',
    modules: [
      {
        id: 'mod_05',
        code: 'MOD 05',
        label: 'Cutting & Bundling',
        icon: Scissors,
        children: [
          { id: 'cutting_lays', label: 'Fabric Lay Records', icon: Scissors },
          { id: 'cutting_bundles', label: 'Master & Piece QRs', icon: FolderTree },
        ]
      },
      {
        id: 'mod_06',
        code: 'MOD 06',
        label: 'Value Addition',
        icon: Layers,
        children: [
          { id: 'va_print_emb', label: 'Print / Embroidery Dispatch', icon: Layers },
          { id: 'va_receive', label: 'Value Add Receipt & QC', icon: CheckCircle },
        ]
      },
      {
        id: 'mod_07',
        code: 'MOD 07',
        label: 'Sewing Floor Tracking',
        icon: Activity,
        badge: 'Live',
        children: [
          { id: 'sewing_telemetry', label: 'Live Line Tracking', icon: Activity, badge: 'Live' },
          { id: 'sewing_wip', label: 'Real-time Line WIP', icon: SlidersHorizontal },
        ]
      },
      {
        id: 'mod_08',
        code: 'MOD 08',
        label: 'Quality Control (QC)',
        icon: CheckCircle,
        children: [
          { id: 'qc_inspection', label: 'Defect Log & Inspection', icon: CheckCircle },
          { id: 'qc_dhu', label: 'DHU Live Analytics', icon: BarChart3 },
        ]
      },
      {
        id: 'mod_09',
        code: 'MOD 09',
        label: 'Washing & Finishing',
        icon: Droplets,
        children: [
          { id: 'wash_batches', label: 'Wash Batch Records', icon: Droplets },
          { id: 'finishing_iron', label: 'Ironing & Finishing QC', icon: CheckCircle },
        ]
      },
      {
        id: 'mod_10',
        code: 'MOD 10',
        label: 'Packing & Shipment',
        icon: PackageCheck,
        children: [
          { id: 'packing_cartons', label: 'Carton Packing & QRs', icon: PackageCheck },
          { id: 'packing_dispatch', label: 'Container Dispatch', icon: Building2 },
        ]
      }
    ]
  },
  {
    category: 'INVENTORY & BUSINESS INTELLIGENCE',
    modules: [
      {
        id: 'mod_11',
        code: 'MOD 11',
        label: 'Fabric & Trims Store',
        icon: Warehouse,
        children: [
          { id: 'store_mrr', label: 'MRR Receive Ledger', icon: Warehouse },
          { id: 'store_issue', label: 'Fabric & Trims Requisition', icon: FileSpreadsheet },
        ]
      },
      {
        id: 'mod_12',
        code: 'MOD 12',
        label: 'BI & Executive Analytics',
        icon: BarChart3,
        children: [
          { id: 'analytics_kpi', label: 'Factory KPIs & Efficiency', icon: BarChart3 },
          { id: 'analytics_reports', label: 'Traceability Audit Reports', icon: History },
        ]
      }
    ]
  }
];

export function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange,
  breadcrumbs = ['System', 'Identity & Security', 'Users & Operators']
}) {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Find which Module contains the current activeTab
  const getActiveModuleId = (tab) => {
    for (const grp of navigationGroups) {
      for (const mod of grp.modules) {
        if (mod.children?.some(c => c.id === tab)) {
          return mod.id;
        }
      }
    }
    return 'mod_01';
  };

  // State: Only the currently active module is expanded
  const [expandedSections, setExpandedSections] = useState(() => ({
    [getActiveModuleId(activeTab)]: true
  }));

  // Auto expand ONLY the active module when activeTab changes
  React.useEffect(() => {
    const currentModuleId = getActiveModuleId(activeTab);
    setExpandedSections({
      [currentModuleId]: true
    });
  }, [activeTab]);

  // Accordion Toggle: Clicking an accordion opens it and closes all others
  const toggleSection = (moduleId) => {
    setExpandedSections(prev => ({
      [moduleId]: !prev[moduleId]
    }));
  };

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

      {/* Left Fixed Sidebar (w-72) - Always Enterprise Dark Theme */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col transition-transform duration-200 lg:translate-x-0 bg-slate-950 border-slate-800/80 text-slate-100 shadow-xl ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Enterprise Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center font-black text-white text-sm shadow-xs tracking-wider">
              R
            </div>
            <div>
              <div className="font-black text-sm leading-none tracking-tight text-white">
                RMG TRACEABILITY
              </div>
              <div className="text-[10px] text-slate-400 font-mono tracking-widest mt-1 uppercase font-semibold">
                Enterprise Core v1.0
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <button 
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Plant / Unit Indicator */}
        <div className="px-4 py-2.5 border-b border-slate-800/60 bg-slate-900/60 text-slate-300 flex items-center justify-between text-xs shrink-0 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-semibold truncate">Standard Unit 01 (Factory)</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            ONLINE
          </span>
        </div>

        {/* Navigation Modules (Strict 12 Official Modules) */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 sidebar-scroll">
          {navigationGroups.map((grp, idx) => (
            <div key={idx} className="space-y-1.5">
              
              {/* Category Header */}
              <div className="px-2 text-[10px] font-bold tracking-wider text-slate-400 mb-1.5 uppercase font-mono">
                {grp.category}
              </div>

              {/* Module Items (Collapsible) */}
              {grp.modules.map((mod) => {
                const ModIcon = mod.icon;
                const isExpanded = expandedSections[mod.id] ?? false;
                const hasActiveChild = mod.children?.some(c => c.id === activeTab);

                return (
                  <div key={mod.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleSection(mod.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                        hasActiveChild 
                          ? 'text-white bg-slate-900 border border-slate-800' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                        <ModIcon className={`h-4 w-4 shrink-0 ${hasActiveChild ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className="truncate">{mod.label}</span>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        {mod.badge && (
                          <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {mod.badge}
                          </span>
                        )}
                        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${
                          isExpanded ? 'rotate-180 text-slate-200' : ''
                        }`} />
                      </div>
                    </button>

                    {/* Sub-Menus under each Module */}
                    {isExpanded && mod.children && (
                      <div className="relative pl-3.5 ml-2.5 border-l border-slate-800 space-y-1 my-1">
                        {mod.children.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeTab === sub.id;

                          return (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                onTabChange(sub.id);
                                setSidebarOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                                <span className={`h-2 w-2 rounded-full shrink-0 ${isSubActive ? 'bg-white' : 'bg-slate-600'}`}></span>
                                <span className="truncate">{sub.label}</span>
                              </div>

                              {sub.badge && (
                                <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                  isSubActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                  {sub.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          ))}
        </div>

        {/* User Account Info & Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-9 w-9 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-blue-400 truncate font-mono mt-0.5">
                  {user?.roles?.[0] || 'Super Admin'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area (offset by sidebar w-72 on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* Top Navbar */}
        <header className={`h-16 border-b sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 backdrop-blur-md transition-colors ${
          isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/90 shadow-2xs'
        }`}>
          
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded border text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400 font-medium">
              <span className="font-semibold text-slate-400">System</span>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
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
