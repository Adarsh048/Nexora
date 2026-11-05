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
      iconBg: 'bg-[#EDE8FF]',
      iconColor: 'text-[#7652E8]',
      badgeBg: 'bg-[#EAFBF3] text-[#22A96D]',
    },
    {
      id: 'interviews',
      title: 'Interviews',
      value: interviewsCount,
      change: interviewsCount > 0 ? '+40%' : null,
      icon: Users,
      iconBg: 'bg-[#E5F5FD]',
      iconColor: 'text-[#22A7F0]',
      badgeBg: 'bg-[#EAFBF3] text-[#22A96D]',
    },
    {
      id: 'offers',
      title: 'Offers',
      value: offersCount,
      change: null,
      icon: Trophy,
      iconBg: 'bg-[#FFF7E6]',
      iconColor: 'text-[#F4B544]',
      badgeBg: '',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      value: rejectedCount,
      change: null,
      icon: XCircle,
      iconBg: 'bg-[#FEECEF]',
      iconColor: 'text-[#EF6674]',
      badgeBg: '',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] hover:shadow-[0_14px_30px_-5px_rgba(118,82,232,0.1)] hover:border-[#DDD6F7] hover:-translate-y-0.5 transition-all duration-200 group flex items-center justify-between h-full min-h-[96px]"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              {/* Soft Tinted Icon Container */}
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs`}
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
