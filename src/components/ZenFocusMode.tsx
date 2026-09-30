import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Flame,
  Sun,
  Moon,
  Pin,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { formatClockTimer } from '../utils/dateUtils';
import { soundChime } from '../utils/audio';
import { Task } from '../types';

interface ZenFocusModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const MINDFUL_QUOTES = [
  'Satu tugas dalam satu waktu. Selesaikan langkah demi langkah.',
  'Fokus adalah seni merelakan segala bentuk gangguan.',
  'Kualitas kerja tertinggi lahir dari perhatian yang tenang dan utuh.',
  'Tarik napas perlahan. Nikmati proses menyelesaikan tanggung jawab.',
  'Kemajuan kecil yang konsisten menghasilkan capaian besar.',
];

export const ZenFocusMode: React.FC<ZenFocusModeProps> = ({ isOpen, onClose }) => {
  const {
    activeTimer,
    activeTask,
    tasks,
    categories,
    todayFocus,
    currentRunningElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    toggleTaskComplete,
    settings,
  } = useWork();

  const [ambientActive, setAmbientActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zenTheme, setZenTheme] = useState<'dark' | 'slate' | 'light'>(
    settings.zenTheme === 'light' ? 'light' : 'dark'
  );
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showTaskPicker, setShowTaskPicker] = useState(false);

  // Rotate quotes every 45 seconds
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MINDFUL_QUOTES.length);
    }, 45000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Toggle ambient focus noise
  const handleToggleAmbient = () => {
    if (ambientActive) {
      soundChime.stopAmbientFocusNoise();
      setAmbientActive(false);
    } else {
      soundChime.startAmbientFocusNoise(0.08);
      setAmbientActive(true);
    }
  };

  // Turn off ambient noise when closing Zen mode
  useEffect(() => {
    if (!isOpen && ambientActive) {
      soundChime.stopAmbientFocusNoise();
      setAmbientActive(false);
    }
  }, [isOpen, ambientActive]);

  // Toggle real browser fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  if (!isOpen) return null;

  // Active task details
  const category = activeTask
    ? categories.find((c) => c.id === activeTask.categoryId)
    : null;

  const isPomodoro = activeTimer?.mode === 'pomodoro';
  const targetSeconds = (activeTimer?.pomodoroTargetMinutes || 25) * 60;
  const pomodoroProgressPercent = Math.min(
    100,
    Math.round((currentRunningElapsed / targetSeconds) * 100)
  );

  // Available tasks to pick if user wants to switch
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');

  // Background and text style presets
  const themeClasses = {
    dark: 'bg-[#080b11] text-slate-100',
    slate: 'bg-slate-900 text-slate-100',
    light: 'bg-stone-50 text-stone-900',
  }[zenTheme];

  const subTextClasses = {
    dark: 'text-slate-400',
    slate: 'text-slate-400',
    light: 'text-stone-500',
  }[zenTheme];

  const surfaceClasses = {
    dark: 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800',
    slate: 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700',
    light: 'bg-stone-200/60 border-stone-300 text-stone-800 hover:bg-stone-200',
  }[zenTheme];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 transition-colors duration-500 select-none overflow-hidden ${themeClasses}`}
    >
      {/* Cinematic subtle background image layer */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/src/assets/images/focus_zen_atmosphere_1790775732497.jpg"
          alt="Zen Garden Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-15 filter blur-xs transform scale-105"
        />
        <div className={`absolute inset-0 ${
          zenTheme === 'light'
            ? 'bg-gradient-to-t from-stone-50 via-stone-50/90 to-stone-50/80'
            : 'bg-gradient-to-t from-[#080B11] via-[#080B11]/90 to-[#080B11]/75'
        }`} />
      </div>

      {/* Top Header: Brand Zen Mark, Ambiance & Exit Button */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase opacity-80">
              Mode Fokus Zen
            </span>
          </div>
          <span className="opacity-30">·</span>
          <span className={`text-xs ${subTextClasses}`}>Bebas Distraksi</span>
        </div>

        {/* Action controls in Zen header */}
        <div className="flex items-center gap-2.5">
          {/* Ambient Sound Button */}
          <button
            onClick={handleToggleAmbient}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              ambientActive
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400'
                : surfaceClasses
            }`}
            title="Suara Latar Penenang (Brown Noise Sintetis)"
          >
            {ambientActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline">Suara Tenang: Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                <span className="hidden sm:inline">Suara Tenang</span>
              </>
            )}
          </button>

          {/* Theme switcher */}
          <button
            onClick={() =>
              setZenTheme((t) => (t === 'dark' ? 'slate' : t === 'slate' ? 'light' : 'dark'))
            }
            className={`p-2 rounded-lg border transition-colors ${surfaceClasses}`}
            title="Ganti Tema Suasana Zen (Gelap / Slate / Terang)"
          >
            {zenTheme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-300" />
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className={`p-2 rounded-lg border transition-colors ${surfaceClasses}`}
            title={isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh OS'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Exit Zen Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm ml-2"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Keluar Zen</span>
            <span className="hidden sm:inline opacity-70 font-mono text-[10px] ml-1">
              (Esc)
            </span>
          </button>
        </div>
      </div>

      {/* Center Hero: Task Details & Giant Tabular Timer */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto text-center px-4">
        {activeTask ? (
          <div className="space-y-6 w-full animate-fade-in">
            {/* Category and priority unboxed metadata */}
            <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
                  style={{ backgroundColor: category?.color || '#6366f1' }}
                />
                <span className="font-semibold">{category?.name || 'Tugas Terpilih'}</span>
              </span>
              <span className="opacity-40">·</span>
              <span
                className={
                  activeTask.priority === 'Tinggi'
                    ? 'text-rose-400 font-semibold'
                    : activeTask.priority === 'Sedang'
                    ? 'text-amber-400 font-semibold'
                    : subTextClasses
                }
              >
                Prioritas {activeTask.priority}
              </span>
              {todayFocus?.taskId === activeTask.id && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Pin className="w-3.5 h-3.5 fill-amber-400" /> Fokus Utama Hari Ini
                  </span>
                </>
              )}
              {isPomodoro && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1 text-orange-400 font-medium">
                    <Flame className="w-3.5 h-3.5" /> Pomodoro ({activeTimer?.pomodoroTargetMinutes}m)
                  </span>
                </>
              )}
            </div>

            {/* Big Task Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight">
              {activeTask.title}
            </h1>

            {/* Description if present */}
            {activeTask.description && (
              <p
                className={`text-xs sm:text-sm max-w-lg mx-auto line-clamp-2 leading-relaxed ${subTextClasses}`}
              >
                {activeTask.description}
              </p>
            )}

            {/* Giant Monospace Timer */}
            <div className="py-2 sm:py-6">
              <div className="text-6xl sm:text-8xl md:text-9xl font-bold font-mono tabular-nums tracking-tight drop-shadow-sm">
                {formatClockTimer(currentRunningElapsed)}
              </div>
            </div>

            {/* Pomodoro Progress Bar */}
            {isPomodoro && (
              <div className="max-w-md mx-auto w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={subTextClasses}>Target: {activeTimer?.pomodoroTargetMinutes}m</span>
                  <span className="text-emerald-400 font-bold">{pomodoroProgressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-700/50">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${pomodoroProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Primary Controls */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {activeTimer?.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-transform active:scale-95 shadow-lg"
                >
                  <Pause className="w-5 h-5 fill-current" /> Jeda Timer
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-transform active:scale-95 shadow-lg"
                >
                  <Play className="w-5 h-5 fill-current" /> Lanjutkan Timer
                </button>
              )}

              <button
                onClick={() => stopTimer('Sesi kerja disimpan dari mode Zen')}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-sm transition-colors ${surfaceClasses}`}
                title="Simpan sesi waktu saat ini"
              >
                <Square className="w-4 h-4" /> Simpan Sesi
              </button>

              <button
                onClick={() => {
                  stopTimer('Pekerjaan selesai di mode Zen');
                  toggleTaskComplete(activeTask.id);
                  onClose();
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-lg"
                title="Tandai pekerjaan ini selesai sepenuhnya"
              >
                <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
              </button>
            </div>
          </div>
        ) : (
          /* Empty state in Zen mode if no timer running */
          <div className="space-y-6">
            <Sparkles className="w-12 h-12 mx-auto text-indigo-400 opacity-60" />
            <div>
              <h2 className="text-2xl font-bold">Ruang Fokus Zen Siap</h2>
              <p className={`text-sm mt-1 max-w-md mx-auto ${subTextClasses}`}>
                Pilih salah satu tugas dari daftar di bawah untuk mengaktifkan fokus terbebas dari distraksi.
              </p>
            </div>

            {/* Task Quick Selector */}
            <div className="max-w-md mx-auto w-full text-left space-y-2 max-h-64 overflow-y-auto pr-1">
              {pendingTasks.slice(0, 5).map((t) => {
                const cat = categories.find((c) => c.id === t.categoryId);
                return (
                  <button
                    key={t.id}
                    onClick={() => startTimer(t.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${surfaceClasses}`}
                  >
                    <div className="truncate mr-3">
                      <div className="text-xs flex items-center gap-1.5 opacity-70 mb-0.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: cat?.color || '#6366f1' }}
                        />
                        <span>{cat?.name}</span>
                        <span>·</span>
                        <span>Prioritas {t.priority}</span>
                      </div>
                      <div className="text-sm font-semibold truncate">{t.title}</div>
                    </div>
                    <Play className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer: Mindful Quote & Task Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10 text-xs">
        <div className="flex items-center gap-2">
          {activeTask && (
            <div className="relative">
              <button
                onClick={() => setShowTaskPicker(!showTaskPicker)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${surfaceClasses}`}
              >
                <span>Ganti Tugas Fokus</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Task switcher popup */}
              {showTaskPicker && (
                <div
                  className={`absolute bottom-full left-0 mb-2 w-72 rounded-xl border shadow-xl p-2 z-50 max-h-60 overflow-y-auto ${
                    zenTheme === 'light'
                      ? 'bg-white border-stone-300 text-stone-900'
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold opacity-60 px-2 py-1 mb-1">
                    Pilih Pekerjaan Lain:
                  </div>
                  {pendingTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        startTimer(t.id);
                        setShowTaskPicker(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs truncate transition-colors ${
                        zenTheme === 'light'
                          ? 'hover:bg-stone-100'
                          : 'hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-medium truncate">{t.title}</div>
                      <div className="text-[10px] opacity-60">Prioritas {t.priority}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inspiring focus quote */}
        <p className={`text-center italic text-xs max-w-md transition-opacity duration-500 ${subTextClasses}`}>
          "{MINDFUL_QUOTES[quoteIndex]}"
        </p>

        {/* Ambient / Shortcut indicator */}
        <div className={`text-[11px] font-mono ${subTextClasses}`}>
          Tekan <kbd className="px-1.5 py-0.5 rounded-sm bg-white/10 text-white font-mono">Esc</kbd> untuk keluar
        </div>
      </div>
    </div>
  );
};
