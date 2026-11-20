import React from 'react';
import { Briefcase, Users, Trophy, XCircle } from 'lucide-react';

export const MetricCards = ({
  totalApplications = 0,
  interviewsCount = 0,
  offersCount = 0,
  rejectedCount = 0,
}) => {
  const cards = [
    {
      id: 'applications',
      title: 'Applications',
      value: totalApplications,
      change: totalApplications > 0 ? '+20%' : null,
      icon: Briefcase,
      iconBg: 'bg-gradient-to-tr from-[#EDE8FF] to-[#DFD6FC]',
      iconColor: 'text-[#7652E8]',
      accentBorder: 'border-t-2 border-t-[#7652E8]',
      badgeBg: 'bg-[#EAFBF3] text-[#22A96D]',
      glowHover: 'hover:shadow-[0_14px_30px_-5px_rgba(118,82,232,0.14)]',
    },
    {
      id: 'interviews',
      title: 'Interviews',
      value: interviewsCount,
      change: interviewsCount > 0 ? '+40%' : null,
      icon: Users,
      iconBg: 'bg-gradient-to-tr from-[#E5F5FD] to-[#D0EEFB]',
      iconColor: 'text-[#22A7F0]',
      accentBorder: 'border-t-2 border-t-[#22A7F0]',
      badgeBg: 'bg-[#EAFBF3] text-[#22A96D]',
      glowHover: 'hover:shadow-[0_14px_30px_-5px_rgba(34,167,240,0.14)]',
    },
    {
      id: 'offers',
      title: 'Offers',
      value: offersCount,
      change: null,
      icon: Trophy,
      iconBg: 'bg-gradient-to-tr from-[#FFF7E6] to-[#FFE9BF]',
      iconColor: 'text-[#F4B544]',
      accentBorder: 'border-t-2 border-t-[#F4B544]',
      badgeBg: '',
      glowHover: 'hover:shadow-[0_14px_30px_-5px_rgba(244,181,68,0.14)]',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: rejectedCount,
      change: null,
      icon: XCircle,
      iconBg: 'bg-gradient-to-tr from-[#FEECEF] to-[#FCD3DA]',
      iconColor: 'text-[#EF6674]',
      accentBorder: 'border-t-2 border-t-[#EF6674]',
      badgeBg: '',
      glowHover: 'hover:shadow-[0_14px_30px_-5px_rgba(239,102,116,0.14)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8FB] ${card.accentBorder} shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] ${card.glowHover} hover:border-[#DDD6F7] hover:-translate-y-1 transition-all duration-200 group flex items-center justify-between h-full min-h-[96px]`}
          >
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              {/* Soft Gradient Tinted Icon Container */}
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-108 shadow-xs`}
              >
                <Icon className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${card.iconColor}`} />
              </div>

              {/* Metric Value & Label */}
              <div className="min-w-0">
                <div className="flex items-baseline space-x-1.5 flex-wrap">
                  <span className="text-2xl sm:text-[28px] font-black text-[#17172F] tracking-tight leading-none font-sans">
                    {card.value}
                  </span>
                  {card.change && (
                    <span
                      className={`text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full ${card.badgeBg}`}
                    >
                      ↑ {card.change}
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#74748C] mt-1 sm:mt-1.5 truncate">
                  {card.title}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
