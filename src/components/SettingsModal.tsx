import React from 'react';
import {
  X,
  Volume2,
  Bell,
  Clock,
  Target,
  RotateCcw,
  Shield,
  Sparkles,
  FileSpreadsheet,
  Download,
  Database,
  Minus,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { requestBrowserNotificationPermission } from '../utils/notification';
import { exportAllWorkHistoryToCSV } from '../utils/csvExport';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExportCSV?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenExportCSV }) => {
  const { tasks, categories, settings, updateSettings, resetToInitialData, sendTestNotification } = useWork();

  if (!isOpen) return null;

  const handleBrowserNotifToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestBrowserNotificationPermission();
      updateSettings({ enableBrowserNotifications: granted });
    } else {
      updateSettings({ enableBrowserNotifications: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#111726] rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold font-display text-white">Pengaturan & Disiplin Kerja</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sesuaikan target jam, bunyi pengingat, dan siklus istirahat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">
          {/* Target Work Hours Configuration */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" />
                Target Jam Kerja Harian
              </label>
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 rounded-lg">
                {settings.dailyWorkGoalHours} Jam / Hari
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Tentukan target waktu fokus kerja harian Anda. Progres pencapaian target ini ditampilkan langsung dalam bentuk progress bar di Dashboard.
            </p>

            {/* Stepper + Input + Slider */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center bg-[#111726] border border-slate-700/80 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => updateSettings({ dailyWorkGoalHours: Math.max(1, settings.dailyWorkGoalHours - 1) })}
                    disabled={settings.dailyWorkGoalHours <= 1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Kurangi 1 jam"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={settings.dailyWorkGoalHours}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        updateSettings({ dailyWorkGoalHours: Math.max(1, Math.min(16, val)) });
                      }
                    }}
                    className="w-16 px-1 py-1 bg-transparent text-center focus:outline-hidden font-mono font-bold text-base text-white"
                  />
                  <button
                    type="button"
                    onClick={() => updateSettings({ dailyWorkGoalHours: Math.min(16, settings.dailyWorkGoalHours + 1) })}
                    disabled={settings.dailyWorkGoalHours >= 16}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Tambah 1 jam"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1">
                  <input
                    type="range"
                    min="1"
                    max="14"
                    step="1"
                    value={settings.dailyWorkGoalHours}
                    onChange={(e) => updateSettings({ dailyWorkGoalHours: parseInt(e.target.value) || 7 })}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1j</span>
                    <span>4j</span>
                    <span>7j</span>
                    <span>10j</span>
                    <span>14j</span>
                  </div>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Pilihan Rekomendasi Cepat:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { hours: 4, label: '4 Jam', sub: 'Ringan' },
                    { hours: 6, label: '6 Jam', sub: 'Fokus' },
                    { hours: 7, label: '7 Jam', sub: 'Standar' },
                    { hours: 8, label: '8 Jam', sub: 'Penuh' },
                  ].map((preset) => (
                    <button
                      key={preset.hours}
                      type="button"
                      onClick={() => updateSettings({ dailyWorkGoalHours: preset.hours })}
                      className={`py-1.5 px-2 rounded-xl text-center border transition-all text-xs ${
                        settings.dailyWorkGoalHours === preset.hours
                          ? 'border-indigo-500 bg-indigo-950/70 text-indigo-300 font-bold shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                          : 'border-slate-800 bg-[#111726]/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <div className="font-semibold">{preset.label}</div>
                      <div className="text-[9px] opacity-75">{preset.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weekly Projection Info */}
              <div className="flex items-center justify-between text-[11px] p-2 bg-[#111726]/80 rounded-xl border border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Proyeksi Target Mingguan:
                </span>
                <span className="font-mono font-bold text-indigo-300">
                  {settings.dailyWorkGoalHours * 5} Jam / Minggu (5 Hari)
                </span>
              </div>
            </div>
          </div>

          {/* Sound Chime Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-white">Bunyi Audio Chime</div>
                <div className="text-[11px] text-slate-400">
                  Bunyi nada lembut saat tugas selesai atau pengingat berbunyi
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSound}
                onChange={(e) => updateSettings({ enableSound: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Browser Notifications Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-white">Notifikasi Browser</div>
                <div className="text-[11px] text-slate-400">
                  Tampilkan notifikasi desktop saat deadline tiba
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBrowserNotifications}
                onChange={(e) => handleBrowserNotifToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Break reminder interval */}
          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Interval Pengingat Istirahat (Fokus Berkelanjutan)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[25, 45, 50, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateSettings({ breakReminderMinutes: mins })}
                  className={`py-2 px-2 text-xs font-mono font-semibold rounded-xl border text-center transition-colors ${
                    settings.breakReminderMinutes === mins
                      ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {mins} Menit
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ketika timer berjalan melebihi interval ini, sistem akan menyarankan Anda rehat sejenak.
            </p>
          </div>

          {/* Zen Mode Settings */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Otomatis Buka Mode Zen
                </div>
                <div className="text-[11px] text-slate-400">
                  Langsung masuk ke layar minimalis begitu timer diaktifkan
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoZenOnTimerStart || false}
                  onChange={(e) => updateSettings({ autoZenOnTimerStart: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">
                Suasana Tema Default Mode Zen:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'dark', label: 'Gelap Pekat' },
                  { key: 'slate', label: 'Deep Slate' },
                  { key: 'light', label: 'Warm Light' },
                ].map((th) => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => updateSettings({ zenTheme: th.key as 'dark' | 'slate' | 'light' })}
                    className={`py-1.5 px-2 text-xs font-medium rounded-xl border text-center transition-colors ${
                      (settings.zenTheme || 'dark') === th.key
                        ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 font-semibold shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Sound Button */}
          <div className="pt-2">
            <button
              onClick={sendTestNotification}
              className="w-full py-2.5 px-3 text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/30 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" /> Uji Bunyi & Notifikasi Sekarang
            </button>
          </div>

          {/* Backup & CSV Export Section */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                Cadangan Data Aktivitas (CSV)
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Unduh cadangan progres pekerjaan Anda untuk arsip offline spreadsheet
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenExportCSV) onOpenExportCSV();
                }}
                className="py-2.5 px-3 text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Laporan CSV...
              </button>
              <button
                type="button"
                onClick={() => {
                  exportAllWorkHistoryToCSV(tasks, categories);
                }}
                className="py-2.5 px-3 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                title="Cadangkan seluruh tugas dan riwayat waktu"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" /> Cadangkan Semua
              </button>
            </div>
          </div>

          {/* Danger zone: reset to initial data */}
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={resetToInitialData}
              className="w-full py-2 px-3 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Muat Ulang Contoh Data Awal
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-sm"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
