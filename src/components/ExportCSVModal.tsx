import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
  Info,
  Clock,
  Check,
  Sparkles,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { exportDailyTasksToCSV, exportAllWorkHistoryToCSV } from '../utils/csvExport';
import { formatDuration, formatIndonesianDate } from '../utils/dateUtils';

interface ExportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const ExportCSVModal: React.FC<ExportCSVModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
}) => {
  const { tasks, categories } = useWork();

  const todayStr = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(defaultDate || todayStr);
  const [exportType, setExportType] = useState<'daily' | 'all'>('daily');
  const [includeSessionDetails, setIncludeSessionDetails] = useState<boolean>(true);
  const [includeSummaryRow, setIncludeSummaryRow] = useState<boolean>(true);
  const [downloadSuccessInfo, setDownloadSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute stats for selected date
  const dayTasks = tasks.filter((t) => t.date === targetDate);
  const daySeconds = dayTasks.reduce((acc, t) => acc + t.actualDurationSeconds, 0);
  const dayCompleted = dayTasks.filter((t) => t.status === 'completed').length;
  const dayCompletionRate = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;

  // Stats for all tasks
  const allSeconds = tasks.reduce((acc, t) => acc + t.actualDurationSeconds, 0);
  const allCompleted = tasks.filter((t) => t.status === 'completed').length;

  const handleExecuteExport = () => {
    try {
      if (exportType === 'daily') {
        const result = exportDailyTasksToCSV(tasks, categories, targetDate, {
          includeSessionDetails,
          includeSummaryRow,
        });
        setDownloadSuccessInfo(`Berhasil mengunduh "${result.filename}" (${result.count} tugas tercatat)`);
      } else {
        const result = exportAllWorkHistoryToCSV(tasks, categories);
        setDownloadSuccessInfo(`Berhasil mengunduh "${result.filename}" (${result.count} total tugas)`);
      }

      setTimeout(() => {
        setDownloadSuccessInfo(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0F1422]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">Unduh Cadangan Laporan CSV</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ekspor aktivitas kerja harian ke format spreadsheet Microsoft Excel & Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-sm">
          {/* Success Banner */}
          {downloadSuccessInfo && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{downloadSuccessInfo}</span>
            </div>
          )}

          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Pilih Ruang Lingkup Laporan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportType('daily')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  exportType === 'daily'
                    ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                    : 'border-slate-800 bg-[#0B0F19]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Laporan Harian</span>
                  </div>
                  {exportType === 'daily' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,1)]" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Aktivitas & tugas pada satu tanggal tertentu
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('all')}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                  exportType === 'all'
                    ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                    : 'border-slate-800 bg-[#0B0F19]/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Cadangan Keseluruhan</span>
                  </div>
                  {exportType === 'all' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Seluruh riwayat tugas dari awal hingga sekarang
                </span>
              </button>
            </div>
          </div>

          {/* Date Picker if Daily */}
          {exportType === 'daily' && (
            <div className="bg-[#0B0F19]/80 border border-slate-800 p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Tanggal Aktivitas Kerja:
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => e.target.value && setTargetDate(e.target.value)}
                  className="bg-[#111726] border border-slate-700 text-white text-xs px-2.5 py-1 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div className="text-xs text-indigo-300 font-medium">
                {formatIndonesianDate(targetDate, { withDayName: true })}
              </div>
            </div>
          )}

          {/* Data Preview Card */}
          <div className="bg-[#0B0F19]/90 border border-slate-800/90 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Pratinjau Data yang Diekspor
              </span>
              <span className="font-mono text-[11px] text-indigo-400">
                Format: .CSV (UTF-8)
              </span>
            </div>

            {exportType === 'daily' ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Total Tugas</span>
                  <span className="font-bold text-white text-sm font-mono tabular-nums">
                    {dayTasks.length}
                  </span>
                </div>
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Selesai</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono tabular-nums">
                    {dayCompleted} ({dayCompletionRate}%)
                  </span>
                </div>
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Waktu Tercatat</span>
                  <span className="font-bold text-indigo-300 text-sm font-mono tabular-nums">
                    {formatDuration(daySeconds)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Semua Tugas</span>
                  <span className="font-bold text-white text-sm font-mono tabular-nums">
                    {tasks.length}
                  </span>
                </div>
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Total Selesai</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono tabular-nums">
                    {allCompleted}
                  </span>
                </div>
                <div className="p-2 bg-[#111726]/60 rounded-lg border border-slate-800">
                  <span className="block text-[10px] text-slate-400">Total Jam</span>
                  <span className="font-bold text-indigo-300 text-sm font-mono tabular-nums">
                    {formatDuration(allSeconds)}
                  </span>
                </div>
              </div>
            )}

            {exportType === 'daily' && dayTasks.length === 0 && (
              <p className="text-xs text-amber-400/90 bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-lg flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                Belum ada aktivitas tugas yang tercatat pada tanggal ini. File CSV akan menyertakan header kolom kosong.
              </p>
            )}
          </div>

          {/* Export Options */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Opsi Kolom & Rincian
            </span>

            <label className="flex items-center justify-between p-2.5 bg-[#0B0F19]/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-white">
                    Sertakan Rincian Sesi Waktu (Timer Logs)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Mencatat jam mulai, selesai, dan durasi tiap sesi kerja
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeSessionDetails}
                onChange={(e) => setIncludeSessionDetails(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-[#0B0F19]/60 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="text-xs font-medium text-white">
                    Sertakan Baris Ringkasan Total
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Menambahkan kalkulasi total durasi dan persentase di baris akhir
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={includeSummaryRow}
                onChange={(e) => setIncludeSummaryRow(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0F1422] border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleExecuteExport}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)]"
          >
            <Download className="w-4 h-4" />
            <span>
              {exportType === 'daily'
                ? `Unduh CSV Laporan Harian`
                : `Unduh Seluruh Cadangan Data`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
