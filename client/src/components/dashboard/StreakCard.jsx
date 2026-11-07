import React from 'react';
import { Flame, Check } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isBefore, isAfter, startOfDay } from 'date-fns';

export const StreakCard = ({ streak = {} }) => {
  const currentStreak = streak?.current || 0;
  const bestStreak = streak?.best || currentStreak;
  const activeDaysSet = new Set(Array.isArray(streak?.activeDays) ? streak.activeDays : []);

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const dayDate = addDays(weekStart, offset);
    const dayStr = format(dayDate, 'yyyy-MM-dd');
    const dayName = format(dayDate, 'EEE');
    const isChecked = activeDaysSet.has(dayStr);
    const isToday = isSameDay(dayDate, now);
    const isPast = isBefore(startOfDay(dayDate), startOfDay(now));
    const isFuture = isAfter(startOfDay(dayDate), startOfDay(now));

    return {
      name: dayName,
      date: dayDate,
      dayStr,
      checked: isChecked,
      isToday,
      isPast,
      isFuture,
    };
  });

  const isActiveToday = activeDaysSet.has(todayStr) || currentStreak > 0;

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] flex flex-col justify-between h-full">
      {/* Header with Flame Icons */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF6E5] flex items-center justify-center shrink-0">
            <Flame className="w-4.5 h-4.5 text-[#F4B544] fill-[#F4B544]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#17172F] tracking-tight">
              {currentStreak > 0 ? `${currentStreak} Day Streak` : '0 Day Streak'}
            </h3>
            {bestStreak > 0 && (
              <span className="text-[10px] text-[#8E8BA8] font-bold block -mt-0.5">
                Personal Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FFF6E5] text-[#D9822B] text-[10px] font-bold">
          <Flame className="w-3 h-3 fill-[#F4B544]" />
          <span>{currentStreak > 0 ? 'Active' : 'Ready'}</span>
        </div>
      </div>

      <p className="text-xs text-[#74748C] mb-3 font-medium">
        {isActiveToday
          ? "🔥 You're active today! Keep your application streak going strong."
          : currentStreak > 0
          ? `⚡ Log an application or update today to keep your ${currentStreak}-day streak alive!`
          : 'Log an application or interview to ignite your streak!'}
      </p>

      {/* Weekday Circles with Accurate Real Date Statuses */}
      <div className="grid grid-cols-7 gap-1 pt-1">
        {weekDays.map((d) => (
          <div key={d.dayStr} className="flex flex-col items-center space-y-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                d.checked
                  ? 'bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] text-white shadow-[0_2px_8px_rgba(118,82,232,0.35)]'
                  : d.isToday
                  ? 'bg-[#FAF9FE] text-[#7652E8] border-2 border-dashed border-[#7652E8]/60 animate-pulse'
                  : d.isPast
                  ? 'bg-[#F8F7FD] text-slate-300 border border-[#ECE8FB]'
                  : 'bg-white text-transparent border border-dashed border-[#ECE8FB]'
              }`}
              title={`${d.name} (${d.dayStr})${d.checked ? ' - Active' : d.isToday ? ' - Today' : ''}`}
            >
              <Check className={`w-3.5 h-3.5 ${d.checked ? 'stroke-[2.5]' : 'opacity-0'}`} />
            </div>
            <span
              className={`text-[10px] font-semibold ${
                d.isToday ? 'text-[#7652E8] font-bold' : 'text-[#74748C]'
              }`}
            >
              {d.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakCard;
