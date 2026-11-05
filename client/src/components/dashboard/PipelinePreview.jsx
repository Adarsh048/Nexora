import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Send, Layers, Calendar, ArrowRight, BarChart3, Plus } from 'lucide-react';

export const PipelinePreview = ({ pipeline = {}, onOpenAddModal }) => {
  const [activeMobileTab, setActiveMobileTab] = useState('Applied');

  const columns = [
    {
      id: 'Saved',
      label: 'Saved',
      count: pipeline?.Saved?.count || 0,
      items: pipeline?.Saved?.items || [],
      icon: Bookmark,
      iconColor: 'text-[#7652E8]',
      badgeBg: 'bg-[#EDE8FF] text-[#7652E8]',
      headerPill: 'bg-[#EDE8FF]/70 text-[#7652E8]',
    },
    {
      id: 'Applied',
      label: 'Applied',
      count: pipeline?.Applied?.count || 0,
      items: pipeline?.Applied?.items || [],
      icon: Send,
      iconColor: 'text-[#7652E8]',
      badgeBg: 'bg-[#EDE8FF] text-[#7652E8]',
      headerPill: 'bg-[#EDE8FF]/70 text-[#7652E8]',
    },
    {
      id: 'Assessment',
      label: 'Assessment',
      count: pipeline?.Assessment?.count || 0,
      items: pipeline?.Assessment?.items || [],
      icon: Layers,
      iconColor: 'text-[#F4B544]',
      badgeBg: 'bg-[#FFF6E5] text-[#F4B544]',
      headerPill: 'bg-[#FFF6E5]/80 text-[#D99516]',
    },
    {
      id: 'Interview',
      label: 'Interview',
      count: pipeline?.Interview?.count || 0,
      items: pipeline?.Interview?.items || [],
      icon: Calendar,
      iconColor: 'text-[#7652E8]',
      badgeBg: 'bg-[#EDE8FF] text-[#7652E8]',
      headerPill: 'bg-[#EDE8FF]/70 text-[#7652E8]',
    },
  ];

  const totalInPipeline =
    (pipeline?.Saved?.count || 0) +
    (pipeline?.Applied?.count || 0) +
    (pipeline?.Assessment?.count || 0) +
    (pipeline?.Interview?.count || 0);

  const getBrandLogo = (companyName) => {
    const name = (companyName || '').toLowerCase();
    if (name.includes('google')) {
      return (
        <span className="font-black text-xs">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
        </span>
      );
    }
    if (name.includes('visa')) {
      return <span className="font-black text-[11px] text-[#1A1F71] italic tracking-tighter">VISA</span>;
    }
    if (name.includes('pwc')) {
      return <span className="font-black text-[10px] text-[#D04A02]">pwc</span>;
    }
    if (name.includes('deloitte')) {
      return (
        <span className="font-black text-xs text-black flex items-baseline">
          D<span className="w-1.5 h-1.5 rounded-full bg-[#86BC25] ml-0.5 inline-block" />
        </span>
      );
    }
    if (name.includes('blackrock')) {
      return <span className="font-black text-[9px] text-[#111111] uppercase tracking-tighter">BLK</span>;
    }
    return (
      <span className="font-black text-[11px] text-[#7652E8]">
        {(companyName || 'CO').slice(0, 2).toUpperCase()}
      </span>
    );
  };

  const renderColumnContent = (col) => (
    <div
      key={col.id}
      className="bg-[#FAF9FE] rounded-2xl p-3 sm:p-3.5 border border-[#F0EDFC] flex flex-col justify-between h-full min-h-[220px]"
    >
      {/* Column Stage Header Pill */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-3">
        <div className="flex items-center space-x-1.5">
          <col.icon className={`w-3.5 h-3.5 ${col.iconColor}`} />
          <span className="text-xs font-bold text-[#17172F]">{col.label}</span>
        </div>
        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
          {col.count}
        </span>
      </div>

      {/* Cards in Column */}
      <div className="space-y-2.5 flex-1">
        {col.items.length === 0 ? (
          <div className="h-full min-h-[130px] flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-[#EAE6F8] rounded-2xl">
            <p className="text-[11px] font-medium text-[#8E8BA8]">No {col.label.toLowerCase()} jobs</p>
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="mt-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD6F7] text-[#7652E8] text-xs font-bold hover:bg-[#7652E8] hover:text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Job</span>
              </button>
            )}
          </div>
        ) : (
          col.items.slice(0, 3).map((app) => (
            <Link
              key={app._id}
              to={`/applications/${app._id}`}
              className="block bg-white p-3 rounded-2xl border border-[#ECE8FB] hover:border-[#DDD6F7] hover:shadow-[0_4px_16px_rgba(118,82,232,0.06)] hover:-translate-y-0.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF9FE] flex items-center justify-center overflow-hidden shrink-0 border border-[#F0EDFC] shadow-2xs">
                  {getBrandLogo(app.companyName)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#17172F] truncate group-hover:text-[#7652E8] transition-colors">
                    {app.companyName}
                  </p>
                  <p className="text-[11px] text-[#74748C] truncate font-medium">{app.jobTitle}</p>
                </div>
              </div>

              {/* Stage Progress mini-bar */}
              <div className="mt-2.5 w-full bg-[#F4F3FA] h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    col.id === 'Assessment'
                      ? 'bg-[#F4B544] w-2/3'
                      : col.id === 'Interview'
                      ? 'bg-[#7652E8] w-4/5'
                      : col.id === 'Applied'
                      ? 'bg-[#9B7AFB] w-1/2'
                      : 'bg-violet-300 w-1/4'
                  }`}
                />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE8FB] shadow-[0_8px_25px_-4px_rgba(118,82,232,0.04),0_2px_6px_rgba(0,0,0,0.015)] h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EDE8FF] flex items-center justify-center text-[#7652E8] shrink-0">
            <BarChart3 className="w-4.5 h-4.5 text-[#7652E8]" />
          </div>
          <h2 className="text-base font-extrabold text-[#17172F] tracking-tight">Application Pipeline</h2>
        </div>
        <div className="flex items-center space-x-2.5">
          <Link
            to="/pipeline"
            className="text-xs font-bold text-[#7652E8] hover:text-[#5d38db] flex items-center space-x-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs (< sm screens) */}
      <div className="flex sm:hidden items-center space-x-1.5 p-1 bg-[#F4F3FA] rounded-2xl mb-3 overflow-x-auto">
        {columns.map((col) => {
          const isActive = activeMobileTab === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileTab(col.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-all ${
                isActive
                  ? 'bg-white text-[#7652E8] shadow-xs'
                  : 'text-[#74748C] hover:text-[#17172F]'
              }`}
            >
              <span>{col.label}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#EDE8FF] text-[#7652E8]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {col.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Stage View on Mobile (< sm) */}
      <div className="block sm:hidden flex-1">
        {columns.filter((c) => c.id === activeMobileTab).map(renderColumnContent)}
      </div>

      {/* Grid on Tablet/Desktop (>= sm screens) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5 flex-1 items-stretch">
        {columns.map(renderColumnContent)}
      </div>

      {totalInPipeline === 0 && onOpenAddModal && (
        <div className="mt-4 pt-3.5 border-t border-[#F0EDFC] flex items-center justify-between text-xs">
          <span className="text-[#74748C] font-medium">Ready to track your career journey?</span>
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white font-extrabold text-xs shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add New Job</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PipelinePreview;
