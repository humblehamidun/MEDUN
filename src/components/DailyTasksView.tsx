import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle2,
  Flame,
  Copy,
  Trash2,
  Edit,
  History,
  AlertTriangle,
  Sparkles,
  Download,
  FileSpreadsheet,
  ChevronDown,
  Pin,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import {
  addDays,
  formatDuration,
  formatIndonesianDate,
  getTodayString,
} from '../utils/dateUtils';
import { PriorityLevel, Task } from '../types';
import { exportDailyTasksToCSV } from '../utils/csvExport';

interface DailyTasksViewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenNewTaskModal: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onOpenManualLog: (task: Task) => void;
  onOpenZenMode: () => void;
  onOpenExportCSV?: (date?: string) => void;
}

export const DailyTasksView: React.FC<DailyTasksViewProps> = ({
  selectedDate,
  onSelectDate,
  onOpenNewTaskModal,
  onEditTask,
  onOpenManualLog,
  onOpenZenMode,
  onOpenExportCSV,
}) => {
  const {
    tasks,
    categories,
    activeTimer,
    currentRunningElapsed,
    dailyFocuses,
    pinTaskAsDailyFocus,
    clearDailyFocus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    toggleTaskComplete,
    deleteTask,
    duplicateTaskToDate,
  } = useWork();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedLogTaskId, setExpandedLogTaskId] = useState<string | null>(null);
  const [csvToast, setCsvToast] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const handleQuickExportCSV = () => {
    try {
      const result = exportDailyTasksToCSV(tasks, categories, selectedDate, {
        includeSessionDetails: true,
        includeSummaryRow: true,
      });
      setCsvToast(`Laporan CSV "${result.filename}" (${result.count} tugas) berhasil diunduh!`);
      setTimeout(() => setCsvToast(null), 4500);
    } catch (e) {
      console.error('Failed to export CSV:', e);
    }
  };

  // Filter tasks for selected date
  const dayTasks = tasks.filter((t) => t.date === selectedDate);

  const filteredTasks = dayTasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedCategoryFilter !== 'all' && t.categoryId !== selectedCategoryFilter) {
      return false;
    }
    if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) {
      return false;
    }
    if (selectedStatusFilter === 'pending' && t.status === 'completed') return false;
    if (selectedStatusFilter === 'completed' && t.status !== 'completed') return false;

    return true;
  });

  // Calculate day stats
  const totalSeconds = dayTasks.reduce(
    (acc, t) => acc + t.actualDurationSeconds,
    0
  ) + (activeTimer && activeTimer.isRunning && tasks.find((t) => t.id === activeTimer.taskId)?.date === selectedDate ? currentRunningElapsed : 0);

  const totalEstimatedMinutes = dayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const completionRate = dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Date Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#111726]/80 border border-slate-800 rounded-xl p-1 shadow-md">
            <button
              onClick={() => onSelectDate(addDays(selectedDate, -1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSelectDate(todayStr)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => onSelectDate(addDays(selectedDate, 1))}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
              id="date-picker"
            />
            <label
              htmlFor="date-picker"
              className="cursor-pointer text-base sm:text-lg font-bold font-display text-white hover:text-indigo-400 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>{formatIndonesianDate(selectedDate, { withDayName: true })}</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* CSV Export Button & Dropdown */}
          <div className="relative">
            <div className="inline-flex rounded-xl shadow-xs">
              <button
                type="button"
                onClick={handleQuickExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 rounded-l-xl transition-all border border-emerald-500/40 hover:border-emerald-400/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                title="Unduh laporan aktivitas harian tanggal ini dalam format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unduh CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-2 py-2 text-xs text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border-y border-r border-emerald-500/40 rounded-r-xl transition-all"
                title="Pilihan Opsi Ekspor CSV"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#111726] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    handleQuickExportCSV();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Unduh CSV Hari Ini</div>
                    <div className="text-[10px] text-slate-400">Termasuk log sesi waktu & ringkasan</div>
                  </div>
                </button>
                {onOpenExportCSV && (
                  <button
                    type="button"
                    onClick={() => {
                      setExportDropdownOpen(false);
                      onOpenExportCSV(selectedDate);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800/80 flex items-center gap-2.5 border-t border-slate-800 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <div className="font-semibold text-white">Sesuaikan Opsi / Cadangan Penuh</div>
                      <div className="text-[10px] text-slate-400">Pilih tanggal atau ekspor semua data</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onOpenZenMode}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-300 bg-indigo-950/80 hover:bg-indigo-900 rounded-xl transition-all border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            title="Buka Ruang Fokus Zen Bebas Distraksi"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Mode Zen
          </button>
          <button
            onClick={() => onOpenNewTaskModal(selectedDate)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            <Plus className="w-4 h-4" /> Catat Pekerjaan
          </button>
        </div>
      </div>

      {/* CSV Toast Notification Banner */}
      {csvToast && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{csvToast}</span>
          </div>
          <button
            onClick={() => setCsvToast(null)}
            className="p-1 hover:text-white text-emerald-400 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      {/* Day Overview Strip */}
      <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Total Tugas</span>
            <span className="font-bold text-white text-sm font-mono tabular-nums">
              {dayTasks.length} Tugas
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Tugas Selesai</span>
            <span className="font-bold text-emerald-400 text-sm font-mono tabular-nums">
              {completedTasks.length} / {dayTasks.length} ({completionRate}%)
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Waktu Terlacak</span>
            <span className="font-bold text-white text-sm font-mono tabular-nums">
              {formatDuration(totalSeconds)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Estimasi Awal</span>
            <span className="font-bold text-slate-400 text-sm font-mono tabular-nums">
              {Math.round(totalEstimatedMinutes / 60)}j {totalEstimatedMinutes % 60}m
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-3 shadow-xl flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pekerjaan atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full md:w-44"
          >
            <option value="all">Semua Jenis Pekerjaan</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full md:w-36"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi (Urgen)</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
            className="px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full md:w-36"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Belum Selesai</option>
            <option value="completed">Selesai</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-12 text-center text-slate-500">
            <Clock className="w-12 h-12 mx-auto stroke-1 mb-3 opacity-30 text-indigo-400" />
            <h3 className="text-base font-semibold text-white">
              Belum Ada Pekerjaan Terdaftar pada Tanggal Ini
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Mulai harimu dengan menambahkan tugas pertama dan kelompokkan sesuai jenis pekerjaan serta prioritasnya.
            </p>
            <button
              onClick={() => onOpenNewTaskModal(selectedDate)}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Tambah Pekerjaan Sekarang
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const category = categories.find((c) => c.id === task.categoryId);
            const isCurrentActive = activeTimer && activeTimer.taskId === task.id;
            const isCompleted = task.status === 'completed';
            const isLogsExpanded = expandedLogTaskId === task.id;
            const isPinnedAsFocus = dailyFocuses[selectedDate]?.taskId === task.id;

            return (
              <div
                key={task.id}
                className={`bg-[#111726]/80 backdrop-blur-md rounded-2xl border transition-all ${
                  isPinnedAsFocus
                    ? 'border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)] bg-[#141724]'
                    : isCurrentActive
                    ? 'border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-[#131B2E]'
                    : 'border-slate-800/90 shadow-lg hover:border-slate-700'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Checkbox + Title & Metadata */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(52,211,153,0.7)]'
                          : 'border-slate-700 hover:border-indigo-400 bg-slate-900'
                      }`}
                      title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Zero-pill metadata line */}
                      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mb-1.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-200">
                          <span
                            className="w-2 h-2 rounded-full inline-block shadow-xs"
                            style={{ backgroundColor: category?.color || '#6366f1' }}
                          />
                          {category?.name || 'Tugas'}
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

                        {isPinnedAsFocus && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 font-semibold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]">
                              <Pin className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                              <span>Fokus Utama</span>
                            </span>
                          </>
                        )}

                        {task.deadlineTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-300 font-mono">
                              Target Selesai: {task.deadlineTime}
                            </span>
                          </>
                        )}

                        {task.reminderTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-indigo-400 font-mono font-medium">
                              Pengingat: {task.reminderTime}
                            </span>
                          </>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-white leading-snug cursor-pointer ${
                          isCompleted ? 'line-through text-slate-500 font-normal' : ''
                        }`}
                        onClick={() => onEditTask(task)}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Duration tracker & action buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
                    {/* Duration numbers */}
                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold font-mono text-white tabular-nums">
                        {formatDuration(
                          task.actualDurationSeconds +
                            (isCurrentActive ? currentRunningElapsed : 0)
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        est: {task.estimatedMinutes} menit
                      </div>
                    </div>

                    {/* Interactive controls */}
                    <div className="flex items-center gap-1.5">
                      {isCurrentActive ? (
                        <>
                          {activeTimer.isRunning ? (
                            <button
                              onClick={pauseTimer}
                              className="px-3 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1"
                              title="Jeda Timer"
                            >
                              <Pause className="w-3.5 h-3.5" /> Jeda
                            </button>
                          ) : (
                            <button
                              onClick={resumeTimer}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                              title="Lanjutkan Timer"
                            >
                              <Play className="w-3.5 h-3.5" /> Lanjut
                            </button>
                          )}
                          <button
                            onClick={() => stopTimer()}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                            title="Hentikan & Simpan Log Waktu"
                          >
                            <Square className="w-4 h-4" />
                          </button>
                          <button
                            onClick={onOpenZenMode}
                            className="p-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors"
                            title="Buka Layar Fokus Zen Untuk Tugas Ini"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                          </button>
                        </>
                      ) : (
                        !isCompleted && (
                          <>
                            <button
                              onClick={() => startTimer(task.id, 'count_up')}
                              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg transition-colors flex items-center gap-1"
                              title="Mulai Stopwatch Pekerjaan"
                            >
                              <Play className="w-3.5 h-3.5" /> Mulai
                            </button>
                            <button
                              onClick={() => startTimer(task.id, 'pomodoro', 25)}
                              className="p-1.5 text-orange-400 hover:bg-orange-950/60 rounded-lg transition-colors border border-slate-800"
                              title="Mulai Fokus Pomodoro 25 Menit"
                            >
                              <Flame className="w-4 h-4" />
                            </button>
                          </>
                        )
                      )}

                      {/* Pin as Daily Focus toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isPinnedAsFocus) {
                            clearDailyFocus(selectedDate);
                          } else {
                            pinTaskAsDailyFocus(task.id, selectedDate);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isPinnedAsFocus
                            ? 'text-amber-300 bg-amber-950/90 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : 'text-slate-500 hover:text-amber-400 bg-slate-900 border-slate-800 hover:border-amber-500/40'
                        }`}
                        title={
                          isPinnedAsFocus
                            ? 'Lepas dari Fokus Utama Hari Ini'
                            : 'Pin sebagai Fokus Utama Hari Ini'
                        }
                      >
                        <Pin className={`w-4 h-4 ${isPinnedAsFocus ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Manual Log Button */}
                      <button
                        onClick={() => onOpenManualLog(task)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Catat Durasi Kerja Manual"
                      >
                        <Clock className="w-4 h-4" />
                      </button>

                      {/* View Sessions Log History Toggle */}
                      {task.timeLogs && task.timeLogs.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedLogTaskId(isLogsExpanded ? null : task.id)
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            isLogsExpanded
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Lihat Riwayat Sesi Waktu"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      )}

                      {/* Duplicate to Tomorrow */}
                      <button
                        onClick={() => {
                          const tomorrow = addDays(selectedDate, 1);
                          duplicateTaskToDate(task.id, tomorrow);
                          alert(`Tugas berhasil disalin ke tanggal ${tomorrow}`);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="Salin tugas ini ke hari berikutnya"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Ubah Rincian Pekerjaan"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus pekerjaan "${task.title}"?`)) {
                            deleteTask(task.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                        title="Hapus Pekerjaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Time Logs History */}
                {isLogsExpanded && task.timeLogs && task.timeLogs.length > 0 && (
                  <div className="px-5 pb-4 pt-2 bg-[#0A0D15] border-t border-slate-800/80 text-xs">
                    <div className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Riwayat {task.timeLogs.length} Sesi Pelacakan Waktu:
                    </div>
                    <div className="space-y-1.5">
                      {task.timeLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between py-1.5 px-3 bg-[#111726] border border-slate-800 rounded-lg font-mono text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400">
                              {new Date(log.startTime).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-slate-600">→</span>
                            <span className="text-slate-200 font-sans font-medium">
                              {log.note || 'Sesi kerja'}
                            </span>
                          </div>
                          <span className="font-bold text-emerald-400">
                            {formatDuration(log.durationSeconds)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
