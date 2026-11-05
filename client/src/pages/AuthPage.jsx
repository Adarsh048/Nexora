import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, targetRole });
      } else {
        await login({ email, password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FD] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-violet-100/80 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#A07BFC] mx-auto flex items-center justify-center shadow-lg shadow-[#7652E8]/35 ring-4 ring-violet-50 mb-3.5">
            <svg
              className="w-7 h-7 text-white transform -rotate-12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight font-sans">NEXORA</h1>
          <p className="text-[11px] text-[#7652E8] font-bold uppercase tracking-widest mt-0.5">
            Job Application Intelligence Platform
          </p>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            "Every application. Every update. One place."
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F8F7FD] p-1.5 rounded-2xl border border-violet-100/70">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Product Designer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Get Started' : 'Open Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Security badge */}
        <div className="pt-2 border-t border-violet-50 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session • Private Candidate Records</span>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;

