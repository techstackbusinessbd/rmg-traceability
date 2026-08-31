import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  Cpu, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('admin@rmgtrace.com');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Left Branding Hero Section */}
      <div className="md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/40 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <Link to="/" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-8 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>হোমপেজে ফিরে যান (Back to Overview)</span>
          </Link>

          <div className="flex items-center space-x-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-cyan-500/30 ring-1 ring-white/20">
              R
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight text-white flex items-center space-x-2">
                <span>RMG TRACEABILITY</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Enterprise
                </span>
              </h1>
              <p className="text-xs text-slate-400">Woven Garments Floor Execution & ERP System</p>
            </div>
          </div>

          <div className="space-y-4 max-w-lg mt-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              সুরক্ষিত অ্যাডমিন ও ম্যানেজমেন্ট অথেন্টিকেশন পোর্টাল
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              সিস্টেম অ্যাডমিন, রোল-বেসড পারমিশন (RBAC), ফ্লোর ট্যাবলেট কনফিগারেশন এবং রিয়েল-টাইম অডিট ট্রেল পরিচালনা করতে লগইন করুন।
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="my-8 space-y-3">
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span><strong>Protected Access:</strong> শুধুমাত্র অনুমোদিত অ্যাডমিন নতুন ইউজার ও ট্যাবলেট রেজিস্ট্রি করতে পারেন।</span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span><strong>Spatie RBAC Scopes:</strong> সুনির্দিষ্ট রোল ও গ্রানুলার অ্যাক্সেস কন্ট্রোল।</span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span><strong>Immutable Audit Logs:</strong> প্রতিটি অ্যাকশন স্বয়ংক্রিয়ভাবে অডিট ট্রেইলে সংরক্ষিত।</span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>&copy; 2026 RMG Traceability ERP</span>
          <span className="font-mono text-cyan-400">Sanctum Token Guard &bull; SHA-256</span>
        </div>
      </div>

      {/* Right Dedicated Login Form Section */}
      <div className="md:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/20 mb-4">
              <Lock className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-black text-white">অ্যাডমিন কনসোলে লগইন করুন</h2>
            <p className="text-xs text-slate-400 mt-1">আপনার সিকিউর ক্রেডেনশিয়াল প্রদান করে প্রবেশ করুন</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                অ্যাডমিন ইমেইল (Admin Email)
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rmgtrace.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  পাসওয়ার্ড (Password)
                </label>
                <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                  Default: Admin@123456
                </span>
              </div>
              <div className="relative">
                <KeyRound className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-2xl text-xs bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              <span>{loading ? 'অথেন্টিকেশন যাচাই হচ্ছে...' : 'লগইন করুন (Sign In to Console)'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Info Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="text-[11px] uppercase font-bold tracking-wider text-cyan-400 flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ডিফল্ট সুপার অ্যাডমিন ক্রেডেনশিয়াল</span>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              Email: <strong className="text-white">admin@rmgtrace.com</strong>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              Password: <strong className="text-white">Admin@123456</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
