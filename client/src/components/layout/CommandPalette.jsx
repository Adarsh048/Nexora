import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Building2, Briefcase, ChevronRight, LayoutDashboard, Calendar, Sparkles } from 'lucide-react';
import { applicationApi } from '../../services/api.js';

export const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    applicationApi.getAll({ limit: '100' }).then((res) => {
      if (res.success && res.data) {
        setApplications(res.data);
      }
    });
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = query.trim()
    ? applications.filter(
        (app) =>
          app.companyName?.toLowerCase().includes(query.toLowerCase()) ||
          app.jobTitle?.toLowerCase().includes(query.toLowerCase()) ||
          app.status?.toLowerCase().includes(query.toLowerCase())
      )
    : applications.slice(0, 6);

  const pages = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Application Pipeline', path: '/pipeline', icon: Briefcase },
    { name: 'Inbox Intelligence', path: '/inbox', icon: Sparkles },
    { name: 'Interview Calendar', path: '/calendar', icon: Calendar },
    { name: 'Company Directory', path: '/companies', icon: Building2 },
  ].filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-[#0E0A22]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 flex items-center space-x-2.5 sm:space-x-3 border-b border-violet-100 shrink-0">
          <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-violet-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications, roles, companies..."
            className="flex-1 bg-transparent border-none text-slate-800 text-xs sm:text-sm font-medium focus:outline-none placeholder:text-slate-400 min-w-0"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Quick Pages */}
          {pages.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
                Navigation
              </p>
              <div className="space-y-1">
                {pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.path}
                      onClick={() => handleSelect(p.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-violet-50 hover:text-[#7652E8] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-violet-400" />
                        <span>{p.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applications Search Results */}
          <div>
            <p className="px-3 text-[11px] font-bold text-violet-400 uppercase tracking-wider mb-1">
              Applications {filteredApps.length > 0 && `(${filteredApps.length})`}
            </p>
            {filteredApps.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400 italic">No applications match your search</p>
            ) : (
              <div className="space-y-1">
                {filteredApps.map((app) => (
                  <button
                    key={app._id}
                    onClick={() => handleSelect(`/applications/${app._id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-violet-50 group transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center font-bold text-[#7652E8] text-[10px] shrink-0">
                        {app.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 group-hover:text-[#7652E8] transition-colors truncate">
                          {app.companyName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{app.jobTitle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {app.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

