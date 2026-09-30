import React, { useState } from 'react';
import { X, Bell, CheckCheck, Trash2, Volume2, ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import {
  requestBrowserNotificationPermission,
  getNotificationPermissionState,
} from '../utils/notification';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTask,
}) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    sendTestNotification,
    settings,
  } = useWork();

  const [permissionState, setPermissionState] = useState<string>(() =>
    getNotificationPermissionState()
  );

  const handleRequestPermission = async () => {
    const granted = await requestBrowserNotificationPermission();
    setPermissionState(granted ? 'granted' : 'denied');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#111726] rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">Pusat Notifikasi & Pengingat</h3>
              <p className="text-xs text-slate-400">
                Peringatan tenggat waktu tugas, jadwal pengingat, dan disiplin istirahat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Permission Alert Banner */}
        {permissionState !== 'granted' && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Aktifkan notifikasi peramban agar pengingat tetap muncul saat membuka tab lain.</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg whitespace-nowrap transition-colors shadow-sm"
            >
              Izinkan
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">
            {notifications.length} Catatan Notifikasi
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={sendTestNotification}
              className="flex items-center gap-1 px-2.5 py-1 text-indigo-400 hover:bg-indigo-950/60 rounded-lg transition-colors font-medium border border-indigo-500/20"
              title="Coba notifikasi dan suara pengingat"
            >
              <Volume2 className="w-3.5 h-3.5" /> Uji Bunyi
            </button>
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Tandai semua dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Baca Semua
                </button>
                <button
                  onClick={clearNotifications}
                  className="flex items-center gap-1 px-2 py-1 text-rose-400 hover:bg-rose-950/60 rounded-lg transition-colors"
                  title="Hapus riwayat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* List of notifications */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-30 text-indigo-400" />
              <p className="text-sm font-medium text-slate-300">Belum ada notifikasi baru</p>
              <p className="text-xs mt-1 text-slate-500">
                Pengingat akan muncul otomatis saat waktu deadline mendekat atau jadwal tiba.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  if (notif.taskId && onNavigateToTask) {
                    onNavigateToTask(notif.taskId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-[#0B0F19]/60 border-slate-800 opacity-70 hover:opacity-100'
                    : 'bg-[#141B2D] border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        notif.type === 'break_reminder'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                          : notif.type === 'task_deadline'
                          ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                          : 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {notif.type === 'break_reminder' ? (
                        <Clock className="w-4 h-4" />
                      ) : notif.type === 'task_deadline' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-2 font-mono">
                        <span>{new Date(notif.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationRead(notif.id);
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-[#0B0F19] border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Audio Chime: {settings.enableSound ? 'Aktif' : 'Mati'}</span>
          <span>Pengingat Istirahat: Tiap {settings.breakReminderMinutes} Menit</span>
        </div>
      </div>
    </div>
  );
};
