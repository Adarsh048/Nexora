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
  ExternalLink,
  Layers,
  Inbox,
  FileText,
  Building2,
  Calendar,
  Briefcase,
  ArrowRight,
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

  // Ingestion Modal with Smart Paste & Guided Form
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestTab, setIngestTab] = useState('smart'); // 'smart' or 'guided'
  const [rawPastedEmail, setRawPastedEmail] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestForm, setIngestForm] = useState({
    sender: '',
    subject: '',
    body: '',
    targetApplicationId: '',
  });

  // Full Email Inspection Modal
  const [inspectingEmail, setInspectingEmail] = useState(null);

  // Google OAuth Configuration Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [googleConfig, setGoogleConfig] = useState({ clientId: '', clientSecret: '' });
  const [savingConfig, setSavingConfig] = useState(false);

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
      setSyncMessage(res.message || 'Gmail sync completed.');
      fetchData();
    } catch (err) {
      setSyncMessage(err.message || 'Sync encountered an error.');
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectGmail = async () => {
    try {
      const res = await gmailApi.getAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setShowConfigModal(true);
    }
  };

  const handleSaveGoogleConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await gmailApi.configure(googleConfig);
      setShowConfigModal(false);
      setSyncMessage('Google Cloud credentials saved! You can now authorize your account.');
      const res = await gmailApi.getAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      alert(err.message || 'Failed to save Google Cloud credentials.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!window.confirm('Disconnect Gmail? Existing processed updates and verified timelines remain preserved.')) return;
    try {
      await gmailApi.disconnect();
      setSyncMessage('Gmail disconnected successfully.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to disconnect');
    }
  };

  const handleIngestEmail = async (e) => {
    e.preventDefault();
    setIngesting(true);
    try {
      let payload = {};
      if (ingestTab === 'smart') {
        if (!rawPastedEmail.trim()) {
          alert('Please paste the email content into the text box.');
          setIngesting(false);
          return;
        }
        payload = { rawEmail: rawPastedEmail.trim() };
      } else {
        if (!ingestForm.sender && !ingestForm.subject && !ingestForm.body) {
          alert('Please fill out the email details.');
          setIngesting(false);
          return;
        }
        payload = ingestForm;
      }

      const res = await inboxApi.ingest(payload);
      setShowIngestModal(false);
      setRawPastedEmail('');
      setIngestForm({ sender: '', subject: '', body: '', targetApplicationId: '' });
      setSyncMessage(res.message || 'Email successfully ingested and classified with verified evidence.');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to ingest email.');
    } finally {
      setIngesting(false);
    }
  };

  const handleApprove = async (email) => {
    try {
      const targetAppId =
        selectedMatch[email._id] ||
        (email.matchedApplicationId?._id || email.matchedApplicationId);

      const res = await inboxApi.approve(email._id, {
        targetApplicationId: targetAppId || undefined,
        newStatus: email.suggestedStatus || undefined,
      });

      setSyncMessage(res.message || 'Update approved and verified into your application timeline.');
      if (inspectingEmail?._id === email._id) {
        setInspectingEmail(null);
      }
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to approve update.');
    }
  };

  const handleDismiss = async (emailId) => {
    try {
      await inboxApi.dismiss(emailId);
      if (inspectingEmail?._id === emailId) {
        setInspectingEmail(null);
      }
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Interview':
        return 'bg-violet-50 text-[#7652E8] border-violet-200';
      case 'Assessment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejection':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Confirmation':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
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
            Real-time recruiter email parsing and entity recognition. Extracts interviews, assessments, and offers with verified timeline evidence.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-[#7652E8] text-white hover:bg-[#6844dd] text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#7652E8]/25"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Recruiter Email</span>
          </button>

          {gmailStatus?.connected && (
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white border border-violet-200 text-[#7652E8] hover:bg-violet-50 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Scanning Gmail...' : 'Sync Gmail'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Real Gmail Connection Banner */}
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
                  ? `Live Account: ${gmailStatus.emailAddress}`
                  : 'Google Gmail Live Sync'}
              </h3>
              {gmailStatus?.connected ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Direct OAuth 2.0 Connected
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {gmailStatus?.connected
                ? `Last synchronized: ${
                    gmailStatus.lastSyncedAt
                      ? formatDistanceToNow(new Date(gmailStatus.lastSyncedAt), { addSuffix: true })
                      : 'Just now'
                  }. Full message inspection monitors inbound interview bookings, assessments, and offers automatically.`
                : 'Connect your Gmail account via direct Google OAuth 2.0 to sync automatically, or ingest recruiter emails from any provider.'}
            </p>
          </div>
        </div>

        {gmailStatus?.connected ? (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-3.5 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#7652E8] text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Scanning...' : 'Scan Now'}</span>
            </button>
            <button
              onClick={handleDisconnectGmail}
              className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleConnectGmail}
              className="px-4 py-2.5 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Connect Google Account</span>
            </button>
            <a
              href="/settings?tab=integrations"
              className="px-3.5 py-2.5 rounded-xl bg-violet-50 text-[#7652E8] text-xs font-bold hover:bg-violet-100 transition-colors"
            >
              API Credentials
            </a>
          </div>
        )}
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs text-violet-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#7652E8] shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-violet-400 hover:text-violet-700 cursor-pointer">
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

      {/* HIGH-PRECISION RECRUITER EMAIL INGEST MODAL */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-violet-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-violet-50 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-violet-100 text-[#7652E8]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Ingest Recruiter Email</h3>
                  <p className="text-[11px] text-slate-400">Accepts emails from Gmail, Outlook, Yahoo, Apple Mail, or LinkedIn</p>
                </div>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Ingest Tabs */}
            <div className="flex p-1 bg-[#FAF9FE] rounded-xl border border-violet-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setIngestTab('smart')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  ingestTab === 'smart' ? 'bg-[#7652E8] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Smart Quick Paste (1-Click)
              </button>
              <button
                type="button"
                onClick={() => setIngestTab('guided')}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  ingestTab === 'guided' ? 'bg-[#7652E8] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Structured Fields
              </button>
            </div>

            <form onSubmit={handleIngestEmail} className="space-y-3.5">
              {ingestTab === 'smart' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Paste Raw Recruiter Email Text or Forwarded Message:
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder={`Paste the email text here. Nexora will automatically detect the sender, company, job role, dates, and category.\n\nExample:\nFrom: Sarah Jenkins <sjenkins@anthropic.com>\nSubject: Anthropic Interview Invitation - Senior Software Engineer\n\nHi Adarsh, Thanks for your application! We would like to invite you for a 45-minute technical video interview next week.`}
                    value={rawPastedEmail}
                    onChange={(e) => setRawPastedEmail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8] leading-relaxed resize-none font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    💡 Tip: You can paste the raw forwarded email headers or just the text of the message.
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sender (Email or Name)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins <sjenkins@anthropic.com> or recruiting@stripe.com"
                      value={ingestForm.sender}
                      onChange={(e) => setIngestForm({ ...ingestForm, sender: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anthropic Interview Invitation - Senior Software Engineer"
                      value={ingestForm.subject}
                      onChange={(e) => setIngestForm({ ...ingestForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Message Body
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Paste the recruiter's message text here..."
                      value={ingestForm.body}
                      onChange={(e) => setIngestForm({ ...ingestForm, body: e.target.value })}
                      className="w-full p-3 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8] leading-relaxed resize-none"
                    />
                  </div>
                </>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-violet-50">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ingesting}
                  className="px-5 py-2 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold transition-all shadow-md shadow-[#7652E8]/25 cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{ingesting ? 'Analyzing Entities...' : 'Ingest & Classify'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EMAIL INSPECTOR MODAL */}
      {inspectingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-violet-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-violet-50 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getCategoryBadge(inspectingEmail.detectedCategory)}`}>
                  {inspectingEmail.detectedCategory}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {inspectingEmail.matchConfidence}% entity match confidence
                </span>
              </div>
              <button
                onClick={() => setInspectingEmail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-800">{inspectingEmail.subject}</h3>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p><strong>From:</strong> {inspectingEmail.senderName} ({inspectingEmail.senderEmail})</p>
                <p><strong>Received:</strong> {inspectingEmail.receivedAt ? format(new Date(inspectingEmail.receivedAt), 'PPP p') : 'Just now'}</p>
                <p><strong>Detected Company:</strong> {inspectingEmail.detectedCompany} | <strong>Role:</strong> {inspectingEmail.detectedJobTitle}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100 text-xs text-slate-700 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap font-sans">
              {inspectingEmail.snippet}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-violet-50">
              <button
                onClick={() => handleDismiss(inspectingEmail._id)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Dismiss Email
              </button>
              {inspectingEmail.reviewStatus === 'pending' && (
                <button
                  onClick={() => handleApprove(inspectingEmail)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept & Track Application</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* GOOGLE CLOUD CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-violet-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-violet-50 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-violet-100 text-[#7652E8]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Configure Google OAuth 2.0</h3>
                  <p className="text-[11px] text-slate-400">Direct Google Cloud authorization for live Gmail synchronization</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoogleConfig} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Google Client ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  value={googleConfig.clientId}
                  onChange={(e) => setGoogleConfig({ ...googleConfig, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Google Client Secret
                </label>
                <input
                  type="password"
                  required
                  placeholder="GOCSPX-••••••••••••••••"
                  value={googleConfig.clientSecret}
                  onChange={(e) => setGoogleConfig({ ...googleConfig, clientSecret: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-medium text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Setup Instructions:</div>
                <div>1. Enable the <strong>Gmail API</strong> in Google Cloud Console.</div>
                <div>2. Set Authorized Redirect URI to:</div>
                <code className="block bg-white p-1 rounded border border-violet-200 text-[#7652E8] font-mono text-[10px]">
                  http://localhost:5000/api/gmail/oauth/callback
                </code>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-violet-50">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2 rounded-xl bg-[#7652E8] hover:bg-[#6844dd] text-white text-xs font-bold transition-all shadow-md shadow-[#7652E8]/25 cursor-pointer disabled:opacity-50"
                >
                  {savingConfig ? 'Saving...' : 'Save & Authorize Gmail'}
                </button>
              </div>
            </form>
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
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No recruitment emails in this view</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Nexora automatically scans your linked Gmail inbox or parses recruiter emails you ingest into verified timeline events.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setShowIngestModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#7652E8] text-white hover:bg-[#6844dd] text-xs font-bold transition-all shadow-md shadow-[#7652E8]/25 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest a Recruiter Email</span>
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

            const isMatched = Boolean(email.matchedApplicationId);

            return (
              <div
                key={email._id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60 hover:border-violet-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadge(category)}`}>
                        {category}
                      </span>
                      {confidencePercent > 0 && (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {confidencePercent}% match confidence
                        </span>
                      )}
                      {email.reviewStatus === 'approved' && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Approved & Evidence Verified
                        </span>
                      )}
                      {email.reviewStatus === 'dismissed' && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Dismissed
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {receivedDate ? format(new Date(receivedDate), 'MMM d, yyyy h:mm a') : 'Just now'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">{email.subject}</h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span>From: <strong className="text-slate-600 font-semibold">{sender}</strong></span>
                    <span>•</span>
                    <span>Detected Company: <strong className="text-[#7652E8] font-bold">{email.detectedCompany || 'Company'}</strong></span>
                  </div>

                  <div
                    onClick={() => setInspectingEmail(email)}
                    className="mt-3 p-3.5 rounded-2xl bg-[#FAF9FE] border border-violet-100/40 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-wrap hover:border-violet-200 transition-all cursor-pointer group"
                  >
                    <p className="line-clamp-3">{email.snippet}</p>
                    <span className="text-[10px] font-bold text-[#7652E8] mt-1.5 inline-flex items-center space-x-1 group-hover:underline">
                      <span>Inspect full message</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Match and Actions */}
                <div className="mt-4 pt-3.5 border-t border-violet-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">Matched Application:</span>
                    {email.matchedApplicationId ? (
                      <span className="font-bold text-[#7652E8] bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                        {email.matchedApplicationId.companyName || email.detectedCompany} — {email.matchedApplicationId.jobTitle || email.detectedJobTitle}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          setSelectedMatch((prev) => ({ ...prev, [email._id]: e.target.value }))
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="">Auto-create or select existing application...</option>
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
                        <span>
                          {isMatched || selectedMatch[email._id]
                            ? 'Accept & Update Timeline'
                            : '+ Create & Track Application'}
                        </span>
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
