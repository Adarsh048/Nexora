import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Kanban,
  Activity,
  Sparkles,
  BarChart3,
  Calendar,
  Building2,
  Award,
  Settings,
  X,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = ({
  gmailStatus = null,
  pendingInboxCount = 0,
  isOpen = false,
  onClose,
  onOpenAddModal,
}) => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: FileText },
    { to: '/pipeline', label: 'Pipeline', icon: Kanban },
    { to: '/activity', label: 'Activity', icon: Activity },
    {
      to: '/inbox',
      label: 'Inbox Intelligence',
      icon: Sparkles,
      badge: pendingInboxCount > 0 ? `${pendingInboxCount}` : undefined,
    },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/companies', label: 'Companies', icon: Building2 },
    { to: '/achievements', label: 'Achievements', icon: Award, isNew: true },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const handleAddJobClick = () => {
    if (onClose) onClose();
    if (onOpenAddModal) {
      onOpenAddModal();
    } else {
      window.dispatchEvent(new CustomEvent('nexora-open-add-modal'));
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0E0A22]/60 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 min-h-screen bg-[#1A1633] text-slate-300 flex flex-col justify-between select-none shrink-0 overflow-y-auto lg:overflow-hidden shadow-2xl lg:shadow-xl transition-transform duration-300 ease-in-out border-r border-white/[0.06] ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Brand Header */}
          <div className="h-18 sm:h-20 px-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#8C6DF2] to-[#7652E8] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(118,82,232,0.4)] shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 9.5L12 17L22 9.5L12 2Z" opacity="0.9" />
                  <path d="M4 12.5L12 18.5L20 12.5" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M4 16L12 22L20 16" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
              <span className="font-black text-white text-lg tracking-tight font-sans">NEXORA</span>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Primary Action Button: Add New Job */}
          <div className="px-4 pb-3">
            <button
              onClick={handleAddJobClick}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#7652E8] via-[#835FEF] to-[#9B7AFB] hover:from-[#6A42E4] hover:to-[#8E6DF3] text-white text-xs font-black shadow-[0_6px_20px_rgba(118,82,232,0.35)] flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-98 cursor-pointer group"
            >
              <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
              </div>
              <span>Add New Job</span>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3.5 py-1 space-y-1 flex-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-200 group ${
                      isActive
                        ? 'bg-[#7652E8] text-white font-bold shadow-[0_8px_20px_-4px_rgba(118,82,232,0.45)]'
                        : 'text-[#9692B0] hover:text-white hover:bg-white/[0.06]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`w-4.5 h-4.5 transition-colors shrink-0 ${
                            isActive ? 'text-white' : 'text-[#8E8BA8] group-hover:text-white'
                          }`}
                        />
                        <span className="truncate">{link.label}</span>
                      </div>

                      {link.isNew && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-[#A78BFA] to-[#7652E8] text-white shadow-xs shrink-0">
                          New
                        </span>
                      )}

                      {link.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4B544] text-[#1E1A3C] shrink-0">
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Mountain Silhouette & User Profile */}
        <div className="relative z-10 pt-4 pb-5 px-4">
          {/* Mountain Silhouette Art */}
          <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 256 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M-20 120 L40 60 L100 120 Z" fill="#6C5CE7" />
              <path d="M60 120 L130 40 L190 90 L240 50 L280 120 Z" fill="#4834D4" />
              <path d="M-10 120 L60 70 L140 120 Z" fill="#A29BFE" opacity="0.4" />
            </svg>
          </div>

          {/* User Profile Card */}
          <div className="relative bg-white/[0.08] backdrop-blur-md rounded-2xl p-3 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7652E8] to-[#9B7AFB] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-inner">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NX'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      gmailStatus?.connected ? 'bg-[#35B982]' : 'bg-slate-400'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 truncate font-medium">
                    {gmailStatus?.connected ? 'Gmail Active' : 'Gmail Off'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
