import { JobCategory, Task, UserSettings, QuickNote } from '../types';

export const INITIAL_CATEGORIES: JobCategory[] = [
  {
    id: 'cat-dev',
    name: 'Pengembangan & Rekayasa Sistem',
    description: 'Coding, implementasi fitur, perbaikan bug, dan code review',
    priority: 'Tinggi',
    color: '#4f46e5', // indigo-600
    targetHoursPerWeek: 18,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-meeting',
    name: 'Koordinasi & Rapat Tim',
    description: 'Daily standup, evaluasi sprint, koordinasi lintas divisi, dan klien',
    priority: 'Sedang',
    color: '#0284c7', // sky-600
    targetHoursPerWeek: 6,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-doc',
    name: 'Penyusunan Dokumen & Laporan',
    description: 'Pembuatan laporan bulanan, dokumentasi arsitektur, dan ringkasan eksekutif',
    priority: 'Tinggi',
    color: '#059669', // emerald-600
    targetHoursPerWeek: 8,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-design',
    name: 'Desain UI/UX & Konsep Visual',
    description: 'Wireframing, prototyping di Figma, design system, dan usability testing',
    priority: 'Sedang',
    color: '#d97706', // amber-600
    targetHoursPerWeek: 6,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-admin',
    name: 'Administrasi & Penanganan Email',
    description: 'Penyortiran email masuk, pengajuan klaim, persuratan, dan inventarisasi',
    priority: 'Rendah',
    color: '#64748b', // slate-500
    targetHoursPerWeek: 4,
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'cat-research',
    name: 'Riset, Analitik & Belajar',
    description: 'Eksplorasi modul baru, analisis performa aplikasi, studi literatur',
    priority: 'Sedang',
    color: '#7c3aed', // violet-600
    targetHoursPerWeek: 4,
    createdAt: '2026-09-01T08:00:00Z',
  },
];

export const INITIAL_TASKS: Task[] = [
  // Today: 2026-09-30
  {
    id: 'task-30-1',
    title: 'Finalisasi Modul Otentikasi dan Dashboard Pengguna',
    description: 'Refactor hook useAuth dan integrasikan validasi formulir input.',
    categoryId: 'cat-dev',
    priority: 'Tinggi',
    date: '2026-09-30',
    estimatedMinutes: 120,
    actualDurationSeconds: 4800, // 1h 20m
    status: 'in_progress',
    deadlineTime: '15:00',
    reminderTime: '14:30',
    timeLogs: [
      {
        id: 'log-30-1',
        startTime: '2026-09-30T09:00:00Z',
        endTime: '2026-09-30T10:20:00Z',
        durationSeconds: 4800,
        note: 'Sesi fokus pagi: implementasi validasi token',
      },
    ],
    createdAt: '2026-09-30T07:45:00Z',
  },
  {
    id: 'task-30-2',
    title: 'Rapat Sinkronisasi Progres Akhir Kuartal',
    description: 'Penyampaian capaian KPI bulan September dan mitigasi kendala.',
    categoryId: 'cat-meeting',
    priority: 'Sedang',
    date: '2026-09-30',
    estimatedMinutes: 60,
    actualDurationSeconds: 3600, // 1h
    status: 'completed',
    deadlineTime: '11:00',
    reminderTime: '10:45',
    timeLogs: [
      {
        id: 'log-30-2',
        startTime: '2026-09-30T10:00:00Z',
        endTime: '2026-09-30T11:00:00Z',
        durationSeconds: 3600,
        note: 'Meeting daring bersama lead engineer & PM',
      },
    ],
    createdAt: '2026-09-30T08:00:00Z',
  },
  {
    id: 'task-30-3',
    title: 'Rekapitulasi Laporan Produktivitas Bulanan September',
    description: 'Export metrik tim dan buat visualisasi ringkasan dalam format PDF.',
    categoryId: 'cat-doc',
    priority: 'Tinggi',
    date: '2026-09-30',
    estimatedMinutes: 90,
    actualDurationSeconds: 0,
    status: 'pending',
    deadlineTime: '17:00',
    reminderTime: '16:00',
    timeLogs: [],
    createdAt: '2026-09-30T08:15:00Z',
  },
  {
    id: 'task-30-4',
    title: 'Pembersihan Inbox & Pengarsipan Berkas Proyek',
    description: 'Balas email vendor dan susun folder penyimpanan di cloud.',
    categoryId: 'cat-admin',
    priority: 'Rendah',
    date: '2026-09-30',
    estimatedMinutes: 30,
    actualDurationSeconds: 0,
    status: 'pending',
    deadlineTime: '18:00',
    timeLogs: [],
    createdAt: '2026-09-30T08:30:00Z',
  },

  // Yesterday: 2026-09-29
  {
    id: 'task-29-1',
    title: 'Optimasi Kueri Database & Pengurangan Waktu Muat',
    description: 'Tambahkan indeks pada tabel aktivitas dan audit payload respon.',
    categoryId: 'cat-dev',
    priority: 'Tinggi',
    date: '2026-09-29',
    estimatedMinutes: 180,
    actualDurationSeconds: 10800, // 3h
    status: 'completed',
    deadlineTime: '16:00',
    timeLogs: [
      {
        id: 'log-29-1',
        startTime: '2026-09-29T09:30:00Z',
        endTime: '2026-09-29T12:30:00Z',
        durationSeconds: 10800,
        note: 'Penambahan indexing & stress test',
      },
    ],
    createdAt: '2026-09-29T08:00:00Z',
  },
  {
    id: 'task-29-2',
    title: 'Review Wireframe & Design Flow Aplikasi Mobile',
    description: 'Cek konsistensi warna tombol dan spasi tipografi bersama UI desainer.',
    categoryId: 'cat-design',
    priority: 'Sedang',
    date: '2026-09-29',
    estimatedMinutes: 90,
    actualDurationSeconds: 5400, // 1.5h
    status: 'completed',
    deadlineTime: '14:30',
    timeLogs: [
      {
        id: 'log-29-2',
        startTime: '2026-09-29T13:30:00Z',
        endTime: '2026-09-29T15:00:00Z',
        durationSeconds: 5400,
      },
    ],
    createdAt: '2026-09-29T08:15:00Z',
  },
  {
    id: 'task-29-3',
    title: 'Pembaruan SOP Keamanan & Password Policy',
    description: 'Draft revisi dokumen panduan keamanan sandi karyawan.',
    categoryId: 'cat-doc',
    priority: 'Sedang',
    date: '2026-09-29',
    estimatedMinutes: 60,
    actualDurationSeconds: 4200, // 1h 10m
    status: 'completed',
    deadlineTime: '17:00',
    timeLogs: [
      {
        id: 'log-29-3',
        startTime: '2026-09-29T15:30:00Z',
        endTime: '2026-09-29T16:40:00Z',
        durationSeconds: 4200,
      },
    ],
    createdAt: '2026-09-29T08:30:00Z',
  },

  // 2026-09-28
  {
    id: 'task-28-1',
    title: 'Implementasi Komponen Grafis Produktivitas Interaktif',
    description: 'Pembuatan SVG visual chart untuk laporan mingguan dan bulanan.',
    categoryId: 'cat-dev',
    priority: 'Tinggi',
    date: '2026-09-28',
    estimatedMinutes: 150,
    actualDurationSeconds: 9000, // 2.5h
    status: 'completed',
    deadlineTime: '16:00',
    timeLogs: [
      {
        id: 'log-28-1',
        startTime: '2026-09-28T10:00:00Z',
        endTime: '2026-09-28T12:30:00Z',
        durationSeconds: 9000,
      },
    ],
    createdAt: '2026-09-28T08:00:00Z',
  },
  {
    id: 'task-28-2',
    title: 'Benchmarking Tools Notifikasi & Service Worker',
    description: 'Eksplorasi Web Audio API dan Web Notifications permission handling.',
    categoryId: 'cat-research',
    priority: 'Sedang',
    date: '2026-09-28',
    estimatedMinutes: 90,
    actualDurationSeconds: 5400, // 1.5h
    status: 'completed',
    deadlineTime: '15:00',
    timeLogs: [
      {
        id: 'log-28-2',
        startTime: '2026-09-28T13:30:00Z',
        endTime: '2026-09-28T15:00:00Z',
        durationSeconds: 5400,
      },
    ],
    createdAt: '2026-09-28T08:10:00Z',
  },
  {
    id: 'task-28-3',
    title: 'Standup Mingguan & Perencanaan Sprint 39',
    description: 'Prioritas backlog dan penugasan tiket minggu depan.',
    categoryId: 'cat-meeting',
    priority: 'Sedang',
    date: '2026-09-28',
    estimatedMinutes: 60,
    actualDurationSeconds: 3600,
    status: 'completed',
    deadlineTime: '10:00',
    timeLogs: [
      {
        id: 'log-28-3',
        startTime: '2026-09-28T09:00:00Z',
        endTime: '2026-09-28T10:00:00Z',
        durationSeconds: 3600,
      },
    ],
    createdAt: '2026-09-28T08:00:00Z',
  },

  // 2026-09-25
  {
    id: 'task-25-1',
    title: 'Sesi Desain Komprehensif Sistem Pengingat Tugas',
    description: 'Menyusun alur user experience notifikasi dan dialog preferensi pengingat.',
    categoryId: 'cat-design',
    priority: 'Tinggi',
    date: '2026-09-25',
    estimatedMinutes: 120,
    actualDurationSeconds: 7200,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-25-1',
        startTime: '2026-09-25T13:00:00Z',
        endTime: '2026-09-25T15:00:00Z',
        durationSeconds: 7200,
      },
    ],
    createdAt: '2026-09-25T08:00:00Z',
  },
  {
    id: 'task-25-2',
    title: 'Pengembangan Logika StopWatch & Pomodoro Multi-sesi',
    description: 'Memastikan timer tetap akurat dan menyinkronkan jeda dengan timestamp.',
    categoryId: 'cat-dev',
    priority: 'Tinggi',
    date: '2026-09-25',
    estimatedMinutes: 150,
    actualDurationSeconds: 9600,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-25-2',
        startTime: '2026-09-25T09:00:00Z',
        endTime: '2026-09-25T11:40:00Z',
        durationSeconds: 9600,
      },
    ],
    createdAt: '2026-09-25T08:00:00Z',
  },

  // 2026-09-24
  {
    id: 'task-24-1',
    title: 'Penyusunan Rencana Kategori Pekerjaan & Bobot Prioritas',
    description: 'Menetapkan standar klasifikasi Tinggi, Sedang, dan Rendah beserta alokasi jam.',
    categoryId: 'cat-doc',
    priority: 'Sedang',
    date: '2026-09-24',
    estimatedMinutes: 90,
    actualDurationSeconds: 5400,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-24-1',
        startTime: '2026-09-24T10:00:00Z',
        endTime: '2026-09-24T11:30:00Z',
        durationSeconds: 5400,
      },
    ],
    createdAt: '2026-09-24T08:00:00Z',
  },
  {
    id: 'task-24-2',
    title: 'Audit Kecepatan Render & Efisiensi Memori Komponen',
    description: 'Profil performa tab laporan bulanan dan pemilahan re-render berlebih.',
    categoryId: 'cat-dev',
    priority: 'Tinggi',
    date: '2026-09-24',
    estimatedMinutes: 120,
    actualDurationSeconds: 7800,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-24-2',
        startTime: '2026-09-24T13:30:00Z',
        endTime: '2026-09-24T15:40:00Z',
        durationSeconds: 7800,
      },
    ],
    createdAt: '2026-09-24T08:00:00Z',
  },

  // 2026-09-22
  {
    id: 'task-22-1',
    title: 'Testing Fitur Notifikasi Browser & Audio Synth Bell',
    description: 'Verifikasi volume suara, fall-back toast, dan izin notifikasi lintas peramban.',
    categoryId: 'cat-research',
    priority: 'Sedang',
    date: '2026-09-22',
    estimatedMinutes: 90,
    actualDurationSeconds: 6000,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-22-1',
        startTime: '2026-09-22T09:00:00Z',
        endTime: '2026-09-22T10:40:00Z',
        durationSeconds: 6000,
      },
    ],
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'task-22-2',
    title: 'Kompilasi Data Waktu Kerja Kuartal Sebelumnya',
    description: 'Menganalisis pola distribusi jam kerja tim engineering dan meeting load.',
    categoryId: 'cat-doc',
    priority: 'Sedang',
    date: '2026-09-22',
    estimatedMinutes: 120,
    actualDurationSeconds: 7200,
    status: 'completed',
    timeLogs: [
      {
        id: 'log-22-2',
        startTime: '2026-09-22T14:00:00Z',
        endTime: '2026-09-22T16:00:00Z',
        durationSeconds: 7200,
      },
    ],
    createdAt: '2026-09-22T08:00:00Z',
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  dailyWorkGoalHours: 7,
  enableSound: true,
  enableBrowserNotifications: true,
  breakReminderMinutes: 50,
  morningReviewTime: '08:30',
  eveningReviewTime: '17:00',
};

export const INITIAL_QUICK_NOTES: QuickNote[] = [
  {
    id: 'note-1',
    content: '💡 Ide: Buat template otomatis untuk laporan bulanan agar hemat 30 menit setiap penutupan sprint.',
    color: 'amber',
    isPinned: true,
    createdAt: '2026-09-30T07:15:00.000Z',
    updatedAt: '2026-09-30T07:15:00.000Z',
  },
  {
    id: 'note-2',
    content: '📌 Pengingat: Konfirmasi hasil review desain dashboard dengan tim klien sebelum presentasi Kamis.',
    color: 'rose',
    isPinned: true,
    createdAt: '2026-09-30T07:45:00.000Z',
    updatedAt: '2026-09-30T07:45:00.000Z',
  },
  {
    id: 'note-3',
    content: '⚡ Cek kembali latensi endpoint laporan analitik sebelum rilis versi produksi.',
    color: 'indigo',
    isPinned: false,
    createdAt: '2026-09-30T08:10:00.000Z',
    updatedAt: '2026-09-30T08:10:00.000Z',
  },
  {
    id: 'note-4',
    content: '📚 Baca artikel panduan time-boxing dan deep work Cal Newport untuk rekomendasi fitur fokus Zen.',
    color: 'emerald',
    isPinned: false,
    createdAt: '2026-09-30T08:30:00.000Z',
    updatedAt: '2026-09-30T08:30:00.000Z',
  },
];
