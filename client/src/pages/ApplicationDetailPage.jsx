import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  Mail,
  User,
  Plus,
  CheckCircle2,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { applicationApi, timelineApi } from '../services/api.js';
import { ApplicationModal } from '../components/applications/ApplicationModal.jsx';
import { format } from 'date-fns';

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  const [modalOpen, setModalOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    eventType: 'Note Added',
    title: '',
    notes: '',
    newStatus: '',
  });

  const fetchApplication = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await applicationApi.getById(id);
      if (res.success && res.data) {
        setApplication(res.data);
        setTimeline(res.data.timeline || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!id) return;
    try {
      await applicationApi.updateStatus(id, newStatus);
      fetchApplication();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!id || !newEvent.title.trim()) return;

    try {
      await timelineApi.addEvent(id, {
        eventType: newEvent.eventType,
        title: newEvent.title,
        notes: newEvent.notes,
        newStatus: newEvent.newStatus || undefined,
      });
      setAddEventOpen(false);
      setNewEvent({
        eventType: 'Note Added',
        title: '',
        notes: '',
        newStatus: '',
      });
      fetchApplication();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Delete this application and its complete timeline history?')) return;
    try {
      await applicationApi.delete(id);
      navigate('/applications');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-white rounded-3xl" />
        <div className="h-96 bg-white rounded-3xl" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-violet-100">
        <p className="text-sm font-bold text-slate-800">Application not found</p>
        <Link to="/applications" className="text-xs text-[#7652E8] font-bold mt-2 inline-block">
          ← Back to applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Back button */}
      <div>
        <Link
          to="/applications"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-[#7652E8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] p-0.5 shadow-md shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-black text-xl text-[#7652E8]">
              {application.companyName.slice(0, 2).toUpperCase()}
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {application.companyName}
              </h1>
              {application.originalUrl && (
                <a
                  href={application.originalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-[#7652E8]"
                  title="Open original job posting"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-sm font-bold text-slate-600 mt-0.5">{application.jobTitle}</p>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{application.jobLocation || 'Remote'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Applied {application.appliedDate ? format(new Date(application.appliedDate), 'MMMM d, yyyy') : '—'}</span>
              </div>
              {application.salaryRange && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1 text-slate-600 font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{application.salaryRange}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status Dropdown & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-violet-50 px-3 py-1.5 rounded-2xl border border-violet-100">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={application.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-bold text-[#7652E8] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Assessment">Assessment</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="p-2.5 rounded-xl border border-violet-100 bg-white text-slate-600 hover:text-[#7652E8] hover:bg-violet-50 transition-colors cursor-pointer"
            title="Edit details"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl border border-rose-100 bg-white text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete application"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-violet-100 pb-2 overflow-x-auto">
        {[
          { id: 'timeline', label: 'Timeline & Evidence', icon: Clock },
          { id: 'details', label: 'Overview & Job Details', icon: FileText },
          { id: 'recruiter', label: 'Recruiter Contacts', icon: User },
          { id: 'notes', label: 'Notes & Strategy', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
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

      {/* TAB 1: TIMELINE & EVIDENCE */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight">Application Lifecycle</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified historical progression backed by emails and actions
              </p>
            </div>
            <button
              onClick={() => setAddEventOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-[#7652E8] text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Event</span>
            </button>
          </div>

          {/* Timeline Events List */}
          <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-violet-100">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No events recorded yet.</p>
            ) : (
              timeline.map((ev) => (
                <div key={ev._id} className="relative group">
                  {/* Event Marker */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                      ev.source === 'gmail'
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-[#7652E8] text-white'
                    }`}
                  >
                    {ev.source === 'gmail' ? (
                      <Mail className="w-2.5 h-2.5" />
                    ) : (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    )}
                  </div>

                  {/* Event Box */}
                  <div className="bg-[#FAF9FE] rounded-2xl p-4 border border-violet-100/70 hover:border-violet-200 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800">{ev.title}</span>
                        {ev.source === 'gmail' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            Gmail Evidence
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {format(new Date(ev.eventDate), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    {ev.notes && (
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-violet-100/40">
                        {ev.notes}
                      </p>
                    )}

                    {ev.previousStatus && ev.newStatus && (
                      <div className="mt-2.5 flex items-center space-x-2 text-[11px]">
                        <span className="text-slate-400">Status shift:</span>
                        <span className="font-semibold text-slate-600">{ev.previousStatus}</span>
                        <span className="text-violet-400 font-bold">→</span>
                        <span className="font-bold text-[#7652E8]">{ev.newStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & DETAILS */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Job Description</h3>
            <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed bg-[#FAF9FE] p-4 rounded-2xl border border-violet-100/60">
              {application.jobDescription || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Employment Type</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{application.employmentType}</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100/60">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Application Source</span>
              <p className="text-xs font-bold text-slate-800 mt-1">{application.source}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECRUITER CONTACTS */}
      {activeTab === 'recruiter' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Recruiter Information</h3>
          {application.recruiterName || application.recruiterEmail ? (
            <div className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{application.recruiterName || 'Talent Team'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{application.recruiterEmail || 'No email specified'}</p>
              </div>
              {application.recruiterEmail && (
                <a
                  href={`mailto:${application.recruiterEmail}`}
                  className="px-3 py-1.5 rounded-xl bg-[#7652E8] text-white text-xs font-bold hover:bg-[#6844dd]"
                >
                  Email Recruiter
                </a>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No recruiter contact details attached yet.</p>
          )}
        </div>
      )}

      {/* TAB 4: NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Interview & Application Notes</h3>
          <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-[#FAF9FE] p-4 rounded-2xl border border-violet-100/60">
            {application.notes || 'No notes added yet.'}
          </p>
        </div>
      )}

      {/* Manual Timeline Event Modal */}
      {addEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-violet-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Log Timeline Event</h3>
            <form onSubmit={handleAddEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
                <select
                  value={newEvent.eventType}
                  onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7652E8]"
                >
                  <option value="Assessment Completed">Assessment Completed</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interview Completed">Interview Completed</option>
                  <option value="Follow-up Sent">Follow-up Sent</option>
                  <option value="Offer Received">Offer Received</option>
                  <option value="Rejection Received">Rejection Received</option>
                  <option value="Note Added">Note Added</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Summary *</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Completed Technical Round with Lead Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status To (Optional)</label>
                <select
                  value={newEvent.newStatus}
                  onChange={(e) => setNewEvent({ ...newEvent, newStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7652E8]"
                >
                  <option value="">Keep current status</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  placeholder="Additional context or takeaways..."
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddEventOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7652E8] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && (
        <ApplicationModal
          isOpen={modalOpen}
          initialData={application}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchApplication();
          }}
        />
      )}
    </div>
  );
};

export default ApplicationDetailPage;

