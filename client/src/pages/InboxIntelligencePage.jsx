import React, { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  Check,
  Info,
  Sparkles,
  Plus,
  AlertCircle,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { inboxApi, gmailApi, applicationApi } from '../services/api.js';
import { format, formatDistanceToNow } from 'date-fns';

export const InboxIntelligencePage = () => {
  const [emails, setEmails] = useState([]);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Simulation form
  const [simScenario, setSimScenario] = useState('interview');
  const [simCompany, setSimCompany] = useState('');
  const [simRole, setSimRole] = useState('');

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('pending');

  // Selected email for manual application match assignment
  const [selectedMatch, setSelectedMatch] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [emailRes, statusRes, appRes] = await Promise.all([
        inboxApi.getEmails({
          category: categoryFilter,
          reviewStatus: reviewStatusFilter,
          limit: '50',
        }),
        gmailApi.getStatus(),
        applicationApi.getAll({ limit: '100' }),
      ]);

      if (emailRes.success && emailRes.data) {
        setEmails(emailRes.data);
      }
      if (statusRes.success) {
        setGmailStatus(statusRes.data);
      }
      if (appRes.success && appRes.data) {
        setApplications(appRes.data);
        if (appRes.data.length > 0 && !simCompany) {
          setSimCompany(appRes.data[0].companyName);
          setSimRole(appRes.data[0].jobTitle);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, reviewStatusFilter]);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await gmailApi.syncNow();
      setSyncMessage(res.message || 'Sync completed successfully.');
      fetchData();
    } catch (err) {
      setSyncMessage(err.message || 'Sync encountered an error.');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectTest = async () => {
    setSyncing(true);
    try {
      await gmailApi.connectDemo();
      setSyncMessage('Connected in test intelligence mode! Initial scan completed.');
      fetchData();
    } catch (err) {
      setSyncMessage(err.message || 'Failed to connect test mode.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSimulateEmail = async (typeOverride) => {
    setSimulating(true);
    try {
      const type = typeOverride || simScenario;
      const res = await inboxApi.simulate({
        type,
        companyName: simCompany || undefined,
        jobTitle: simRole || undefined,
      });

      setShowSimulateModal(false);
      setSyncMessage(res.message || 'Recruiter email simulated and classified!');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to simulate recruiter email.');
    } finally {
      setSimulating(false);
    }
  };

  const handleApprove = async (email) => {
    try {
      const targetAppId =
        selectedMatch[email._id] ||
        (email.matchedApplicationId?._id || email.matchedApplicationId);

      if (!targetAppId) {
        alert('Please select an application to apply this status update to.');
        return;
      }

      await inboxApi.approve(email._id, {
        targetApplicationId: targetAppId,
        newStatus: email.suggestedStatus || undefined,
      });

      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to approve update.');
    }
  };

  const handleDismiss = async (emailId) => {
    try {
      await inboxApi.dismiss(emailId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearInbox = async () => {
    if (!window.confirm('Clear all processed emails from your inbox intelligence feed?')) return;
    try {
      await inboxApi.clearAll();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'Offer':
        return 'bg-emerald-100 text-emerald-800';
      case 'Interview':
        return 'bg-violet-100 text-[#7652E8]';
      case 'Assessment':
        return 'bg-amber-100 text-amber-800';
      case 'Rejection':
        return 'bg-rose-100 text-rose-800';
      case 'Confirmation':
        return 'bg-sky-100 text-sky-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Inbox Intelligence</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            AI-assisted email recognition engine. Detects application status updates and invitations with verified timeline evidence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl bg-violet-50 text-[#7652E8] hover:bg-violet-100 border border-violet-100 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Test Email</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={syncing || !gmailStatus?.connected}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Scanning Inbox...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Gmail Connection Status Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] p-0.5 shadow-sm shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-[#7652E8]">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-800">
                {gmailStatus?.connected
                  ? `Connected: ${gmailStatus.emailAddress}`
                  : 'Connect Your Gmail Inbox'}
              </h3>
              {gmailStatus?.connected ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {gmailStatus.isDemo ? 'Test Mode Active' : 'Live Gmail Active'}
                </span>
              ) : (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-bold border border-amber-100">
                  Disconnected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {gmailStatus?.connected
                ? `Last synchronized: ${
                    gmailStatus.lastSyncedAt
                      ? formatDistanceToNow(new Date(gmailStatus.lastSyncedAt), { addSuffix: true })
                      : 'Just now'
                  }. Background processing checks for recruitment updates automatically.`
                : 'Connect Gmail to automatically parse recruiter emails, interview requests, and offers into verified timeline events.'}
            </p>
          </div>
        </div>

        {!gmailStatus?.connected ? (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleConnectTest}
              disabled={syncing}
              className="px-3.5 py-2 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              Connect Test Mode (1-Click)
            </button>
            <a
              href="/settings?tab=integrations"
              className="px-3.5 py-2 rounded-xl bg-violet-50 text-[#7652E8] text-xs font-bold hover:bg-violet-100 transition-colors"
            >
              Settings
            </a>
          </div>
        ) : null}
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs text-violet-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#7652E8] shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-violet-400 hover:text-violet-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 bg-white p-1 rounded-2xl border border-violet-100/60 shadow-xs">
          {['pending', 'approved', 'dismissed', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setReviewStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                reviewStatusFilter === status
                  ? 'bg-[#7652E8] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-violet-100 bg-white text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Interview">Interview Invitations</option>
            <option value="Assessment">Assessments</option>
            <option value="Offer">Offers</option>
            <option value="Rejection">Rejections</option>
            <option value="Confirmation">Application Received</option>
          </select>

          {emails.length > 0 && (
            <button
              onClick={handleClearInbox}
              className="text-xs text-slate-400 hover:text-rose-500 font-semibold px-2 py-1 transition-colors cursor-pointer"
              title="Clear inbox list"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Simulation Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-violet-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-violet-50 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-violet-100 text-[#7652E8]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Simulate Inbound Recruiter Email</h3>
                  <p className="text-[11px] text-slate-400">Test Nexora's classification, confidence score, and timeline updates</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Choose a Realistic Preset:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'interview', label: 'Technical Interview', comp: 'Google', role: 'Software Engineer', badge: 'bg-violet-100 text-[#7652E8]' },
                  { id: 'offer', label: 'Official Job Offer', comp: 'Stripe', role: 'Full Stack Engineer', badge: 'bg-emerald-100 text-emerald-700' },
                  { id: 'assessment', label: 'HackerRank Assessment', comp: 'Amazon', role: 'Backend Developer', badge: 'bg-amber-100 text-amber-700' },
                  { id: 'rejection', label: 'Application Status Update', comp: 'Meta', role: 'Software Engineer', badge: 'bg-rose-100 text-rose-700' },
                  { id: 'confirmation', label: 'Application Received', comp: 'Apple', role: 'iOS Engineer', badge: 'bg-sky-100 text-sky-700' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSimScenario(preset.id);
                      setSimCompany(preset.comp);
                      setSimRole(preset.role);
                      handleSimulateEmail(preset.id);
                    }}
                    disabled={simulating}
                    className="p-3 rounded-2xl border border-violet-100 hover:border-[#7652E8] hover:bg-violet-50/50 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${preset.badge}`}>
                        {preset.label}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800">{preset.comp}</p>
                    <p className="text-[11px] text-slate-400">{preset.role}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Application Customizer */}
            {applications.length > 0 && (
              <div className="pt-2 border-t border-violet-50">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Or Test Against an Existing Application:
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={simCompany}
                    onChange={(e) => {
                      const app = applications.find(a => a.companyName === e.target.value);
                      if (app) {
                        setSimCompany(app.companyName);
                        setSimRole(app.jobTitle);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    {applications.map((app) => (
                      <option key={app._id} value={app.companyName}>
                        {app.companyName} — {app.jobTitle}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleSimulateEmail('interview')}
                    disabled={simulating}
                    className="px-4 py-2 rounded-xl bg-[#7652E8] text-white text-xs font-bold hover:bg-[#6844dd] transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {simulating ? 'Injecting...' : 'Send Interview Invite'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processed Emails List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-white rounded-3xl" />
          <div className="h-28 bg-white rounded-3xl" />
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-violet-100/60 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-[#7652E8] flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No recruitment emails in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Nexora scans your linked inbox for job confirmations, assessments, and interview bookings.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-violet-100 text-[#7652E8] hover:bg-violet-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate a Test Recruiter Email</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => {
            const isPending = email.reviewStatus === 'pending';
            const category = email.detectedCategory || email.category || 'Other';
            const confidencePercent = email.matchConfidence || Math.round((email.confidenceScore || 0.85) * 100);
            const receivedDate = email.receivedAt || email.receivedDate;
            const sender = email.senderName
              ? `${email.senderName} <${email.senderEmail}>`
              : email.senderEmail || email.sender || 'Recruiting Team';

            return (
              <div
                key={email._id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60 hover:border-violet-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadge(category)}`}>
                        {category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {confidencePercent}% match confidence
                      </span>
                      {email.reviewStatus === 'approved' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approved & Applied
                        </span>
                      )}
                      {email.reviewStatus === 'dismissed' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Dismissed
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {receivedDate ? format(new Date(receivedDate), 'MMM d, yyyy h:mm a') : 'Just now'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">{email.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">From: {sender}</p>

                  <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF9FE] border border-violet-100/40 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap">
                    {email.snippet}
                  </div>
                </div>

                {/* Match and Actions */}
                <div className="mt-4 pt-3.5 border-t border-violet-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">Matched Application:</span>
                    {email.matchedApplicationId ? (
                      <span className="font-bold text-[#7652E8] bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                        {email.matchedApplicationId.companyName} — {email.matchedApplicationId.jobTitle}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          setSelectedMatch((prev) => ({ ...prev, [email._id]: e.target.value }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="">Select matching job...</option>
                        {applications.map((app) => (
                          <option key={app._id} value={app._id}>
                            {app.companyName} — {app.jobTitle}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {isPending && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDismiss(email._id)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleApprove(email)}
                        className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Update Timeline</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InboxIntelligencePage;

