import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Mail, CheckCircle2, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const RecentActivityCard = ({ activity = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'Interview Scheduled':
      case 'Interview Completed':
        return <Mail className="w-4 h-4 text-[#7652E8]" />;
      case 'Assessment Invitation':
      case 'Assessment Completed':
        return <FileText className="w-4 h-4 text-[#F4B544]" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#35B982]" />;
    }
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Interview':
        return 'bg-[#EDE8FF] text-[#7652E8]';
      case 'Assessment':
        return 'bg-[#FFF6E5] text-[#F4B544]';
      case 'Applied':
        return 'bg-[#EBF7FD] text-[#22A7F0]';
      case 'Offer':
        return 'bg-[#EAF8F1] text-[#35B982]';
      default:
        return 'bg-[#F4F3FA] text-[#7652E8]';
    }
  };

  const displayList = activity && activity.length > 0 ? activity.slice(0, 3) : [];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shrink-0">
            <Zap className="w-4 h-4 text-[#7652E8]" />
          </div>
          <h3 className="text-sm font-black text-[#17172F]">Recent Activity</h3>
        </div>
        <Link
          to="/activity"
          className="text-xs font-bold text-[#7652E8] hover:text-[#5d38db] flex items-center space-x-1 transition-colors group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Activity Feed Items */}
      <div className="space-y-3 flex-1">
        {displayList.length === 0 ? (
          <div className="h-full min-h-[140px] flex items-center justify-center text-center text-xs text-[#8E8BA8] border border-dashed border-[#EAE6F8] rounded-2xl p-4">
            No recent activity recorded yet. Status updates and recruitment email detections will stream here.
          </div>
        ) : (
          displayList.map((item) => {
            const appId = typeof item.applicationId === 'object' ? item.applicationId?._id : item.applicationId;
            const statusLabel =
              item.newStatus ||
              (item.eventType?.includes('Interview')
                ? 'Interview'
                : item.eventType?.includes('Assessment')
                ? 'Assessment'
                : 'Applied');

            return (
              <Link
                key={item._id}
                to={appId ? `/applications/${appId}` : '/activity'}
                className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9FE] hover:shadow-2xs transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF9FE] flex items-center justify-center shrink-0 border border-[#F0EDFC]">
                    {getIcon(item.eventType)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#17172F] group-hover:text-[#7652E8] transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#74748C] font-medium">
                      {formatDistanceToNow(new Date(item.eventDate), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${getBadgeStyle(
                    statusLabel
                  )}`}
                >
                  {statusLabel}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
