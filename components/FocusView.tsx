
import React, { useState, useEffect } from 'react';
import { Screen } from '../types';

interface FocusViewProps {
  onNavigate: (screen: Screen) => void;
  streak: number;
  totalTasks: number;
  completedTasks: number;
}

const STORAGE_KEY = 'spark_focus_sessions';

interface SessionLog {
  id: string;
  type: 'pomodoro' | 'sprint';
  duration: number; // seconds
  timestamp: number;
}

const loadSessions = (): SessionLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* corrupted */ }
  return [];
};

const FocusView: React.FC<FocusViewProps> = ({ onNavigate, streak, totalTasks, completedTasks }) => {
  const [sessions] = useState<SessionLog[]>(loadSessions);

  const todaySessions = sessions.filter(s => {
    const d = new Date(s.timestamp);
    return d.toDateString() === new Date().toDateString();
  });

  const todayMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60);
  const weekSessions = sessions.filter(s => {
    const now = Date.now();
    return now - s.timestamp < 7 * 24 * 60 * 60 * 1000;
  });
  const weekMinutes = Math.round(weekSessions.reduce((acc, s) => acc + s.duration, 0) / 60);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const quickActions = [
    {
      icon: 'timer',
      title: 'POMODORO',
      label: '25 min session',
      screen: Screen.TIMER,
    },
    {
      icon: 'bolt',
      title: 'SPRINT',
      label: '5 min burst',
      screen: Screen.IGNITE,
    },
    {
      icon: 'air',
      title: 'FOG CUTTER',
      label: 'Break a task',
      screen: Screen.FOG_CUTTER,
    },
    {
      icon: 'airwave',
      title: 'BREATHE',
      label: 'Reset mind',
      screen: Screen.MINDSET,
    },
  ];

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20 overflow-y-auto no-scrollbar">
      <h2 className="text-2xl ndot mb-n-6">FOCUS HUB</h2>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-n-3 mb-n-8">
        <div className="n-border rounded-n-sm p-n-4 flex flex-col items-center">
          <span className="ndot text-2xl leading-none">{streak.toString().padStart(2, '0')}</span>
          <span className="n-label mt-n-2">STREAK</span>
        </div>
        <div className="n-border rounded-n-sm p-n-4 flex flex-col items-center">
          <span className="ndot text-2xl leading-none">{todayMinutes}</span>
          <span className="n-label mt-n-2">MIN TODAY</span>
        </div>
        <div className="n-border rounded-n-sm p-n-4 flex flex-col items-center">
          <span className="ndot text-2xl leading-none">{completionRate}%</span>
          <span className="n-label mt-n-2">TASKS</span>
        </div>
      </div>

      {/* Week heatmap */}
      <div className="mb-n-8">
        <p className="n-label mb-n-3">THIS WEEK — {weekMinutes} MIN</p>
        <div className="flex gap-n-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
            const dayDate = new Date();
            const currentDay = dayDate.getDay(); // 0=Sun
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
            const targetDate = new Date(dayDate);
            targetDate.setDate(dayDate.getDate() + mondayOffset + i);
            const isToday = targetDate.toDateString() === new Date().toDateString();

            const dayMinutes = sessions
              .filter(s => new Date(s.timestamp).toDateString() === targetDate.toDateString())
              .reduce((acc, s) => acc + s.duration, 0) / 60;

            const intensity = Math.min(dayMinutes / 60, 1); // cap at 60 min

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-n-1">
                <div
                  className={`w-full aspect-square rounded-[2px] transition-all duration-n-fast ${isToday ? 'ring-1 ring-n-red/40' : ''}`}
                  style={{
                    backgroundColor: dayMinutes > 0
                      ? `rgba(255, 0, 0, ${0.1 + intensity * 0.4})`
                      : 'rgba(255, 255, 255, 0.04)',
                  }}
                />
                <span className={`ndot text-2xs ${isToday ? 'text-n-red' : 'opacity-30'}`}>{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <p className="n-label mb-n-3">QUICK START</p>
      <div className="grid grid-cols-2 gap-n-3">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => onNavigate(action.screen)}
            aria-label={action.title}
            className="n-border n-border-hover n-press rounded-n-sm p-n-4 flex flex-col items-start gap-n-2 text-left transition-all duration-n-fast ease-n-ease hover:bg-white/3"
          >
            <span className="material-symbols-outlined text-[20px] opacity-60">{action.icon}</span>
            <span className="ndot text-sm">{action.title}</span>
            <span className="n-label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Today's sessions */}
      {todaySessions.length > 0 && (
        <div className="mt-n-8">
          <p className="n-label mb-n-3">TODAY'S SESSIONS ({todaySessions.length})</p>
          <div className="space-y-n-2">
            {todaySessions.slice(0, 5).map(session => (
              <div key={session.id} className="n-border rounded-n-sm px-n-4 py-n-3 flex items-center justify-between">
                <div className="flex items-center gap-n-3">
                  <span className="material-symbols-outlined text-[16px] text-n-red opacity-60">
                    {session.type === 'sprint' ? 'bolt' : 'timer'}
                  </span>
                  <span className="ndot text-xs">
                    {session.type === 'sprint' ? 'SPRINT' : 'POMODORO'}
                  </span>
                </div>
                <span className="ndot text-xs opacity-40">{Math.round(session.duration / 60)} MIN</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {todaySessions.length === 0 && (
        <div className="mt-n-8 text-center py-n-8">
          <span className="material-symbols-outlined text-[32px] opacity-10 block mb-n-2">hourglass_empty</span>
          <p className="n-label">No sessions yet today</p>
        </div>
      )}
    </div>
  );
};

export default FocusView;
