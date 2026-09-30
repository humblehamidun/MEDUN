import React, { useState } from 'react';
import {
  Lightbulb,
  Pin,
  Plus,
  Trash2,
  Edit3,
  Check,
  Copy,
  ArrowUpRight,
  Sparkles,
  Tag,
  X,
  Bookmark,
} from 'lucide-react';
import { useWork } from '../context/WorkContext';
import { QuickNote, QuickNoteColor, PriorityLevel } from '../types';

interface QuickNotesCardProps {
  onOpenNewTaskModal?: () => void;
}

const COLOR_CONFIG: Record<
  QuickNoteColor,
  {
    bg: string;
    border: string;
    text: string;
    pill: string;
    dot: string;
    label: string;
  }
> = {
  amber: {
    bg: 'bg-amber-950/20 hover:bg-amber-950/30',
    border: 'border-amber-500/30 hover:border-amber-500/50',
    text: 'text-amber-200',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    label: 'Ide / Amber',
  },
  indigo: {
    bg: 'bg-indigo-950/20 hover:bg-indigo-950/30',
    border: 'border-indigo-500/30 hover:border-indigo-500/50',
    text: 'text-indigo-200',
    pill: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-400',
    label: 'Fokus / Indigo',
  },
  emerald: {
    bg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
    border: 'border-emerald-500/30 hover:border-emerald-500/50',
    text: 'text-emerald-200',
    pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    label: 'Selesai / Emerald',
  },
  rose: {
    bg: 'bg-rose-950/20 hover:bg-rose-950/30',
    border: 'border-rose-500/30 hover:border-rose-500/50',
    text: 'text-rose-200',
    pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    label: 'Penting / Rose',
  },
  purple: {
    bg: 'bg-purple-950/20 hover:bg-purple-950/30',
    border: 'border-purple-500/30 hover:border-purple-500/50',
    text: 'text-purple-200',
    pill: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    dot: 'bg-purple-400',
    label: 'Riset / Purple',
  },
  slate: {
    bg: 'bg-slate-900/60 hover:bg-slate-900/80',
    border: 'border-slate-700/60 hover:border-slate-600',
    text: 'text-slate-300',
    pill: 'bg-slate-800 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    label: 'Netral / Slate',
  },
};

export const QuickNotesCard: React.FC<QuickNotesCardProps> = () => {
  const {
    quickNotes,
    addQuickNote,
    updateQuickNote,
    deleteQuickNote,
    togglePinQuickNote,
    convertNoteToTask,
    categories,
  } = useWork();

  const [inputContent, setInputContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<QuickNoteColor>('amber');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'pinned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Convert to task modal / dropdown state
  const [convertingNote, setConvertingNote] = useState<QuickNote | null>(null);
  const [selectedCategoryForTask, setSelectedCategoryForTask] = useState<string>(
    categories[0]?.id || ''
  );
  const [selectedPriorityForTask, setSelectedPriorityForTask] = useState<PriorityLevel>('Sedang');

  // Handle Add
  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    addQuickNote(inputContent, selectedColor);
    setInputContent('');
  };

  // Keyboard shortcut for adding: Ctrl/Cmd + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleAddNote();
    }
  };

  // Start Edit
  const handleStartEdit = (note: QuickNote) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  // Save Edit
  const handleSaveEdit = (id: string) => {
    if (!editingContent.trim()) {
      deleteQuickNote(id);
    } else {
      updateQuickNote(id, { content: editingContent });
    }
    setEditingNoteId(null);
    setEditingContent('');
  };

  // Copy Content
  const handleCopy = (note: QuickNote) => {
    navigator.clipboard.writeText(note.content);
    setCopiedId(note.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === note.id ? null : curr));
    }, 2000);
  };

  // Confirm Convert to Task
  const handleExecuteConvert = () => {
    if (!convertingNote) return;
    convertNoteToTask(convertingNote.id, selectedCategoryForTask, selectedPriorityForTask);
    setConvertingNote(null);
  };

  // Filtered & Sorted Notes: Pinned first, then by date descending
  const filteredNotes = quickNotes
    .filter((note) => {
      if (filterMode === 'pinned' && !note.isPinned) return false;
      if (searchQuery.trim()) {
        return note.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const pinnedCount = quickNotes.filter((n) => n.isPinned).length;

  return (
    <div className="bg-[#111726]/80 backdrop-blur-md rounded-2xl border border-slate-800/90 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Catatan Cepat & Memo</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 border border-slate-700 text-slate-300">
                {quickNotes.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tulis ide kilat atau memo saat bekerja tanpa membuat tugas formal
            </p>
          </div>
        </div>

        {/* Filter / Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterMode === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Semua ({quickNotes.length})
          </button>
          <button
            onClick={() => setFilterMode('pinned')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              filterMode === 'pinned'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>Disematkan ({pinnedCount})</span>
          </button>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddNote} className="mt-4">
        <div className="relative rounded-xl border border-slate-700/80 bg-[#0B0F19]/90 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
          <textarea
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis ide kilat, link referensi, atau memo instan... (Ctrl+Enter untuk simpan)"
            rows={2}
            className="w-full bg-transparent px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none"
          />

          {/* Quick preset helpers and Color Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/60 border-t border-slate-800/80 rounded-b-xl">
            {/* Color pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 mr-1 flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" /> Warna:
              </span>
              {(Object.keys(COLOR_CONFIG) as QuickNoteColor[]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === c
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0B0F19] scale-110'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      c === 'amber'
                        ? '#f59e0b'
                        : c === 'indigo'
                        ? '#6366f1'
                        : c === 'emerald'
                        ? '#10b981'
                        : c === 'rose'
                        ? '#f43f5e'
                        : c === 'purple'
                        ? '#a855f7'
                        : '#64748b',
                  }}
                  title={COLOR_CONFIG[c].label}
                />
              ))}
            </div>

            {/* Quick prefix insertion buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setInputContent((prev) => (prev ? `💡 ${prev}` : '💡 '))}
                className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                title="Tambahkan ikon Ide"
              >
                💡 Ide
              </button>
              <button
                type="button"
                onClick={() => setInputContent((prev) => (prev ? `📌 ${prev}` : '📌 '))}
                className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                title="Tambahkan ikon Pengingat"
              >
                📌 Ingat
              </button>
              <button
                type="button"
                onClick={() => setInputContent((prev) => (prev ? `⚡ ${prev}` : '⚡ '))}
                className="px-2 py-0.5 text-[10px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                title="Tambahkan ikon Cepat"
              >
                ⚡ Cepat
              </button>
              <button
                type="submit"
                disabled={!inputContent.trim()}
                className="ml-2 flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Search Bar if > 3 notes */}
      {quickNotes.length > 3 && (
        <div className="mt-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dalam catatan..."
            className="w-full bg-[#0B0F19]/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}

      {/* Notes Grid / List */}
      <div className="mt-4 space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 rounded-xl border border-dashed border-slate-800/80 bg-slate-900/20">
            <Sparkles className="w-6 h-6 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              {searchQuery
                ? 'Tidak ada catatan yang cocok dengan pencarian.'
                : filterMode === 'pinned'
                ? 'Belum ada catatan yang disematkan.'
                : 'Belum ada catatan kecil.'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Gunakan kotak di atas untuk mencatat ide spontan atau pengingat tanpa tekanan membuat tugas formal.
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => {
            const config = COLOR_CONFIG[note.color] || COLOR_CONFIG.amber;
            const isEditing = editingNoteId === note.id;

            return (
              <div
                key={note.id}
                className={`group relative rounded-xl border p-3 transition-all duration-200 ${config.bg} ${config.border} shadow-sm`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={3}
                      className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                      >
                        <Check className="w-3.5 h-3.5" /> Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Top note header info: pin status, color dot, actions */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                        {note.isPinned && (
                          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            <Pin className="w-2.5 h-2.5 fill-amber-400" /> Disematkan
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(note.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>

                      {/* Action buttons (hover or mobile visible) */}
                      <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => togglePinQuickNote(note.id)}
                          className={`p-1 rounded-md transition-colors ${
                            note.isPinned
                              ? 'text-amber-400 bg-amber-500/20'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                          title={note.isPinned ? 'Lepas sematan' : 'Sematkan ke atas'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-400' : ''}`} />
                        </button>

                        <button
                          onClick={() => handleCopy(note)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                          title="Salin teks catatan"
                        >
                          {copiedId === note.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleStartEdit(note)}
                          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                          title="Edit catatan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => deleteQuickNote(note.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                          title="Hapus catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                      {note.content}
                    </p>

                    {/* Bottom Action: 1-Click Convert to Formal Task */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* Change color quickly */}
                        {(['amber', 'indigo', 'emerald', 'rose', 'slate'] as QuickNoteColor[]).map((c) => (
                          <button
                            key={c}
                            onClick={() => updateQuickNote(note.id, { color: c })}
                            className={`w-2.5 h-2.5 rounded-full transition-transform ${
                              note.color === c ? 'scale-125 ring-1 ring-white' : 'opacity-40 hover:opacity-100'
                            }`}
                            style={{
                              backgroundColor:
                                c === 'amber'
                                  ? '#f59e0b'
                                  : c === 'indigo'
                                  ? '#6366f1'
                                  : c === 'emerald'
                                  ? '#10b981'
                                  : c === 'rose'
                                  ? '#f43f5e'
                                  : '#64748b',
                            }}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setConvertingNote(note);
                          setSelectedCategoryForTask(categories[0]?.id || '');
                        }}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                        title="Ubah memo ini menjadi tugas kerja formal di daftar harian"
                      >
                        <span>Jadikan Tugas</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Convert to Task Dialog / Overlay */}
      {convertingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#111726] border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Konversi Memo Menjadi Tugas Formal</h3>
              </div>
              <button
                onClick={() => setConvertingNote(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800 text-xs text-slate-300 italic line-clamp-3">
              "{convertingNote.content}"
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pilih Jenis Pekerjaan (Kategori):
                </label>
                <select
                  value={selectedCategoryForTask}
                  onChange={(e) => setSelectedCategoryForTask(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.priority})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tingkat Prioritas:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Tinggi', 'Sedang', 'Rendah'] as PriorityLevel[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriorityForTask(p)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        selectedPriorityForTask === p
                          ? p === 'Tinggi'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-xs'
                            : p === 'Sedang'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                          : 'bg-[#0B0F19] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setConvertingNote(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteConvert}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Sebagai Tugas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
