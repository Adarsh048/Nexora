import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';
import { getUserAnalytics } from '../services/analyticsService.js';
import { startOfWeek, endOfWeek, format, subDays } from 'date-fns';

export function computeAccurateStreak(user, applications = [], events = []) {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const existingDays = Array.isArray(user?.streak?.activeDays) ? user.streak.activeDays : [];

  const daySet = new Set(existingDays);
  // User is actively on the platform
  daySet.add(todayStr);

  applications.forEach(app => {
    if (app.createdAt) daySet.add(format(new Date(app.createdAt), 'yyyy-MM-dd'));
    if (app.appliedDate) daySet.add(format(new Date(app.appliedDate), 'yyyy-MM-dd'));
  });

  events.forEach(ev => {
    if (ev.eventDate) daySet.add(format(new Date(ev.eventDate), 'yyyy-MM-dd'));
    if (ev.createdAt) daySet.add(format(new Date(ev.createdAt), 'yyyy-MM-dd'));
  });

  // Calculate consecutive streak backwards from today
  let currentStreak = 0;
  let checkDate = now;
  while (daySet.has(format(checkDate, 'yyyy-MM-dd'))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  // If today had no prior activity check starting from yesterday
  if (currentStreak === 0) {
    checkDate = subDays(now, 1);
    while (daySet.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }
  }

  const sortedDays = Array.from(daySet).sort().slice(-60);
  const bestStreak = Math.max(user?.streak?.best || 0, currentStreak);

  return {
    current: currentStreak,
    best: bestStreak,
    lastActiveDate: now,
    activeDays: sortedDays,
  };
}

export async function getDashboardData(req, res) {
  try {
    const userId = req.user._id;

    // Parallel fetch for ultra-fast response
    const [user, applications, recentActivity, upcomingEvents] = await Promise.all([
      User.findById(userId).lean(),
      Application.find({ userId }).sort('-appliedDate').lean(),
      ApplicationEvent.find({ userId })
        .sort('-eventDate')
        .limit(6)
        .populate('applicationId', 'companyName jobTitle companyLogo status')
        .lean(),
      CalendarEvent.find({
        userId,
        startTime: { $gte: new Date(Date.now() - 3600000 * 2) },
      })
        .sort('startTime')
        .limit(4)
        .populate('applicationId', 'companyName jobTitle companyLogo')
        .lean(),
    ]);

    // Accurate Streak Calculation
    const streak = computeAccurateStreak(user, applications, recentActivity);

    // Asynchronously persist streak updates to MongoDB
    if (user && (!user.streak || user.streak.current !== streak.current || user.streak.activeDays?.length !== streak.activeDays.length)) {
      User.findByIdAndUpdate(userId, { streak }).catch(() => {});
    }

    // Counts
    const totalApps = applications.length;
    const interviewsCount = applications.filter(a => a.status === 'Interview').length;
    const offersCount = applications.filter(a => a.status === 'Offer').length;
    const rejectedCount = applications.filter(a => a.status === 'Rejected').length;
    const assessmentCount = applications.filter(a => a.status === 'Assessment').length;
    const appliedCount = applications.filter(a => a.status === 'Applied').length;
    const savedCount = applications.filter(a => a.status === 'Saved').length;

    // Weekly progress
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyApplicationsCount = applications.filter(a => {
      const d = new Date(a.appliedDate || a.createdAt);
      return d >= weekStart && d <= weekEnd;
    }).length;

    const weeklyGoal = user?.weeklyGoal || 5;
    const weeklyGoalPercent = Math.min(100, Math.round((weeklyApplicationsCount / weeklyGoal) * 100));

    // Pipeline preview columns (top items in each column)
    const pipelinePreview = {
      Saved: {
        count: savedCount,
        items: applications.filter(a => a.status === 'Saved').slice(0, 3),
      },
      Applied: {
        count: appliedCount,
        items: applications.filter(a => a.status === 'Applied').slice(0, 3),
      },
      Assessment: {
        count: assessmentCount,
        items: applications.filter(a => a.status === 'Assessment').slice(0, 3),
      },
      Interview: {
        count: interviewsCount,
        items: applications.filter(a => a.status === 'Interview').slice(0, 3),
      },
    };

    // Donut chart distribution (percentages)
    const distribution = [
      { name: 'Applied', value: appliedCount, percent: totalApps ? Math.round((appliedCount / totalApps) * 100) : 0, color: '#7652E8' },
      { name: 'Interview', value: interviewsCount, percent: totalApps ? Math.round((interviewsCount / totalApps) * 100) : 0, color: '#489BEE' },
      { name: 'Assessment', value: assessmentCount, percent: totalApps ? Math.round((assessmentCount / totalApps) * 100) : 0, color: '#35B982' },
      { name: 'Offered', value: offersCount, percent: totalApps ? Math.round((offersCount / totalApps) * 100) : 0, color: '#F4B544' },
      { name: 'Rejected', value: rejectedCount, percent: totalApps ? Math.round((rejectedCount / totalApps) * 100) : 0, color: '#EF6674' },
    ];

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalApplications: totalApps,
          interviewsCount,
          offersCount,
          rejectedCount,
          assessmentCount,
          savedCount,
        },
        pipelinePreview,
        progress: {
          weeklyGoal,
          completedThisWeek: weeklyApplicationsCount,
          percentage: weeklyGoalPercent,
        },
        streak,
        careerGoal: user.careerGoal || 'Get your next offer',
        targetRole: user.targetRole || 'Software Engineer',
        recentActivity,
        upcomingEvents,
        distribution,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getFullAnalyticsData(req, res) {
  try {
    const { timeframe } = req.query;
    const analytics = await getUserAnalytics(req.user._id, timeframe);

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

