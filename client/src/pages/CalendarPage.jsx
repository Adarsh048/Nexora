import React, { useState, useEffect } from 'react';
import {
  Plus,
  Clock,
  Video,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MapPin,
} from 'lucide-react';
import { calendarApi, applicationApi } from '../services/api.js';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';

export const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterType] = useState('All');

  // Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    applicationId: '',
    eventType: 'Interview',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: 'Google Meet / Zoom',
    meetingLink: '',
    notes: '',
  });

  const fetchEvents = async () => {
    try {
      const [evRes, appRes] = await Promise.all([
        calendarApi.getEvents({ eventType: filterType }),
        applicationApi.getAll({ limit: '100' }),
      ]);

      if (evRes.success && evRes.data) {
        setEvents(evRes.data);
      }
      if (appRes.success && appRes.data) {
        setApplications(appRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title) return;

    try {
      await calendarApi.create(formData);
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        companyName: '',
        applicationId: '',
        eventType: 'Interview',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        location: 'Google Meet / Zoom',
        meetingLink: '',
        notes: '',
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await calendarApi.delete(id);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // Calendar dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Filter events for selected date
  const selectedDateEvents = events.filter((ev) =>
    isSameDay(new Date(ev.startTime), selectedDate)
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Interview & Deadline Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize recruitment interviews, test deadlines, follow-ups, and recruiter touchpoints
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Calendar View */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60">
          {/* Month Navigator */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-slate-800">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl border border-violet-100 hover:bg-violet-50 text-slate-500 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 py-1.5 rounded-xl border border-violet-100 text-xs font-bold text-slate-600 hover:bg-violet-50 cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl border border-violet-100 hover:bg-violet-50 text-slate-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayEvents = events.filter((ev) => isSameDay(new Date(ev.startTime), day));
              const isSelected = isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#7652E8] bg-violet-50/70 shadow-xs'
                      : today
                      ? 'border-violet-300 bg-white'
                      : 'border-violet-100/50 bg-[#FAF9FE] hover:bg-white hover:border-violet-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        today
                          ? 'w-5 h-5 rounded-full bg-[#7652E8] text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-[#7652E8]'
                          : 'text-slate-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7652E8]" />
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev._id}
                        className="text-[10px] font-bold truncate px-1.5 py-0.5 rounded bg-white text-[#7652E8] border border-violet-100 shadow-2xs"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-semibold block px-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Day Schedule */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-violet-50 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {format(selectedDate, 'EEEE, MMMM d')}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDateEvents.length} scheduled event
                  {selectedDateEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-violet-100 rounded-2xl p-4">
                  No events scheduled for this date.
                </div>
              ) : (
                selectedDateEvents.map((ev) => (
                  <div
                    key={ev._id}
                    className="p-4 rounded-2xl bg-[#FAF9FE] border border-violet-100/70 hover:border-violet-200 transition-all space-y-2 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-[#7652E8]">
                          {ev.eventType}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{ev.title}</h4>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(ev._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {format(new Date(ev.startTime), 'h:mm a')} –{' '}
                          {format(new Date(ev.endTime), 'h:mm a')}
                        </span>
                      </div>
                      {ev.location && (
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>

                    {ev.meetingLink && (
                      <a
                        href={ev.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#7652E8] text-white text-[11px] font-bold hover:bg-[#6844dd] transition-colors mt-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Meeting</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-violet-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Add Calendar Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. System Design Interview with Lead Architect"
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none focus:border-[#7652E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="Interview">Interview</option>
                    <option value="Assessment Deadline">Assessment Deadline</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Recruiter Call">Recruiter Call</option>
                    <option value="Offer Deadline">Offer Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Related Job</label>
                  <select
                    value={formData.applicationId}
                    onChange={(e) => {
                      const app = applications.find((a) => a._id === e.target.value);
                      setFormData({
                        ...formData,
                        applicationId: e.target.value,
                        companyName: app ? app.companyName : '',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="">None / General</option>
                    {applications.map((app) => (
                      <option key={app._id} value={app._id}>
                        {app.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (optional)</label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-violet-100 bg-[#FAF9FE] text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#7652E8] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

