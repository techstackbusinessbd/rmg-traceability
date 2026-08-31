import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
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
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Top Bar with Back Link and Theme Toggle */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between">
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
          className={`p-2 rounded-md border transition-all flex items-center justify-center cursor-pointer ${
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
      <div className={`w-full max-w-sm border rounded-lg p-6 sm:p-8 transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-900 border-slate-800 shadow-xl' 
          : 'bg-white border-slate-200 shadow-md'
      }`}>
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-10 w-10 bg-blue-600 rounded-md items-center justify-center font-bold text-white text-lg mb-3 shadow-sm">
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold block mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rmgtrace.com"
              required
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
                required
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
            className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

      </div>

      {/* Footer */}
      <div className={`text-center mt-6 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        &copy; 2026 RMG Traceability ERP. All Rights Reserved.
      </div>

    </div>
  );
}
