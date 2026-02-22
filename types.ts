
export enum Screen {
  HOME = 'home',
  TIMER = 'timer',
  TASKS = 'tasks',
  PLAN = 'plan',
  FOCUS = 'focus_explore',
  FOG_CUTTER = 'fog_cutter',
  IGNITE = 'ignite',
  CHECK_IN = 'check_in',
  MINDSET = 'mindset',
  INBOX = 'inbox'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  subtasks?: string[];
  day?: string; // e.g. 'MON', 'TUE' — used by PlanView
}

export interface FocusSession {
  duration: number; // in seconds
  label: string;
  type: 'pomodoro' | 'sprint' | 'deep';
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  mood: number;   // 1-5
  energy: number;  // 1-5
  note?: string;
}

export interface PlannedDay {
  day: string;       // 'MON' | 'TUE' | ...
  taskIds: string[];
}
