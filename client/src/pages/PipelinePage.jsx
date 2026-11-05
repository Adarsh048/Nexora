import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Bookmark,
  Send,
  Layers,
  Calendar,
  Award,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { applicationApi } from '../services/api.js';
import { ApplicationModal } from '../components/applications/ApplicationModal.jsx';
import { format } from 'date-fns';

export const PipelinePage = () => {
  const [columns, setColumns] = useState({
    Saved: [],
    Applied: [],
    Assessment: [],
    Interview: [],
    Offer: [],
    Rejected: [],
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState('Applied');
  const [draggingAppId, setDraggingAppId] = useState(null);

  const fetchKanban = async () => {
    try {
      const res = await applicationApi.getKanban();
      if (res.success && res.data) {
        setColumns({
          Saved: res.data.Saved || [],
          Applied: res.data.Applied || [],
          Assessment: res.data.Assessment || [],
          Interview: res.data.Interview || [],
          Offer: res.data.Offer || [],
          Rejected: res.data.Rejected || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKanban();
  }, []);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setColumns((prev) => {
        let appToMove = null;
        const newCols = {};

        for (const [colKey, list] of Object.entries(prev)) {
          const filtered = list.filter((a) => {
            if (a._id === appId) {
              appToMove = { ...a, status: newStatus };
              return false;
            }
            return true;
          });
          newCols[colKey] = filtered;
        }

        if (appToMove && newCols[newStatus]) {
          newCols[newStatus] = [appToMove, ...newCols[newStatus]];
        }

        return newCols;
      });

      await applicationApi.updateStatus(appId, newStatus);
      fetchKanban();
    } catch (err) {
      console.error('Failed to change status:', err);
      fetchKanban();
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggingAppId(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggingAppId;
    setDraggingAppId(null);
    if (!id) return;
    await handleStatusChange(id, targetStatus);
  };

  const columnConfig = [
    { id: 'Saved', title: 'Saved', icon: Bookmark, color: 'text-purple-600', badgeBg: 'bg-purple-100 text-purple-700', borderTop: 'border-t-purple-400' },
    { id: 'Applied', title: 'Applied', icon: Send, color: 'text-[#7652E8]', badgeBg: 'bg-violet-100 text-[#7652E8]', borderTop: 'border-t-[#7652E8]' },
    { id: 'Assessment', title: 'Assessment', icon: Layers, color: 'text-amber-500', badgeBg: 'bg-amber-100 text-amber-700', borderTop: 'border-t-amber-400' },
    { id: 'Interview', title: 'Interview', icon: Calendar, color: 'text-sky-500', badgeBg: 'bg-sky-100 text-sky-700', borderTop: 'border-t-sky-400' },
    { id: 'Offer', title: 'Offer', icon: Award, color: 'text-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700', borderTop: 'border-t-emerald-400' },
    { id: 'Rejected', title: 'Rejected', icon: XCircle, color: 'text-rose-500', badgeBg: 'bg-rose-100 text-rose-700', borderTop: 'border-t-rose-400' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Application Pipeline</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-[#7652E8]">
              Drag & Drop
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual recruitment pipeline. Drag cards between stages or use quick-advance buttons.
          </p>
        </div>

        <button
          onClick={() => {
            setDefaultStatusForModal('Applied');
            setModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#7652E8] to-[#9B7AFB] text-white text-xs font-bold shadow-md shadow-[#7652E8]/25 hover:opacity-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Job</span>
        </button>
      </div>

      {/* Kanban Board Container (Horizontal Swipeable on Mobile) */}
      <div className="flex items-start space-x-3.5 sm:space-x-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory">
        {columnConfig.map((col) => {
          const Icon = col.icon;
          const items = columns[col.id] || [];

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-[85vw] sm:w-72 shrink-0 snap-center bg-[#F7F6FD] rounded-3xl p-3.5 border-t-4 ${col.borderTop} border border-violet-100/70 shadow-xs flex flex-col min-h-[520px] sm:min-h-[580px] transition-colors`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-2 py-2 mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-4 h-4 ${col.color}`} />
                  <span className="text-xs font-bold text-slate-800">{col.title}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.badgeBg}`}>
                    {items.length}
                  </span>
                  <button
                    onClick={() => {
                      setDefaultStatusForModal(col.id);
                      setModalOpen(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-violet-100/60 cursor-pointer"
                    title={`Add new ${col.title} application`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                {items.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-violet-200/60 rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[11px] text-slate-400">Drag applications here</p>
                  </div>
                ) : (
                  items.map((app) => (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      className="bg-white rounded-2xl p-4 shadow-xs border border-violet-100/80 hover:shadow-md hover:border-violet-300 transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Top: Company Logo & Details */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center font-bold text-[#7652E8] text-xs shrink-0 border border-violet-100/50">
                            {app.companyName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/applications/${app._id}`}
                              className="text-xs font-bold text-slate-800 hover:text-[#7652E8] transition-colors line-clamp-1"
                            >
                              {app.companyName}
                            </Link>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{app.jobTitle}</p>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Source and Date */}
                      <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-violet-50/80 pt-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium">
                          {app.source}
                        </span>
                        <span>{app.appliedDate ? format(new Date(app.appliedDate), 'MMM d') : ''}</span>
                      </div>

                      {/* Quick status mover footer */}
                      <div className="mt-3 pt-2 border-t border-violet-50 flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-slate-400 font-medium">Move to:</span>
                        <div className="flex items-center space-x-1">
                          {columnConfig
                            .filter((c) => c.id !== col.id)
                            .slice(0, 2)
                            .map((target) => (
                              <button
                                key={target.id}
                                onClick={() => handleStatusChange(app._id, target.id)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-50 hover:bg-[#7652E8] hover:text-white text-[#7652E8] transition-colors cursor-pointer"
                              >
                                {target.title}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <ApplicationModal
          isOpen={modalOpen}
          initialData={{ status: defaultStatusForModal }}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchKanban();
          }}
        />
      )}
    </div>
  );
};

export default PipelinePage;

