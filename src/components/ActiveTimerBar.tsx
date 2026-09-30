import React from 'react';
import { Play, Pause, Square, CheckCircle, Flame, Sparkles } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { formatClockTimer } from '../utils/dateUtils';

interface ActiveTimerBarProps {
  onOpenZenMode?: () => void;
}

export const ActiveTimerBar: React.FC<ActiveTimerBarProps> = ({ onOpenZenMode }) => {
  const { activeTimer, activeTask, categories, currentRunningElapsed, pauseTimer, resumeTimer, stopTimer, toggleTaskComplete } = useWork();

  if (!activeTimer || !activeTask) return null;

  const category = categories.find((c) => c.id === activeTask.categoryId);
  const isPomodoro = activeTimer.mode === 'pomodoro';
  const targetSeconds = (activeTimer.pomodoroTargetMinutes || 25) * 60;
  const pomodoroProgressPercent = Math.min(100, Math.round((currentRunningElapsed / targetSeconds) * 100));

  const handleFinishAndComplete = () => {
    stopTimer('Pekerjaan diselesaikan langsung dari timer');
    toggleTaskComplete(activeTask.id);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[500px] z-40 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 p-4 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: category?.color || '#6366f1' }}
            />
            <span className="truncate">{category?.name || 'Tugas'}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-medium ${
                activeTask.priority === 'Tinggi'
                  ? 'text-rose-400'
                  : activeTask.priority === 'Sedang'
                  ? 'text-amber-300'
                  : 'text-slate-400'
              }`}
            >
              Prioritas {activeTask.priority}
            </span>
            {isPomodoro && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-orange-400 font-medium">
                  <Flame className="w-3 h-3" /> Pomodoro
                </span>
              </>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white truncate">{activeTask.title}</h4>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {formatClockTimer(currentRunningElapsed)}
          </div>
          {isPomodoro && (
            <div className="text-[11px] text-slate-400 font-mono">
              target: {activeTimer.pomodoroTargetMinutes}m
            </div>
          )}
        </div>
      </div>

      {isPomodoro && (
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${pomodoroProgressPercent}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          {activeTimer.isRunning ? (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition-colors"
            >
              <Pause className="w-3.5 h-3.5" /> Jeda
            </button>
          ) : (
            <button
              onClick={resumeTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Lanjutkan
            </button>
          )}

          <button
            onClick={() => stopTimer()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors"
          >
            <Square className="w-3.5 h-3.5" /> Simpan
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenZenMode && (
            <button
              onClick={onOpenZenMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold border border-indigo-500/30 transition-colors"
              title="Aktifkan Mode Fokus Zen Tanpa Distraksi"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Mode Zen
            </button>
          )}

          <button
            onClick={handleFinishAndComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
