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
  Check,
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
  const [demoFilled, setDemoFilled] = useState(false);

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
    setDemoFilled(true);
    setTimeout(() => setDemoFilled(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0E0B1F] flex flex-col lg:flex-row relative overflow-x-hidden select-none font-sans">
      {/* Dynamic Ambient Background Glow Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-[#7652E8]/25 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] sm:right-[20%] w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#9B7AFB]/20 rounded-full blur-[110px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-5%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-sky-500/10 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

      {/* Subtle Dot Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* LEFT COLUMN: HERO SHOWCASE (Desktop lg:flex) */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/[0.08]">
        {/* Top Brand Header */}
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

          {/* Interactive Showcase Card: Detected Recruiter Email */}
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

      {/* RIGHT COLUMN / MOBILE EXPERIENCE */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:p-8 lg:p-12 relative z-10 min-h-screen w-full">
        <div className="w-full max-w-[430px] space-y-4 sm:space-y-6">

          {/* ATTRACTIVE MOBILE BRAND HERO (Visible only on < lg screens) */}
          <div className="lg:hidden text-center space-y-3 pt-2 pb-1">
            {/* Glowing Brand Icon with Ring & Status Indicator */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-[#7652E8] via-[#916DF8] to-[#C4B5FD] p-0.5 shadow-xl shadow-[#7652E8]/40 ring-4 ring-violet-500/10 animate-in zoom-in-90 duration-300">
                <div className="w-full h-full rounded-[20px] bg-[#130F2D] flex items-center justify-center">
                  <svg className="w-7 h-7 text-[#A78BFA] transform -rotate-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" />
                    <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
                    <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2.2" fill="none" />
                  </svg>
                </div>
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-[2.5px] border-[#0E0B1F] shadow-sm animate-pulse" />
            </div>

            {/* Title & Tagline */}
            <div>
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-2xl font-black text-white tracking-tight">NEXORA</h1>
                <span className="text-[10px] font-bold text-violet-300 bg-violet-900/60 border border-violet-700/50 px-2 py-0.5 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-1 font-medium">
                "Every application. Every update. One place."
              </p>
            </div>

            {/* Live Recruiter Simulation Teaser Pill on Mobile */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md shadow-lg text-[11px] text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-semibold truncate">Google Interview Invite detected</span>
              <span className="text-[10px] font-bold text-[#C4B5FD] bg-violet-950/90 px-1.5 py-0.5 rounded-md">
                94% Match
              </span>
            </div>
          </div>

          {/* MAIN GLASSMORPHIC FORM CARD */}
          <div className="bg-white rounded-[28px] sm:rounded-3xl p-6 sm:p-9 shadow-2xl shadow-[#7652E8]/10 border border-violet-100/90 relative space-y-5 transition-all">
            {/* Card Header & Tab Switcher */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {isRegister ? 'Create Your Account' : 'Welcome Back'}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    {isRegister
                      ? 'Launch your intelligent job search workspace'
                      : 'Sign in to access your recruitment pipeline'}
                  </p>
                </div>
              </div>

              {/* Seamless Segmented Control Tabs */}
              <div className="flex bg-[#F5F3FC] p-1 rounded-2xl border border-violet-100/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !isRegister
                      ? 'bg-white text-slate-900 shadow-xs'
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
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isRegister
                      ? 'bg-white text-slate-900 shadow-xs'
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adarsh Sharma"
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                      Target Job Role
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Full Stack Developer, Product Manager"
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-3.5 py-3 rounded-2xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#916DF8] hover:from-[#6A47DD] hover:to-[#835CEE] active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-[#7652E8]/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-1"
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

            {/* 1-Tap Demo Autofill Action */}
            {!isRegister && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-violet-50/80 to-purple-50/80 hover:from-violet-100 hover:to-purple-100 border border-violet-100 text-[#7652E8] text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  {demoFilled ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Demo Account Filled!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#7652E8] fill-[#7652E8]" />
                      <span>1-Tap Demo Account (Quick Fill)</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Security badge footer inside card */}
            <div className="pt-2 border-t border-violet-50 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Encrypted Session • Private Candidate Record</span>
            </div>
          </div>

          {/* MOBILE VALUE TICKER (Visible on < lg screens) */}
          <div className="lg:hidden flex items-center justify-around px-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <span>&lt; 50ms Queries</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>Zero Spam</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
