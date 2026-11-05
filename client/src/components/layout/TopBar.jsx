import React, { useState } from 'react';
import { Search, Bell, Check, LogOut, Settings as SettingsIcon, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { notificationApi } from '../../services/api.js';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export const TopBar = ({
  onOpenSearch,
  onToggleMobileMenu,
  notifications = [],
  unreadCount = 0,
  onRefreshNotifications,
}) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      onRefreshNotifications?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      onRefreshNotifications?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="h-16 sm:h-18 px-3.5 sm:px-6 lg:px-8 flex items-center bg-[#F8F7FD]/90 backdrop-blur-md sticky top-0 z-30 transition-all border-b border-[#ECE8FB]/60">
      {/* Aligned container matching the max width and padding of the main workspace */}
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mobile Menu Toggle + Search Bar */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 flex-1 max-w-lg min-w-0">
          {/* Mobile Hamburger Menu Button */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-[#ECE8FB] flex items-center justify-center text-[#17172F] hover:bg-[#FAF9FE] shadow-2xs transition-colors shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Search Input (Pill Style) */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex-1 flex items-center justify-between px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-white border border-[#ECE8FB] text-xs text-[#74748C] hover:border-[#DDD6F7] hover:shadow-xs transition-all cursor-pointer text-left shadow-[0_2px_12px_rgba(118,82,232,0.03)] min-w-0"
          >
            <div className="flex items-center space-x-2 sm:space-x-2.5 truncate">
              <Search className="w-4 h-4 text-[#9692B0] shrink-0" />
              <span className="text-[#8E8BA8] font-medium truncate text-[11px] sm:text-xs">
                Search applications, companies, or roles...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-[#8E8BA8] bg-[#F4F3FA] rounded-md border border-[#ECE8FB] shrink-0 ml-1">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* Right Controls: Notification Bell + User Avatar (Clean, identical to Reference UI) */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border border-[#ECE8FB] hover:border-[#DDD6F7] flex items-center justify-center text-[#74748C] hover:text-[#17172F] transition-all relative cursor-pointer shadow-xs shrink-0"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EF6674] ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-3xl shadow-xl border border-[#ECE8FB] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EDFB]">
                  <span className="text-xs font-bold text-[#17172F]">Notifications ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-[#7652E8] font-bold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#F8F7FD] py-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#8E8BA8] py-4 text-center">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`py-2.5 px-1.5 rounded-xl flex items-start justify-between group transition-colors ${
                          !n.read ? 'bg-[#FAF9FE]' : ''
                        }`}
                      >
                        <div className="pr-2">
                          <p className="text-xs font-bold text-[#17172F]">{n.title}</p>
                          <p className="text-[11px] text-[#74748C] mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-[#A09DBA] mt-1 block">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {!n.read && (
                          <button
                            onClick={(e) => handleMarkAsRead(n._id, e)}
                            className="text-[#9692B0] hover:text-[#7652E8] p-1 cursor-pointer"
                            title="Mark read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#7652E8] to-[#9B7AFB] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs cursor-pointer shrink-0"
              aria-label="User Profile"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'NX'}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-52 sm:w-56 bg-white rounded-3xl shadow-xl border border-[#ECE8FB] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-[#F0EDFB]">
                  <p className="text-xs font-bold text-[#17172F] truncate">{user?.name}</p>
                  <p className="text-[11px] text-[#8E8BA8] truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-[#74748C] hover:text-[#17172F] hover:bg-[#F8F7FD] rounded-xl"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" />
                    <span>Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-[#EF6674] hover:bg-red-50 rounded-xl cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
