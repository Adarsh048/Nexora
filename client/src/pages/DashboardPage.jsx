import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { analyticsApi } from '../services/api.js';
import { MountainIllustration } from '../components/dashboard/MountainIllustration.jsx';
import { MetricCards } from '../components/dashboard/MetricCards.jsx';
import { PipelinePreview } from '../components/dashboard/PipelinePreview.jsx';
import { ProgressCard } from '../components/dashboard/ProgressCard.jsx';
import { StreakCard } from '../components/dashboard/StreakCard.jsx';
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard.jsx';
import { InsightsDonutCard } from '../components/dashboard/InsightsDonutCard.jsx';
import { UpcomingCard } from '../components/dashboard/UpcomingCard.jsx';
import { ApplicationModal } from '../components/applications/ApplicationModal.jsx';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await analyticsApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchDashboard();

    const handleAdded = () => fetchDashboard();
    window.addEventListener('nexora-application-added', handleAdded);

    // Keep greeting and time dynamically updated every 30 seconds
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);

    return () => {
      window.removeEventListener('nexora-application-added', handleAdded);
      clearInterval(timer);
    };
  }, []);

  const getTimeContext = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        greeting: 'Good morning',
        emoji: '☀️',
        subtitle: 'Start your day strong. Ready to conquer your career goals today?',
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        greeting: 'Good afternoon',
        emoji: '🌤️',
        subtitle: 'Midday momentum! Keep tracking applications and interview updates.',
      };
    } else if (hour >= 17 && hour < 22) {
      return {
        greeting: 'Good evening',
        emoji: '🌆',
        subtitle: 'Wrapping up your day? Review your recruitment updates and progress.',
      };
    } else {
      return {
        greeting: 'Good night',
        emoji: '🌙',
        subtitle: 'Burning the midnight oil. Your consistency and preparation will pay off!',
      };
    }
  };

  const timeContext = getTimeContext();

  if (loading && !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-32 bg-white/70 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-24 bg-white/70 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-72 bg-white/70 rounded-3xl" />
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalApplications: 0,
    interviewsCount: 0,
    offersCount: 0,
    rejectedCount: 0,
    assessmentCount: 0,
    savedCount: 0,
  };

  const pipeline = data?.pipelinePreview || {
    Saved: { count: 0, items: [] },
    Applied: { count: 0, items: [] },
    Assessment: { count: 0, items: [] },
    Interview: { count: 0, items: [] },
  };

  const progress = data?.progress || {
    weeklyGoal: user?.weeklyGoal || 5,
    completedThisWeek: 0,
    percentage: 0,
  };

  const streak = data?.streak || user?.streak || {
    current: 0,
    best: 0,
    activeDays: [],
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Header Row (Greeting on Left, Mountain Career Landscape on Right, Perfectly Aligned) */}
      <div className="flex flex-col lg:flex-row lg:items-stretch justify-between gap-4 sm:gap-6">
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#17172F] tracking-tight font-sans flex items-center gap-2">
              <span>{timeContext.greeting}, {user?.name || 'Explorer'}</span>
              <span className="text-xl sm:text-2xl md:text-3xl select-none" role="img" aria-label="time context">
                {timeContext.emoji}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#74748C] mt-1 font-medium">
              {timeContext.subtitle}
            </p>
          </div>

          {/* Primary Action: Add New Job (Aligned on bottom baseline of mountain card in web view) */}
          <div className="mt-4 flex items-center space-x-3 flex-wrap gap-y-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] via-[#855FEA] to-[#9B7AFB] hover:from-[#6A42E4] hover:to-[#8E6DF3] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-[#7652E8]/35 hover:shadow-xl hover:shadow-[#7652E8]/45 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-lg bg-white/25 flex items-center justify-center group-hover:bg-white/35 transition-colors">
                <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
              </div>
              <span className="whitespace-nowrap">Add New Job</span>
            </button>
            <span className="text-xs text-[#8E8BA8] font-medium hidden sm:inline">
              Track an applied role in 5 seconds
            </span>
          </div>
        </div>

        {/* Mountain Illustration & Career Goal Badge */}
        <div className="shrink-0 flex items-center justify-end">
          <MountainIllustration careerGoal={user?.careerGoal || data?.careerGoal || 'Get your next offer'} />
        </div>
      </div>

      {/* 2. Overview Metric Cards Row (2 cols on mobile, 4 on desktop, perfectly stretched) */}
      <MetricCards
        totalApplications={metrics.totalApplications}
        interviewsCount={metrics.interviewsCount}
        offersCount={metrics.offersCount}
        rejectedCount={metrics.rejectedCount}
      />

      {/* 3. Middle Row: Pipeline & Progress + Streak (Matched heights) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <PipelinePreview pipeline={pipeline} onOpenAddModal={() => setIsAddModalOpen(true)} />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5 justify-between">
          <div className="flex-1">
            <ProgressCard progress={progress} />
          </div>
          <div className="flex-1">
            <StreakCard streak={streak} />
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Recent Activity, Application Insights Donut, Upcoming (Equal heights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        <div className="flex flex-col">
          <RecentActivityCard activity={data?.recentActivity || []} />
        </div>
        <div className="flex flex-col">
          <InsightsDonutCard
            distribution={data?.distribution || []}
            totalApplications={metrics.totalApplications}
          />
        </div>
        <div className="flex flex-col">
          <UpcomingCard events={data?.upcomingEvents || []} />
        </div>
      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && (
        <ApplicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaved={() => {
            setIsAddModalOpen(false);
            fetchDashboard();
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
