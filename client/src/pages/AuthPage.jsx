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
    <div className="min-h-screen bg-[#080711] flex flex-col lg:flex-row relative overflow-x-hidden select-none font-sans text-slate-100">
      {/* Refined Enterprise Ambient Top-Center Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-gradient-to-b from-[#7652E8]/15 via-[#6366F1]/08 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-violet-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Precision Architectural Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* LEFT COLUMN: ENTERPRISE PRODUCT SHOWCASE (>= lg screens) */}
      <div className="hidden lg:flex lg:w-7/12 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/[0.07] bg-white/[0.01]">
        {/* Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28D9] via-[#7C3AED] to-[#A78BFA] p-0.5 shadow-md shadow-violet-900/30 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#0E0C1F] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#A78BFA]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" opacity="0.9" />
                <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black text-white tracking-tight">NEXORA</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded-md">
              Platform v2.0
            </span>
          </div>
        </div>

        {/* Center Presentation: Headline & Real Platform Preview */}
        <div className="my-auto py-8 max-w-xl space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[11px] font-semibold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>The Intelligent Job Application Operating System</span>
            </div>
            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Every application. <br />
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-white bg-clip-text text-transparent">
                Every update. One place.
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg font-normal">
              Take complete command of your career search. Track applications effortlessly, sync recruitment timelines in real time, and maintain verified evidence with zero manual friction.
            </p>
          </div>

          {/* Interactive Enterprise Pipeline Preview Card */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-4.5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">Live Recruitment Pipeline</span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md">
                3 Active Interviews
              </span>
            </div>

            {/* Pipeline Rows Preview */}
            <div className="space-y-2">
              {[
                { company: 'Stripe', role: 'Staff Frontend Engineer', stage: 'Technical Round 3', match: '96%', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
                { company: 'OpenAI', role: 'Full Stack Engineer', stage: 'Application Review', match: '92%', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                { company: 'Figma', role: 'Product Systems Lead', stage: 'Offer In Review', match: '98%', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center font-bold text-[11px] text-white">
                      {row.company[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{row.company}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{row.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${row.badge}`}>
                      {row.stage}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{row.match}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with live timeline
              </span>
              <span>AES-256 Encrypted</span>
            </div>
          </div>

          {/* Performance & Security Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Query Latency', val: '< 50ms', sub: 'Instant cache' },
              { label: 'Detection Engine', val: '5 States', sub: 'Screening to offer' },
              { label: 'Privacy Standard', val: '100% Private', sub: 'Zero data sales' },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center"
              >
                <div className="text-sm font-bold text-white">{stat.val}</div>
                <div className="text-[10px] font-semibold text-violet-300 mt-0.5">{stat.label}</div>
                <div className="text-[9px] text-slate-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="flex items-center space-x-6 text-xs text-slate-400 border-t border-white/[0.06] pt-5">
          <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-grade Token Security</span>
          </div>
          <span className="text-white/20">•</span>
          <span>Google OAuth 2.0 Read-Only</span>
          <span className="text-white/20">•</span>
          <span>SOC2 Compliant Standards</span>
        </div>
      </div>

      {/* RIGHT COLUMN: REFINED STANDARD ENTERPRISE AUTH FORM */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:p-8 lg:p-12 relative z-10 min-h-screen w-full">
        <div className="w-full max-w-[340px] xs:max-w-[370px] sm:max-w-[400px] space-y-4 sm:space-y-5">

          {/* CLEAN STANDARD BRAND HERO (< lg screens) */}
          <div className="lg:hidden text-center space-y-2 pt-1">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6D28D9] via-[#7C3AED] to-[#A78BFA] p-0.5 shadow-md shadow-violet-900/40">
              <div className="w-full h-full rounded-[10px] bg-[#0E0C1F] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A78BFA]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" />
                  <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
                  <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2.2" fill="none" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center space-x-1.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">NEXORA</h1>
                <span className="text-[9px] font-bold text-violet-300 bg-violet-950/70 border border-violet-800/40 px-1.5 py-0.5 rounded-md">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-normal">
                Job Application Intelligence Platform
              </p>
            </div>
          </div>

          {/* STANDARD AUTH SECTION */}
          <div className="w-full space-y-3.5 sm:space-y-4.5 transition-all">
            {/* Header Title & Segment Switcher */}
            <div className="space-y-2.5 sm:space-y-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{isRegister ? 'Create Your Account' : 'Welcome Back'}</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-normal">
                  {isRegister
                    ? 'Launch your intelligent job search workspace'
                    : 'Sign in to access your recruitment pipeline'}
                </p>
              </div>

              {/* Standard Segmented Tab Control */}
              <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isRegister
                      ? 'bg-violet-600 text-white shadow-xs'
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
                  className={`flex-1 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isRegister
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-[11px] sm:text-xs text-rose-300 font-medium leading-relaxed flex items-start space-x-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5">
              {isRegister && (
                <>
                  {/* Full Name Input */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div
                      className={`relative rounded-xl border transition-all duration-150 ${
                        focusedField === 'name'
                          ? 'border-violet-500/80 bg-white/[0.07] ring-2 ring-violet-500/25'
                          : 'border-white/[0.1] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.06]'
                      }`}
                    >
                      <UserIcon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3 transition-colors ${
                          focusedField === 'name' ? 'text-violet-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        required
                        value={name}
                        autoComplete="name"
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Adarsh Sharma"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 placeholder:font-normal focus:outline-none bg-transparent auth-input"
                      />
                    </div>
                  </div>

                  {/* Target Job Role Input */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider mb-1">
                      Target Job Role
                    </label>
                    <div
                      className={`relative rounded-xl border transition-all duration-150 ${
                        focusedField === 'role'
                          ? 'border-violet-500/80 bg-white/[0.07] ring-2 ring-violet-500/25'
                          : 'border-white/[0.1] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.06]'
                      }`}
                    >
                      <Briefcase
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3 transition-colors ${
                          focusedField === 'role' ? 'text-violet-400' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        value={targetRole}
                        autoComplete="organization-title"
                        onFocus={() => setFocusedField('role')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 placeholder:font-normal focus:outline-none bg-transparent auth-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Email Address Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">Work or Personal</span>
                </div>
                <div
                  className={`relative rounded-xl border transition-all duration-150 ${
                    focusedField === 'email'
                      ? 'border-violet-500/80 bg-white/[0.07] ring-2 ring-violet-500/25'
                      : 'border-white/[0.1] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.06]'
                  }`}
                >
                  <Mail
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3 transition-colors ${
                      focusedField === 'email' ? 'text-violet-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    autoComplete="email"
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@company.com"
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 placeholder:font-normal focus:outline-none bg-transparent auth-input"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] sm:text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] sm:text-xs font-semibold text-violet-400 hover:text-white cursor-pointer flex items-center space-x-1"
                  >
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div
                  className={`relative rounded-xl border transition-all duration-150 ${
                    focusedField === 'password'
                      ? 'border-violet-500/80 bg-white/[0.07] ring-2 ring-violet-500/25'
                      : 'border-white/[0.1] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.06]'
                  }`}
                >
                  <Lock
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 absolute left-3 sm:left-3.5 top-2.5 sm:top-3 transition-colors ${
                      focusedField === 'password' ? 'text-violet-400' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. ••••••••••••"
                    className="w-full pl-9 sm:pl-10 pr-9 sm:pr-11 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm text-white font-medium placeholder:text-slate-500 placeholder:font-normal focus:outline-none bg-transparent auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-2.5 top-2 sm:top-2.5 p-1 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-white/[0.08] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {isRegister && password && (
                  <div className="mt-1.5 space-y-1 animate-in fade-in">
                    <div className="flex items-center space-x-1.5">
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                          passwordStrength >= 1 ? 'bg-amber-400' : 'bg-white/[0.1]'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                          passwordStrength >= 2 ? 'bg-violet-400' : 'bg-white/[0.1]'
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                          passwordStrength >= 3 ? 'bg-emerald-400' : 'bg-white/[0.1]'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-slate-400 px-0.5">
                      <span>Security:</span>
                      <span className="font-semibold text-slate-300">
                        {passwordStrength === 1 && 'Basic'}
                        {passwordStrength === 2 && 'Good'}
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
                className="w-full py-2.5 sm:py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-violet-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2 sm:mt-3"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in securely...</span>
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
            <div className="pt-2 sm:pt-3 border-t border-white/[0.06] flex items-center justify-center space-x-1.5 text-[10px] sm:text-[11px] text-slate-400">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
              <span>Enterprise AES-256 Encryption • Private Candidate Record</span>
            </div>
          </div>

          {/* MOBILE METRICS STRIP (< lg screens) */}
          <div className="lg:hidden flex items-center justify-around px-2 pt-1 text-[10px] text-slate-400">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span>&lt; 50ms Queries</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span>OAuth 2.0</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
