import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  ShoppingCart, 
  Calendar, 
  Scissors, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Package, 
  Warehouse, 
  BarChart3, 
  QrCode, 
  WifiOff, 
  TrendingUp, 
  AlertTriangle, 
  Truck, 
  Sun, 
  Moon, 
  ArrowRight, 
  CheckCircle, 
  ListTree, 
  ChevronRight,
  Lock,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const valueProps = [
  {
    icon: QrCode,
    title: 'Single-Piece QR Traceability',
    desc: 'From cutting table roll and shade tracking to generating unique serialized QR codes for every garment bundle.',
    color: 'from-blue-600 to-cyan-500',
    bgLight: 'bg-blue-50/80 border-blue-200/80',
    bgDark: 'bg-blue-950/20 border-blue-800/40'
  },
  {
    icon: AlertTriangle,
    title: 'Zero Mix-up Guarantee',
    desc: 'Instant system blockage when mismatched shade, wrong size, or incorrect buyer order is scanned in sewing and packing.',
    color: 'from-amber-600 to-orange-500',
    bgLight: 'bg-amber-50/80 border-amber-200/80',
    bgDark: 'bg-amber-950/20 border-amber-800/40'
  },
  {
    icon: WifiOff,
    title: 'Strict Offline-First Edge',
    desc: 'Continuous scanning and validation on shop-floor tablets even when Wi-Fi drops, with automatic background synchronization.',
    color: 'from-emerald-600 to-teal-500',
    bgLight: 'bg-emerald-50/80 border-emerald-200/80',
    bgDark: 'bg-emerald-950/20 border-emerald-800/40'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Floor WIP & DHU',
    desc: 'Live hourly line output, worker efficiency tracking, and interactive SVG garment body defect mapping.',
    color: 'from-purple-600 to-pink-500',
    bgLight: 'bg-purple-50/80 border-purple-200/80',
    bgDark: 'bg-purple-950/20 border-purple-800/40'
  }
];

const lifecycleSteps = [
  { step: '01', title: 'Order & Plan', desc: 'Buyer PO, Breakdown & Line Load', icon: ShoppingCart },
  { step: '02', title: 'Cutting & QR', desc: 'Roll/Shade Track & Bundle QR', icon: Scissors },
  { step: '03', title: 'Value Add', desc: 'Print/Embroidery Dispatch & Receive', icon: Sparkles },
  { step: '04', title: 'Sewing IN/OUT', desc: 'Tablet Scanning & Hourly Output', icon: Activity },
  { step: '05', title: 'QC Defect Map', desc: 'Pass, Rework & Real-time DHU', icon: CheckCircle2 },
  { step: '06', title: 'Pack & Ship', desc: 'Carton Scan & Container Load', icon: Truck },
];

const modulesData = [
  {
    id: '01',
    name: 'System Admin & User Management',
    role: 'Security, RBAC & Device Auth',
    category: 'Core Foundation',
    icon: ShieldCheck,
    color: 'from-blue-600 to-cyan-500',
    desc: 'Core gatekeeper and security foundation. Spatie RBAC, factory floor tablet authorization, and immutable audit logs.',
    submodules: [
      {
        id: '1.1',
        name: 'Role-Based Access Control (RBAC)',
        features: [
          { id: '1.1.1', title: 'Custom Role Creation', desc: 'Define roles such as Super Admin, Cutting Master, Line Supervisor, QC Inspector.' },
          { id: '1.1.2', title: 'Granular JSON Permissions', desc: 'Map permissions to specific API routes, sidebar menus, and interactive buttons.' }
        ]
      },
      {
        id: '1.2',
        name: 'User & Device Management',
        features: [
          { id: '1.2.1', title: 'User Accounts & Session Revocation', desc: 'Bcrypt hashed passwords, active/inactive controls, and instant token revocation.' },
          { id: '1.2.2', title: 'Tablet Device Line-Locking', desc: 'Lock shop-floor tablets with a 6-digit PIN and fixed production line assignment.' },
          { id: '1.2.3', title: 'Immutable System Audit Logs', desc: 'Cryptographically timestamped audit trail of all master data and production changes.' }
        ]
      }
    ]
  },
  {
    id: '02',
    name: 'Master Data Management',
    role: 'Global Master Library',
    category: 'Core Foundation',
    icon: Layers,
    color: 'from-indigo-600 to-purple-500',
    desc: 'Centralized master data repository. Buyers, styles, lines, colors, and sizes configured here are reused across all modules.',
    submodules: [
      {
        id: '2.1',
        name: 'Core Factory Configurations',
        features: [
          { id: '2.1.1', title: 'Buyer Setup', desc: 'Configure buyer profiles, countries, codes, and operational status.' },
          { id: '2.1.2', title: 'Style & Garment Type Library', desc: 'Map buyer styles to garment categories (Woven Shirt, Pant, Jacket).' },
          { id: '2.1.3', title: 'Production Line Architecture', desc: 'Define floor and production line structures with daily capacity limits.' },
          { id: '2.1.4', title: 'Color Library with HEX Codes', desc: 'Manage visual HEX color codes and standard color naming conventions.' },
          { id: '2.1.5', title: 'Size Range Configuration', desc: 'Configure numeric (28, 30, 32) and alpha (S, M, L, XL) size matrices.' }
        ]
      }
    ]
  },
  {
    id: '03',
    name: 'Order Management',
    role: 'Merchandising & Purchase Orders',
    category: 'Planning & Orders',
    icon: ShoppingCart,
    color: 'from-sky-600 to-blue-500',
    desc: 'Purchase order entry, color/size breakdown matrices, and strict mathematical quantity validation.',
    submodules: [
      {
        id: '3.1',
        name: 'Purchase Order (PO) Processing',
        features: [
          { id: '3.1.1', title: 'Auto-validated PO Creation', desc: 'Validate PO entry against global Master Data.' },
          { id: '3.1.2', title: 'Color vs Size Breakdown Matrix', desc: 'Automatically compute piece quantities across size and color combinations.' },
          { id: '3.1.3', title: 'Mathematical Quantity Guard', desc: 'Ensure breakdown matrix sum matches total purchase order quantity exactly.' },
          { id: '3.1.4', title: 'Order Workflow Approval', desc: 'Manage Draft -> Pending Approval -> Confirmed workflow lifecycles.' }
        ]
      }
    ]
  },
  {
    id: '04',
    name: 'Production Planning & IE',
    role: 'Capacity Loading & Material Readiness',
    category: 'Planning & Orders',
    icon: Calendar,
    color: 'from-emerald-600 to-teal-500',
    desc: 'Industrial Engineering (IE) capacity loading, SMV calculations, and live material readiness cross-checks.',
    submodules: [
      {
        id: '4.1',
        name: 'Capacity & Line Allocation',
        features: [
          { id: '4.1.1', title: 'Line Loading Schedule', desc: 'Assign confirmed purchase orders to specific sewing lines with scheduled dates.' },
          { id: '4.1.2', title: 'SMV & Manpower Input', desc: 'Compute hourly targets and target DHU based on Standard Minute Values.' }
        ]
      }
    ]
  },
  {
    id: '05',
    name: 'Cutting & Bundle Ticket Generation',
    role: 'Traceability Origin & QR Engine',
    category: 'Floor Production',
    icon: Scissors,
    color: 'from-amber-600 to-yellow-500',
    desc: 'Origin of traceability. Fabric lay spreading, shade and roll tracking, and unique serialized QR bundle ticket printing.',
    submodules: [
      {
        id: '5.1',
        name: 'Cut Lay & Spreading Registration',
        features: [
          { id: '5.1.1', title: 'Lay Parameters Entry', desc: 'Log Cut No, Plies, Fabric Roll No, Shade Band, and cutting tables.' },
          { id: '5.1.2', title: 'Excess Cutting Governance', desc: 'Auto-calculate cut variance percentage against PO with manager authorization.' }
        ]
      }
    ]
  },
  {
    id: '06',
    name: 'Value Addition',
    role: 'Print & Embroidery Gateways',
    category: 'Floor Production',
    icon: Sparkles,
    color: 'from-pink-600 to-rose-500',
    desc: 'Dispatch bundles to external printing/embroidery units and reconcile returning parts with variance logging.',
    submodules: [
      {
        id: '6.1',
        name: 'Dispatch & Receive Reconcile',
        features: [
          { id: '6.1.1', title: 'Delivery Challan Batching', desc: 'Group multiple cut bundles into serialized delivery challans.' },
          { id: '6.1.2', title: 'Missing & Reject Piece Logging', desc: 'Log transit rejections and automatically adjust inventory balances.' }
        ]
      }
    ]
  },
  {
    id: '07',
    name: 'Sewing Line Tracking',
    role: 'High-Concurrency Concurrency Core',
    category: 'Floor Production',
    icon: Activity,
    color: 'from-emerald-500 to-green-600',
    desc: 'Shop-floor core with highest transaction concurrency. Line-IN / Line-OUT scanning with real-time hourly output.',
    submodules: [
      {
        id: '7.1',
        name: 'Tablet Floor Scanning',
        features: [
          { id: '7.1.1', title: 'Line-IN / Line-OUT Scanning', desc: 'Scan bundles upon line entry and track completion at finishing output.' },
          { id: '7.1.2', title: 'Offline-First Edge Sync', desc: 'Save scans locally during Wi-Fi drops with automatic bulk sync on reconnect.' }
        ]
      }
    ]
  },
  {
    id: '08',
    name: 'Quality Control (QC)',
    role: 'Garment Body Defect Map & DHU',
    category: 'Quality & Finishing',
    icon: CheckCircle2,
    color: 'from-red-500 to-orange-500',
    desc: 'Digital quality gateway. Interactive SVG garment body defect mapping with real-time DHU calculations.',
    submodules: [
      {
        id: '8.1',
        name: 'Interactive Defect Logging',
        features: [
          { id: '8.1.1', title: '3-Way Inspection Flow', desc: 'Assign Pass, Reject, or Alter status per scanned garment bundle.' },
          { id: '8.1.2', title: 'Interactive SVG Body Map', desc: 'Pinpoint exact visual defect locations on garment body schematics.' }
        ]
      }
    ]
  },
  {
    id: '09',
    name: 'Washing & Finishing',
    role: 'Batching & Ironing Quality Gate',
    category: 'Quality & Finishing',
    icon: Sparkles,
    color: 'from-cyan-600 to-blue-600',
    desc: 'Washing machine batch tracking, thread cutting, pressing, and final dimensional measurement audits.',
    submodules: [
      {
        id: '9.1',
        name: 'Wash Batch & Finishing QC',
        features: [
          { id: '9.1.1', title: 'Machine Batch Grouping', desc: 'Group bundles into wash batches and track machine cycles.' },
          { id: '9.1.2', title: 'Finishing & Pressing Gate', desc: 'Clear pressed and folded bundles for final carton packing.' }
        ]
      }
    ]
  },
  {
    id: '10',
    name: 'Packing & Shipment',
    role: 'Assortment Validation & Container Gate',
    category: 'Shipment & Store',
    icon: Package,
    color: 'from-violet-600 to-indigo-600',
    desc: 'Carton barcode generation, size/color ratio assortment verification, and container dispatch scanning.',
    submodules: [
      {
        id: '10.1',
        name: 'Carton Assembly & Container Loading',
        features: [
          { id: '10.1.1', title: 'Single-Piece into Carton Mapping', desc: 'Scan QC-passed garments into pre-configured export cartons.' },
          { id: '10.1.2', title: 'Container Loading Scan', desc: 'Scan out cartons at container gates with automated packing list generation.' }
        ]
      }
    ]
  },
  {
    id: '11',
    name: 'Fabric & Accessories Store',
    role: 'Double-Entry Inventory & Roll Allocation',
    category: 'Shipment & Store',
    icon: Warehouse,
    color: 'from-teal-600 to-emerald-600',
    desc: 'Raw material receipt (MRR), double-entry stock ledger, and hard allocation of fabric rolls to specific cuts.',
    submodules: [
      {
        id: '11.1',
        name: 'Material Receiving & Allocation',
        features: [
          { id: '11.1.1', title: 'Supplier PO Receiving Report (MRR)', desc: 'Receive goods in Yards, KGs, or Cones against supplier purchase orders.' },
          { id: '11.1.2', title: 'Roll-to-PO Hard Allocation', desc: 'Lock designated fabric rolls exclusively to specific buyer orders.' }
        ]
      }
    ]
  },
  {
    id: '12',
    name: 'BI & Analytics Dashboard',
    role: 'Floor TV Displays & Pareto Analytics',
    category: 'Executive BI',
    icon: BarChart3,
    color: 'from-purple-600 to-pink-600',
    desc: 'Real-time shop-floor TV displays, hourly line efficiency benchmarks, Pareto defect charts, and executive reporting.',
    submodules: [
      {
        id: '12.1',
        name: 'Floor Displays & Analytics',
        features: [
          { id: '12.1.1', title: 'Hourly Target vs Actual Visuals', desc: 'Broadcast live target vs output charts on shop-floor TV displays.' },
          { id: '12.1.2', title: 'Top Defect Pareto Charts', desc: 'Perform live 80/20 Pareto defect analyses and line efficiency heatmaps.' }
        ]
      }
    ]
  }
];

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [selectedMod, setSelectedMod] = useState(modulesData[0]);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Navigation */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-md ring-1 ring-white/20">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-black text-lg tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  RMG TRACEABILITY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Enterprise Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Woven Garments Floor Execution & ERP System</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Go to Login Page or Admin Console Link */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/admin"
                  className="px-3.5 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-md border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Login</span>
              </Link>
            )}

            {/* Dark/Light Mode Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-sm'
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-sm'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Hero Section: What & Why */}
        <section className={`relative overflow-hidden rounded-2xl p-8 sm:p-10 border ${
          isDark 
            ? 'bg-slate-900 border-slate-800 shadow-xl' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <span>🎯 End-to-End Woven Manufacturing Architecture</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Real-Time Digital Piece-Level Traceability from Cutting to Final Shipment
            </h1>
            <p className={`text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <strong className="text-blue-500">Why this system?</strong> Traditional ERPs lack precision on the shop floor. This platform generates <strong>serialized QR codes</strong> for every bundle, blocking <strong>size/shade mix-ups</strong>, reducing <strong>defects (DHU)</strong>, and providing <strong>real-time Work-in-Progress (WIP)</strong> visibility via shop-floor tablets.
            </p>
          </div>

          {/* Quick Lifecycle Stepper */}
          <div className="mt-8 pt-8 border-t border-slate-700/40">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <span>Production Traceability Lifecycle</span>
              <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {lifecycleSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className={`p-3.5 rounded-lg border transition-all ${
                    isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                      <span className="font-mono font-bold text-blue-500">STEP {step.step}</span>
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{step.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4 Core Pillars */}
        <section className="space-y-4">
          <div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Core Pillars & Value Propositions
            </h2>
            <p className="text-sm text-slate-400">How the platform reduces manufacturing variances, defect rates, and operational overhead</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className={`p-5 rounded-lg border transition-all ${
                  isDark ? prop.bgDark : prop.bgLight
                }`}>
                  <div className={`p-2.5 rounded-md bg-blue-600 text-white w-fit shadow-sm mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className={`font-bold text-base mb-1.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {prop.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {prop.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 12 Enterprise Modules Section */}
        <section className="space-y-6" id="modules-section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                12 Enterprise Modules Architecture & Feature Inspector
              </h2>
              <p className="text-sm text-slate-400">Click on any module card below to inspect its dedicated sub-modules and functional scope</p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20 w-fit">
              Click Any Module to Inspect
            </div>
          </div>

          {/* Detailed Inspector Display for Selected Module */}
          <div className={`p-6 sm:p-8 rounded-xl border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-blue-500/50 shadow-xl' 
              : 'bg-white border-blue-500/70 shadow-md ring-1 ring-blue-500/20'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/30">
              <div className="flex items-start space-x-4">
                <div className="p-3.5 rounded-lg bg-blue-600 text-white shadow-md">
                  {React.createElement(selectedMod.icon, { className: 'h-7 w-7' })}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      MODULE {selectedMod.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">&bull; {selectedMod.category}</span>
                  </div>
                  <h3 className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedMod.name}
                  </h3>
                  <p className={`text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {selectedMod.desc}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border text-xs space-y-2 lg:min-w-[280px] ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="font-semibold text-blue-400">{selectedMod.role}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Architecture:</span>
                  <span className="font-semibold text-emerald-400">Domain-Driven (DDD)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Integrity:</span>
                  <span className="font-semibold text-indigo-400">Strict DB::transaction()</span>
                </div>
              </div>
            </div>

            {/* Sub-modules and Features List */}
            <div className="mt-6 space-y-6">
              <div className="flex items-center space-x-2 text-sm font-bold text-blue-400">
                <ListTree className="h-4 w-4" />
                <span>Module {selectedMod.id} Sub-modules & Functional Features Breakdown:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {selectedMod.submodules.map((sub) => (
                  <div 
                    key={sub.id} 
                    className={`rounded-lg p-5 border transition-all ${
                      isDark ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-700/20">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Sub {sub.id}
                      </span>
                      <h4 className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {sub.name}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {sub.features.map((feat) => (
                        <div key={feat.id} className="flex items-start space-x-2.5">
                          <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[11px] font-mono font-bold text-slate-400">[{feat.id}]</span>
                              <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                {feat.title}
                              </span>
                            </div>
                            <p className={`text-[11px] mt-0.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                              {feat.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 12 Module Interactive Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modulesData.map((mod) => {
              const Icon = mod.icon;
              const isSelected = selectedMod.id === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedMod(mod);
                    document.getElementById('modules-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`group relative rounded-lg p-5 border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? isDark 
                        ? 'bg-slate-900 border-blue-400 shadow-md ring-1 ring-blue-400' 
                        : 'bg-white border-blue-600 shadow-md ring-1 ring-blue-500'
                      : isDark
                        ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-md bg-blue-600 text-white shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      isSelected 
                        ? 'text-blue-400' 
                        : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>
                      MOD {mod.id}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h4 className={`font-bold text-sm transition-colors ${
                      isSelected 
                        ? isDark ? 'text-white' : 'text-slate-950'
                        : isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-800 group-hover:text-slate-950'
                    }`}>
                      {mod.name}
                    </h4>
                    <p className={`text-xs mt-1 line-clamp-2 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {mod.desc}
                    </p>
                    
                    <div className="mt-3 pt-2.5 border-t border-slate-700/30 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">{mod.submodules.length} Sub-modules</span>
                      <span className="text-blue-500 font-semibold flex items-center space-x-0.5">
                        <span>{isSelected ? 'Viewing Features' : 'Click to Inspect'}</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors duration-300 ${
        isDark ? 'border-slate-900 bg-slate-950 text-slate-500' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 RMG Woven Garments Traceability & ERP Suite. All Rights Reserved.</span>
          <span className="font-mono text-blue-400">Domain Driven Design &bull; Offline First &bull; Strict Transaction Integrity</span>
        </div>
      </footer>
    </div>
  );
}
