import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Kanban, Sparkles, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar.jsx';
import { TopBar } from './TopBar.jsx';
import { CommandPalette } from './CommandPalette.jsx';
import { ApplicationModal } from '../applications/ApplicationModal.jsx';
import { notificationApi, gmailApi, inboxApi, prefetchWorkspaceData } from '../../services/api.js';

export const AppLayout = () => {
  const location = useLocation();
  const workspaceContainerRef = useRef(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [gmailStatus, setGmailStatus] = useState(null);
  const [pendingInboxCount, setPendingInboxCount] = useState(0);

  // Smooth scroll-to-top on route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (workspaceContainerRef.current) {
      workspaceContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const fetchHeaderData = async () => {
    try {
      const [notifRes, gmailRes, inboxRes] = await Promise.all([
        notificationApi.getAll(),
        gmailApi.getStatus(),
        inboxApi.getEmails({ limit: '1' }),
      ]);

      if (notifRes.success) {
        setNotifications(notifRes.data);
        setUnreadCount(notifRes.unreadCount);
      }
      if (gmailRes.success) {
        setGmailStatus(gmailRes.data);
      }
      if (inboxRes.success) {
        setPendingInboxCount(inboxRes.pendingCount || 0);
      }
    } catch {
      // Quietly handle during initial setup
    }
  };

  useEffect(() => {
    fetchHeaderData();
    prefetchWorkspaceData();
    const interval = setInterval(fetchHeaderData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener('nexora-open-add-modal', handleOpenModal);
    return () => window.removeEventListener('nexora-open-add-modal', handleOpenModal);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8F7FD] overflow-x-hidden">
      {/* Persistent Visual Sidebar (Responsive Drawer on Mobile) */}
      <Sidebar
        gmailStatus={gmailStatus}
        pendingInboxCount={pendingInboxCount}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div
        ref={workspaceContainerRef}
        className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto pb-20 lg:pb-0 scroll-smooth"
      >
        <TopBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          notifications={notifications}
          unreadCount={unreadCount}
          onRefreshNotifications={fetchHeaderData}
        />

        <main
          key={location.pathname}
          className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto transition-all animate-in fade-in duration-200"
        >
          <Outlet context={{ refreshGlobalData: fetchHeaderData }} />
        </main>
      </div>

      {/* Sleek Mobile Bottom Navigation Bar with Prominent Center Add Button (< lg screens) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg border-t border-[#ECE8FB] py-1.5 px-2 z-30 flex items-center justify-around shadow-[0_-4px_25px_rgba(118,82,232,0.08)]">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all duration-200 ${
              isActive ? 'text-[#7652E8] font-bold scale-105' : 'text-[#8E8BA8] hover:text-[#17172F]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#7652E8] mt-0.5" />}
            </>
          )}
        </NavLink>

        {/* 2. Applications */}
        <NavLink
          to="/applications"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all duration-200 ${
              isActive ? 'text-[#7652E8] font-bold scale-105' : 'text-[#8E8BA8] hover:text-[#17172F]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FileText className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 tracking-tight">Applications</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#7652E8] mt-0.5" />}
            </>
          )}
        </NavLink>

        {/* 3. Central Prominent Elevated "+ Add Job" Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] text-white shadow-lg shadow-[#7652E8]/45 flex items-center justify-center active:scale-95 transition-all hover:scale-105 cursor-pointer ring-4 ring-white"
          title="Add New Job"
          aria-label="Add New Job"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>

        {/* 4. Pipeline */}
        <NavLink
          to="/pipeline"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all duration-200 ${
              isActive ? 'text-[#7652E8] font-bold scale-105' : 'text-[#8E8BA8] hover:text-[#17172F]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Kanban className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] mt-0.5 tracking-tight">Pipeline</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#7652E8] mt-0.5" />}
            </>
          )}
        </NavLink>

        {/* 5. Inbox */}
        <NavLink
          to="/inbox"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all duration-200 ${
              isActive ? 'text-[#7652E8] font-bold scale-105' : 'text-[#8E8BA8] hover:text-[#17172F]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <Sparkles className="w-5 h-5 stroke-[2.2]" />
                {pendingInboxCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#EF6674] text-white text-[9px] font-black flex items-center justify-center">
                    {pendingInboxCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Inbox</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-[#7652E8] mt-0.5" />}
            </>
          )}
        </NavLink>
      </nav>

      {/* Command Palette (⌘K) */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Quick Add Application Modal */}
      {isAddModalOpen && (
        <ApplicationModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaved={() => {
            setIsAddModalOpen(false);
            fetchHeaderData();
            window.dispatchEvent(new CustomEvent('nexora-application-added'));
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;

