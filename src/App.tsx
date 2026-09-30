import React, { useState, useEffect } from 'react';
import { WorkProvider, useWork } from './context/WorkContext';
import { Navbar } from './components/Navbar';
import { ActiveTimerBar } from './components/ActiveTimerBar';
import { DashboardView } from './components/DashboardView';
import { DailyTasksView } from './components/DailyTasksView';
import { JobCategoriesView } from './components/JobCategoriesView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { TaskModal } from './components/TaskModal';
import { ManualTimeLogModal } from './components/ManualTimeLogModal';
import { CategoryModal } from './components/CategoryModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { SettingsModal } from './components/SettingsModal';
import { ZenFocusMode } from './components/ZenFocusMode';
import { ExportCSVModal } from './components/ExportCSVModal';
import { getTodayString } from './utils/dateUtils';
import { Task, JobCategory } from './types';

const MainAppContent: React.FC = () => {
  const { activeTimer, settings } = useWork();
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'daily' | 'categories' | 'monthly'>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskDefaultDate, setTaskDefaultDate] = useState<string>(getTodayString());
  const [taskDefaultCategoryId, setTaskDefaultCategoryId] = useState<string | undefined>(undefined);

  const [manualLogModalOpen, setManualLogModalOpen] = useState(false);
  const [manualLogTask, setManualLogTask] = useState<Task | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<JobCategory | null>(null);

  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [zenModeOpen, setZenModeOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportTargetDate, setExportTargetDate] = useState<string>(getTodayString());

  // Auto open Zen mode if preference is active and a timer starts running
  useEffect(() => {
    if (activeTimer?.isRunning && settings.autoZenOnTimerStart) {
      setZenModeOpen(true);
    }
  }, [activeTimer?.isRunning, settings.autoZenOnTimerStart]);

  // Handlers
  const handleOpenExportCSV = (date?: string) => {
    setExportTargetDate(date || selectedDate || getTodayString());
    setExportModalOpen(true);
  };

  const handleOpenNewTaskModal = (date?: string, categoryId?: string) => {
    setTaskToEdit(null);
    setTaskDefaultDate(date || selectedDate || getTodayString());
    setTaskDefaultCategoryId(categoryId);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleOpenManualLog = (task: Task) => {
    setManualLogTask(task);
    setManualLogModalOpen(true);
  };

  const handleOpenNewCategoryModal = () => {
    setCategoryToEdit(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: JobCategory) => {
    setCategoryToEdit(cat);
    setCategoryModalOpen(true);
  };

  const handleAddTaskWithCategory = (catId: string) => {
    handleOpenNewTaskModal(undefined, catId);
  };

  const handleSelectDateToDaily = (date: string) => {
    setSelectedDate(date);
    setCurrentTab('daily');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white relative">
      {/* Subtle Ambient Radial Lighting in Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Global Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
        onOpenZenMode={() => setZenModeOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 relative z-10">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigateToDaily={() => setCurrentTab('daily')}
            onNavigateToCategories={() => setCurrentTab('categories')}
            onNavigateToMonthly={() => setCurrentTab('monthly')}
            onOpenNewTaskModal={() => handleOpenNewTaskModal()}
            onEditTask={handleEditTask}
            onOpenZenMode={() => setZenModeOpen(true)}
            onOpenExportCSV={handleOpenExportCSV}
            onOpenSettings={() => setSettingsModalOpen(true)}
          />
        )}

        {currentTab === 'daily' && (
          <DailyTasksView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onOpenNewTaskModal={(date) => handleOpenNewTaskModal(date)}
            onEditTask={handleEditTask}
            onOpenManualLog={handleOpenManualLog}
            onOpenZenMode={() => setZenModeOpen(true)}
            onOpenExportCSV={handleOpenExportCSV}
          />
        )}

        {currentTab === 'categories' && (
          <JobCategoriesView
            onOpenNewCategoryModal={handleOpenNewCategoryModal}
            onEditCategory={handleEditCategory}
            onAddTaskWithCategory={handleAddTaskWithCategory}
          />
        )}

        {currentTab === 'monthly' && (
          <MonthlyReportView
            onSelectDateToDaily={handleSelectDateToDaily}
          />
        )}
      </main>

      {/* Floating Active Timer Bar (if a task is currently running) */}
      <ActiveTimerBar onOpenZenMode={() => setZenModeOpen(true)} />

      {/* Footer */}
      <footer className="bg-[#0B0F19]/90 border-t border-slate-800/80 py-6 text-xs text-slate-500 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-display">KerjaAlur</span>
            <span>·</span>
            <span>Studio Pencatatan Kerja, Pelacakan Waktu & Produktivitas Harian</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Disiplin Waktu & Prioritas</span>
            <span>·</span>
            <span>Mode Fokus Zen Tersedia</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultDate={taskDefaultDate}
        defaultCategoryId={taskDefaultCategoryId}
      />

      <ManualTimeLogModal
        isOpen={manualLogModalOpen}
        onClose={() => setManualLogModalOpen(false)}
        task={manualLogTask}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />

      <NotificationCenterModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        onNavigateToTask={(taskId) => {
          setCurrentTab('daily');
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onOpenExportCSV={() => handleOpenExportCSV()}
      />

      {/* Export CSV & Data Backup Modal */}
      <ExportCSVModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        defaultDate={exportTargetDate}
      />

      {/* Zen Focus Mode Minimalist Viewport */}
      <ZenFocusMode
        isOpen={zenModeOpen}
        onClose={() => setZenModeOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <WorkProvider>
      <MainAppContent />
    </WorkProvider>
  );
}
