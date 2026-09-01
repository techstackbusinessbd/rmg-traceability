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
  Clock,
  Sparkles,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

// Official 12-Module ERP Structure - Clean & Uncluttered
const navigationGroups = [
  {
    category: 'System & Master Setup',
    modules: [
      {
        id: 'mod_01',
        label: 'Auth & Administration',
        icon: ShieldCheck,
        children: [
          { id: 'users', label: 'Users & Access Scopes', icon: Users },
          { id: 'devices', label: 'Floor Tablets & Hardware', icon: Smartphone },
          { id: 'roles', label: 'Roles & Permissions Matrix', icon: KeyRound },
          { id: 'shifts', label: 'Unit & Floor Shifts', icon: Clock },
          { id: 'audit', label: 'Security Audit Trail', icon: History },
          { id: 'settings', label: 'System Configuration', icon: SlidersHorizontal },
        ]
      },
      {
        id: 'mod_02',
        label: 'Master Data Setup',
        icon: Database,
        children: [
          { id: 'master_plant', label: 'Group & Plant Structure', icon: Building2 },
          { id: 'master_buyers', label: 'Buyers & Brand Labels', icon: Shield },
          { id: 'master_styles', label: 'Styles & SMV Library', icon: Layers },
          { id: 'master_attributes', label: 'Colors, Sizes & Defects', icon: Database },
        ]
      },
      {
        id: 'mod_03',
        label: 'Order Management (PO)',
        icon: FileSpreadsheet,
        children: [
          { id: 'orders_po', label: 'Purchase Orders (PO)', icon: FileSpreadsheet },
          { id: 'orders_bom', label: 'BOM Costing & Specs', icon: Layers },
        ]
      },
      {
        id: 'mod_04',
        label: 'Production Planning',
        icon: SlidersHorizontal,
        children: [
          { id: 'planning_routing', label: 'Line Load & Routing', icon: SlidersHorizontal },
          { id: 'planning_targets', label: 'Daily Output Targets', icon: Activity },
        ]
      }
    ]
  },
  {
    category: 'Shopfloor Traceability',
    modules: [
      {
        id: 'mod_05',
        label: 'Cutting & Bundling',
        icon: Scissors,
        children: [
          { id: 'cutting_lays', label: 'Fabric Lay Records', icon: Scissors },
          { id: 'cutting_bundles', label: 'Piece QR Barcodes', icon: FolderTree },
        ]
      },
      {
        id: 'mod_06',
        label: 'Value Addition Units',
        icon: Layers,
        children: [
          { id: 'va_print_emb', label: 'Print / Embroidery Dispatch', icon: Layers },
          { id: 'va_receive', label: 'Value Add Receipt & QC', icon: CheckCircle },
        ]
      },
      {
        id: 'mod_07',
        label: 'Sewing Floor Tracking',
        icon: Activity,
        children: [
          { id: 'sewing_telemetry', label: 'Live Line Tracking', icon: Activity },
          { id: 'sewing_wip', label: 'Real-time Line WIP', icon: SlidersHorizontal },
        ]
      },
      {
        id: 'mod_08',
        label: 'Quality Control (QC)',
        icon: CheckCircle,
        children: [
          { id: 'qc_inspection', label: 'Defect Log & Inspection', icon: CheckCircle },
          { id: 'qc_dhu', label: 'DHU Live Analytics', icon: BarChart3 },
        ]
      },
      {
        id: 'mod_09',
        label: 'Washing & Finishing',
        icon: Droplets,
        children: [
          { id: 'wash_batches', label: 'Wash Batch Records', icon: Droplets },
          { id: 'finishing_iron', label: 'Ironing & Finishing QC', icon: CheckCircle },
        ]
      },
      {
        id: 'mod_10',
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
    category: 'Inventory & Intelligence',
    modules: [
      {
        id: 'mod_11',
        label: 'Fabric & Trims Store',
        icon: Warehouse,
        children: [
          { id: 'store_mrr', label: 'MRR Receive Ledger', icon: Warehouse },
          { id: 'store_issue', label: 'Fabric & Trims Issue', icon: FileSpreadsheet },
        ]
      },
      {
        id: 'mod_12',
        label: 'BI & Executive Analytics',
        icon: BarChart3,
        children: [
          { id: 'analytics_kpi', label: 'Factory KPIs & Efficiency', icon: BarChart3 },
          { id: 'analytics_reports', label: 'Deep Traceability Reports', icon: History },
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

  // State: Expanded accordion sections
  const [expandedSections, setExpandedSections] = useState(() => ({
    [getActiveModuleId(activeTab)]: true
  }));

  // Auto expand the active module when activeTab changes
  React.useEffect(() => {
    const currentModuleId = getActiveModuleId(activeTab);
    setExpandedSections({
      [currentModuleId]: true
    });
  }, [activeTab]);

  // Accordion Toggle
  const toggleSection = (moduleId) => {
    setExpandedSections(prev => ({
      ...prev,
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

      {/* Left Fixed Sidebar (w-72) - Clean Enterprise Dark Design */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r flex flex-col transition-transform duration-200 lg:translate-x-0 bg-slate-950 border-slate-800 text-slate-100 shadow-xl ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Clean Enterprise Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-xs tracking-wider">
              RMG
            </div>
            <div>
              <div className="font-bold text-sm leading-none tracking-tight text-white uppercase">
                Traceability ERP
              </div>
              <div className="text-xs text-slate-400 font-mono tracking-wider mt-1">
                Woven Garments Suite
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic User Scope / Context Pill */}
        <div className="px-4 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-xs shrink-0 font-medium">
          <div className="flex items-center space-x-2 truncate">
            <Building2 className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-xs text-slate-200 truncate font-semibold">
              {user?.unit?.name || 'Global Enterprise HQ'}
            </span>
          </div>
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Clean Navigation Modules (12 Modules) */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 space-y-4 sidebar-scroll">
          {navigationGroups.map((grp, idx) => (
            <div key={idx} className="space-y-1">
              
              {/* Category Subheading */}
              <div className="px-2.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono mb-1.5">
                {grp.category}
              </div>

              {/* Module Accordions */}
              {grp.modules.map((mod) => {
                const ModIcon = mod.icon;
                const isExpanded = expandedSections[mod.id] ?? false;
                const hasActiveChild = mod.children?.some(c => c.id === activeTab);

                return (
                  <div key={mod.id} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => toggleSection(mod.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors cursor-pointer text-left ${
                        hasActiveChild 
                          ? 'text-white bg-slate-900 border border-slate-800' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                        <ModIcon className={`h-4 w-4 shrink-0 ${hasActiveChild ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className="truncate text-xs font-semibold">{mod.label}</span>
                      </div>

                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                        isExpanded ? 'rotate-180 text-slate-200' : ''
                      }`} />
                    </button>

                    {/* Sub-Menus */}
                    {isExpanded && mod.children && (
                      <div className="relative pl-3.5 ml-2.5 border-l border-slate-800 space-y-0.5 my-1">
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
                              className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
                              }`}
                            >
                              <SubIcon className={`h-3.5 w-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate text-xs">{sub.label}</span>
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

        {/* Clean User Account Profile Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="h-8 w-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                  {user?.username ? `@${user.username}` : user?.emp_id || 'Root Admin'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
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

          {/* Right: Telemetry & Theme Toggle */}
          <div className="flex items-center space-x-3">
            
            {/* Realtime Telemetry Badge */}
            <div className={`hidden md:flex items-center space-x-2 text-[11px] px-2.5 py-1 rounded border font-mono ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>Trace Core: Online</span>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded border transition-colors cursor-pointer ${
                isDark 
                  ? 'border-slate-800 bg-slate-950 text-amber-400 hover:bg-slate-800' 
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
