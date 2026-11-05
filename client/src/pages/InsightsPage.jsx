import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Target,
} from 'lucide-react';
import { analyticsApi } from '../services/api.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const InsightsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsApi.getInsights();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 h-28 bg-white rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-72 bg-white rounded-3xl" />
      </div>
    );
  }

  const {
    totalApplications = 0,
    interviewsCount = 0,
    offersCount = 0,
    responseRate = 0,
    interviewConversionRate = 0,
    offerConversionRate = 0,
    sourceDistribution = [],
    weeklyTrend = [],
    monthlyTrend = [],
    funnel = [],
  } = data || {};

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Analytics & Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Evidence-backed metrics, conversion funnels, and trends calculated directly from your application records
        </p>
      </div>

      {/* Top Conversion Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <div className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Response Rate</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-[#7652E8] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-800 font-sans">{responseRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Applications that received a follow-up or test</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Interview Rate</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-800 font-sans">{interviewConversionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Applications converted into interviews ({interviewsCount})</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Offer Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-800 font-sans">{offerConversionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Applications converted into job offers ({offersCount})</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-xs border border-violet-100/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Total Tracked</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-800 font-sans">{totalApplications}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active and historical opportunities</p>
        </div>
      </div>

      {/* Middle Row: Funnel & Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruitment Funnel */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Recruitment Conversion Funnel</h3>
          <div className="space-y-3.5">
            {funnel.map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700">{stage.stage}</span>
                  <span className="font-semibold text-slate-400">
                    {stage.count} ({stage.percent}%)
                  </span>
                </div>
                <div className="w-full bg-[#FAF9FE] h-2.5 rounded-full overflow-hidden border border-violet-100/40">
                  <div
                    className="h-full bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] rounded-full transition-all duration-700"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Application Sources</h3>
          {sourceDistribution.length === 0 ? (
            <p className="text-xs text-slate-400 py-10 text-center">No source data yet</p>
          ) : (
            <div className="space-y-3">
              {sourceDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{item.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-400">{item.count} apps</span>
                    <span className="font-bold text-[#7652E8] bg-violet-50 px-2 py-0.5 rounded-md">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Trends Charts */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-violet-100/60">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Weekly Application Momentum</h3>
        <div className="h-64 w-full">
          {weeklyTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Not enough data for momentum chart
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1A3C',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="applications" fill="#7652E8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;

