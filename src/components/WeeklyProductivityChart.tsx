import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Award,
  Flame,
  Target,
  ArrowUpRight,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import {
  addDays,
  formatDuration,
  formatDurationHoursDecimal,
  formatIndonesianDate,
  getTodayString,
} from '../utils/dateUtils';
import { Task } from '../types';

interface WeeklyProductivityChartProps {
  onSelectDateToDaily?: (date: string) => void;
  onNavigateToMonthly?: () => void;
}

const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DAY_NAMES_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const WeeklyProductivityChart: React.FC<WeeklyProductivityChartProps> = ({
  onSelectDateToDaily,
  onNavigateToMonthly,
}) => {
  const { tasks, categories, settings, activeTimer, activeTask, currentRunningElapsed } = useWork();

  const todayStr = getTodayString();
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = last week
  const [viewMode, setViewMode] = useState<'calendar' | 'rolling'>('calendar'); // 'calendar' = Mon-Sun, 'rolling' = last 7 days
  const [hoveredDayDate, setHoveredDayDate] = useState<string | null>(null);

  const goalHours = settings.dailyWorkGoalHours || 7;

  // Calculate 7 dates for the selected week
  const getWeekDates = (): string[] => {
    if (viewMode === 'rolling' && weekOffset === 0) {
      // 7 rolling days ending today
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        dates.push(addDays(todayStr, -i));
      }
      return dates;
    }

    // Standard Monday to Sunday of the target week
    const [y, m, d] = todayStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    
    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfWeek = curr.getDay();
    // In Indonesia / ISO, week starts on Monday (1). If Sunday (0), it's day 7
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const mondayDate = new Date(curr);
    mondayDate.setDate(curr.getDate() + distanceToMonday + weekOffset * 7);

    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(mondayDate);
      dayDate.setDate(mondayDate.getDate() + i);
      const year = dayDate.getFullYear();
      const month = String(dayDate.getMonth() + 1).padStart(2, '0');
      const day = String(dayDate.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const startDateStr = weekDates[0];
  const endDateStr = weekDates[6];

  // Map category by ID
  const categoryMap = new Map<string, typeof categories[0]>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // Compute daily data for each of the 7 days
  const dailyData = weekDates.map((dateStr) => {
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    
    let seconds = dayTasks.reduce((acc, t) => acc + t.actualDurationSeconds, 0);
    // Include live active timer if running on that date
    if (activeTimer && activeTask && activeTask.date === dateStr) {
      seconds += currentRunningElapsed;
    }

    const hours = seconds / 3600;
    const completedTasksCount = dayTasks.filter((t) => t.status === 'completed').length;
    const isTargetMet = hours >= goalHours;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayNameShort = DAY_NAMES_SHORT[dateObj.getDay()];
    const dayNameFull = DAY_NAMES_FULL[dateObj.getDay()];

    // Find dominant category
    const catHoursMap: Record<string, number> = {};
    dayTasks.forEach((t) => {
      catHoursMap[t.categoryId] = (catHoursMap[t.categoryId] || 0) + t.actualDurationSeconds;
    });
    let topCatId = '';
    let topCatSec = 0;
    Object.entries(catHoursMap).forEach(([catId, sec]) => {
      if (sec > topCatSec) {
        topCatSec = sec;
        topCatId = catId;
      }
    });

    return {
      date: dateStr,
      dayNameShort,
      dayNameFull,
      dayNum: d,
      seconds,
      hours,
      totalTasks: dayTasks.length,
      completedTasks: completedTasksCount,
      isTargetMet,
      isToday,
      isFuture,
      topCategory: topCatId ? categoryMap.get(topCatId) : null,
    };
  });

  // Calculate Week Aggregate Metrics
  const totalWeekSeconds = dailyData.reduce((acc, d) => acc + d.seconds, 0);
  const totalWeekHours = totalWeekSeconds / 3600;
  const activeDaysCount = dailyData.filter((d) => d.seconds > 0).length;
  const avgDailyHours = activeDaysCount > 0 ? (totalWeekHours / activeDaysCount).toFixed(1) : '0';
  
  const targetMetDaysCount = dailyData.filter((d) => d.isTargetMet).length;
  const totalWeekTasks = dailyData.reduce((acc, d) => acc + d.totalTasks, 0);
  const totalCompletedTasks = dailyData.reduce((acc, d) => acc + d.completedTasks, 0);
  const weekCompletionRate = totalWeekTasks > 0 ? Math.round((totalCompletedTasks / totalWeekTasks) * 100) : 0;

  // Best day this week
  let bestDay = dailyData[0];
  dailyData.forEach((d) => {
    if (d.seconds > bestDay.seconds) bestDay = d;
  });

  // Max scale calculation for Chart Y-Axis
  const maxDayHours = Math.max(...dailyData.map((d) => d.hours), 0);
  // Chart ceiling: at least goalHours + 2, rounded up to next even number
  const chartMaxHours = Math.max(Math.ceil(maxDayHours + 1), goalHours + 2, 8);

  const goalLineYPercent = ((chartMaxHours - goalHours) / chartMaxHours) * 100;

  return (
    <div className="bg-[#111726]/85 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-44 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Header & Week Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold font-display text-white">
              Tren Produktivitas Mingguan
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
              {weekOffset === 0 ? 'Minggu Ini' : weekOffset === -1 ? 'Minggu Lalu' : `${Math.abs(weekOffset)} Minggu Lalu`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rentang:{' '}
            <span className="text-slate-200 font-medium">
              {formatIndonesianDate(startDateStr)} – {formatIndonesianDate(endDateStr)}
            </span>
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Calendar vs Rolling toggle */}
          <div className="flex items-center bg-[#0B0F19] border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => {
                setViewMode('calendar');
                setWeekOffset(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sen – Min
            </button>
            <button
              onClick={() => {
                setViewMode('rolling');
                setWeekOffset(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                viewMode === 'rolling'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
          </div>

          {/* Week Pager */}
          <div className="flex items-center bg-[#0B0F19] border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                weekOffset === 0
                  ? 'text-indigo-400 opacity-60 cursor-default'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Sekarang
            </button>
            <button
              onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
              disabled={weekOffset >= 0}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Weekly Quick Stat Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0B0F19]/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Akumulasi Jam Kerja</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-white tabular-nums">
              {totalWeekHours.toFixed(1)}j
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({formatDuration(totalWeekSeconds)})
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Target mingguan: ~{goalHours * 5} Jam
          </span>
        </div>

        <div className="p-3.5 bg-[#0B0F19]/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Rata-rata Harian Aktif</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-indigo-300 tabular-nums">
              {avgDailyHours}j
            </span>
            <span className="text-[11px] text-slate-500 font-mono">/ hari</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {activeDaysCount} dari 7 hari tercatat aktif
          </span>
        </div>

        <div className="p-3.5 bg-[#0B0F19]/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Target Harian Terpenuhi</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {targetMetDaysCount} Hari
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ({Math.round((targetMetDaysCount / 5) * 100)}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Acuan target: {goalHours} Jam/Hari
          </span>
        </div>

        <div className="p-3.5 bg-[#0B0F19]/80 border border-slate-800 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">Hari Paling Produktif</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold font-mono text-amber-300 tabular-nums truncate">
              {bestDay.seconds > 0 ? bestDay.dayNameShort : '-'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {bestDay.seconds > 0 ? `${bestDay.hours.toFixed(1)}j` : '0j'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            {bestDay.seconds > 0 ? formatIndonesianDate(bestDay.date) : 'Belum ada data'}
          </span>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="relative pt-6 pb-2">
        {/* Target Baseline Indicator Legend */}
        <div className="flex items-center justify-between text-xs mb-3 px-1 text-slate-400">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-dashed border-t-2 border-dashed border-amber-400/90" />
              <span>Garis Target Harian ({goalHours} Jam)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Mencapai Target</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" />
              <span>Sedang Berjalan</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Klik batang untuk melihat rincian hari
          </span>
        </div>

        {/* Chart Canvas Area */}
        <div className="relative h-64 bg-[#0B0F19]/90 border border-slate-800/90 rounded-2xl p-4 sm:p-6 flex flex-col justify-end shadow-inner">
          {/* Horizontal Grid lines */}
          <div className="absolute inset-x-4 sm:inset-x-6 top-6 bottom-10 pointer-events-none flex flex-col justify-between text-[10px] font-mono text-slate-600">
            {[chartMaxHours, Math.round(chartMaxHours * 0.75), Math.round(chartMaxHours * 0.5), Math.round(chartMaxHours * 0.25), 0].map(
              (val, idx) => (
                <div key={idx} className="w-full flex items-center justify-between relative">
                  <span className="w-6 text-right pr-2 text-slate-500">{val}j</span>
                  <div className="flex-1 h-px bg-slate-800/60" />
                </div>
              )
            )}
          </div>

          {/* Goal Hours Dashed Line */}
          <div
            className="absolute inset-x-4 sm:inset-x-6 pointer-events-none transition-all duration-300 z-10"
            style={{ top: `${Math.max(10, Math.min(88, goalLineYPercent))}%` }}
          >
            <div className="w-full flex items-center">
              <span className="w-6 text-right pr-2 text-amber-400 font-mono text-[9px] font-bold">
                {goalHours}j
              </span>
              <div className="flex-1 border-t-2 border-dashed border-amber-400/70 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
            </div>
          </div>

          {/* 7 Daily Bars Columns */}
          <div className="relative z-20 grid grid-cols-7 gap-2 sm:gap-4 h-48 items-end pl-6">
            {dailyData.map((day) => {
              const heightPercent = Math.min(100, Math.max(3, (day.hours / chartMaxHours) * 100));
              const isHovered = hoveredDayDate === day.date;
              const hasHours = day.seconds > 0;

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredDayDate(day.date)}
                  onMouseLeave={() => setHoveredDayDate(null)}
                  onClick={() => onSelectDateToDaily && onSelectDateToDaily(day.date)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-24 sm:-top-28 z-40 bg-[#161D31] border border-slate-700 p-2.5 rounded-xl shadow-2xl text-left pointer-events-none w-44 animate-in fade-in zoom-in-95 duration-150">
                      <div className="text-[11px] font-bold text-white flex items-center justify-between">
                        <span>{day.dayNameFull}</span>
                        <span className="font-mono text-indigo-300">{day.dayNum}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {formatIndonesianDate(day.date)}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-bold text-white tabular-nums">
                          {formatDuration(day.seconds)} ({day.hours.toFixed(1)}j)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-0.5">
                        <span className="text-slate-400">Target:</span>
                        <span
                          className={`font-semibold ${
                            day.isTargetMet ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {Math.round((day.hours / goalHours) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>Tugas:</span>
                        <span className="text-slate-300 font-mono">
                          {day.completedTasks}/{day.totalTasks} Selesai
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Value Above Bar */}
                  <span
                    className={`text-[10px] font-mono tabular-nums mb-1 transition-all ${
                      hasHours
                        ? day.isTargetMet
                          ? 'text-emerald-400 font-bold'
                          : 'text-slate-300 font-semibold'
                        : 'text-slate-600'
                    }`}
                  >
                    {hasHours ? `${day.hours.toFixed(1)}j` : '0j'}
                  </span>

                  {/* Bar Capsule */}
                  <div className="w-full max-w-[36px] bg-[#141B2D] rounded-t-xl h-full flex items-end p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ease-out relative ${
                        day.isTargetMet
                          ? 'bg-gradient-to-t from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                          : hasHours
                          ? 'bg-gradient-to-t from-indigo-700 via-indigo-600 to-cyan-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                          : 'bg-slate-800/40'
                      } ${day.isToday ? 'ring-2 ring-indigo-400/90' : ''} ${
                        isHovered ? 'brightness-125 scale-[1.03]' : ''
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      {/* Subtle glossy shimmer */}
                      {hasHours && (
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-white/25 rounded-t-lg" />
                      )}
                    </div>
                  </div>

                  {/* Day Label at Bottom */}
                  <div className="mt-2.5 text-center">
                    <span
                      className={`block text-xs font-semibold uppercase tracking-wider ${
                        day.isToday
                          ? 'text-indigo-400 font-bold'
                          : hasHours
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.dayNameShort}
                    </span>
                    <span
                      className={`text-[10px] font-mono block ${
                        day.isToday
                          ? 'text-indigo-300 font-bold px-1 rounded-sm bg-indigo-950/80 border border-indigo-500/40'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Summary / Navigation Hint */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3 border-t border-slate-800/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            {targetMetDaysCount >= 5 ? (
              <strong className="text-emerald-400 font-semibold">
                Luar biasa! Disiplin kerja mingguan Anda sangat konsisten di atas target.
              </strong>
            ) : targetMetDaysCount >= 3 ? (
              <strong className="text-indigo-300 font-semibold">
                Konsistensi yang baik. Terus pertahankan ritme fokus hingga akhir minggu.
              </strong>
            ) : (
              <span>
                Fokus harian dapat ditingkatkan untuk memenuhi target komitmen mingguan.
              </span>
            )}
          </span>
        </div>

        {onNavigateToMonthly && (
          <button
            onClick={onNavigateToMonthly}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold self-end sm:self-auto transition-colors"
          >
            <span>Buka Laporan Analitik Bulanan Penuh</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
