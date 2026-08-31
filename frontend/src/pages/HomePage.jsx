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

const valueProps = [
  {
    icon: QrCode,
    title: 'Single-Piece QR Traceability',
    desc: 'কাটিং ফ্লোরে ফেব্রিক রোল ও শেড ট্র্যাকিং থেকে প্রতিটি পিসের ইউনিক QR কোড জেনারেশন।',
    color: 'from-blue-600 to-cyan-500',
    bgLight: 'bg-blue-50/80 border-blue-200/80',
    bgDark: 'bg-blue-950/20 border-blue-800/40'
  },
  {
    icon: AlertTriangle,
    title: 'Zero Mix-up Guarantee',
    desc: 'ভুল শেড বা অন্য বায়ারের সাইজ সুইং ও প্যাকিং লাইনে স্ক্যান হলে তাৎক্ষণিক সিস্টেম ব্লক।',
    color: 'from-amber-600 to-orange-500',
    bgLight: 'bg-amber-50/80 border-amber-200/80',
    bgDark: 'bg-amber-950/20 border-amber-800/40'
  },
  {
    icon: WifiOff,
    title: 'Strict Offline-First Edge',
    desc: 'কারখানা ফ্লোরে ইন্টারনেট ড্রপ হলেও লোকাল ডিভাইসে নিরবচ্ছিন্ন স্ক্যানিং ও ব্যাকগ্রাউন্ড সিঙ্ক।',
    color: 'from-emerald-600 to-teal-500',
    bgLight: 'bg-emerald-50/80 border-emerald-200/80',
    bgDark: 'bg-emerald-950/20 border-emerald-800/40'
  },
  {
    icon: TrendingUp,
    title: 'Real-Time Floor WIP & DHU',
    desc: 'প্রতিটি লাইনের প্রতি ঘণ্টার প্রোডাকশন, এফিশিয়েন্সি এবং লাইভ SVG বডি ডিফেক্ট ম্যাপিং।',
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
    desc: 'পুরো সিস্টেমের সিকিউরিটি ও গেটকিপার। Spatie RBAC, ফ্লোর ট্যাবলেট অথেন্টিকেশন ও অপরিবর্তনীয় অডিট ট্রেল।',
    submodules: [
      {
        id: '1.1',
        name: 'RBAC (Role-Based Access Control)',
        features: [
          { id: '1.1.1', title: 'Custom Role Creation', desc: 'Super Admin, Cutting Master, Line Supervisor, QC Inspector ইত্যাদি রোল তৈরি।' },
          { id: '1.1.2', title: 'Granular JSON Permissions', desc: 'নির্দিষ্ট API Route, Sidebar Menu এবং Action Button ভিত্তিক পারমিশন ম্যাপিং।' }
        ]
      },
      {
        id: '1.2',
        name: 'User & Device Management',
        features: [
          { id: '1.2.1', title: 'User Accounts & Session Revocation', desc: 'Bcrypt পাসওয়ার্ড, স্ট্যাটাস কন্ট্রোল এবং রোল পরিবর্তনে সাথে সাথে Sanctum টোকেন বাতিল।' },
          { id: '1.2.2', title: 'Tablet Device Line-Locking', desc: 'ফ্লোরের ট্যাবলেটকে ৬-ডিজিট পিন ও স্পেসিফিক Line ID-তে লক করা (Security Protection)।' },
          { id: '1.2.3', title: 'Immutable System Audit Logs', desc: 'কে কখন কোন মাস্টার ডাটা বা প্রোডাকশন লগ তৈরি/এডিট করেছে তার অপরিবর্তনীয় লগ।' }
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
    desc: 'পুরো সিস্টেমের জন্য সেন্ট্রাল ডাটা হাব। বায়ার, স্টাইল, কালার ও সাইজ এখান থেকে সমস্ত মডিউলে রিইউজ হয়।',
    submodules: [
      {
        id: '2.1',
        name: 'Core Factory Configurations',
        features: [
          { id: '2.1.1', title: 'Buyer Setup', desc: 'বায়ারের নাম, কান্ট্রি, কোড এবং স্ট্যাটাস কনফিগারেশন।' },
          { id: '2.1.2', title: 'Style & Garment Type Library', desc: 'বায়ার অনুযায়ী স্টাইল কোড ও আইটেম ক্যাটাগরি ম্যাপিং।' },
          { id: '2.1.3', title: 'Production Line Architecture', desc: 'ফ্লোর ও লাইন কনফিগারেশন (Line Name, Floor No, Capacity)।' },
          { id: '2.1.4', title: 'Color Library with HEX Codes', desc: 'কালার কোড, নাম ও ভিজ্যুয়াল HEX কালার সংরক্ষণ।' },
          { id: '2.1.5', title: 'Size Range Configuration', desc: 'Numeric (28, 30, 32) ও Alpha (S, M, L, XL) সাইজ লাইব্রেরি।' }
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
    desc: 'মার্চেন্ডাইজিং থেকে বায়ার Purchase Order (PO) এন্ট্রি এবং সাইজ-কালার রেশিও ভিত্তিক কোয়ান্টিটি ক্যালকুলেশন।',
    submodules: [
      {
        id: '3.1',
        name: 'Purchase Order (PO) Processing',
        features: [
          { id: '3.1.1', title: 'Auto-validated PO Creation', desc: 'মাস্টার ডাটা ভ্যালিডেশন সহ ইউনিক PO নম্বর রেজিস্ট্রি।' },
          { id: '3.1.2', title: 'Color vs Size Breakdown Matrix', desc: 'কালার ও সাইজের রেশিও অনুযায়ী স্বয়ংক্রিয় পিস ব্রেকডাউন ক্যালকুলেশন।' },
          { id: '3.1.3', title: 'Mathematical Quantity Guard', desc: 'ব্রেকডাউনের যোগফল মোট PO পরিমাণের সাথে মিল নিশ্চিতকরণ।' },
          { id: '3.1.4', title: 'Order Workflow Approval', desc: 'Draft -> Pending Approval -> Confirmed স্ট্যাটাস সাইকেল।' }
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
    desc: 'ইন্ডাস্ট্রিয়াল ইঞ্জিনিয়ারিং (IE) ও লাইন ক্যাপাসিটি প্ল্যানিং। SMV ক্যালকুলেশন এবং মেটেরিয়াল রেডিনেস ভেরিফিকেশন।',
    submodules: [
      {
        id: '4.1',
        name: 'Capacity & Line Allocation',
        features: [
          { id: '4.1.1', title: 'Line Loading Schedule', desc: 'নির্দিষ্ট সুইং লাইনে কনফার্মড PO অ্যালোকেশন।' },
          { id: '4.1.2', title: 'SMV & Manpower Input', desc: 'Standard Minute Value ও অপারেটর ইনপুট দিয়ে লাইভ এফিশিয়েন্সি নির্ধারণ।' }
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
    desc: 'ট্রেসিবিলিটির জন্মস্থান। ফেব্রিক লে এন্ট্রি, শেড ও রোল ট্র্যাকিং এবং ইউনিক QR কোড সম্বলিত বান্ডেল টিকিট জেনারেশন।',
    submodules: [
      {
        id: '5.1',
        name: 'Cut Lay & Spreading Registration',
        features: [
          { id: '5.1.1', title: 'Lay Parameters Entry', desc: 'Cut No, Plies, Fabric Roll No, Shade Band লগ।' },
          { id: '5.1.2', title: 'Excess Cutting Governance', desc: 'PO-এর অতিরিক্ত কাটিং পার্সেন্টেজ গণনা ও অনুমোদন।' }
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
    desc: 'প্রিন্ট ও এমব্রয়ডারি সেকশনে মালামাল পাঠানো (Dispatch) এবং মিসিং/রিজেক্ট ভ্যারিয়েন্স সহ রিসিভ করা।',
    submodules: [
      {
        id: '6.1',
        name: 'Dispatch & Receive Reconcile',
        features: [
          { id: '6.1.1', title: 'Delivery Challan Batching', desc: 'একাধিক বান্ডেলকে চালানে গ্রুপ করা।' },
          { id: '6.1.2', title: 'Missing & Reject Piece Logging', desc: 'নষ্ট হওয়া বা হারিয়ে যাওয়া পিস সিস্টেম থেকে বাদ দেওয়া।' }
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
    desc: 'ফ্যাক্টরি ফ্লোরের সর্বোচ্চ ট্রাফিক জোন। লাইনে বান্ডেল ইনপুট/আউটপুট স্ক্যানিং এবং রিয়েল-টাইম প্রতি ঘণ্টার আউটপুট।',
    submodules: [
      {
        id: '7.1',
        name: 'Tablet Floor Scanning',
        features: [
          { id: '7.1.1', title: 'Line-IN / Line-OUT Scanning', desc: 'সুইং লাইনে স্ক্যান ইন এবং ফিনিশিংয়ে স্ক্যান আউট।' },
          { id: '7.1.2', title: 'Offline-First Edge Sync', desc: 'ইন্টারনেট ড্রপ হলেও লোকাল ডিভাইসে ডাটা সেভ ও অটো সিঙ্ক।' }
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
    desc: 'ডিজিটাল কোয়ালিটি গেট। ইন্টারঅ্যাক্টিভ SVG বডি ম্যাপে ডিফেক্ট পয়েন্টিং এবং রিয়েল-টাইম DHU ট্র্যাকিং।',
    submodules: [
      {
        id: '8.1',
        name: 'Interactive Defect Logging',
        features: [
          { id: '8.1.1', title: '3-Way Inspection Flow', desc: 'বান্ডেল স্ক্যান করে Pass, Reject বা Alter স্ট্যাটাস অ্যাসাইন করা।' },
          { id: '8.1.2', title: 'Interactive SVG Body Map', desc: 'পোশাকের ভিজ্যুয়াল ম্যাপে ত্রুটি নির্দিষ্ট করা।' }
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
    desc: 'ওয়াশিং মেশিনের ব্যাচ ট্র্যাকিং, থ্রেড কাটিং, আয়রনিং এবং ফাইনাল মেজারমেন্ট অডিট।',
    submodules: [
      {
        id: '9.1',
        name: 'Wash Batch & Finishing QC',
        features: [
          { id: '9.1.1', title: 'Machine Batch Grouping', desc: 'ওয়াশ ব্যাচ তৈরি ও সময়কাল ট্র্যাক করা।' },
          { id: '9.1.2', title: 'Finishing & Pressing Gate', desc: 'ফাইনাল প্রেসিং ও ফোল্ডিং ক্লিয়ারেন্স।' }
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
    desc: 'কার্টন বারকোড জেনারেশন, কার্টনে সাইজ রেশিও মেলানো (Assortment Check) এবং শিপমেন্ট স্ক্যান-আউট।',
    submodules: [
      {
        id: '10.1',
        name: 'Carton Assembly & Container Loading',
        features: [
          { id: '10.1.1', title: 'Single-Piece into Carton Mapping', desc: 'পিস স্ক্যান করে কার্টনে অ্যাসাইন করা।' },
          { id: '10.1.2', title: 'Container Loading Scan', desc: 'কন্টেইনারে লোডের সময় বারকোড স্ক্যান আউট।' }
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
    desc: 'কাঁচামাল রিসিভ (MRR), ডাবল-এন্ট্রি ইনভেন্টরি লেজার এবং কাটিংয়ে স্পেসিফিক শেডের ফেব্রিক রোল ইস্যু।',
    submodules: [
      {
        id: '11.1',
        name: 'Material Receiving & Allocation',
        features: [
          { id: '11.1.1', title: 'Supplier PO Receiving Report (MRR)', desc: 'চালানের বিপরীতে ইয়ার্ড/কেজিতে মাল রিসিভ।' },
          { id: '11.1.2', title: 'Roll-to-PO Hard Allocation', desc: 'নির্দিষ্ট PO-এর জন্য ফেব্রিক রোল লক করা।' }
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
    desc: 'রিয়েল-টাইম ফ্লোর টিভি ড্যাশবোর্ড, লাইন এফিশিয়েন্সি, Pareto চার্ট এবং উচ্চপদস্থ কর্মকর্তাদের জন্য এক্সিকিউটিভ রিপোর্ট।',
    submodules: [
      {
        id: '12.1',
        name: 'Floor Displays & Analytics',
        features: [
          { id: '12.1.1', title: 'Hourly Target vs Actual Visuals', desc: 'ফ্লোর বড় পর্দায় লাইনের আউটপুট প্রদর্শন।' },
          { id: '12.1.2', title: 'Top Defect Pareto Charts', desc: 'ডিফেক্ট বিশ্লেষণ ও এফিশিয়েন্সি হিটম্যাপ।' }
        ]
      }
    ]
  }
];

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [selectedMod, setSelectedMod] = useState(modulesData[0]);

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-cyan-500 selection:text-black ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Top Navigation */}
      <header className={`border-b backdrop-blur-md sticky top-0 z-40 transition-colors duration-300 ${
        isDark ? 'border-slate-800/80 bg-slate-900/80' : 'border-slate-200 bg-white/80 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
              R
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`font-black text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                  isDark ? 'from-white via-slate-100 to-slate-300' : 'from-slate-950 via-slate-800 to-slate-700'
                }`}>
                  RMG TRACEABILITY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
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
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Admin Login</span>
              </Link>
            )}

            {/* Dark/Light Mode Button */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-yellow-400 shadow-md shadow-black/20'
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
        <section className={`relative overflow-hidden rounded-3xl p-8 sm:p-10 border ${
          isDark 
            ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 border-slate-800 shadow-2xl' 
            : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200 shadow-md'
        }`}>
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <span>🎯 End-to-End Woven Manufacturing Architecture</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              গার্মেন্টস কারখানার কাটিং থেকে শিপমেন্ট পর্যন্ত প্রতিটি পিসের রিয়েল-টাইম ডিজিটাল ট্র্যাকিং
            </h1>
            <p className={`text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <strong className="text-cyan-500">কেন এই সফটওয়্যার?</strong> সাধারণ ইআরপিতে ফ্লোরের নিখুঁত হিসাব থাকে না। এই সিস্টেমে প্রতিটি কাটিং বান্ডেলের জন্য <strong>ইউনিক QR কোড</strong> তৈরি হয় এবং অ্যান্ড্রয়েড ট্যাবলেট স্ক্যানিংয়ের মাধ্যমে <strong>ভুল সাইজ/শেড মিক্স-আপ বন্ধ</strong>, <strong>ডিফেক্ট (DHU) নিয়ন্ত্রণ</strong> এবং <strong>রিয়েল-টাইম WIP ট্র্যাকিং</strong> নিশ্চিত করা হয়।
            </p>
          </div>

          {/* Quick Lifecycle Stepper */}
          <div className="mt-8 pt-8 border-t border-slate-700/40">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <span>প্রোডাকশন ট্রেসিবিলিটি লাইফসাইকেল (Traceability Lifecycle)</span>
              <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {lifecycleSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className={`p-3.5 rounded-2xl border transition-all ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                  }`}>
                    <div className="flex items-center justify-between text-slate-400 text-xs mb-1.5">
                      <span className="font-mono font-bold text-cyan-500">STEP {step.step}</span>
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
              সিস্টেমের মূল ৪টি ভিত্তি ও সুবিধা (Core Value Propositions)
            </h2>
            <p className="text-sm text-slate-400">কীভাবে এটি ফ্যাক্টরির উৎপাদন খরচ ও ত্রুটি কমিয়ে কার্যক্ষমতা বৃদ্ধি করে</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {valueProps.map((prop, idx) => {
              const Icon = prop.icon;
              return (
                <div key={idx} className={`p-5 rounded-2xl border transition-all ${
                  isDark ? prop.bgDark : prop.bgLight
                }`}>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${prop.color} text-white w-fit shadow-md mb-3`}>
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
                ১২টি এন্টারপ্রাইজ মডিউল ও ফিচার পরিদর্শক (Module, Sub-module & Feature Inspector)
              </h2>
              <p className="text-sm text-slate-400">নিচের যেকোনো মডিউল কার্ডে ক্লিক করে তার অন্তর্ভুক্ত সাব-মডিউল ও স্পেসিফিক ফিচারসমূহ দেখুন</p>
            </div>
            <div className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 text-cyan-500 font-semibold border border-cyan-500/20 w-fit">
              Click Any Module to Inspect
            </div>
          </div>

          {/* Detailed Inspector Display for Selected Module */}
          <div className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 ${
            isDark 
              ? 'bg-slate-900 border-cyan-500/60 shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-500/30' 
              : 'bg-white border-cyan-500/80 shadow-xl ring-2 ring-cyan-500/20'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/30">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-tr ${selectedMod.color} text-white shadow-xl ring-1 ring-white/20`}>
                  {React.createElement(selectedMod.icon, { className: 'h-8 w-8' })}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
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

              <div className={`p-4 rounded-2xl border text-xs space-y-2 lg:min-w-[280px] ${
                isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Role:</span>
                  <span className="font-semibold text-cyan-400">{selectedMod.role}</span>
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
              <div className="flex items-center space-x-2 text-sm font-bold text-cyan-500">
                <ListTree className="h-4 w-4" />
                <span>মডিউল {selectedMod.id}-এর সাব-মডিউল ও ফিচারসমূহ (Sub-modules & Features Breakdown):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {selectedMod.submodules.map((sub) => (
                  <div 
                    key={sub.id} 
                    className={`rounded-2xl p-5 border transition-all ${
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
                  className={`group relative rounded-2xl p-5 border transition-all cursor-pointer select-none ${
                    isSelected 
                      ? isDark 
                        ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400' 
                        : 'bg-white border-cyan-600 shadow-lg ring-2 ring-cyan-500/40'
                      : isDark
                        ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${mod.color} text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-mono font-bold ${
                      isSelected 
                        ? 'text-cyan-400' 
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
                      <span className="text-cyan-500 font-semibold flex items-center space-x-0.5">
                        <span>{isSelected ? 'Viewing Features' : 'Click to View'}</span>
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
          <span className="font-mono text-cyan-500">Domain Driven Design &bull; Offline First &bull; Strict Transaction Integrity</span>
        </div>
      </footer>
    </div>
  );
}
