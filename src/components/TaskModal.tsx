import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle, Tag, Bell } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { PriorityLevel, Task, TaskStatus } from '../types';
import { getTodayString } from '../utils/dateUtils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultDate?: string;
  defaultCategoryId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultDate,
  defaultCategoryId,
}) => {
  const { categories, addTask, updateTask } = useWork();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Sedang');
  const [date, setDate] = useState(defaultDate || getTodayString());
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [deadlineTime, setDeadlineTime] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setDate(taskToEdit.date);
      setEstimatedMinutes(taskToEdit.estimatedMinutes);
      setDeadlineTime(taskToEdit.deadlineTime || '');
      setReminderTime(taskToEdit.reminderTime || '');
      setStatus(taskToEdit.status);
    } else {
      setTitle('');
      setDescription('');
      const initialCatId = defaultCategoryId || (categories.length > 0 ? categories[0].id : '');
      setCategoryId(initialCatId);
      const cat = categories.find((c) => c.id === initialCatId);
      setPriority(cat ? cat.priority : 'Sedang');
      setDate(defaultDate || getTodayString());
      setEstimatedMinutes(60);
      setDeadlineTime('');
      setReminderTime('');
      setStatus('pending');
    }
  }, [taskToEdit, isOpen, defaultDate, defaultCategoryId, categories]);

  // When category changes, auto-suggest its default priority
  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    const cat = categories.find((c) => c.id === newCatId);
    if (cat && !taskToEdit) {
      setPriority(cat.priority);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || (categories[0]?.id ?? ''),
        priority,
        date,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        deadlineTime: deadlineTime || undefined,
        reminderTime: reminderTime || undefined,
        status,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || (categories[0]?.id ?? ''),
        priority,
        date,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        deadlineTime: deadlineTime || undefined,
        reminderTime: reminderTime || undefined,
        status,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#111726] rounded-2xl shadow-2xl max-w-xl w-full border border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              {taskToEdit ? 'Ubah Rincian Pekerjaan' : 'Tambah Pekerjaan Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Catat tugas harian lengkap dengan target waktu dan pengingat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Judul Tugas / Pekerjaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Implementasi modul pembayaran API atau Review dokumen SOP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Catatan / Rincian Instruksi (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan poin penting, link referensi, atau hasil yang diharapkan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder:text-slate-500"
            />
          </div>

          {/* Category & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Jenis Pekerjaan
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.name} ({cat.priority})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0F19] border border-slate-800 rounded-xl">
                {(['Tinggi', 'Sedang', 'Rendah'] as PriorityLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      priority === lvl
                        ? lvl === 'Tinggi'
                          ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                          : lvl === 'Sedang'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                          : 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Estimated Minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Estimasi Durasi (Menit)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Math.max(5, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white font-mono"
              />
            </div>
          </div>

          {/* Schedule: Deadline & Reminder Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target Jam Selesai / Deadline
              </label>
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                Waktu Pengingat Notifikasi
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white"
              />
            </div>
          </div>

          {/* Status (if editing) */}
          {taskToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Status Pekerjaan
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'pending', label: 'Belum Dimulai' },
                  { key: 'in_progress', label: 'Berjalan' },
                  { key: 'completed', label: 'Selesai' },
                  { key: 'on_hold', label: 'Ditunda' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key as TaskStatus)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-xl border text-center transition-colors ${
                      status === s.key
                        ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 font-semibold shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
            >
              {taskToEdit ? 'Simpan Perubahan' : 'Tambahkan Pekerjaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
