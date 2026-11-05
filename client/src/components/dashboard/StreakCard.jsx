import React from 'react';
import { Flame, Check } from 'lucide-react';

export const StreakCard = ({ streak = {} }) => {
  const currentStreak = streak?.current || 0;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, idx) => {
    const isChecked = currentStreak > 0 && idx < Math.min(5, currentStreak);
    return { name, checked: isChecked };
  });

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full">
      {/* Header with Flame Icons */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF6E5] flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5 text-[#F4B544] fill-[#F4B544]" />
          </div>
          <h3 className="text-sm font-black text-[#17172F] tracking-tight">
            {currentStreak > 0 ? `${currentStreak} Day Streak` : '0 Day Streak'}
          </h3>
        </div>
        <Flame className="w-4 h-4 text-[#F4B544] fill-[#F4B544] opacity-80" />
      </div>

      <p className="text-xs text-[#74748C] mb-3 font-medium">
        {currentStreak > 0
          ? "You've been actively job searching!"
          : 'Log an application or interview to ignite your streak!'}
      </p>

      {/* Weekday Circles with Purple Checkmarks */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {weekDays.map((d) => (
          <div key={d.name} className="flex flex-col items-center space-y-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                d.checked
                  ? 'bg-[#7652E8] text-white shadow-[0_2px_8px_rgba(118,82,232,0.4)]'
                  : 'bg-white text-transparent border border-[#ECE8FB]'
              }`}
            >
              <Check className={`w-3.5 h-3.5 ${d.checked ? 'stroke-[2.5]' : 'opacity-0'}`} />
            </div>
            <span className="text-[10px] font-semibold text-[#74748C]">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCard;
