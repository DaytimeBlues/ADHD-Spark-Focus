
import React, { useState } from 'react';
import { Task } from '../types';

interface TaskListViewProps {
  tasks: Task[];
  onAddTask: (title: string) => void;
  onToggleTask: (id: string) => void;
  onBack: () => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, onAddTask, onToggleTask, onBack }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTask(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center gap-n-4 mb-n-6">
        <button onClick={onBack} aria-label="Go back" className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast">
          arrow_back
        </button>
        <h2 className="text-2xl ndot">QUICK LIST</h2>
      </div>

      {/* Add Task Input */}
      <form onSubmit={handleSubmit} className="mb-n-6">
        <div className="relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="ADD TASK..."
            aria-label="New task title"
            autoComplete="off"
            className="w-full bg-transparent n-border rounded-n-sm p-n-4 font-body text-sm text-n-white transition-colors duration-n-fast placeholder:opacity-25 placeholder:font-body placeholder:text-sm"
          />
          <button
            type="submit"
            aria-label="Add task"
            className="n-press touch-target absolute right-0 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] opacity-40 hover:opacity-80 transition-opacity duration-n-fast"
          >
            add
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-n-3 overflow-y-auto no-scrollbar" role="list">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            role="checkbox"
            aria-checked={task.completed}
            aria-label={task.title}
            tabIndex={0}
            onClick={() => onToggleTask(task.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleTask(task.id); } }}
            className={`n-border n-press rounded-n-sm p-n-4 flex items-center justify-between cursor-pointer transition-all duration-n-fast ease-n-ease ${
              task.completed ? 'opacity-25' : 'opacity-100 n-border-hover'
            }`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className={`font-body text-sm task-title ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </span>
            <div
              className={`w-5 h-5 shrink-0 n-border rounded-[3px] flex items-center justify-center transition-all duration-n-fast ${
                task.completed ? 'bg-n-white' : 'bg-transparent'
              }`}
            >
              {task.completed && (
                <span className="material-symbols-outlined text-[14px] text-n-black font-bold">check</span>
              )}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div role="status" className="text-center py-n-12 opacity-15 ndot text-lg">
            No active tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListView;
