import { Task, JobCategory } from '../types';
import { formatDuration, formatDurationHoursDecimal, formatIndonesianDate } from './dateUtils';

export interface DailyCSVExportOptions {
  includeSessionDetails?: boolean;
  includeSummaryRow?: boolean;
  statusLabelMap?: Record<string, string>;
}

const DEFAULT_STATUS_LABELS: Record<string, string> = {
  completed: 'Selesai',
  in_progress: 'Sedang Dikerjakan',
  pending: 'Belum Dimulai',
  on_hold: 'Ditunda',
};

/**
 * Escapes a single CSV field value according to RFC 4180
 */
export function escapeCSVField(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  // If value contains comma, quotes, newline, or carriage return, enclose in quotes and escape quotes
  if (/[",\r\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Downloads a string as a CSV file with UTF-8 BOM so Excel / Google Sheets display characters properly
 */
export function triggerCSVDownload(csvContent: string, filename: string): void {
  // Prepend UTF-8 Byte Order Mark (BOM) to guarantee Indonesian characters and UTF-8 encoding in Microsoft Excel
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Generates and downloads a CSV report for daily work activities on a specific date
 */
export function exportDailyTasksToCSV(
  tasks: Task[],
  categories: JobCategory[],
  date: string,
  options: DailyCSVExportOptions = {}
): { count: number; filename: string; totalSeconds: number } {
  const {
    includeSessionDetails = true,
    includeSummaryRow = true,
    statusLabelMap = DEFAULT_STATUS_LABELS,
  } = options;

  // Filter tasks for the target date
  const dayTasks = tasks.filter((t) => t.date === date);

  const categoryMap = new Map<string, JobCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  // CSV Headers
  const headers = [
    'No',
    'ID Tugas',
    'Tanggal',
    'Judul Pekerjaan',
    'Deskripsi / Catatan',
    'Kategori',
    'Prioritas',
    'Status',
    'Batas Waktu (Deadline)',
    'Waktu Pengingat',
    'Estimasi Waktu (Menit)',
    'Durasi Aktual (Detik)',
    'Durasi Terlacak (Format Waktu)',
    'Durasi Terlacak (Jam Desimal)',
    'Jumlah Sesi Waktu',
  ];

  if (includeSessionDetails) {
    headers.push('Rincian Riwayat Sesi Timer', 'Waktu Dibuat');
  } else {
    headers.push('Waktu Dibuat');
  }

  let totalDurationSeconds = 0;
  let totalEstimatedMinutes = 0;
  let completedCount = 0;

  // Build task data rows
  const rows: string[] = [];

  dayTasks.forEach((task, index) => {
    totalDurationSeconds += task.actualDurationSeconds;
    totalEstimatedMinutes += task.estimatedMinutes;
    if (task.status === 'completed') completedCount++;

    const category = categoryMap.get(task.categoryId);
    const categoryName = category ? category.name : 'Umum';
    const statusText = statusLabelMap[task.status] || task.status;
    const formattedDuration = formatDuration(task.actualDurationSeconds);
    const hoursDecimal = formatDurationHoursDecimal(task.actualDurationSeconds);

    // Format session logs if available
    let sessionDetailsStr = '';
    if (includeSessionDetails && task.timeLogs && task.timeLogs.length > 0) {
      sessionDetailsStr = task.timeLogs
        .map((log, i) => {
          const start = log.startTime ? new Date(log.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
          const end = log.endTime ? new Date(log.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Berjalan';
          const dur = formatDuration(log.durationSeconds);
          const note = log.note ? ` [Catatan: ${log.note}]` : '';
          return `Sesi ${i + 1}: ${start}-${end} (${dur})${note}`;
        })
        .join('; ');
    } else {
      sessionDetailsStr = task.timeLogs?.length ? `${task.timeLogs.length} sesi` : '0 sesi';
    }

    const createdFormatted = task.createdAt
      ? new Date(task.createdAt).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    const rowData = [
      escapeCSVField(index + 1),
      escapeCSVField(task.id),
      escapeCSVField(task.date),
      escapeCSVField(task.title),
      escapeCSVField(task.description || '-'),
      escapeCSVField(categoryName),
      escapeCSVField(task.priority),
      escapeCSVField(statusText),
      escapeCSVField(task.deadlineTime || '-'),
      escapeCSVField(task.reminderTime || '-'),
      escapeCSVField(task.estimatedMinutes),
      escapeCSVField(task.actualDurationSeconds),
      escapeCSVField(formattedDuration),
      escapeCSVField(hoursDecimal),
      escapeCSVField(task.timeLogs?.length || 0),
    ];

    if (includeSessionDetails) {
      rowData.push(escapeCSVField(sessionDetailsStr), escapeCSVField(createdFormatted));
    } else {
      rowData.push(escapeCSVField(createdFormatted));
    }

    rows.push(rowData.join(','));
  });

  // Optional summary row at bottom
  if (includeSummaryRow && dayTasks.length > 0) {
    rows.push(''); // blank separator line
    const completionPercent = Math.round((completedCount / dayTasks.length) * 100);
    const summaryData = [
      escapeCSVField('RINGKASAN HARIAN'),
      escapeCSVField(`Total ${dayTasks.length} Tugas`),
      escapeCSVField(date),
      escapeCSVField(`Selesai: ${completedCount}/${dayTasks.length} (${completionPercent}%)`),
      escapeCSVField(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField(totalEstimatedMinutes),
      escapeCSVField(totalDurationSeconds),
      escapeCSVField(formatDuration(totalDurationSeconds)),
      escapeCSVField(formatDurationHoursDecimal(totalDurationSeconds)),
      escapeCSVField('-'),
    ];
    if (includeSessionDetails) {
      summaryData.push(escapeCSVField('-'), escapeCSVField('-'));
    } else {
      summaryData.push(escapeCSVField('-'));
    }
    rows.push(summaryData.join(','));
  }

  const csvBody = [headers.join(','), ...rows].join('\r\n');
  const filename = `Laporan_Aktivitas_Harian_${date}.csv`;

  triggerCSVDownload(csvBody, filename);

  return {
    count: dayTasks.length,
    filename,
    totalSeconds: totalDurationSeconds,
  };
}

/**
 * Generates and downloads a complete backup CSV containing all tasks across all dates
 */
export function exportAllWorkHistoryToCSV(
  tasks: Task[],
  categories: JobCategory[]
): { count: number; filename: string; totalSeconds: number } {
  const categoryMap = new Map<string, JobCategory>();
  categories.forEach((c) => categoryMap.set(c.id, c));

  const headers = [
    'No',
    'ID Tugas',
    'Tanggal',
    'Judul Pekerjaan',
    'Deskripsi / Catatan',
    'Kategori',
    'Prioritas',
    'Status',
    'Batas Waktu',
    'Waktu Pengingat',
    'Estimasi (Menit)',
    'Durasi Terlacak (Detik)',
    'Durasi Terlacak (Format Waktu)',
    'Durasi Terlacak (Jam Desimal)',
    'Jumlah Sesi',
    'Rincian Riwayat Sesi Timer',
    'Waktu Dibuat',
  ];

  // Sort tasks chronologically by date descending, then time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  });

  let totalDurationSeconds = 0;
  const rows: string[] = [];

  sortedTasks.forEach((task, index) => {
    totalDurationSeconds += task.actualDurationSeconds;
    const category = categoryMap.get(task.categoryId);
    const categoryName = category ? category.name : 'Umum';
    const statusText = DEFAULT_STATUS_LABELS[task.status] || task.status;
    const formattedDuration = formatDuration(task.actualDurationSeconds);
    const hoursDecimal = formatDurationHoursDecimal(task.actualDurationSeconds);

    let sessionDetailsStr = '';
    if (task.timeLogs && task.timeLogs.length > 0) {
      sessionDetailsStr = task.timeLogs
        .map((log, i) => {
          const start = log.startTime ? new Date(log.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
          const end = log.endTime ? new Date(log.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Berjalan';
          const dur = formatDuration(log.durationSeconds);
          const note = log.note ? ` [Catatan: ${log.note}]` : '';
          return `Sesi ${i + 1}: ${start}-${end} (${dur})${note}`;
        })
        .join('; ');
    } else {
      sessionDetailsStr = '0 sesi';
    }

    const createdFormatted = task.createdAt
      ? new Date(task.createdAt).toLocaleString('id-ID', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-';

    const rowData = [
      escapeCSVField(index + 1),
      escapeCSVField(task.id),
      escapeCSVField(task.date),
      escapeCSVField(task.title),
      escapeCSVField(task.description || '-'),
      escapeCSVField(categoryName),
      escapeCSVField(task.priority),
      escapeCSVField(statusText),
      escapeCSVField(task.deadlineTime || '-'),
      escapeCSVField(task.reminderTime || '-'),
      escapeCSVField(task.estimatedMinutes),
      escapeCSVField(task.actualDurationSeconds),
      escapeCSVField(formattedDuration),
      escapeCSVField(hoursDecimal),
      escapeCSVField(task.timeLogs?.length || 0),
      escapeCSVField(sessionDetailsStr),
      escapeCSVField(createdFormatted),
    ];

    rows.push(rowData.join(','));
  });

  // Summary row
  rows.push('');
  const completedCount = sortedTasks.filter((t) => t.status === 'completed').length;
  const completionPercent = sortedTasks.length > 0 ? Math.round((completedCount / sortedTasks.length) * 100) : 0;
  
  rows.push(
    [
      escapeCSVField('CADANGAN KESELURUHAN DATA'),
      escapeCSVField(`Total ${sortedTasks.length} Tugas`),
      escapeCSVField('Semua Tanggal'),
      escapeCSVField(`Selesai: ${completedCount}/${sortedTasks.length} (${completionPercent}%)`),
      escapeCSVField(`Diekspor pada: ${new Date().toLocaleString('id-ID')}`),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField(totalDurationSeconds),
      escapeCSVField(formatDuration(totalDurationSeconds)),
      escapeCSVField(formatDurationHoursDecimal(totalDurationSeconds)),
      escapeCSVField('-'),
      escapeCSVField('-'),
      escapeCSVField('-'),
    ].join(',')
  );

  const csvBody = [headers.join(','), ...rows].join('\r\n');
  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `Cadangan_Seluruh_Aktivitas_Kerja_${todayStr}.csv`;

  triggerCSVDownload(csvBody, filename);

  return {
    count: sortedTasks.length,
    filename,
    totalSeconds: totalDurationSeconds,
  };
}
