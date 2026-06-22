import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Animated background - only visible in dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid pattern overlay - only visible in dark mode */}
      <div className="absolute inset-0 opacity-20 dark:block hidden" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 dark:bg-white/10 backdrop-blur-sm hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-300"
        >
          {isDark ? <Sun size={20} className="text-yellow-500 dark:text-yellow-300" /> : <Moon size={20} className="text-gray-600 dark:text-blue-300" />}
        </button>

        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 mb-2 tracking-tight">
            Textile ERP
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm font-medium tracking-wide">Next-Gen Business Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-gray-600 dark:text-slate-400 text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Credentials */}
          <div className="mt-8 p-5 bg-gradient-to-r from-purple-100 to-fuchsia-100 dark:from-purple-500/10 dark:to-fuchsia-500/10 rounded-2xl border border-purple-200 dark:border-purple-500/20">
            <p className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase tracking-widest mb-3 text-center">
              Default Credentials
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-slate-300 font-medium">Admin</span>
                <span className="text-purple-600 dark:text-purple-300 font-mono bg-purple-200 dark:bg-purple-500/20 px-3 py-1.5 rounded-lg">admin / admin123</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-700 dark:text-slate-300 font-medium">Staff</span>
                <span className="text-purple-600 dark:text-purple-300 font-mono bg-purple-200 dark:bg-purple-500/20 px-3 py-1.5 rounded-lg">staff / staff123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-slate-500 text-xs mt-8">
          © 2024 Textile ERP. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
