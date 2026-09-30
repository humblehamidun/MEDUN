export type PriorityLevel = 'Tinggi' | 'Sedang' | 'Rendah';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

export interface TimeLogEntry {
  id: string;
  startTime: string; // ISO string
  endTime?: string; // ISO string
  durationSeconds: number;
  note?: string;
}

export interface JobCategory {
  id: string;
  name: string;
  description: string;
  priority: PriorityLevel;
  color: string; // Hex color code or Tailwind identifier
  targetHoursPerWeek: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: PriorityLevel;
  date: string; // YYYY-MM-DD
  estimatedMinutes: number;
  actualDurationSeconds: number;
  status: TaskStatus;
  deadlineTime?: string; // HH:mm
  reminderTime?: string; // HH:mm
  timeLogs: TimeLogEntry[];
  isReminderDismissed?: boolean;
  createdAt: string;
}

export interface ActiveTimer {
  taskId: string;
  startTime: number; // Date.now() timestamp
  elapsedBefore: number; // seconds prior to this run
  isRunning: boolean;
  mode: 'count_up' | 'pomodoro';
  pomodoroTargetMinutes?: number;
}

export interface ReminderNotification {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  type: 'task_deadline' | 'scheduled_reminder' | 'break_reminder' | 'daily_review' | 'system';
  isRead: boolean;
}

export interface UserSettings {
  dailyWorkGoalHours: number;
  enableSound: boolean;
  enableBrowserNotifications: boolean;
  breakReminderMinutes: number; // e.g., 25 or 50
  morningReviewTime: string; // e.g. "08:30"
  eveningReviewTime: string; // e.g. "17:00"
  autoZenOnTimerStart?: boolean;
  zenTheme?: 'dark' | 'slate' | 'light' | 'warm';
}

export type QuickNoteColor = 'amber' | 'indigo' | 'emerald' | 'rose' | 'purple' | 'slate';

export interface QuickNote {
  id: string;
  content: string;
  color: QuickNoteColor;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyFocus {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  taskId?: string;
  isCompleted: boolean;
  completedAt?: string;
  motivationNote?: string;
  createdAt: string;
}
