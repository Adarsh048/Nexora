import React from 'react';
import { Target, ChevronDown } from 'lucide-react';

export const ProgressCard = ({ progress = {} }) => {
  const { weeklyGoal = 5, completedThisWeek = 0, percentage = 0 } = progress;

  // Circular ring calculation
  const radius = 33;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shrink-0">
            <Target className="w-4 h-4 text-[#7652E8]" />
          </div>
          <h3 className="text-sm font-black text-[#17172F]">Your Progress</h3>
        </div>

        <div className="flex items-center space-x-1 text-xs text-[#74748C] font-semibold cursor-pointer hover:text-[#17172F] transition-colors">
          <span>This Week</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Progress Ring and Stats */}
      <div className="flex items-center space-x-4 sm:space-x-5 my-1">
        {/* SVG Circular Progress Ring with Gradient */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 86 86">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7652E8" />
                <stop offset="100%" stopColor="#A184FC" />
              </linearGradient>
            </defs>
            {/* Background ring */}
            <circle
              cx="43"
              cy="43"
              r={radius}
              stroke="#EDE8FC"
              strokeWidth="7"
              fill="transparent"
            />
            {/* Active progress ring */}
            <circle
              cx="43"
              cy="43"
              r={radius}
              stroke="url(#ringGrad)"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-black text-[#17172F] tracking-tight">{percentage}%</span>
          </div>
        </div>

        {/* Goal Detail & Bar */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#17172F]">Weekly Goal</p>
          <p className="text-[11px] text-[#74748C] mt-0.5 truncate font-medium">
            Apply to {weeklyGoal} new opportunities
          </p>

          <div className="mt-2.5">
            <div className="w-full bg-[#EDE8FC] h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
            <div className="flex justify-end mt-1 text-[11px] font-bold text-[#74748C]">
              <span>{completedThisWeek}/{weeklyGoal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
