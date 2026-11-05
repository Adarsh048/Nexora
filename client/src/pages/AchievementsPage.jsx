import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Star,
  Award,
  Flag,
  Video,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { achievementApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';

export const AchievementsPage = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState({ total: 6, unlocked: 0, percentage: 0 });

  useEffect(() => {
    async function load() {
      try {
        const res = await achievementApi.getAll();
        if (res.success && res.data) {
          setAchievements(res.data);
          setSummary(res.summary || { total: 6, unlocked: 0, percentage: 0 });
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7652E8', '#9B7AFB', '#F4B544', '#35B982'],
    });
  };

  const getBadgeIcon = (iconKey) => {
    switch (iconKey) {
      case 'flame':
        return <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />;
      case 'flag':
        return <Flag className="w-6 h-6 text-[#7652E8]" />;
      case 'video':
        return <Video className="w-6 h-6 text-sky-500" />;
      case 'trophy':
        return <Trophy className="w-6 h-6 text-amber-500" />;
      case 'award':
        return <Award className="w-6 h-6 text-emerald-500" />;
      case 'layers':
        return <Layers className="w-6 h-6 text-[#9B7AFB]" />;
      default:
        return <Star className="w-6 h-6 text-[#7652E8]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Career Milestones & Achievements</span>
            <span className="text-xl">🏆</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track momentum, job-search consistency, and major hiring milestones
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Progress</span>
        </button>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-violet-100/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-[#7652E8] uppercase tracking-wider bg-violet-50 px-3 py-1 rounded-full">
            Journey Velocity
          </span>
          <h2 className="text-xl font-black text-slate-800 tracking-tight mt-2">
            {summary.unlocked} of {summary.total} Milestones Unlocked
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Milestones recognize key steps: starting your pipeline, maintaining consistency, landing interviews, and securing offers.
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full md:w-64">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500">Milestone Progress</span>
            <span className="text-[#7652E8]">{summary.percentage}%</span>
          </div>
          <div className="w-full bg-[#FAF9FE] h-3 rounded-full overflow-hidden border border-violet-100/40">
            <div
              className="h-full bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] rounded-full transition-all duration-700"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((item) => {
          const unlocked = item.unlocked;

          return (
            <div
              key={item._id || item.badgeKey}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-white border-violet-100/80 shadow-xs hover:shadow-md hover:border-violet-300'
                  : 'bg-white/60 border-slate-200/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      unlocked
                        ? 'bg-violet-50 border-violet-100 shadow-2xs'
                        : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}
                  >
                    {unlocked ? getBadgeIcon(item.icon) : <Lock className="w-5 h-5 text-slate-400" />}
                  </div>

                  {unlocked ? (
                    <span className="flex items-center space-x-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-violet-50/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{item.criteria}</span>
                {unlocked && item.unlockedAt && (
                  <span>{format(new Date(item.unlockedAt), 'MMM d, yyyy')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;

