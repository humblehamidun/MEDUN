import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ActiveTimer,
  JobCategory,
  PriorityLevel,
  ReminderNotification,
  Task,
  UserSettings,
  QuickNote,
  QuickNoteColor,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_TASKS,
  INITIAL_SETTINGS,
  INITIAL_QUICK_NOTES,
} from '../data/initialData';
import { getTodayString } from '../utils/dateUtils';
import { triggerSystemNotification } from '../utils/notification';
import { soundChime } from '../utils/audio';

interface WorkContextType {
  categories: JobCategory[];
  tasks: Task[];
  activeTimer: ActiveTimer | null;
  currentRunningElapsed: number; // in seconds
  activeTask: Task | null;
  notifications: ReminderNotification[];
  unreadNotificationCount: number;
  settings: UserSettings;
  
  // Category management
  addCategory: (category: Omit<JobCategory, 'id' | 'createdAt'>) => JobCategory;
  updateCategory: (id: string, updates: Partial<JobCategory>) => void;
  deleteCategory: (id: string) => boolean;

  // Task management
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualDurationSeconds' | 'timeLogs'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  duplicateTaskToDate: (id: string, targetDate: string) => void;

  // Time Tracking
  startTimer: (taskId: string, mode?: 'count_up' | 'pomodoro', pomodoroTargetMinutes?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (note?: string) => void;
  addManualTimeLog: (taskId: string, durationSeconds: number, note?: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  sendTestNotification: () => void;

  // Quick Notes / Catatan Kecil
  quickNotes: QuickNote[];
  addQuickNote: (content: string, color?: QuickNoteColor) => QuickNote;
  updateQuickNote: (id: string, updates: Partial<QuickNote>) => void;
  deleteQuickNote: (id: string) => void;
  togglePinQuickNote: (id: string) => void;
  convertNoteToTask: (noteId: string, categoryId?: string, priority?: PriorityLevel) => Task;

  // Settings & Storage
  updateSettings: (updates: Partial<UserSettings>) => void;
  resetToInitialData: () => void;
}

const STORAGE_KEYS = {
  CATEGORIES: 'kerjaalur_categories_v1',
  TASKS: 'kerjaalur_tasks_v1',
  ACTIVE_TIMER: 'kerjaalur_timer_v1',
  NOTIFICATIONS: 'kerjaalur_notifications_v1',
  SETTINGS: 'kerjaalur_settings_v1',
  QUICK_NOTES: 'kerjaalur_quick_notes_v1',
};

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Categories State
  const [categories, setCategories] = useState<JobCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // 2. Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // 3. Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // 4. Notifications State
  const [notifications, setNotifications] = useState<ReminderNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome-notif',
          title: 'Selamat Datang di KerjaAlur!',
          message: 'Sistem pencatatan waktu dan manajemen prioritas pekerjaan Anda siap digunakan.',
          timestamp: new Date().toISOString(),
          type: 'system',
          isRead: false,
        }
      ];
    } catch {
      return [];
    }
  });

  // 5. Active Timer State
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 6. Quick Notes / Catatan Kecil State
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUICK_NOTES);
      return saved ? JSON.parse(saved) : INITIAL_QUICK_NOTES;
    } catch {
      return INITIAL_QUICK_NOTES;
    }
  });

  const [currentRunningElapsed, setCurrentRunningElapsed] = useState<number>(0);
  const breakNotifiedRef = useRef<boolean>(false);

  // Sync states to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed saving categories to storage:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed saving tasks to storage:', e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed saving settings to storage:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed saving notifications to storage:', e);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUICK_NOTES, JSON.stringify(quickNotes));
    } catch (e) {
      console.warn('Failed saving quick notes to storage:', e);
    }
  }, [quickNotes]);

  useEffect(() => {
    try {
      if (activeTimer) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(activeTimer));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TIMER);
      }
    } catch (e) {
      console.warn('Failed saving active timer to storage:', e);
    }
  }, [activeTimer]);

  // Find active task
  const activeTask = activeTimer ? tasks.find((t) => t.id === activeTimer.taskId) || null : null;

  // Running timer interval ticker
  useEffect(() => {
    if (!activeTimer) {
      setCurrentRunningElapsed(0);
      return;
    }

    const calculateCurrentElapsed = () => {
      if (activeTimer.isRunning) {
        const added = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        return activeTimer.elapsedBefore + Math.max(0, added);
      }
      return activeTimer.elapsedBefore;
    };

    setCurrentRunningElapsed(calculateCurrentElapsed());

    if (!activeTimer.isRunning) return;

    const interval = setInterval(() => {
      const elapsed = calculateCurrentElapsed();
      setCurrentRunningElapsed(elapsed);

      // Check break reminder
      const breakLimitSeconds = (settings.breakReminderMinutes || 50) * 60;
      if (elapsed >= breakLimitSeconds && !breakNotifiedRef.current) {
        breakNotifiedRef.current = true;
        const breakNotif: ReminderNotification = {
          id: `break-${Date.now()}`,
          taskId: activeTimer.taskId,
          title: 'Waktunya Istirahat Sejenak!',
          message: `Anda telah fokus bekerja selama ${settings.breakReminderMinutes} menit. Berdirilah, regangkan badan, dan minum air putih agar tetap bugar.`,
          timestamp: new Date().toISOString(),
          type: 'break_reminder',
          isRead: false,
        };
        setNotifications((prev) => [breakNotif, ...prev]);
        triggerSystemNotification(breakNotif, settings.enableSound, settings.enableBrowserNotifications);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, settings.breakReminderMinutes, settings.enableSound, settings.enableBrowserNotifications]);

  // Periodic Reminder Checker for task deadlines and custom reminder times (runs every 15s)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = getTodayString();

      tasks.forEach((task) => {
        if (task.status === 'completed' || task.isReminderDismissed) return;
        if (task.date !== todayStr) return;

        // 1. Explicit reminderTime match
        if (task.reminderTime && task.reminderTime === currentTimeStr) {
          const reminderId = `reminder-${task.id}-${currentTimeStr}`;
          setNotifications((prev) => {
            if (prev.some((n) => n.id === reminderId)) return prev;
            const newNotif: ReminderNotification = {
              id: reminderId,
              taskId: task.id,
              title: `Pengingat Tugas: ${task.title}`,
              message: `Jadwal pengingat tiba untuk pekerjaan "${task.title}". Tingkat Prioritas: ${task.priority}.`,
              timestamp: new Date().toISOString(),
              type: 'scheduled_reminder',
              isRead: false,
            };
            triggerSystemNotification(newNotif, settings.enableSound, settings.enableBrowserNotifications);
            return [newNotif, ...prev];
          });
        }

        // 2. Approaching Deadline (15 minutes before deadlineTime)
        if (task.deadlineTime) {
          const [dHours, dMins] = task.deadlineTime.split(':').map(Number);
          const deadlineTotalMinutes = dHours * 60 + dMins;
          const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
          const diffMinutes = deadlineTotalMinutes - currentTotalMinutes;

          if (diffMinutes === 15) {
            const deadlineNotifId = `deadline-15m-${task.id}-${task.deadlineTime}`;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === deadlineNotifId)) return prev;
              const newNotif: ReminderNotification = {
                id: deadlineNotifId,
                taskId: task.id,
                title: `Target Deadline Mendekat: ${task.title}`,
                message: `Target selesai dalam 15 menit (${task.deadlineTime}). Periksa progres pekerjaan Anda!`,
                timestamp: new Date().toISOString(),
                type: 'task_deadline',
                isRead: false,
              };
              triggerSystemNotification(newNotif, settings.enableSound, settings.enableBrowserNotifications);
              return [newNotif, ...prev];
            });
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [tasks, settings.enableSound, settings.enableBrowserNotifications]);

  // Categories CRUD
  const addCategory = (categoryData: Omit<JobCategory, 'id' | 'createdAt'>): JobCategory => {
    const newCat: JobCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<JobCategory>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCategory = (id: string): boolean => {
    // Check if category is used in active tasks
    const isUsed = tasks.some((t) => t.categoryId === id);
    if (isUsed) {
      alert('Kategori ini masih digunakan oleh sejumlah tugas. Silakan pindahkan tugas ke kategori lain sebelum menghapus.');
      return false;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Task CRUD
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualDurationSeconds' | 'timeLogs'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualDurationSeconds: 0,
      timeLogs: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    // Optional feedback chime
    if (settings.enableSound) {
      soundChime.playChime();
    }
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (id: string) => {
    if (activeTimer && activeTimer.taskId === id) {
      stopTimer();
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted && settings.enableSound) {
            soundChime.playSuccess();
          }
          // If completing active timer task, stop timer
          if (isNowCompleted && activeTimer && activeTimer.taskId === id) {
            stopTimer('Pekerjaan diselesaikan');
          }
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'pending',
          };
        }
        return t;
      })
    );
  };

  const duplicateTaskToDate = (id: string, targetDate: string) => {
    const source = tasks.find((t) => t.id === id);
    if (!source) return;
    const newTask: Task = {
      ...source,
      id: `task-${Date.now()}`,
      date: targetDate,
      status: 'pending',
      actualDurationSeconds: 0,
      timeLogs: [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Timer actions
  const startTimer = (taskId: string, mode: 'count_up' | 'pomodoro' = 'count_up', pomodoroTargetMinutes?: number) => {
    // If another timer is running, stop it and log its time first
    if (activeTimer && activeTimer.taskId !== taskId) {
      stopTimer('Beralih ke pekerjaan lain');
    }

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Mark task as in_progress if pending
    if (task.status === 'pending') {
      updateTask(taskId, { status: 'in_progress' });
    }

    breakNotifiedRef.current = false;
    setActiveTimer({
      taskId,
      startTime: Date.now(),
      elapsedBefore: 0,
      isRunning: true,
      mode,
      pomodoroTargetMinutes: pomodoroTargetMinutes || 25,
    });
  };

  const pauseTimer = () => {
    if (!activeTimer || !activeTimer.isRunning) return;
    const added = Math.floor((Date.now() - activeTimer.startTime) / 1000);
    setActiveTimer({
      ...activeTimer,
      isRunning: false,
      elapsedBefore: activeTimer.elapsedBefore + Math.max(0, added),
    });
  };

  const resumeTimer = () => {
    if (!activeTimer || activeTimer.isRunning) return;
    setActiveTimer({
      ...activeTimer,
      isRunning: true,
      startTime: Date.now(),
    });
  };

  const stopTimer = (note?: string) => {
    if (!activeTimer) return;
    const added = activeTimer.isRunning
      ? Math.floor((Date.now() - activeTimer.startTime) / 1000)
      : 0;
    const sessionSeconds = activeTimer.elapsedBefore + Math.max(0, added);

    if (sessionSeconds > 0) {
      const targetTaskId = activeTimer.taskId;
      const logEntry = {
        id: `log-${Date.now()}`,
        startTime: new Date(Date.now() - sessionSeconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: sessionSeconds,
        note: note || (activeTimer.mode === 'pomodoro' ? 'Sesi Pomodoro fokus' : 'Sesi kerja aktif'),
      };

      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === targetTaskId) {
            return {
              ...t,
              actualDurationSeconds: t.actualDurationSeconds + sessionSeconds,
              timeLogs: [logEntry, ...t.timeLogs],
            };
          }
          return t;
        })
      );
    }

    setActiveTimer(null);
    setCurrentRunningElapsed(0);
    breakNotifiedRef.current = false;
  };

  const addManualTimeLog = (taskId: string, durationSeconds: number, note?: string) => {
    if (durationSeconds <= 0) return;
    const logEntry = {
      id: `log-${Date.now()}`,
      startTime: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      durationSeconds,
      note: note || 'Pencatatan waktu manual',
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            actualDurationSeconds: t.actualDurationSeconds + durationSeconds,
            timeLogs: [logEntry, ...t.timeLogs],
          };
        }
        return t;
      })
    );
  };

  // Notification management
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const sendTestNotification = () => {
    const testNotif: ReminderNotification = {
      id: `test-${Date.now()}`,
      title: 'Uji Coba Pengingat Disiplin',
      message: 'Sistem notifikasi pengingat & audio chime KerjaAlur berfungsi normal!',
      timestamp: new Date().toISOString(),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [testNotif, ...prev]);
    triggerSystemNotification(testNotif, settings.enableSound, settings.enableBrowserNotifications);
  };

  // Quick Notes / Catatan Cepat
  const addQuickNote = (content: string, color: QuickNoteColor = 'amber') => {
    const trimmed = content.trim();
    if (!trimmed) throw new Error('Catatan tidak boleh kosong');

    const newNote: QuickNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      content: trimmed,
      color,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuickNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const updateQuickNote = (id: string, updates: Partial<QuickNote>) => {
    setQuickNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
  };

  const deleteQuickNote = (id: string) => {
    setQuickNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const togglePinQuickNote = (id: string) => {
    setQuickNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const convertNoteToTask = (noteId: string, categoryId?: string, priority: PriorityLevel = 'Sedang'): Task => {
    const targetNote = quickNotes.find((n) => n.id === noteId);
    if (!targetNote) {
      throw new Error('Catatan tidak ditemukan');
    }

    const firstLine = targetNote.content.split('\n')[0].replace(/^[💡📌⚡📚🔗•\-\*]\s*/, '').trim();
    const taskTitle = firstLine.length > 80 ? firstLine.slice(0, 80) + '...' : firstLine;
    const taskDesc = targetNote.content;

    const catId = categoryId || categories[0]?.id || 'cat-dev';
    const createdTask = addTask({
      title: taskTitle || 'Tugas dari Catatan Cepat',
      description: taskDesc,
      categoryId: catId,
      priority,
      date: getTodayString(),
      estimatedMinutes: 30,
      status: 'pending',
    });

    // Remove the converted note
    deleteQuickNote(noteId);

    // Add in-app confirmation notification
    const convertNotif: ReminderNotification = {
      id: `convert-${Date.now()}`,
      title: 'Catatan Dialihkan ke Tugas',
      message: `"${taskTitle}" telah resmi dicatat dalam daftar tugas hari ini.`,
      timestamp: new Date().toISOString(),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [convertNotif, ...prev]);

    return createdTask;
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetToInitialData = () => {
    if (window.confirm('Apakah Anda yakin ingin memuat ulang contoh data awal? Tindakan ini akan mengembalikan tugas dan kategori ke kondisi default.')) {
      setCategories(INITIAL_CATEGORIES);
      setTasks(INITIAL_TASKS);
      setSettings(INITIAL_SETTINGS);
      setQuickNotes(INITIAL_QUICK_NOTES);
      setActiveTimer(null);
      setCurrentRunningElapsed(0);
      localStorage.clear();
    }
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <WorkContext.Provider
      value={{
        categories,
        tasks,
        activeTimer,
        currentRunningElapsed,
        activeTask,
        notifications,
        unreadNotificationCount,
        settings,
        addCategory,
        updateCategory,
        deleteCategory,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        duplicateTaskToDate,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        addManualTimeLog,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        sendTestNotification,
        quickNotes,
        addQuickNote,
        updateQuickNote,
        deleteQuickNote,
        togglePinQuickNote,
        convertNoteToTask,
        updateSettings,
        resetToInitialData,
      }}
    >
      {children}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (!context) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
};
