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
  TrendingUp,
  Layers,
  Award,
  Briefcase,
  Shield,
  KeyRound,
} from 'lucide-react';

export const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Dynamic Password Security Meter (0 to 3)
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);

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

  return (
    <div className="min-h-screen bg-[#090616] flex flex-col lg:flex-row relative overflow-x-hidden select-none font-sans text-slate-100">
      {/* Dynamic Ambient Background Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[420px] sm:w-[620px] h-[420px] sm:h-[620px] bg-[#7652E8]/22 rounded-full blur-[120px] sm:blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] sm:right-[15%] w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] bg-[#9B7AFB]/20 rounded-full blur-[130px] sm:blur-[160px] pointer-events-none" />
      <div className="absolute top-[35%] right-[-5%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-cyan-500/12 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      {/* Subtle Precision Dot Matrix Grid */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* LEFT COLUMN: DESKTOP SHOWCASE HERO (>= lg screens) */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/[0.08]">
        {/* Brand Header */}
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
            <span className="ml-2.5 text-[10px] uppercase font-bold tracking-widest text-[#B396FF] bg-violet-950/70 border border-violet-700/50 px-2.5 py-0.5 rounded-full">
              Intelligence v2.0
            </span>
          </div>
        </div>

        {/* Center Presentation: Headline & Floating Showcase */}
        <div className="my-auto py-8 max-w-xl space-y-7">
          <div className="space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-[11px] font-bold text-violet-300">
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

          {/* Platform Capability Showcase Card */}
          <div className="p-5 rounded-3xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-2xl space-y-3.5 hover:border-violet-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Automated Recruitment Pipeline</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Live Synchronization
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-400 font-medium">Stage 1</div>
                <div className="text-xs font-bold text-white mt-0.5">Applied</div>
                <div className="text-[9px] text-emerald-400 mt-1">Confirmed</div>
              </div>
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                <div className="text-[10px] text-violet-300 font-medium">Stage 2</div>
                <div className="text-xs font-bold text-violet-200 mt-0.5">Interview</div>
                <div className="text-[9px] text-violet-300 mt-1">Scheduled</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-center">
                <div className="text-[10px] text-slate-400 font-medium">Stage 3</div>
                <div className="text-xs font-bold text-white mt-0.5">Offer</div>
                <div className="text-[9px] text-cyan-400 mt-1">Reviewing</div>
              </div>
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

      {/* RIGHT COLUMN: FULLY TRANSPARENT GLASSMORPHIC AUTH EXPERIENCE */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:p-8 lg:p-12 relative z-10 min-h-screen w-full">
        <div className="w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[430px] space-y-3.5 sm:space-y-5">

          {/* VIBRANT MOBILE BRAND HERO (< lg screens) */}
          <div className="lg:hidden text-center space-y-2 sm:space-y-3 pt-0.5">
            {/* 3D Radiant Emblem with Live Status Ping */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-[20px] sm:rounded-[24px] bg-gradient-to-tr from-[#7652E8] via-[#916DF8] to-[#C4B5FD] p-[2px] shadow-2xl shadow-[#7652E8]/50 ring-4 ring-violet-500/20">
                <div className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-[#120D2C] flex items-center justify-center">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-[#A78BFA] transform -rotate-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" />
                    <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
                    <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2.2" fill="none" />
                  </svg>
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 bg-emerald-500 border-2 border-[#090616]" />
              </span>
            </div>

            {/* Typography & Value Proposition */}
            <div>
              <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">NEXORA</h1>
                <span className="text-[9px] sm:text-[10px] font-bold text-violet-300 bg-violet-900/70 border border-violet-700/50 px-1.5 sm:px-2 py-0.5 rounded-full">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300/80 mt-0.5 sm:mt-1 font-medium">
                "Every application. Every update. One place."
              </p>
            </div>
          </div>

          {/* BORDERLESS FORM AREA (Compact for mobile, spacious for desktop) */}
          <div className="w-full space-y-3 sm:space-y-5 transition-all">
            {/* Header Title & Tab Switcher */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                  <span>{isRegister ? 'Create Your Account' : 'Welcome Back'}</span>
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A78BFA]" />
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 font-medium">
                  {isRegister
                    ? 'Launch your intelligent job search workspace'
                    : 'Sign in to access your recruitment pipeline'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-white/[0.06] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-white/[0.12] backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    !isRegister
                      ? 'bg-gradient-to-r from-[#7652E8] to-[#916DF8] text-white shadow-md shadow-[#7652E8]/35'
                      : 'text-slate-400 hover:text-white'
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
                  className={`flex-1 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    isRegister
                      ? 'bg-gradient-to-r from-[#7652E8] to-[#916DF8] text-white shadow-md shadow-[#7652E8]/35'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/30 text-[11px] sm:text-xs text-rose-300 font-semibold leading-relaxed flex items-start space-x-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
              {isRegister && (
                <>
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 sm:mb-1.5">
                      Full Name
                    </label>
                    <div
                      className={`relative rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                        focusedField === 'name'
                          ? 'border-[#A78BFA] bg-white/[0.12] ring-3 sm:ring-4 ring-[#7652E8]/30 shadow-[0_0_20px_rgba(118,82,232,0.35)]'
                          : 'border-white/[0.14] bg-white/[0.06] hover:border-white/[0.25] hover:bg-white/[0.08]'
                      }`}
                    >
                      <UserIcon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3.5 transition-colors ${
                          focusedField === 'name' ? 'text-[#A78BFA]' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adarsh Sharma"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white font-semibold placeholder:text-slate-400/50 placeholder:font-normal placeholder:transition-opacity focus:placeholder:opacity-35 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>

                  {/* Target Job Role Input */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider mb-1 sm:mb-1.5">
                      Target Job Role
                    </label>
                    <div
                      className={`relative rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                        focusedField === 'role'
                          ? 'border-[#A78BFA] bg-white/[0.12] ring-3 sm:ring-4 ring-[#7652E8]/30 shadow-[0_0_20px_rgba(118,82,232,0.35)]'
                          : 'border-white/[0.14] bg-white/[0.06] hover:border-white/[0.25] hover:bg-white/[0.08]'
                      }`}
                    >
                      <Briefcase
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3.5 transition-colors ${
                          focusedField === 'role' ? 'text-[#A78BFA]' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        value={targetRole}
                        onFocus={() => setFocusedField('role')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white font-semibold placeholder:text-slate-400/50 placeholder:font-normal placeholder:transition-opacity focus:placeholder:opacity-35 focus:outline-none bg-transparent"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address Input */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Work or Personal</span>
                </div>
                <div
                  className={`relative rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                    focusedField === 'email'
                      ? 'border-[#A78BFA] bg-white/[0.12] ring-3 sm:ring-4 ring-[#7652E8]/30 shadow-[0_0_20px_rgba(118,82,232,0.35)]'
                      : 'border-white/[0.14] bg-white/[0.06] hover:border-white/[0.25] hover:bg-white/[0.08]'
                  }`}
                >
                  <Mail
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3.5 transition-colors ${
                      focusedField === 'email' ? 'text-[#A78BFA]' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.com"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white font-semibold placeholder:text-slate-400/50 placeholder:font-normal placeholder:transition-opacity focus:placeholder:opacity-35 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] sm:text-xs font-bold text-[#A78BFA] hover:text-white cursor-pointer flex items-center space-x-1"
                  >
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div
                  className={`relative rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                    focusedField === 'password'
                      ? 'border-[#A78BFA] bg-white/[0.12] ring-3 sm:ring-4 ring-[#7652E8]/30 shadow-[0_0_20px_rgba(118,82,232,0.35)]'
                      : 'border-white/[0.14] bg-white/[0.06] hover:border-white/[0.25] hover:bg-white/[0.08]'
                  }`}
                >
                  <Lock
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3.5 transition-colors ${
                      focusedField === 'password' ? 'text-[#A78BFA]' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. ••••••••••••"
                    className="w-full pl-9 sm:pl-10 pr-9 sm:pr-11 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-white font-semibold placeholder:text-slate-400/50 placeholder:font-normal placeholder:transition-opacity focus:placeholder:opacity-35 focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-2 sm:top-3 p-1 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/[0.08] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {isRegister && password && (
                  <div className="mt-1.5 sm:mt-2 space-y-1 animate-in fade-in">
                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 1 ? 'bg-amber-400' : 'bg-white/[0.1]'
                        }`}
                      />
                      <div
                        className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 2 ? 'bg-[#916DF8]' : 'bg-white/[0.1]'
                        }`}
                      />
                      <div
                        className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          passwordStrength >= 3 ? 'bg-emerald-400' : 'bg-white/[0.1]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 px-0.5">
                      <span>Security level:</span>
                      <span className="font-bold text-slate-300">
                        {passwordStrength === 1 && 'Basic (Add capital letter or number)'}
                        {passwordStrength === 2 && 'Good (Add special character)'}
                        {passwordStrength >= 3 && 'Strong & Secure'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#7652E8] via-[#8B5CF6] to-[#A855F7] hover:from-[#6D46E6] hover:to-[#9947E9] active:scale-[0.98] text-white text-xs sm:text-sm font-black tracking-wide shadow-xl shadow-[#7652E8]/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2 sm:mt-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing securely...</span>
                  </div>
                ) : (
                  <>
                    <span>{isRegister ? 'Create Free Workspace' : 'Open Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security badge footer */}
            <div className="pt-2 sm:pt-3 border-t border-white/[0.08] flex items-center justify-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span>Encrypted Session • Private Candidate Record</span>
            </div>
          </div>

          {/* MOBILE VALUE METRICS TICKER (< lg screens) */}
          <div className="lg:hidden flex items-center justify-around px-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
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
