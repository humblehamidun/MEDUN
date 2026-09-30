import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { Task } from '../types';

interface ManualTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export const ManualTimeLogModal: React.FC<ManualTimeLogModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { addManualTimeLog } = useWork();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState('');

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = (hours * 3600) + (minutes * 60);
    if (totalSeconds <= 0) return;

    addManualTimeLog(task.id, totalSeconds, note.trim() || undefined);
    onClose();
    setHours(0);
    setMinutes(30);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#111726] rounded-2xl shadow-2xl max-w-md w-full border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold font-display text-white">Catat Waktu Kerja Manual</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Durasi Waktu yang Dihabiskan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium mb-1 block">Jam</span>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-white"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium mb-1 block">Menit</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            {[15, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setHours(Math.floor(m / 60));
                  setMinutes(m % 60);
                }}
                className="px-2.5 py-1 text-xs bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-lg transition-colors font-mono"
              >
                {m}m
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan Sesi Kerja (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Sesi revisi desain atau analisa hasil testing"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              Simpan Durasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
