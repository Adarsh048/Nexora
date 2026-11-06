import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Zap,
  TrendingUp,
  Layers,
  Award,
  Clock,
  Briefcase,
} from 'lucide-react';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillDemo = () => {
    setIsRegister(false);
    setEmail('test@gmail.com');
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0E0B1F] flex flex-col lg:flex-row relative overflow-hidden select-none font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] bg-[#7652E8]/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[30%] w-[600px] h-[600px] bg-[#9B7AFB]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* LEFT COLUMN: HERO SHOWCASE (Desktop & Tablet) */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/[0.08]">
        {/* Top Brand Tagline */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#7652E8] via-[#916DF8] to-[#B396FF] p-0.5 shadow-lg shadow-[#7652E8]/40 flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-[#120E28] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#9B7AFB]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" opacity="0.9" />
                <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">NEXORA</span>
            <span className="ml-2.5 text-[10px] uppercase font-bold tracking-widest text-[#B396FF] bg-violet-950/70 border border-violet-700/50 px-2 py-0.5 rounded-full">
              Intelligence v2.0
            </span>
          </div>
        </div>

        {/* Center Presentation: Headline & Floating Showcase */}
        <div className="my-auto py-8 max-w-xl space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-bold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-[#9B7AFB]" />
              <span>Real-Time Job Application Intelligence Platform</span>
            </div>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Every application. <br />
              <span className="bg-gradient-to-r from-[#9B7AFB] via-violet-200 to-white bg-clip-text text-transparent">
                Every update. One place.
              </span>
            </h1>
            <p className="text-sm text-slate-300/80 leading-relaxed max-w-lg font-normal">
              Take complete command of your career search. Track applications effortlessly, parse recruiter emails automatically, and maintain verified timeline evidence with zero manual friction.
            </p>
          </div>

          {/* Interactive Showcase Card 1: Detected Recruiter Email */}
          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-2xl space-y-3.5 hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Inbox Intelligence Detection</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                94% Match Confidence
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">Google Careers</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-xs font-semibold text-violet-300">
                Invitation to Technical Interview: Senior Software Engineer
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                "Hi there, We reviewed your application and would like to invite you to interview with our engineering team..."
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Auto-updates application timeline
              </span>
              <span>AES-256 Encrypted</span>
            </div>
          </div>

          {/* Live Metrics Showcase Pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tracking Speed', val: '< 50ms', sub: 'Instant queries' },
              { label: 'Detection Engine', val: '5 States', sub: 'Interview, Offer, Test' },
              { label: 'Privacy Standard', val: 'Zero Tracking', sub: '100% Private Data' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center backdrop-blur-xs"
              >
                <div className="text-base font-black text-white">{stat.val}</div>
                <div className="text-[11px] font-bold text-violet-300 mt-0.5">{stat.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="flex items-center space-x-6 text-xs text-slate-400 border-t border-white/[0.06] pt-6">
          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-grade AES-256 Token Encryption</span>
          </div>
          <span className="text-white/20">•</span>
          <span>Google OAuth 2.0 Read-Only</span>
          <span className="text-white/20">•</span>
          <span>Production Ready</span>
        </div>
      </div>

      {/* RIGHT COLUMN: REFINED AUTH CARD (Mobile & Desktop) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative z-10 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Brand (visible only on small screens) */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#A07BFC] mx-auto flex items-center justify-center shadow-lg shadow-[#7652E8]/40">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" />
                <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">NEXORA</h1>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9B7AFB]">
              Job Application Intelligence
            </p>
          </div>

          {/* Main Glassmorphic Form Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-violet-100/80 relative space-y-6">
            {/* Card Header & Tab Switcher */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {isRegister ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isRegister
                      ? 'Launch your intelligent job search workspace'
                      : 'Sign in to access your recruitment pipeline'}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-[#F6F4FD] p-1.5 rounded-2xl border border-violet-100/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isRegister
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
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
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-semibold leading-relaxed flex items-start space-x-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adarsh Sharma"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target Job Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Full Stack Developer, Product Manager"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#916DF8] hover:from-[#6A47DD] hover:to-[#835CEE] text-white text-xs font-bold shadow-lg shadow-[#7652E8]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 active:scale-[0.99] mt-2"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing securely...</span>
                  </div>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Free Workspace' : 'Open Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill Pill */}
            {!isRegister && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="w-full py-2 px-3 rounded-xl bg-violet-50/70 hover:bg-violet-100/70 border border-violet-100 text-[#7652E8] text-[11px] font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#7652E8]" />
                  <span>Fill Demo Account (Instant Test)</span>
                </button>
              </div>
            )}

            {/* Security badge footer */}
            <div className="pt-3 border-t border-violet-50 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Encrypted Session • Private Candidate Records</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
