const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDONESIAN_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

export function getTodayString(): string {
  // Use today's local date or fallback to default
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIndonesianDate(dateStr: string, options?: { withDayName?: boolean }): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);

  const d = new Date(year, month, day);
  const dayName = INDONESIAN_DAYS[d.getDay()];
  const monthName = INDONESIAN_MONTHS[month];

  if (options?.withDayName) {
    return `${dayName}, ${day} ${monthName} ${year}`;
  }
  return `${day} ${monthName} ${year}`;
}

export function formatIndonesianMonthYear(year: number, monthZeroIndexed: number): string {
  return `${INDONESIAN_MONTHS[monthZeroIndexed]} ${year}`;
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}j ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}d`;
  }
  return `${seconds}d`;
}

export function formatDurationHoursDecimal(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  return hours.toFixed(1);
}

export function formatClockTimer(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  if (hours > 0) {
    const hh = String(hours).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

export function getFirstDayOfWeek(year: number, monthZeroIndexed: number): number {
  // 0 = Sunday, 1 = Monday, etc.
  return new Date(year, monthZeroIndexed, 1).getDay();
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
