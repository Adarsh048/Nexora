import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Check,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gmailApi, authApi } from '../services/api';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const oauthSuccess = searchParams.get('success') === 'gmail_connected';
  const oauthError = searchParams.get('error');

  const [activeTab, setActiveTab] = useState(initialTab);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearingData, setClearingData] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    careerGoal: user?.careerGoal || 'Get your next offer',
    targetRole: user?.targetRole || 'Software Engineer',
    weeklyGoal: user?.weeklyGoal || 5,
  });

  const fetchGmailStatus = async () => {
    try {
      const res = await gmailApi.getStatus();
      if (res.success) {
        setGmailStatus(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGmailStatus();
  }, []);

  const [googleConfig, setGoogleConfig] = useState({ clientId: '', clientSecret: '' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(null);

  const handleCopyRedirectUri = () => {
    navigator.clipboard.writeText('http://localhost:5000/api/gmail/oauth/callback');
    setCopiedRedirect(true);
    setTimeout(() => setCopiedRedirect(false), 2500);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(profileForm);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await gmailApi.getAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      const configElem = document.getElementById('google-oauth-config');
      if (configElem) {
        configElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSaveGoogleConfig = async (e) => {
    e.preventDefault();
    if (!googleConfig.clientId || !googleConfig.clientSecret) {
      alert('Please enter both Google Client ID and Client Secret.');
      return;
    }
    setSavingConfig(true);
    setConfigSuccess(null);
    try {
      const res = await gmailApi.configure(googleConfig);
      setConfigSuccess('Google Cloud credentials configured successfully!');
      await fetchGmailStatus();
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        const authRes = await gmailApi.getAuthUrl();
        if (authRes.success && authRes.url) {
          window.location.href = authRes.url;
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to save Google Cloud credentials.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Disconnect Gmail? Existing processed updates and timelines will remain preserved.')) return;
    try {
      await gmailApi.disconnect();
      fetchGmailStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await gmailApi.syncNow();
      fetchGmailStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to delete all tracked applications, events, and companies from your workspace? This cannot be undone.')) return;
    setClearingData(true);
    try {
      await authApi.clearData();
      alert('All workspace application data cleared. You have a completely clean slate!');
      window.location.reload();
    } catch (err) {
      alert(err.message || 'Failed to clear workspace data');
    } finally {
      setClearingData(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your career goals, weekly targets, email intelligence connections, and privacy controls
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-violet-100 pb-2">
        {[
          { id: 'profile', label: 'Profile & Targets', icon: User },
          { id: 'integrations', label: 'Gmail Integration', icon: Mail },
          { id: 'privacy', label: 'Security & Privacy', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id
                  ? 'bg-[#7652E8] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-violet-50/60'
                }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE & TARGETS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60 max-w-2xl">
          <h2 className="text-base font-bold text-slate-800 mb-1">Career Goal & Preferences</h2>
          <p className="text-xs text-slate-400 mb-6">
            Customize your headline and dashboard weekly target metrics
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {savedSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center space-x-2 text-emerald-700 text-xs font-semibold">
                <Check className="w-4 h-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Role</label>
              <input
                type="text"
                value={profileForm.targetRole}
                onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                placeholder="e.g. Full Stack Engineer, Product Manager"
                className="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Career Goal Statement</label>
              <input
                type="text"
                value={profileForm.careerGoal}
                onChange={(e) => setProfileForm({ ...profileForm, careerGoal: e.target.value })}
                placeholder="e.g. Get your next offer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-medium focus:outline-none focus:border-[#7652E8] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Weekly Application Goal
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={profileForm.weeklyGoal}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, weeklyGoal: Number(e.target.value) })
                  }
                  className="w-28 px-3.5 py-2.5 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 font-bold focus:outline-none focus:border-[#7652E8] focus:bg-white"
                />
                <span className="text-xs text-slate-400">applications per week</span>
              </div>
            </div>

            <div className="pt-4 border-t border-violet-50 flex items-center justify-between">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* Reset / Clean Data Zone */}
          <div className="mt-8 pt-6 border-t border-violet-100">
            <h3 className="text-xs font-bold text-slate-800 mb-1">Workspace Data Management</h3>
            <p className="text-xs text-slate-400 mb-3">
              Clear all tracked applications, companies, and events to keep your account 100% clean.
            </p>
            <button
              type="button"
              onClick={handleClearAllData}
              disabled={clearingData}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{clearingData ? 'Clearing...' : 'Clear All Workspace Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: GMAIL INTEGRATION */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 max-w-3xl">
          {oauthSuccess && (
            <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start space-x-3 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Google Gmail Connected Successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Real-time recruitment scanning is now active on your live Google account. Inbound interview bookings, tests, and offer updates will sync automatically to your inbox.
                </p>
              </div>
            </div>
          )}

          {oauthError && (
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start space-x-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Google Connection Notice</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  {decodeURIComponent(oauthError)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-[#7652E8]">
                  <Mail className="w-7 h-7" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-slate-800">Connect your inbox</h2>
                  {gmailStatus?.connected && (
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                      Connected
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#7652E8] mt-0.5">
                  Never miss an application update.
                </p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Connect Gmail to detect application confirmations, assessments, interview invitations, rejection emails and offers with zero manual data entry.
                </p>

                {/* Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
                  {[
                    'Automatic interview & assessment detection',
                    'Evidence-backed application timelines',
                    'Zero spam or unwanted email reading',
                    'Explicit user approval for every status update',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {gmailStatus?.connected ? (
                  <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="text-slate-400">Account: </span>
                        <strong className="text-slate-800">{gmailStatus.emailAddress}</strong>
                        <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live Sync Active
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSyncNow}
                          disabled={syncing}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-violet-200 text-xs font-bold text-[#7652E8] hover:bg-violet-50 transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                          <span>{syncing ? 'Scanning...' : 'Sync Now'}</span>
                        </button>
                        <button
                          onClick={handleDisconnectGmail}
                          className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleConnectGmail}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 transition-all cursor-pointer"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Authorize Google Gmail (OAuth 2.0)</span>
                      </button>
                    </div>

                    {configSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{configSuccess}</span>
                      </div>
                    )}

                    {!gmailStatus?.isConfigured && (
                      <form
                        id="google-oauth-config"
                        onSubmit={handleSaveGoogleConfig}
                        className="p-5 rounded-2xl bg-[#FAF9FE] border border-violet-100 space-y-3 scroll-mt-20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                            <Sparkles className="w-4 h-4 text-[#7652E8]" />
                            <span>Configure Google OAuth 2.0 Credentials</span>
                          </div>
                          <a
                            href="https://console.cloud.google.com/apis/credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#7652E8] font-bold inline-flex items-center gap-1 hover:underline"
                          >
                            <span>Google Cloud Console</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Provide your Google Cloud Client credentials below to enable live direct Gmail synchronization for your account:
                        </p>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Google Client ID
                            </label>
                            <input
                              type="text"
                              required
                              value={googleConfig.clientId}
                              onChange={(e) => setGoogleConfig({ ...googleConfig, clientId: e.target.value })}
                              placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                              className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              Google Client Secret
                            </label>
                            <input
                              type="password"
                              required
                              value={googleConfig.clientSecret}
                              onChange={(e) => setGoogleConfig({ ...googleConfig, clientSecret: e.target.value })}
                              placeholder="GOCSPX-••••••••••••••••"
                              className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                            />
                          </div>
                        </div>
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center space-x-2 text-[10px] text-slate-500 flex-wrap">
                            <span>Redirect URI:</span>
                            <code className="bg-white px-1.5 py-0.5 rounded border border-violet-100 text-[#7652E8] font-mono text-[10px]">
                              http://localhost:5000/api/gmail/oauth/callback
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyRedirectUri}
                              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-violet-100 text-[#7652E8] font-bold text-[10px] hover:bg-violet-200 transition-colors cursor-pointer"
                            >
                              {copiedRedirect ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedRedirect ? 'Copied!' : 'Copy'}</span>
                            </button>
                          </div>
                          <button
                            type="submit"
                            disabled={savingConfig}
                            className="px-4 py-2 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                          >
                            {savingConfig ? 'Saving...' : 'Save & Authorize Gmail'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & PRIVACY */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60 max-w-2xl space-y-4">
          <h2 className="text-base font-bold text-slate-800">Security & Encryption Architecture</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nexora follows strict least-privilege standards to safeguard your candidate data:
          </p>

          <div className="space-y-3 pt-2">
            {[
              { title: 'AES-256-GCM Token Encryption', desc: 'OAuth tokens are stored encrypted at rest using industry-standard AES-256 authenticated encryption.' },
              { title: 'Read-Only Gmail Access', desc: 'Nexora only requests gmail.readonly permissions. We can never send, delete, or modify your emails.' },
              { title: 'Zero Third-Party Data Sharing', desc: 'Your job search history, interviews, and recruiter notes are private to your authenticated user account.' },
              { title: 'No Full Email Scraping', desc: 'We only parse recruiter sender domains and status snippets required for verified matching.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100/60">
                <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsPage;

