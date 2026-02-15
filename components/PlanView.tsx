
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface PlanViewProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAssignDay: (taskId: string, day: string | undefined) => void;
}

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const getCurrentDayIndex = (): number => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // Convert to 0=Mon
};

const PlanView: React.FC<PlanViewProps> = ({ tasks, onToggleTask, onAssignDay }) => {
  const [selectedDay, setSelectedDay] = useState(DAYS[getCurrentDayIndex()]);
  const [assignMode, setAssignMode] = useState(false);

  const todayIndex = getCurrentDayIndex();

  const dayTasks = tasks.filter(t => t.day === selectedDay);
  const unassigned = tasks.filter(t => !t.day && !t.completed);

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-n-6">
        <h2 className="text-2xl ndot">PLAN</h2>
        <button
          onClick={() => setAssignMode(!assignMode)}
          aria-label={assignMode ? 'Done assigning' : 'Assign tasks to days'}
          className={`n-press ndot text-xs px-n-3 py-n-2 rounded-n-sm transition-all duration-n-fast ease-n-ease ${
            assignMode ? 'bg-n-white text-n-black' : 'n-border n-border-hover opacity-50 hover:opacity-80'
          }`}
        >
          {assignMode ? 'DONE' : 'ASSIGN'}
        </button>
      </div>

      {/* Day selector */}
      <div className="flex gap-n-1 mb-n-6">
        {DAYS.map((day, i) => {
          const isSelected = selectedDay === day;
          const isToday = i === todayIndex;
          const count = tasks.filter(t => t.day === day && !t.completed).length;

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              aria-label={day}
              aria-current={isToday ? 'date' : undefined}
              className={`n-press flex-1 flex flex-col items-center gap-n-1 py-n-3 rounded-n-sm transition-all duration-n-fast ease-n-ease ${
                isSelected
                  ? 'bg-n-white text-n-black'
                  : 'n-border hover:bg-white/3'
              }`}
            >
              <span className={`ndot text-xs ${!isSelected ? 'opacity-50' : ''}`}>{day}</span>
              {count > 0 && (
                <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-n-red' : isToday ? 'bg-n-red' : 'bg-white/30'}`} />
              )}
              {count === 0 && isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-n-red/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day tasks */}
      <div className="mb-n-6">
        <p className="n-label mb-n-3">{selectedDay} — {dayTasks.filter(t => !t.completed).length} TASK{dayTasks.filter(t => !t.completed).length !== 1 ? 'S' : ''}</p>

        {dayTasks.length === 0 && (
          <div className="n-border rounded-n-sm p-n-6 text-center">
            <span className="material-symbols-outlined text-[24px] opacity-10 block mb-n-2">event_available</span>
            <p className="n-label">Nothing planned</p>
          </div>
        )}

        <div className="space-y-n-2">
          {dayTasks.map(task => (
            <div
              key={task.id}
              className={`n-border rounded-n-sm px-n-4 py-n-3 flex items-center justify-between transition-all duration-n-fast ${
                task.completed ? 'opacity-25' : 'n-border-hover'
              }`}
            >
              <button
                onClick={() => onToggleTask(task.id)}
                aria-label={`${task.completed ? 'Uncomplete' : 'Complete'} ${task.title}`}
                className="n-press flex items-center gap-n-3 flex-1 text-left min-w-0"
              >
                <div className={`w-4 h-4 shrink-0 n-border rounded-[2px] flex items-center justify-center transition-all duration-n-fast ${
                  task.completed ? 'bg-n-white' : 'bg-transparent'
                }`}>
                  {task.completed && (
                    <span className="material-symbols-outlined text-[12px] text-n-black font-bold">check</span>
                  )}
                </div>
                <span className={`font-body text-sm truncate ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </span>
              </button>
              {assignMode && (
                <button
                  onClick={() => onAssignDay(task.id, undefined)}
                  aria-label={`Remove ${task.title} from ${selectedDay}`}
                  className="n-press material-symbols-outlined text-[16px] opacity-30 hover:opacity-60 ml-n-2 shrink-0"
                >
                  close
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned pool (visible in assign mode) */}
      {assignMode && unassigned.length > 0 && (
        <div>
          <div className="n-divider mb-n-4" />
          <p className="n-label mb-n-3">UNASSIGNED ({unassigned.length})</p>
          <div className="space-y-n-2">
            {unassigned.map(task => (
              <button
                key={task.id}
                onClick={() => onAssignDay(task.id, selectedDay)}
                aria-label={`Assign ${task.title} to ${selectedDay}`}
                className="n-border n-border-hover n-press rounded-n-sm px-n-4 py-n-3 w-full flex items-center justify-between text-left transition-all duration-n-fast ease-n-ease hover:bg-white/3"
              >
                <span className="font-body text-sm truncate">{task.title}</span>
                <span className="material-symbols-outlined text-[16px] opacity-30 shrink-0">add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!assignMode && unassigned.length > 0 && (
        <div>
          <div className="n-divider mb-n-4" />
          <p className="n-label mb-n-2">{unassigned.length} UNASSIGNED TASK{unassigned.length !== 1 ? 'S' : ''}</p>
          <p className="n-label opacity-50">Tap ASSIGN to schedule them</p>
        </div>
      )}
    </div>
  );
};

export default PlanView;
