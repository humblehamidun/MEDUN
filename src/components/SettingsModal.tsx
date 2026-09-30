import React from 'react';
import { X, Volume2, Bell, Clock, Target, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { requestBrowserNotificationPermission } from '../utils/notification';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetToInitialData, sendTestNotification } = useWork();

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
          {/* Target Work Hours */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              Target Jam Kerja Harian
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="16"
                value={settings.dailyWorkGoalHours}
                onChange={(e) =>
                  updateSettings({ dailyWorkGoalHours: Math.max(1, parseInt(e.target.value) || 7) })
                }
                className="w-24 px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors font-mono font-bold text-white"
              />
              <span className="text-xs text-slate-400">Jam per hari (Acuan target harian)</span>
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
