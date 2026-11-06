import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import CalendarEvent from '../models/CalendarEvent.js';
import User from '../models/User.js';
import { getUserAnalytics } from '../services/analyticsService.js';
import { startOfWeek, endOfWeek } from 'date-fns';

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
        streak: user.streak || { current: 0, best: 0, activeDays: [] },
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

