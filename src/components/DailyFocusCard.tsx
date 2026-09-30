import React, { useState } from 'react';
import {
  Target,
  Flame,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  Square,
  Pin,
  PinOff,
  Edit3,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
  Lightbulb,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { formatClockTimer, formatDuration, getTodayString } from '../utils/dateUtils';
import { Task } from '../types';

interface DailyFocusCardProps {
  onOpenNewTaskModal?: () => void;
  onOpenZenMode?: () => void;
  onEditTask?: (task: Task) => void;
}

const MOTIVATIONAL_QUOTES = [
  {
    quote: 'Satu sasaran utama yang tuntas jauh lebih bernilai dari sepuluh rencana yang setengah jadi.',
    author: 'Prinsip Fokus',
  },
  {
    quote: 'Konsentrasi pada hal yang paling penting adalah kunci melipatgandakan dampak kerja Anda.',
    author: 'Deep Work',
  },
  {
    quote: 'Fokus bukan sekadar memilih apa yang dikerjakan, melainkan berani menolak distraksi lain.',
    author: 'Steve Jobs',
  },
  {
    quote: 'Selesaikan pekerjaan terberat terlebih dahulu saat energi dan konsentrasi Anda masih di puncak.',
    author: 'Brian Tracy',
  },
  {
    quote: 'Kemajuan nyata datang dari konsistensi menyelesaikan prioritas tertinggi setiap harinya.',
    author: 'KerjaAlur Flow',
  },
];

export const DailyFocusCard: React.FC<DailyFocusCardProps> = ({
  onOpenNewTaskModal,
  onOpenZenMode,
  onEditTask,
}) => {
  const {
    todayFocus,
    setDailyFocus,
    toggleDailyFocusComplete,
    clearDailyFocus,
    pinTaskAsDailyFocus,
    tasks,
    categories,
    activeTimer,
    activeTask,
    currentRunningElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useWork();

  const todayStr = getTodayString();
  const todayTasks = tasks.filter((t) => t.date === todayStr);

  const [isEditing, setIsEditing] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [customNoteInput, setCustomNoteInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pick_task' | 'custom'>('pick_task');
  const [showCelebrationNotice, setShowCelebrationNotice] = useState(false);

  // Quote rotation based on day
  const todayDayNumber = new Date().getDate();
  const currentQuote = MOTIVATIONAL_QUOTES[todayDayNumber % MOTIVATIONAL_QUOTES.length];

  // Linked task if any
  const linkedTask = todayFocus?.taskId
    ? tasks.find((t) => t.id === todayFocus.taskId)
    : null;
  const linkedCategory = linkedTask
    ? categories.find((c) => c.id === linkedTask.categoryId)
    : null;

  // Active timer on linked task
  const isLinkedTaskRunning =
    activeTimer && linkedTask && activeTimer.taskId === linkedTask.id;

  const handleToggleComplete = () => {
    if (!todayFocus) return;
    const willBeCompleted = !todayFocus.isCompleted;
    toggleDailyFocusComplete();
    if (willBeCompleted) {
      setShowCelebrationNotice(true);
      setTimeout(() => setShowCelebrationNotice(false), 5000);
    }
  };

  const handleOpenEdit = () => {
    if (todayFocus) {
      setCustomGoalInput(todayFocus.title);
      setCustomNoteInput(todayFocus.motivationNote || '');
      setSelectedTaskId(todayFocus.taskId || '');
      setActiveTab(todayFocus.taskId ? 'pick_task' : 'custom');
    } else {
      setCustomGoalInput('');
      setCustomNoteInput('');
      setSelectedTaskId(todayTasks[0]?.id || '');
      setActiveTab(todayTasks.length > 0 ? 'pick_task' : 'custom');
    }
    setIsEditing(true);
  };

  const handleSaveFocus = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'pick_task' && selectedTaskId) {
      pinTaskAsDailyFocus(selectedTaskId);
      setIsEditing(false);
    } else if (customGoalInput.trim()) {
      setDailyFocus(customGoalInput.trim(), undefined, todayStr, customNoteInput.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleQuickPinTask = (taskId: string) => {
    pinTaskAsDailyFocus(taskId);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#111726]/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Dynamic Ambient Background Glow */}
      <div
        className={`absolute -left-12 -top-12 w-64 h-64 rounded-full blur-[90px] pointer-events-none transition-all duration-700 ${
          todayFocus?.isCompleted
            ? 'bg-emerald-500/20'
            : todayFocus
            ? 'bg-amber-500/15'
            : 'bg-indigo-600/15'
        }`}
      />
      <div
        className={`absolute -right-12 -bottom-12 w-56 h-56 rounded-full blur-[80px] pointer-events-none transition-all duration-700 ${
          todayFocus?.isCompleted
            ? 'bg-teal-500/15'
            : todayFocus
            ? 'bg-indigo-500/10'
            : 'bg-cyan-500/10'
        }`}
      />

      <div className="relative z-10 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner shrink-0 ${
                todayFocus?.isCompleted
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : todayFocus
                  ? 'bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-indigo-950/80 border-indigo-500/50 text-indigo-400'
              }`}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-display">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Fokus Utama Hari Ini
                </span>
                <span className="text-[11px] text-slate-500 font-medium">· The ONE Thing</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Satu sasaran paling esensial untuk menjaga momentum dan motivasi kerja
              </p>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {todayFocus ? (
              <>
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all shadow-xs"
                  title="Ganti atau sesuaikan fokus utama hari ini"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ganti Fokus</span>
                </button>
                <button
                  onClick={() => clearDailyFocus()}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 rounded-xl transition-all"
                  title="Lepas pin fokus hari ini"
                >
                  <PinOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Lepas Pin</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              >
                <Pin className="w-3.5 h-3.5" />
                <span>Tentukan Fokus Hari Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit / Set Focus Inline Modal / Panel */}
        {isEditing && (
          <div className="p-4 sm:p-5 bg-[#0B0F19] border border-amber-500/40 rounded-2xl space-y-4 animate-in fade-in duration-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400" />
                <span>Pilih atau Tulis 1 Sasaran Utama Hari Ini</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-1 p-1 bg-[#111726] border border-slate-800 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('pick_task')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'pick_task'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pilih dari Tugas Hari Ini ({todayTasks.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'custom'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Tulis Sasaran Bebas</span>
              </button>
            </div>

            {/* Content per tab */}
            {activeTab === 'pick_task' ? (
              <div className="space-y-3">
                {todayTasks.length === 0 ? (
                  <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center">
                    <p className="text-xs text-slate-400">
                      Belum ada tugas terjadwal untuk hari ini.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        onOpenNewTaskModal?.();
                      }}
                      className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      + Tambah Tugas Baru Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {todayTasks.map((t) => {
                      const cat = categories.find((c) => c.id === t.categoryId);
                      const isCurrentlyPinned = todayFocus?.taskId === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => handleQuickPinTask(t.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                            isCurrentlyPinned
                              ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-0.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: cat?.color || '#6366f1' }}
                              />
                              <span>{cat?.name || 'Umum'}</span>
                              <span>·</span>
                              <span
                                className={
                                  t.priority === 'Tinggi'
                                    ? 'text-rose-400 font-semibold'
                                    : t.priority === 'Sedang'
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                                }
                              >
                                Prioritas {t.priority}
                              </span>
                            </div>
                            <div
                              className={`text-xs font-semibold truncate ${
                                t.status === 'completed'
                                  ? 'line-through text-slate-500'
                                  : 'text-white'
                              }`}
                            >
                              {t.title}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/40 rounded-lg hover:bg-amber-900 shrink-0"
                          >
                            {isCurrentlyPinned ? 'Fokus Aktif' : 'Pin Jadi Fokus'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveFocus} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Judul Sasaran Utama Hari Ini *
                  </label>
                  <input
                    type="text"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    placeholder="Contoh: Selesaikan proposal tender dan kirim sebelum pk 15:00"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catatan Pengingat / Motivasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={customNoteInput}
                    onChange={(e) => setCustomNoteInput(e.target.value)}
                    placeholder="Contoh: Kerjakan tuntas tanpa distraksi media sosial."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!customGoalInput.trim()}
                    className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  >
                    Simpan Fokus Utama
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Main Pinned Display */}
        {todayFocus ? (
          <div className="space-y-4">
            {/* Celebration Alert when just completed */}
            {showCelebrationNotice && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">
                    Luar biasa! Sasaran utama hari ini berhasil Anda selesaikan! 🎉
                  </span>
                </div>
                <button
                  onClick={() => setShowCelebrationNotice(false)}
                  className="text-emerald-400 hover:text-white p-1"
                >
                  &times;
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800">
              {/* Left: Checkbox + Goal Title + Tags */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={handleToggleComplete}
                  className={`mt-1 w-7 h-7 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                    todayFocus.isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : 'border-amber-500/50 hover:border-amber-400 bg-amber-500/10 text-transparent hover:text-amber-400'
                  }`}
                  title={
                    todayFocus.isCompleted
                      ? 'Tandai belum selesai'
                      : 'Tandai sasaran utama ini selesai!'
                  }
                >
                  {todayFocus.isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Metadata Chips */}
                  <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold border ${
                        todayFocus.isCompleted
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {todayFocus.isCompleted ? '✓ Tuntas Diselesaikan' : '🎯 Sasaran Prioritas 1'}
                    </span>

                    {linkedCategory && (
                      <span className="flex items-center gap-1.5 text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: linkedCategory.color }}
                        />
                        <span>{linkedCategory.name}</span>
                      </span>
                    )}

                    {linkedTask && (
                      <span
                        className={`px-2 py-0.5 rounded-md border font-semibold ${
                          linkedTask.priority === 'Tinggi'
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                            : linkedTask.priority === 'Sedang'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        Prioritas {linkedTask.priority}
                      </span>
                    )}

                    {linkedTask?.deadlineTime && (
                      <span className="flex items-center gap-1 text-slate-400 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Target: {linkedTask.deadlineTime}
                      </span>
                    )}
                  </div>

                  {/* Big Goal Headline */}
                  <h3
                    onClick={() => {
                      if (linkedTask && onEditTask) {
                        onEditTask(linkedTask);
                      }
                    }}
                    className={`text-base sm:text-lg font-bold font-display leading-snug transition-colors ${
                      linkedTask ? 'cursor-pointer hover:text-amber-300' : ''
                    } ${
                      todayFocus.isCompleted
                        ? 'line-through text-slate-500 font-normal'
                        : 'text-white'
                    }`}
                  >
                    {todayFocus.title}
                  </h3>

                  {/* Motivational or Context Note */}
                  {todayFocus.motivationNote ? (
                    <p className="text-xs text-slate-400 mt-1 italic leading-relaxed">
                      "{todayFocus.motivationNote}"
                    </p>
                  ) : linkedTask?.description ? (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                      {linkedTask.description}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Right Side: Integrated Live Timer & Quick Focus Controls */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 w-full md:w-auto justify-between md:justify-end">
                {linkedTask ? (
                  <div className="flex items-center gap-2.5">
                    {/* Time Counter */}
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-white tabular-nums">
                        {formatDuration(
                          linkedTask.actualDurationSeconds +
                            (isLinkedTaskRunning ? currentRunningElapsed : 0)
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        est: {linkedTask.estimatedMinutes}m
                      </div>
                    </div>

                    {/* Timer Trigger */}
                    {isLinkedTaskRunning ? (
                      <div className="flex items-center gap-1">
                        {activeTimer.isRunning ? (
                          <button
                            onClick={pauseTimer}
                            className="p-2 text-amber-400 hover:bg-amber-950/60 rounded-xl transition-colors bg-amber-950/40 border border-amber-500/40"
                            title="Jeda Timer Fokus"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={resumeTimer}
                            className="p-2 text-emerald-400 hover:bg-emerald-950/60 rounded-xl transition-colors bg-emerald-950/40 border border-emerald-500/40"
                            title="Lanjutkan Timer Fokus"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => stopTimer()}
                          className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors bg-rose-950/30 border border-rose-800/40"
                          title="Hentikan & Simpan Waktu"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      !todayFocus.isCompleted && (
                        <button
                          onClick={() => startTimer(linkedTask.id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                          title="Mulai Timer Fokus Sekarang"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Fokus</span>
                        </button>
                      )
                    )}

                    {onOpenZenMode && (
                      <button
                        onClick={onOpenZenMode}
                        className="p-2 text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 rounded-xl transition-all"
                        title="Buka Ruang Fokus Zen Bebas Distraksi"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleComplete}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        todayFocus.isCompleted
                          ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                          : 'text-amber-300 bg-amber-950/60 border-amber-500/40 hover:bg-amber-900'
                      }`}
                    >
                      {todayFocus.isCompleted ? '✓ Selesai' : 'Tandai Selesai'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Insight / Motivational Quote */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="italic text-[11px] text-slate-400">
                  "{currentQuote.quote}" — <span className="text-slate-300">{currentQuote.author}</span>
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {todayFocus.isCompleted
                  ? 'Status: Berhasil dituntaskan'
                  : 'Komitmen non-negotiable hari ini'}
              </span>
            </div>
          </div>
        ) : (
          /* Empty / Unset State */
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0F19]/70 border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Target className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                Belum Ada Sasaran Utama yang Disematkan Hari Ini
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Pilih satu pekerjaan terpenting untuk diprioritaskan hari ini. Memiliki satu fokus utama
                membantu Anda terhindar dari rasa kewalahan dan menjaga energi tetap maksimal.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1 flex-wrap">
              {todayTasks.length > 0 ? (
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>Pilih dari {todayTasks.length} Tugas Hari Ini</span>
                </button>
              ) : (
                <button
                  onClick={onOpenNewTaskModal}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Tugas Hari Ini</span>
                </button>
              )}
              <button
                onClick={() => {
                  setActiveTab('custom');
                  setIsEditing(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                <span>Tulis Sasaran Kustom</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
