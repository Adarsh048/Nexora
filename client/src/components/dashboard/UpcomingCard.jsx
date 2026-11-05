import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, ArrowRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export const UpcomingCard = ({ events = [] }) => {
  const displayEvents = events && events.length > 0 ? events.slice(0, 2) : [];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shrink-0">
            <CalendarIcon className="w-4 h-4 text-[#7652E8]" />
          </div>
          <h3 className="text-sm font-black text-[#17172F]">Upcoming</h3>
        </div>
        <Link
          to="/calendar"
          className="text-xs font-bold text-[#7652E8] hover:text-[#5d38db] flex items-center space-x-1 transition-colors group"
        >
          <span>View Calendar</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-3 flex-1">
        {displayEvents.length === 0 ? (
          <div className="h-full min-h-[140px] flex items-center justify-center text-center text-xs text-[#8E8BA8] border border-dashed border-[#EAE6F8] rounded-2xl p-4">
            No upcoming events. Scheduled interviews and assessment deadlines appear here.
          </div>
        ) : (
          displayEvents.map((ev) => {
            const evDate = new Date(ev.startTime);
            const monthStr = format(evDate, 'MMM');
            const dayStr = format(evDate, 'dd');
            const timeStr = format(evDate, 'EEE, h:mm a');

            return (
              <div
                key={ev._id}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9FE] hover:shadow-2xs transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {/* Two-Tone Date Badge Tile */}
                  <div className="w-11 h-11 rounded-2xl bg-[#EDE8FF] flex flex-col items-center justify-center shrink-0 border border-[#DDD6F7] shadow-2xs">
                    <span className="text-[10px] font-black text-[#7652E8] uppercase tracking-wider leading-none">
                      {monthStr}
                    </span>
                    <span className="text-sm font-black text-[#17172F] leading-tight mt-0.5">
                      {dayStr}
                    </span>
                  </div>

                  {/* Title & Time */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#17172F] group-hover:text-[#7652E8] transition-colors truncate">
                      {ev.title}
                    </p>
                    <p className="text-[11px] text-[#74748C] font-medium mt-0.5 truncate flex items-center space-x-1">
                      <span>{timeStr}</span>
                    </p>
                  </div>
                </div>

                {ev.meetingLink ? (
                  <a
                    href={ev.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl text-[#9692B0] hover:text-[#7652E8] hover:bg-[#EDE8FF] transition-colors shrink-0 ml-2 cursor-pointer"
                    title="Open meeting"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    to="/calendar"
                    className="p-1.5 rounded-xl text-[#9692B0] hover:text-[#7652E8] hover:bg-[#EDE8FF] transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UpcomingCard;
