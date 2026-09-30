import React, { useState, useEffect } from 'react';
import { X, Tag, AlertTriangle, Clock, Palette } from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { JobCategory, PriorityLevel } from '../types';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: JobCategory | null;
}

const COLOR_PRESETS = [
  { label: 'Indigo', hex: '#4f46e5' },
  { label: 'Sky Blue', hex: '#0284c7' },
  { label: 'Emerald', hex: '#059669' },
  { label: 'Amber', hex: '#d97706' },
  { label: 'Rose Red', hex: '#e11d48' },
  { label: 'Violet', hex: '#7c3aed' },
  { label: 'Teal', hex: '#0d9488' },
  { label: 'Slate', hex: '#64748b' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
}) => {
  const { addCategory, updateCategory } = useWork();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Sedang');
  const [color, setColor] = useState('#4f46e5');
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(10);

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setDescription(categoryToEdit.description);
      setPriority(categoryToEdit.priority);
      setColor(categoryToEdit.color);
      setTargetHoursPerWeek(categoryToEdit.targetHoursPerWeek);
    } else {
      setName('');
      setDescription('');
      setPriority('Sedang');
      setColor('#4f46e5');
      setTargetHoursPerWeek(8);
    }
  }, [categoryToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (categoryToEdit) {
      updateCategory(categoryToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        priority,
        color,
        targetHoursPerWeek: Number(targetHoursPerWeek) || 8,
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        priority,
        color,
        targetHoursPerWeek: Number(targetHoursPerWeek) || 8,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#111726] rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div>
            <h3 className="text-base font-bold font-display text-white">
              {categoryToEdit ? 'Ubah Jenis Pekerjaan' : 'Tambah Jenis Pekerjaan Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klasifikasikan jenis pekerjaan Anda dengan tingkat prioritas & alokasi waktu
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
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Nama Jenis / Bidang Pekerjaan <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Riset Pasar, Perancangan Database, Content Writing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder:text-slate-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deskripsi & Cakupan Pekerjaan
            </label>
            <textarea
              rows={2}
              placeholder="Jelaskan jenis kegiatan apa saja yang masuk ke dalam kategori ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white placeholder:text-slate-500"
            />
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
              Klasifikasi Tingkat Prioritas Default
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Tinggi', 'Sedang', 'Rendah'] as PriorityLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriority(lvl)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    priority === lvl
                      ? lvl === 'Tinggi'
                        ? 'border-rose-500 bg-rose-950/60 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                        : lvl === 'Sedang'
                        ? 'border-amber-500 bg-amber-950/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'border-slate-600 bg-slate-800 text-slate-200'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Prioritas {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Setiap tugas yang memakai jenis pekerjaan ini akan otomatis menggunakan prioritas ini sebagai acuan awal.
            </p>
          </div>

          {/* Color & Target Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                Warna Penanda
              </label>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === c.hex ? 'scale-110 ring-2 ring-offset-2 ring-offset-slate-900 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Target Jam per Minggu
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={targetHoursPerWeek}
                  onChange={(e) => setTargetHoursPerWeek(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors text-white font-mono"
                />
                <span className="text-xs text-slate-400 font-medium">Jam</span>
              </div>
            </div>
          </div>

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
              {categoryToEdit ? 'Simpan Perubahan' : 'Buat Jenis Pekerjaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
