import React, { useState } from 'react';
import { Bell, Clock, Settings, Play, Pause, Square, Sparkles } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { formatClockTimer } from '../utils/dateUtils';

interface NavbarProps {
  currentTab: 'dashboard' | 'daily' | 'categories' | 'monthly';
  onSelectTab: (tab: 'dashboard' | 'daily' | 'categories' | 'monthly') => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenNewTaskModal: () => void;
  onOpenZenMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNotifications,
  onOpenSettings,
  onOpenNewTaskModal,
  onOpenZenMode,
}) => {
  const { activeTimer, activeTask, currentRunningElapsed, pauseTimer, resumeTimer, stopTimer, unreadNotificationCount } = useWork();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark (Single text element with cinematic display font) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="text-left font-display font-extrabold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
            >
              <span>KerjaAlur</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            </button>
            <span className="hidden sm:inline text-xs text-slate-600 font-medium">·</span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium tracking-wide">
              Productivity & Focus Studio
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`transition-all py-1 relative ${
                currentTab === 'dashboard'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('daily')}
              className={`transition-all py-1 relative ${
                currentTab === 'daily'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pekerjaan Harian
            </button>
            <button
              onClick={() => onSelectTab('categories')}
              className={`transition-all py-1 relative ${
                currentTab === 'categories'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Jenis Pekerjaan
            </button>
            <button
              onClick={() => onSelectTab('monthly')}
              className={`transition-all py-1 relative ${
                currentTab === 'monthly'
                  ? 'text-white font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-500 after:shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Laporan Bulanan
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active timer quick widget in header if active */}
            {activeTimer && activeTask && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#141B2D] border border-slate-700/80 text-white rounded-lg text-xs shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                <span className="font-medium max-w-[120px] truncate text-slate-200">{activeTask.title}</span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold pl-1">
                  {formatClockTimer(currentRunningElapsed)}
                </span>
                <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
                  {activeTimer.isRunning ? (
                    <button
                      onClick={pauseTimer}
                      title="Jeda Timer"
                      className="p-1 hover:text-amber-400 text-slate-400 transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={resumeTimer}
                      title="Lanjutkan Timer"
                      className="p-1 hover:text-emerald-400 text-slate-400 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => stopTimer()}
                    title="Hentikan & Catat Log"
                    className="p-1 hover:text-rose-400 text-slate-400 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onOpenZenMode}
                    title="Masuk Mode Zen Bebas Distraksi"
                    className="p-1 hover:text-indigo-300 text-indigo-400 transition-colors ml-0.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Zen Mode Button if no active timer is on header bar */}
            {!activeTimer && (
              <button
                onClick={onOpenZenMode}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#141B2D] hover:bg-[#1C253D] rounded-lg transition-colors border border-slate-700/80 shadow-xs"
                title="Buka Ruang Fokus Zen Bebas Distraksi"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mode Zen</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Notifikasi & Pengingat Tugas"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
              title="Pengaturan Aplikasi"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Quick Add Task Button */}
            <button
              onClick={onOpenNewTaskModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              + Catat Tugas
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
              aria-label="Toggle navigation"
            >
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onSelectTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentTab === 'dashboard' ? 'bg-indigo-950/60 text-indigo-400' : 'text-slate-400'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                onSelectTab('daily');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentTab === 'daily' ? 'bg-indigo-950/60 text-indigo-400' : 'text-slate-400'
              }`}
            >
              Pekerjaan Harian
            </button>
            <button
              onClick={() => {
                onSelectTab('categories');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentTab === 'categories' ? 'bg-indigo-950/60 text-indigo-400' : 'text-slate-400'
              }`}
            >
              Jenis Pekerjaan
            </button>
            <button
              onClick={() => {
                onSelectTab('monthly');
                setMobileMenuOpen(false);
              }}
              className={`text-left px-3 py-2 text-sm font-medium rounded-lg ${
                currentTab === 'monthly' ? 'bg-indigo-950/60 text-indigo-400' : 'text-slate-400'
              }`}
            >
              Laporan Bulanan
            </button>
            <button
              onClick={() => {
                onOpenZenMode();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 text-sm font-medium rounded-lg text-indigo-300 bg-indigo-950/60 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" /> Buka Mode Fokus Zen
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
