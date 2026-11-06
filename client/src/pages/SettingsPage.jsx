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
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { gmailApi, authApi } from '../services/api';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [clearingData, setClearingData] = useState(false);

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
      alert(err.message || 'Please configure Google OAuth credentials in backend server/.env');
    }
  };

  const handleConnectDemo = async () => {
    setSyncing(true);
    try {
      await gmailApi.connectDemo(user?.email || 'applicant@gmail.com');
      await fetchGmailStatus();
    } catch (err) {
      alert(err.message || 'Failed to connect test Gmail');
    } finally {
      setSyncing(false);
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
                        {gmailStatus.isDemo && (
                          <span className="ml-2 text-[10px] bg-violet-100 text-[#7652E8] px-2 py-0.5 rounded-full font-bold">
                            Test Simulation Active
                          </span>
                        )}
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
                      {gmailStatus?.isConfigured ? (
                        <button
                          onClick={handleConnectGmail}
                          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 transition-all cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Connect Google Account</span>
                        </button>
                      ) : null}

                      <button
                        onClick={handleConnectDemo}
                        disabled={syncing}
                        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-[#7652E8] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{syncing ? 'Connecting...' : 'Connect Test Mode (Instant 1-Click)'}</span>
                      </button>
                    </div>

                    {!gmailStatus?.isConfigured && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-xs text-amber-800 space-y-2">
                        <div className="flex items-center space-x-2 font-bold">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>External Google OAuth Credentials Notice</span>
                        </div>
                        <p className="leading-relaxed">
                          Test mode above works instantly without any API keys. If you wish to connect your personal live Google account:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 font-medium">
                          <li>Create a project in the Google Cloud Console</li>
                          <li>Enable the <strong>Gmail API</strong> in APIs & Services</li>
                          <li>Create an OAuth 2.0 Web Client ID with redirect URI: <code className="bg-amber-100 px-1 py-0.5 rounded">http://localhost:5000/api/gmail/oauth/callback</code></li>
                          <li>Add <code className="bg-amber-100 px-1 py-0.5 rounded">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100 px-1 py-0.5 rounded">GOOGLE_CLIENT_SECRET</code> to <code className="bg-amber-100 px-1 py-0.5 rounded">server/.env</code></li>
                        </ol>
                      </div>
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

