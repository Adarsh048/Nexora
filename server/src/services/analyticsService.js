import Application from '../models/Application.js';
import ApplicationEvent from '../models/ApplicationEvent.js';
import { subDays, startOfWeek, endOfWeek, format, eachDayOfInterval, subMonths } from 'date-fns';

export async function getUserAnalytics(userId, timeframe = 'all') {
  const allApplications = await Application.find({ userId });
  const total = allApplications.length;

  if (total === 0) {
    return {
      totalApplications: 0,
      interviewsCount: 0,
      offersCount: 0,
      rejectedCount: 0,
      responseRate: 0,
      interviewConversionRate: 0,
      offerConversionRate: 0,
      avgResponseDays: 0,
      statusBreakdown: [],
      sourceDistribution: [],
      weeklyTrend: [],
      monthlyTrend: [],
      funnel: [
        { stage: 'Applied', count: 0, dropoff: '0%' },
        { stage: 'Assessment', count: 0, dropoff: '0%' },
        { stage: 'Interview', count: 0, dropoff: '0%' },
        { stage: 'Offer', count: 0, dropoff: '0%' },
      ],
    };
  }

  // Count by status
  const statusCounts = {
    Saved: 0,
    Applied: 0,
    Assessment: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
    Withdrawn: 0,
    'On Hold': 0,
  };

  const sourceCounts = {};

  allApplications.forEach(app => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    } else {
      statusCounts[app.status] = 1;
    }

    const src = app.source || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const interviewsCount = statusCounts.Interview || 0;
  const offersCount = statusCounts.Offer || 0;
  const rejectedCount = statusCounts.Rejected || 0;
  const assessmentsCount = statusCounts.Assessment || 0;

  // Active / Submitted applications (excluding purely 'Saved')
  const submittedApplications = allApplications.filter(a => a.status !== 'Saved');
  const submittedTotal = submittedApplications.length;

  // Response rate calculation:
  // Applications with an outcome or advance beyond 'Applied' or 'Saved'
  // i.e., Assessment, Interview, Offer, or Rejected
  const respondedApplications = allApplications.filter(a => 
    ['Assessment', 'Interview', 'Offer', 'Rejected'].includes(a.status)
  );

  const responseRate = submittedTotal > 0
    ? Math.round((respondedApplications.length / submittedTotal) * 100)
    : 0;

  // Conversion rates
  const interviewConversionRate = submittedTotal > 0
    ? Math.round(((interviewsCount + offersCount) / submittedTotal) * 100)
    : 0;

  const offerConversionRate = submittedTotal > 0
    ? Math.round((offersCount / submittedTotal) * 100)
    : 0;

  // Status breakdown array for charts (percentage and count)
  const statusBreakdown = [
    { name: 'Applied', value: statusCounts.Applied, percent: total ? Math.round((statusCounts.Applied / total) * 100) : 0, color: '#7652E8' },
    { name: 'Interview', value: interviewsCount, percent: total ? Math.round((interviewsCount / total) * 100) : 0, color: '#489BEE' },
    { name: 'Assessment', value: assessmentsCount, percent: total ? Math.round((assessmentsCount / total) * 100) : 0, color: '#F4B544' },
    { name: 'Offer', value: offersCount, percent: total ? Math.round((offersCount / total) * 100) : 0, color: '#35B982' },
    { name: 'Rejected', value: rejectedCount, percent: total ? Math.round((rejectedCount / total) * 100) : 0, color: '#EF6674' },
    { name: 'Saved', value: statusCounts.Saved, percent: total ? Math.round((statusCounts.Saved / total) * 100) : 0, color: '#9B7AFB' },
  ].filter(item => item.value > 0);

  // Source distribution array
  const sourceDistribution = Object.keys(sourceCounts).map(source => ({
    name: source,
    count: sourceCounts[source],
    percent: Math.round((sourceCounts[source] / total) * 100),
  })).sort((a, b) => b.count - a.count);

  // Weekly Trend (last 7 days)
  const now = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(now, 6),
    end: now,
  });

  const weeklyTrend = last7Days.map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayName = format(day, 'EEE');
    const count = allApplications.filter(app => {
      const appDate = format(new Date(app.appliedDate || app.createdAt), 'yyyy-MM-dd');
      return appDate === dayStr;
    }).length;

    return {
      date: dayStr,
      day: dayName,
      applications: count,
    };
  });

  // Monthly Trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const targetMonth = subMonths(now, i);
    const monthKey = format(targetMonth, 'yyyy-MM');
    const monthLabel = format(targetMonth, 'MMM');
    const count = allApplications.filter(app => {
      const appMonth = format(new Date(app.appliedDate || app.createdAt), 'yyyy-MM');
      return appMonth === monthKey;
    }).length;

    monthlyTrend.push({
      month: monthLabel,
      applications: count,
    });
  }

  // Funnel progression
  const totalAppliedStage = submittedTotal;
  const reachedAssessmentOrHigher = assessmentsCount + interviewsCount + offersCount;
  const reachedInterviewOrHigher = interviewsCount + offersCount;
  const reachedOffer = offersCount;

  const funnel = [
    { stage: 'Applied', count: totalAppliedStage, percent: 100 },
    { stage: 'Assessment', count: reachedAssessmentOrHigher, percent: totalAppliedStage ? Math.round((reachedAssessmentOrHigher / totalAppliedStage) * 100) : 0 },
    { stage: 'Interview', count: reachedInterviewOrHigher, percent: totalAppliedStage ? Math.round((reachedInterviewOrHigher / totalAppliedStage) * 100) : 0 },
    { stage: 'Offer', count: reachedOffer, percent: totalAppliedStage ? Math.round((reachedOffer / totalAppliedStage) * 100) : 0 },
  ];

  return {
    totalApplications: total,
    interviewsCount,
    offersCount,
    rejectedCount,
    assessmentsCount,
    savedCount: statusCounts.Saved,
    appliedCount: statusCounts.Applied,
    responseRate,
    interviewConversionRate,
    offerConversionRate,
    statusBreakdown,
    sourceDistribution,
    weeklyTrend,
    monthlyTrend,
    funnel,
  };
}

