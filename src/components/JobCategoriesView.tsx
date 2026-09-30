import React, { useState } from 'react';
import {
  Plus,
  Tag,
  Clock,
  CheckCircle2,
  Edit,
  Trash2,
  AlertTriangle,
  Play,
  Search,
  Filter,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { formatDuration, formatDurationHoursDecimal } from '../utils/dateUtils';
import { JobCategory, PriorityLevel } from '../types';

interface JobCategoriesViewProps {
  onOpenNewCategoryModal: () => void;
  onEditCategory: (category: JobCategory) => void;
  onAddTaskWithCategory: (categoryId: string) => void;
}

export const JobCategoriesView: React.FC<JobCategoriesViewProps> = ({
  onOpenNewCategoryModal,
  onEditCategory,
  onAddTaskWithCategory,
}) => {
  const { categories, tasks, deleteCategory } = useWork();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cat.name.toLowerCase().includes(q);
      const matchDesc = cat.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (priorityFilter !== 'all' && cat.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Manajemen Jenis Pekerjaan & Prioritas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Definisikan dan inputkan jenis pekerjaan apa saja sesuai kebutuhan Anda beserta klasifikasi tingkat prioritasnya.
          </p>
        </div>

        <button
          onClick={onOpenNewCategoryModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Tambah Jenis Pekerjaan
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-3 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari jenis pekerjaan atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {/* Priority Segmented / Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Prioritas:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-[#0B0F19] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          // Calculate statistics for this category across all tasks
          const categoryTasks = tasks.filter((t) => t.categoryId === cat.id);
          const totalSeconds = categoryTasks.reduce((acc, t) => acc + t.actualDurationSeconds, 0);
          const completedTasks = categoryTasks.filter((t) => t.status === 'completed');
          const completionRate = categoryTasks.length > 0
            ? Math.round((completedTasks.length / categoryTasks.length) * 100)
            : 0;

          return (
            <div
              key={cat.id}
              className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: Color tag + Priority info */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        cat.priority === 'Tinggi'
                          ? 'text-rose-400'
                          : cat.priority === 'Sedang'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      Prioritas {cat.priority}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCategory(cat)}
                      className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors"
                      title="Ubah Jenis Pekerjaan"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-md transition-colors"
                      title="Hapus Jenis Pekerjaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-base font-bold text-white font-display leading-snug">
                  {cat.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed min-h-[36px]">
                  {cat.description || 'Tidak ada deskripsi khusus.'}
                </p>

                {/* Stats Grid */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">Total Tugas</span>
                    <span className="font-bold text-white font-mono tabular-nums">
                      {categoryTasks.length}
                    </span>
                  </div>

                  <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">Waktu Terlacak</span>
                    <span className="font-bold text-white font-mono tabular-nums">
                      {formatDuration(totalSeconds)}
                    </span>
                  </div>

                  <div className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] text-slate-400 block">Selesai</span>
                    <span className="font-bold text-emerald-400 font-mono tabular-nums">
                      {completionRate}%
                    </span>
                  </div>
                </div>

                {/* Weekly Target Bar */}
                <div className="mt-3.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Target Mingguan: {cat.targetHoursPerWeek} Jam</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {formatDurationHoursDecimal(totalSeconds)}j terlacak
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300 shadow-sm"
                      style={{
                        backgroundColor: cat.color,
                        width: `${Math.min(100, Math.round((totalSeconds / 3600 / cat.targetHoursPerWeek) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action: Catat tugas di jenis pekerjaan ini */}
              <button
                onClick={() => onAddTaskWithCategory(cat.id)}
                className="mt-4 w-full py-2.5 px-3 text-xs font-semibold text-slate-300 hover:text-white bg-[#0B0F19] hover:bg-[#141B2D] border border-slate-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-400" /> Catat Tugas Pada Kategori Ini
              </button>
            </div>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-12 text-center text-slate-500">
          <Tag className="w-10 h-10 mx-auto stroke-1 mb-2 opacity-40 text-indigo-400" />
          <p className="text-sm font-semibold text-white">Tidak ada jenis pekerjaan yang cocok</p>
          <button
            onClick={onOpenNewCategoryModal}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            + Buat jenis pekerjaan baru
          </button>
        </div>
      )}
    </div>
  );
};
