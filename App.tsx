
import React, { useState, useEffect } from 'react';
import { Screen, Task } from './types';
import HomeView from './components/HomeView';
import TimerView from './components/TimerView';
import TaskListView from './components/TaskListView';
import FogCutterView from './components/FogCutterView';
import IgniteView from './components/IgniteView';
import CheckInView from './components/CheckInView';
import MindsetView from './components/MindsetView';
import FocusView from './components/FocusView';
import PlanView from './components/PlanView';
import InboxView from './components/InboxView';
import Layout from './components/Layout';
import { CaptureBubble } from './components/capture';

const STORAGE_KEY_TASKS = 'spark_tasks';
const STORAGE_KEY_STREAK = 'spark_streak';

const DEFAULT_TASKS: Task[] = [
  { id: '1', title: 'Complete project outline', completed: false },
  { id: '2', title: 'Review team feedback', completed: true },
  { id: '3', title: 'Call client', completed: false }
];

const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* corrupted — fall through */ }
  return DEFAULT_TASKS;
};

const loadStreak = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STREAK);
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n >= 0) return n;
    }
  } catch { /* corrupted — fall through */ }
  return 12;
};

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const [streak, setStreak] = useState(loadStreak);
  const [tasks, setTasks] = useState<Task[]>(loadTasks);

  // Persist tasks to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks)); } catch { /* quota exceeded — ignore */ }
  }, [tasks]);

  // Persist streak to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY_STREAK, String(streak)); } catch { /* ignore */ }
  }, [streak]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const assignDay = (taskId: string, day: string | undefined) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, day } : t));
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.HOME:
        return <HomeView onNavigate={setCurrentScreen} />;
      case Screen.TIMER:
        return <TimerView onBack={() => setCurrentScreen(Screen.HOME)} onComplete={() => setStreak(s => s + 1)} />;
      case Screen.IGNITE:
        return <IgniteView onBack={() => setCurrentScreen(Screen.HOME)} onComplete={() => setStreak(s => s + 1)} />;
      case Screen.TASKS:
        return <TaskListView tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.FOG_CUTTER:
        return <FogCutterView onBack={() => setCurrentScreen(Screen.HOME)} onAddGeneratedTasks={(newTasks) => {
          newTasks.forEach(t => addTask(t));
          setCurrentScreen(Screen.TASKS);
        }} />;
      case Screen.CHECK_IN:
        return <CheckInView onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.MINDSET:
        return <MindsetView onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.FOCUS:
        return (
          <FocusView
            onNavigate={setCurrentScreen}
            streak={streak}
            totalTasks={tasks.length}
            completedTasks={tasks.filter(t => t.completed).length}
          />
        );
      case Screen.PLAN:
        return <PlanView tasks={tasks} onToggleTask={toggleTask} onAssignDay={assignDay} />;
      case Screen.INBOX:
        return <InboxView onBack={() => setCurrentScreen(Screen.HOME)} onAddTask={addTask} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-n-4 px-n-6">
            <span className="material-symbols-outlined text-[48px] opacity-15">construction</span>
            <span className="ndot text-xl opacity-20">SYSTEM COMING SOON</span>
            <div className="n-divider max-w-[120px] mt-n-2"></div>
            <p className="n-label mt-n-1">Module not yet initialized</p>
          </div>
        );
    }
  };

  return (
    <Layout 
      currentScreen={currentScreen} 
      onNavigate={setCurrentScreen} 
      streak={streak}
      captureBubble={
        <CaptureBubble onNavigateInbox={() => setCurrentScreen(Screen.INBOX)} />
      }
    >
      {renderScreen()}
    </Layout>
  );
};

export default App;
