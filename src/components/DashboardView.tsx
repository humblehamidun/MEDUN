import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  TrendingUp,
  Flame,
  Play,
  Pause,
  Square,
  Plus,
  ArrowRight,
  Calendar,
  AlertCircle,
  Timer,
  Sparkles,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import {
  formatDuration,
  formatDurationHoursDecimal,
  formatIndonesianDate,
  getTodayString,
  formatClockTimer,
} from '../utils/dateUtils';
import { Task } from '../types';
import { QuickNotesCard } from './QuickNotesCard';

interface DashboardViewProps {
  onNavigateToDaily: () => void;
  onNavigateToCategories: () => void;
  onNavigateToMonthly: () => void;
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onOpenZenMode: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToDaily,
  onNavigateToCategories,
  onNavigateToMonthly,
  onOpenNewTaskModal,
  onEditTask,
  onOpenZenMode,
}) => {
  const {
    tasks,
    categories,
    settings,
    activeTimer,
    activeTask,
    currentRunningElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    toggleTaskComplete,
  } = useWork();

  const todayStr = getTodayString();
  const todayTasks = tasks.filter((t) => t.date === todayStr);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Today calculations
  const totalSecondsToday = todayTasks.reduce(
    (acc, t) => acc + t.actualDurationSeconds,
    0
  ) + (activeTimer && activeTask && activeTask.date === todayStr ? currentRunningElapsed : 0);

  const totalHoursToday = totalSecondsToday / 3600;
  const goalHours = settings.dailyWorkGoalHours || 7;
  const goalPercentage = Math.min(100, Math.round((totalHoursToday / goalHours) * 100));

  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const completionRate = todayTasks.length > 0
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
    : 0;

  // Filtered tasks
  const filteredTodayTasks = todayTasks.filter((t) => {
    if (filterStatus === 'pending') return t.status !== 'completed';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  // Calculate time by category today
  const categoryHoursMap: { [catId: string]: number } = {};
  todayTasks.forEach((t) => {
    categoryHoursMap[t.categoryId] = (categoryHoursMap[t.categoryId] || 0) + t.actualDurationSeconds;
  });
  if (activeTimer && activeTask && activeTask.date === todayStr) {
    categoryHoursMap[activeTask.categoryId] =
      (categoryHoursMap[activeTask.categoryId] || 0) + currentRunningElapsed;
  }

  // Priority distribution today
  const priorityCount = {
    Tinggi: todayTasks.filter((t) => t.priority === 'Tinggi').length,
    Sedang: todayTasks.filter((t) => t.priority === 'Sedang').length,
    Rendah: todayTasks.filter((t) => t.priority === 'Rendah').length,
  };

  return (
    <div className="space-y-7">
      {/* Cinematic Hero Spotlight Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-[#0F1422]">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/workspace_cinematic_hero_1790775709341.jpg"
            alt="Workspace Cinematic Ambience"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30 transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent" />
        </div>

        {/* Content over scrim */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2 tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
              <span>Studio Produktivitas & Fokus Kerja</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
              Kuasai Waktu, Capai Kualitas Tertinggi.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-xl">
              Pantau alur kerja setiap hari dengan presisi tinggi, kelola prioritas tanpa gangguan, dan evaluasi capaian produktivitas Anda.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-4 flex-wrap">
              <span className="font-mono text-slate-300 font-medium">
                {formatIndonesianDate(todayStr, { withDayName: true })}
              </span>
              <span>·</span>
              <span className="text-slate-300">Target Harian: {goalHours} Jam Kerja</span>
              <span>·</span>
              <span className="text-emerald-400 font-mono font-semibold">
                {completedTodayTasks.length}/{todayTasks.length} Tugas Selesai
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenZenMode}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              title="Buka Ruang Fokus Zen Bebas Distraksi"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Mode Zen</span>
            </button>
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              <Plus className="w-4 h-4" /> Catat Tugas Baru
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards in Glassmorphism Dark Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Hours Today */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Waktu Kerja Hari Ini</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {formatDuration(totalSecondsToday)}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({formatDurationHoursDecimal(totalSecondsToday)}j)
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Target {goalHours}j ({goalPercentage}%)</span>
              <span className="font-mono text-slate-300">{Math.max(0, goalHours - totalHoursToday).toFixed(1)}j sisa</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  goalPercentage >= 100
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                    : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                }`}
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Tugas Selesai Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {completedTodayTasks.length}
            </span>
            <span className="text-xs text-slate-400">
              dari {todayTasks.length} tugas terencana
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Tingkat Penyelesaian</span>
            <span className="font-bold font-mono text-emerald-400 tabular-nums">
              {completionRate}%
            </span>
          </div>
        </div>

        {/* Metric 3: Priority Distribution */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Beban Prioritas Hari Ini</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Tinggi (Urgen)</span>
              <span className="font-bold font-mono text-rose-400">{priorityCount.Tinggi} tugas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Sedang (Reguler)</span>
              <span className="font-bold font-mono text-amber-400">{priorityCount.Sedang} tugas</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Rendah (Fleksibel)</span>
              <span className="font-bold font-mono text-slate-400">{priorityCount.Rendah} tugas</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Focus Streak & Consistency */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Disiplin Kerja & Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              5 Hari
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Beruntun
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 leading-normal">
            Pencatatan waktu aktif konsisten selama 5 hari kerja berturut-turut.
          </p>
        </div>
      </div>

      {/* Main Content Layout: Tasks List + Right Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Today's Task List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
            {/* Header of Today's Task List */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white font-display tracking-wide">
                  Daftar Pekerjaan Hari Ini
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{todayTasks.length} Tugas Terjadwal</span>
                  <span aria-hidden="true">·</span>
                  <span>{completedTodayTasks.length} Selesai</span>
                </div>
              </div>

              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-[#0B0F19] border border-slate-800 rounded-xl">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Semua ({todayTasks.length})
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === 'pending'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Aktif ({todayTasks.length - completedTodayTasks.length})
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filterStatus === 'completed'
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Selesai ({completedTodayTasks.length})
                </button>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-800/60">
              {filteredTodayTasks.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium text-slate-400">Tidak ada tugas pada filter ini</p>
                  <button
                    onClick={onOpenNewTaskModal}
                    className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    + Buat tugas baru sekarang
                  </button>
                </div>
              ) : (
                filteredTodayTasks.map((task) => {
                  const category = categories.find((c) => c.id === task.categoryId);
                  const isCurrentActive = activeTimer && activeTimer.taskId === task.id;
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3 ${
                        isCurrentActive ? 'bg-indigo-950/30 border-l-2 border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                              : 'border-slate-700 hover:border-indigo-400 bg-slate-900'
                          }`}
                          title={isCompleted ? 'Tandai belum selesai' : 'Tandai pekerjaan selesai'}
                        >
                          {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        {/* Title and metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mb-1">
                            <span className="flex items-center gap-1.5 font-medium text-slate-300">
                              <span
                                className="w-2 h-2 rounded-full inline-block shadow-xs"
                                style={{ backgroundColor: category?.color || '#6366f1' }}
                              />
                              {category?.name || 'Umum'}
                            </span>
                            <span aria-hidden="true">·</span>

                            <span
                              className={`font-semibold ${
                                task.priority === 'Tinggi'
                                  ? 'text-rose-400'
                                  : task.priority === 'Sedang'
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              Prioritas {task.priority}
                            </span>

                            {task.deadlineTime && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-slate-300">
                                  Target: {task.deadlineTime}
                                </span>
                              </>
                            )}

                            {task.reminderTime && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-indigo-400">
                                  Pengingat: {task.reminderTime}
                                </span>
                              </>
                            )}
                          </div>

                          <h3
                            className={`text-sm font-semibold text-white leading-snug cursor-pointer ${
                              isCompleted ? 'line-through text-slate-500 font-normal' : ''
                            }`}
                            onClick={() => onEditTask(task)}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right side: Duration & Timer trigger */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-bold font-mono text-white tabular-nums">
                            {formatDuration(
                              task.actualDurationSeconds +
                                (isCurrentActive ? currentRunningElapsed : 0)
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            est: {task.estimatedMinutes}m
                          </div>
                        </div>

                        {/* Timer control */}
                        {isCurrentActive ? (
                          <div className="flex items-center gap-1">
                            {activeTimer.isRunning ? (
                              <button
                                onClick={pauseTimer}
                                className="p-2 text-amber-400 hover:bg-amber-950/60 rounded-lg transition-colors"
                                title="Jeda Timer"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={resumeTimer}
                                className="p-2 text-emerald-400 hover:bg-emerald-950/60 rounded-lg transition-colors"
                                title="Lanjutkan Timer"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => stopTimer()}
                              className="p-2 text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                              title="Hentikan & Catat Log"
                            >
                              <Square className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          !isCompleted && (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="p-2 text-slate-400 hover:text-white hover:bg-indigo-600/30 rounded-lg transition-colors"
                              title="Mulai Melacak Waktu"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom link to Daily view */}
            <div className="p-3.5 bg-[#0D121F] border-t border-slate-800/80 text-center">
              <button
                onClick={onNavigateToDaily}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Buka Halaman Rinci Pekerjaan Harian →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col on lg): Live Active Card + Today Category Breakdown */}
        <div className="space-y-4">
          {/* Active Timer Box / Focus Mode */}
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-indigo-400" />
                Status Pelacakan Waktu
              </span>
              {activeTimer ? (
                <span className="text-emerald-400 font-semibold animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Aktif
                </span>
              ) : (
                <span className="text-slate-500">Standby</span>
              )}
            </div>

            {activeTimer && activeTask ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-[#0B0F19] rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 truncate mb-1">
                    Sedang Dikerjakan:
                  </div>
                  <div className="font-bold text-white text-sm truncate">
                    {activeTask.title}
                  </div>
                  <div className="text-3xl font-bold font-mono tabular-nums text-emerald-400 mt-2 shadow-inner">
                    {formatClockTimer(currentRunningElapsed)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeTimer.isRunning ? (
                    <button
                      onClick={pauseTimer}
                      className="flex-1 py-2 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pause className="w-4 h-4" /> Jeda
                    </button>
                  ) : (
                    <button
                      onClick={resumeTimer}
                      className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    >
                      <Play className="w-4 h-4" /> Lanjut
                    </button>
                  )}
                  <button
                    onClick={() => stopTimer()}
                    className="py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                    title="Hentikan dan simpan waktu kerja"
                  >
                    <Square className="w-4 h-4" /> Simpan
                  </button>
                </div>

                <button
                  onClick={onOpenZenMode}
                  className="w-full py-2.5 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  title="Masuk ke layar minimalis bebas distraksi"
                >
                  <Sparkles className="w-4 h-4 text-indigo-200" /> Buka Layar Fokus Zen
                </button>
              </div>
            ) : (
              <div className="text-center py-5">
                <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">Belum ada tugas yang berjalan</p>
                <p className="text-[11px] text-slate-500 mt-1 mb-4">
                  Pilih tugas dari daftar di samping untuk memulai timer fokus.
                </p>
                {todayTasks.filter((t) => t.status !== 'completed').length > 0 && (
                  <button
                    onClick={() => {
                      const firstPending = todayTasks.find((t) => t.status !== 'completed');
                      if (firstPending) startTimer(firstPending.id);
                    }}
                    className="w-full py-2.5 text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Mulai Tugas Pertama
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Time Distribution by Category Today */}
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-white mb-3">
              <span>Alokasi Jam per Jenis Pekerjaan</span>
              <button
                onClick={onNavigateToCategories}
                className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium"
              >
                Kelola Jenis →
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => {
                const seconds = categoryHoursMap[cat.id] || 0;
                const percent = totalSecondsToday > 0
                  ? Math.round((seconds / totalSecondsToday) * 100)
                  : 0;

                return (
                  <div key={cat.id} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300 truncate font-medium">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="font-mono text-slate-400 tabular-nums shrink-0">
                        {formatDuration(seconds)} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Catatan Cepat / Memo Harian (Scratchpad) */}
          <QuickNotesCard onOpenNewTaskModal={onOpenNewTaskModal} />
        </div>
      </div>
    </div>
  );
};
