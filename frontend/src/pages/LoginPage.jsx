import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [loginIdentifier, setLoginIdentifier] = useState('EMP-SUPERADMIN');
  const [password, setPassword] = useState('Admin@123456');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(loginIdentifier, password);
    if (res.success) {
      navigate('/admin');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 font-sans transition-colors duration-200 relative overflow-hidden ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Authentic RMG Woven Fabric / Textile Twill Weft Pattern - Ultra Soft & Light */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.07] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3Cpath d='M0 0l40 40h-20L0 20M40 0v20L20 0' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, #000 50%, transparent 100%)'
        }}
      />

      {/* Clean Premium Enterprise Ultra-Subtle Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top Centered Soft Illumination */}
        <div className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[140px] ${
          isDark ? 'bg-blue-600/8' : 'bg-blue-300/12'
        }`} />
        
        {/* Bottom Ambient Tint */}
        <div className={`absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[150px] ${
          isDark ? 'bg-slate-800/10' : 'bg-slate-200/20'
        }`} />
      </div>

      {/* Content Container */}
      <div className="w-full max-w-sm relative z-10">
        
        {/* Top Bar with Back Link and Theme Toggle */}
        <div className="mb-4 flex items-center justify-between">
          <Link 
            to="/" 
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Overview</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className={`p-1.5 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-yellow-400 shadow-sm'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Clean Single Card Container */}
        <div className={`border rounded-lg p-6 sm:p-8 transition-colors duration-200 backdrop-blur-xs ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 shadow-xl' 
            : 'bg-white/95 border-slate-200 shadow-md ring-1 ring-slate-900/5'
        }`}>
          
          {/* Brand Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-10 w-10 bg-blue-600 rounded-md items-center justify-center font-bold text-white text-lg mb-3 shadow-xs">
              R
            </div>
            <h1 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              RMG Traceability ERP
            </h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Admin Authentication
            </p>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Employee ID / Username / Email
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="e.g. EMP-1001 or admin"
                className={`w-full px-3 py-2 rounded text-xs border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2 pr-9 rounded text-xs border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' 
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-2.5 top-2.5 cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className={`text-center mt-6 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          &copy; 2026 RMG Traceability ERP. All Rights Reserved.
        </div>

      </div>

    </div>
  );
}
