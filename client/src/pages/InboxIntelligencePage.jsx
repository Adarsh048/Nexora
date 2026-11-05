import React, { useState, useEffect } from 'react';
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  Check,
  Info,
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

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('pending');

  // Selected email for manual application match assignment
  const [selectedMatch, setSelectedMatch] = useState(null);

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
      setSyncMessage(res.message || 'Sync completed successfully.');
      fetchData();
    } catch (err) {
      setSyncMessage(err.message || 'Sync encountered an error.');
    } finally {
      setSyncing(false);
    }
  };

  const handleApprove = async (email) => {
    try {
      const targetAppId =
        selectedMatch && selectedMatch.emailId === email._id
          ? selectedMatch.appId
          : email.matchedApplicationId?._id;

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

        {/* Sync Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncNow}
            disabled={syncing || !gmailStatus?.connected}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Scanning Gmail...' : 'Sync Now'}</span>
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
                  <CheckCircle2 className="w-3 h-3" /> Active
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
                  }. Background processing checks for new responses automatically.`
                : 'Connect read-only Gmail access in Settings to monitor recruitment updates, tests, and interview links.'}
            </p>
          </div>
        </div>

        {!gmailStatus?.connected && (
          <a
            href="/settings?tab=integrations"
            className="px-4 py-2 rounded-xl bg-violet-50 text-[#7652E8] text-xs font-bold hover:bg-violet-100 transition-colors shrink-0"
          >
            Configure Integration
          </a>
        )}
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs text-violet-800 flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#7652E8] shrink-0" />
          <span>{syncMessage}</span>
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
      </div>

      {/* Processed Emails List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 bg-white rounded-3xl" />
          <div className="h-28 bg-white rounded-3xl" />
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-violet-100/60 shadow-xs">
          <p className="text-sm font-bold text-slate-800">No recruitment emails in this view</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Nexora scans your linked inbox for job confirmations, assessments, and interview bookings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => {
            const isPending = email.reviewStatus === 'pending';
            const confidencePercent = Math.round((email.confidenceScore || 0.8) * 100);

            return (
              <div
                key={email._id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60 hover:border-violet-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCategoryBadge(email.category)}`}>
                        {email.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {confidencePercent}% confidence
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      {email.receivedDate ? format(new Date(email.receivedDate), 'MMM d, yyyy h:mm a') : ''}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">{email.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">From: {email.sender}</p>

                  <div className="mt-3 p-3.5 rounded-2xl bg-[#FAF9FE] border border-violet-100/40 text-xs text-slate-600 leading-relaxed font-mono whitespace-pre-wrap">
                    {email.snippet}
                  </div>
                </div>

                {/* Match and Actions */}
                <div className="mt-4 pt-3.5 border-t border-violet-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-slate-400 font-medium">Matched Application:</span>
                    {email.matchedApplicationId ? (
                      <span className="font-bold text-[#7652E8] bg-violet-50 px-2 py-0.5 rounded-lg border border-violet-100">
                        {email.matchedApplicationId.companyName} — {email.matchedApplicationId.jobTitle}
                      </span>
                    ) : (
                      <select
                        onChange={(e) =>
                          setSelectedMatch({ emailId: email._id, appId: e.target.value })
                        }
                        className="px-2 py-1 rounded-lg border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700"
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

