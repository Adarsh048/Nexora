import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FileText, Calendar, Search, Award, XCircle } from 'lucide-react';
import { timelineApi } from '../services/api.js';
import { format } from 'date-fns';

export const ActivityPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [companySearch, setCompanySearch] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await timelineApi.getFeed({
        eventType: typeFilter,
        source: sourceFilter,
        companyName: companySearch,
        limit: '60',
      });

      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [typeFilter, sourceFilter, companySearch]);

  const getEventIcon = (type) => {
    if (type?.includes('Interview')) return <Calendar className="w-4 h-4 text-[#7652E8]" />;
    if (type?.includes('Assessment')) return <FileText className="w-4 h-4 text-amber-500" />;
    if (type?.includes('Offer')) return <Award className="w-4 h-4 text-emerald-500" />;
    if (type?.includes('Rejection')) return <XCircle className="w-4 h-4 text-rose-500" />;
    return <CheckCircle2 className="w-4 h-4 text-sky-500" />;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Activity Feed</h1>
        <p className="text-xs text-slate-400 mt-1">
          Chronological audit trail of all job applications, detected emails, interviews, and status advancements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-violet-100/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
            placeholder="Search by company name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Event Types</option>
            <option value="Application Submitted">Application Submitted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Assessment Invitation">Assessment Invitation</option>
            <option value="Offer Received">Offer Received</option>
            <option value="Rejection Received">Rejection Received</option>
            <option value="Status Changed">Status Changed</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Sources</option>
            <option value="manual">Manual Entry</option>
            <option value="gmail">Gmail Intelligence</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-white rounded-3xl" />
          <div className="h-20 bg-white rounded-3xl" />
          <div className="h-20 bg-white rounded-3xl" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-violet-100/60 shadow-xs">
          <p className="text-sm font-bold text-slate-800">No activity recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            As you submit applications or connect Gmail, updates will stream into this feed automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {events.map((ev) => {
            const appId = typeof ev.applicationId === 'object' ? ev.applicationId?._id : ev.applicationId;
            return (
              <div
                key={ev._id}
                className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60 hover:border-violet-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center shrink-0 border border-violet-100/50 mt-0.5">
                      {getEventIcon(ev.eventType)}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-slate-800">{ev.title}</h3>
                        {ev.source === 'gmail' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Gmail Scan
                          </span>
                        )}
                      </div>

                      {ev.notes && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed bg-[#FAF9FE] p-2.5 rounded-xl border border-violet-100/40">
                          {ev.notes}
                        </p>
                      )}

                      <div className="flex items-center space-x-3 mt-2 text-[11px] text-slate-400">
                        <span>{format(new Date(ev.eventDate), 'MMM d, yyyy h:mm a')}</span>
                        {appId && (
                          <>
                            <span>•</span>
                            <Link
                              to={`/applications/${appId}`}
                              className="text-[#7652E8] font-bold hover:underline"
                            >
                              View Application →
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityPage;

