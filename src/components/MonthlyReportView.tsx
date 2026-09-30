import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Clock,
  CheckCircle2,
  PieChart,
  BarChart3,
  Award,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import {
  formatDuration,
  formatDurationHoursDecimal,
  formatIndonesianDate,
  formatIndonesianMonthYear,
  getDaysInMonth,
  getFirstDayOfWeek,
} from '../utils/dateUtils';
import { Task } from '../types';
import { triggerCSVDownload, escapeCSVField } from '../utils/csvExport';

interface MonthlyReportViewProps {
  onSelectDateToDaily: (date: string) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  onSelectDateToDaily,
}) => {
  const { tasks, categories } = useWork();

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 8 is September (0-indexed)
  const [hoveredBarDay, setHoveredBarDay] = useState<number | null>(null);
  const [inspectedDay, setInspectedDay] = useState<string | null>(null);

  // Filter tasks belonging to selected month & year
  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const monthTasks = tasks.filter((t) => t.date.startsWith(monthPrefix));

  const totalMonthSeconds = monthTasks.reduce(
    (acc, t) => acc + t.actualDurationSeconds,
    0
  );
  const totalMonthHours = totalMonthSeconds / 3600;
  const completedMonthTasks = monthTasks.filter((t) => t.status === 'completed');
  const monthCompletionRate = monthTasks.length > 0
    ? Math.round((completedMonthTasks.length / monthTasks.length) * 100)
    : 0;

  // Days in month calculation
  const numDays = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayOfWeek = getFirstDayOfWeek(selectedYear, selectedMonth); // 0 = Sun, 1 = Mon

  // Daily hours map for the month
  const dailySecondsMap: { [day: number]: number } = {};
  const dailyTasksMap: { [day: number]: Task[] } = {};

  for (let d = 1; d <= numDays; d++) {
    dailySecondsMap[d] = 0;
    dailyTasksMap[d] = [];
  }

  monthTasks.forEach((t) => {
    const dayNum = parseInt(t.date.split('-')[2], 10);
    dailySecondsMap[dayNum] = (dailySecondsMap[dayNum] || 0) + t.actualDurationSeconds;
    if (!dailyTasksMap[dayNum]) dailyTasksMap[dayNum] = [];
    dailyTasksMap[dayNum].push(t);
  });

  // Calculate active working days
  const activeDaysCount = Object.values(dailySecondsMap).filter((s) => s > 0).length;
  const avgDailyHours = activeDaysCount > 0 ? (totalMonthHours / activeDaysCount).toFixed(1) : '0';

  // Find most productive day
  let bestDayNum = 1;
  let maxSeconds = 0;
  for (let d = 1; d <= numDays; d++) {
    if (dailySecondsMap[d] > maxSeconds) {
      maxSeconds = dailySecondsMap[d];
      bestDayNum = d;
    }
  }

  // Category breakdown
  const categorySummary = categories.map((cat) => {
    const catTasks = monthTasks.filter((t) => t.categoryId === cat.id);
    const catSeconds = catTasks.reduce((acc, t) => acc + t.actualDurationSeconds, 0);
    const catCompleted = catTasks.filter((t) => t.status === 'completed').length;
    const percentageOfTotalTime = totalMonthSeconds > 0
      ? Math.round((catSeconds / totalMonthSeconds) * 100)
      : 0;

    return {
      category: cat,
      taskCount: catTasks.length,
      completedCount: catCompleted,
      seconds: catSeconds,
      percentage: percentageOfTotalTime,
    };
  }).filter((item) => item.seconds > 0 || item.taskCount > 0);

  // Priority breakdown
  const prioritySummary = {
    Tinggi: monthTasks
      .filter((t) => t.priority === 'Tinggi')
      .reduce((acc, t) => acc + t.actualDurationSeconds, 0),
    Sedang: monthTasks
      .filter((t) => t.priority === 'Sedang')
      .reduce((acc, t) => acc + t.actualDurationSeconds, 0),
    Rendah: monthTasks
      .filter((t) => t.priority === 'Rendah')
      .reduce((acc, t) => acc + t.actualDurationSeconds, 0),
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Judul Pekerjaan', 'Kategori', 'Prioritas', 'Status', 'Estimasi (Menit)', 'Durasi Terlacak (Detik)', 'Durasi (Jam)'];
    const rows = monthTasks.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || 'Umum';
      return [
        escapeCSVField(t.id),
        escapeCSVField(t.date),
        escapeCSVField(t.title),
        escapeCSVField(cat),
        escapeCSVField(t.priority),
        escapeCSVField(t.status),
        escapeCSVField(t.estimatedMinutes),
        escapeCSVField(t.actualDurationSeconds),
        escapeCSVField((t.actualDurationSeconds / 3600).toFixed(2)),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    triggerCSVDownload(csvContent, `Laporan_Produktivitas_${selectedYear}_${selectedMonth + 1}.csv`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find max daily hours for scaling the chart
  const maxDaySeconds = Math.max(...Object.values(dailySecondsMap), 3600 * 4);
  const maxDayHours = maxDaySeconds / 3600;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Top Header & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Laporan & Evaluasi Produktivitas Bulanan
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analisis visual komprehensif alokasi waktu kerja, pencapaian target, dan efisiensi prioritas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month selector */}
          <div className="flex items-center bg-[#111726]/80 border border-slate-800 rounded-xl p-1 shadow-md">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-white font-mono">
              {formatIndonesianMonthYear(selectedYear, selectedMonth)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 bg-[#111726] hover:bg-[#1A2238] border border-slate-800 rounded-xl transition-colors shadow-xs"
            title="Download Spreadsheet CSV"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-xs"
            title="Cetak Laporan PDF"
          >
            <Printer className="w-3.5 h-3.5" /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* 4 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Total Jam Kerja Bulan Ini</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {totalMonthHours.toFixed(1)} Jam
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({formatDuration(totalMonthSeconds)})
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Terdistribusi dalam {activeDaysCount} hari kerja aktif
          </p>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Rata-rata Waktu / Hari Aktif</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {avgDailyHours} Jam
            </span>
            <span className="text-xs text-slate-400">/ hari</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Konsistensi pencatatan waktu terjaga
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Tingkat Penyelesaian Tugas</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono tabular-nums">
              {monthCompletionRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ({completedMonthTasks.length}/{monthTasks.length})
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-500 h-full rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"
              style={{ width: `${monthCompletionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#111726]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-800/90 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium tracking-wide">Hari Terproduktif</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-mono tabular-nums">
              Tgl {bestDayNum} ({formatDuration(maxSeconds)})
            </span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Capaian jam fokus tertinggi dalam 1 hari
          </p>
        </div>
      </div>

      {/* Visual Chart: Daily Hours Bar Graph */}
      <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Tren Jam Kerja Harian (Tanggal 1 – {numDays})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Arahkan kursor pada batang untuk melihat rincian jam kerja per tanggal
            </p>
          </div>
          {hoveredBarDay && (
            <div className="text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/40">
              Tgl {hoveredBarDay}: {(dailySecondsMap[hoveredBarDay] / 3600).toFixed(1)} Jam ({dailyTasksMap[hoveredBarDay]?.length || 0} Tugas)
            </div>
          )}
        </div>

        {/* SVG Daily Bar Chart */}
        <div className="w-full overflow-x-auto pb-2">
          <div className="min-w-[640px] h-48 flex items-end gap-1.5 pt-6 px-2 border-b border-slate-800">
            {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
              const seconds = dailySecondsMap[day] || 0;
              const hours = seconds / 3600;
              const heightPercent = maxDayHours > 0 ? Math.min(100, Math.round((hours / maxDayHours) * 100)) : 0;
              const isHovered = hoveredBarDay === day;
              const hasWork = seconds > 0;

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredBarDay(day)}
                  onMouseLeave={() => setHoveredBarDay(null)}
                  onClick={() => {
                    const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
                    setInspectedDay(dateStr);
                  }}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all duration-200 ${
                      isHovered
                        ? 'bg-indigo-400 ring-2 ring-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.8)]'
                        : hasWork
                        ? 'bg-indigo-600/80 group-hover:bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.4)]'
                        : 'bg-slate-800/40'
                    }`}
                    style={{
                      height: `${Math.max(4, heightPercent)}%`,
                    }}
                  />
                  <span
                    className={`text-[10px] mt-1.5 font-mono ${
                      isHovered ? 'font-bold text-indigo-400' : 'text-slate-500'
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Monthly Calendar Grid + Category Proportion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Calendar Heatmap Grid */}
        <div className="lg:col-span-2 bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Matriks Kalender Aktivitas Bulanan
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Klik tanggal untuk melihat daftar tugas yang diselesaikan pada hari tersebut
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Kurang</span>
              <span className="w-3 h-3 rounded-xs bg-slate-800" />
              <span className="w-3 h-3 rounded-xs bg-indigo-900/60" />
              <span className="w-3 h-3 rounded-xs bg-indigo-600" />
              <span className="w-3 h-3 rounded-xs bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
              <span>Intensif</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-slate-400 mb-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`offset-${i}`} className="h-16 rounded-xl bg-slate-900/30 border border-slate-800/40" />
            ))}

            {/* Actual days */}
            {Array.from({ length: numDays }, (_, i) => i + 1).map((day) => {
              const seconds = dailySecondsMap[day] || 0;
              const hours = seconds / 3600;
              const taskList = dailyTasksMap[day] || [];
              const dateStr = `${monthPrefix}-${String(day).padStart(2, '0')}`;
              const isSelected = inspectedDay === dateStr;

              // Heat level in dark mode
              let bgClass = 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:border-slate-700';
              if (hours >= 5) bgClass = 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]';
              else if (hours >= 2.5) bgClass = 'bg-indigo-800/70 text-indigo-100 border-indigo-700';
              else if (hours > 0) bgClass = 'bg-indigo-950/60 text-indigo-300 border-indigo-900';

              return (
                <div
                  key={day}
                  onClick={() => setInspectedDay(dateStr)}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left cursor-pointer transition-all ${bgClass} ${
                    isSelected ? 'ring-2 ring-indigo-400' : ''
                  }`}
                >
                  <span className="text-xs font-mono font-bold leading-none">{day}</span>
                  {seconds > 0 ? (
                    <div className="text-[10px] leading-tight">
                      <div className="font-mono font-bold tabular-nums">
                        {hours.toFixed(1)}j
                      </div>
                      <div className="opacity-80 truncate">{taskList.length} tugas</div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600">-</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inspected Day Detail Drawer */}
          {inspectedDay && (
            <div className="mt-5 p-4 bg-[#0B0F19] border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-display">
                    Rincian: {formatIndonesianDate(inspectedDay, { withDayName: true })}
                  </h4>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    ({formatDuration(
                      monthTasks
                        .filter((t) => t.date === inspectedDay)
                        .reduce((acc, t) => acc + t.actualDurationSeconds, 0)
                    )})
                  </span>
                </div>
                <button
                  onClick={() => onSelectDateToDaily(inspectedDay)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Buka di Halaman Harian →
                </button>
              </div>

              <div className="space-y-1.5">
                {monthTasks.filter((t) => t.date === inspectedDay).length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">
                    Tidak ada pekerjaan yang tercatat pada tanggal ini.
                  </p>
                ) : (
                  monthTasks
                    .filter((t) => t.date === inspectedDay)
                    .map((t) => {
                      const cat = categories.find((c) => c.id === t.categoryId);
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2 bg-[#111726] rounded-lg border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: cat?.color || '#6366f1' }}
                            />
                            <span className="font-medium text-white truncate">
                              {t.title}
                            </span>
                            <span className="text-slate-400 font-mono">
                              ({cat?.name})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`font-semibold ${
                                t.status === 'completed'
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {t.status === 'completed' ? 'Selesai' : 'Berjalan'}
                            </span>
                            <span className="font-mono font-bold text-slate-300">
                              {formatDuration(t.actualDurationSeconds)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Category Distribution & Priority Allocation */}
        <div className="space-y-6">
          {/* Category Allocation */}
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Proporsi Waktu per Jenis Pekerjaan
            </h3>

            <div className="space-y-3">
              {categorySummary.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Belum ada data</p>
              ) : (
                categorySummary.map((item) => (
                  <div key={item.category.id} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1.5 font-medium text-slate-200 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: item.category.color }}
                        />
                        <span className="truncate">{item.category.name}</span>
                      </span>
                      <span className="font-mono tabular-nums text-slate-400 shrink-0 font-medium">
                        {formatDuration(item.seconds)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: item.category.color,
                          width: `${item.percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Priority Allocation Breakdown */}
          <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white font-display mb-3">
              Alokasi Jam Berdasarkan Prioritas
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-rose-400">Prioritas Tinggi (Urgen)</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {formatDuration(prioritySummary.Tinggi)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full shadow-[0_0_6px_rgba(244,63,94,0.6)]"
                    style={{
                      width: `${totalMonthSeconds > 0 ? (prioritySummary.Tinggi / totalMonthSeconds) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-amber-400">Prioritas Sedang (Reguler)</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {formatDuration(prioritySummary.Sedang)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                    style={{
                      width: `${totalMonthSeconds > 0 ? (prioritySummary.Sedang / totalMonthSeconds) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-300">Prioritas Rendah (Fleksibel)</span>
                  <span className="font-mono font-bold text-white tabular-nums">
                    {formatDuration(prioritySummary.Rendah)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{
                      width: `${totalMonthSeconds > 0 ? (prioritySummary.Rendah / totalMonthSeconds) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tabular Summary per Category */}
      <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white font-display">
            Tabel Rekapitulasi Produktivitas per Kategori Pekerjaan
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar komprehensif alokasi jam kerja dan tingkat keberhasilan tugas
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B0F19] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Jenis Pekerjaan</th>
                <th className="py-3 px-4">Prioritas Default</th>
                <th className="py-3 px-4 text-center">Total Tugas</th>
                <th className="py-3 px-4 text-center">Tugas Selesai</th>
                <th className="py-3 px-4 text-right">Total Jam Kerja</th>
                <th className="py-3 px-4 text-right">Porsi Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {categorySummary.map((item) => (
                <tr key={item.category.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: item.category.color }}
                    />
                    <span>{item.category.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        item.category.priority === 'Tinggi'
                          ? 'text-rose-400'
                          : item.category.priority === 'Sedang'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      Prioritas {item.category.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums">
                    {item.taskCount}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-400 font-bold">
                    {item.completedCount}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatDuration(item.seconds)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                    {item.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#0B0F19] font-bold text-white border-t border-slate-800">
              <tr>
                <td className="py-3 px-4" colSpan={2}>
                  Total Akumulatif Bulan Ini
                </td>
                <td className="py-3 px-4 text-center font-mono tabular-nums">
                  {monthTasks.length}
                </td>
                <td className="py-3 px-4 text-center font-mono tabular-nums text-emerald-400">
                  {completedMonthTasks.length}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  {formatDuration(totalMonthSeconds)}
                </td>
                <td className="py-3 px-4 text-right font-mono tabular-nums">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
