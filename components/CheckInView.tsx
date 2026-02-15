
import React, { useState, useEffect } from 'react';
import { MoodEntry } from '../types';

interface CheckInViewProps {
  onBack: () => void;
}

const STORAGE_KEY = 'spark_checkins';

const MOOD_ICONS = ['sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];
const MOOD_LABELS = ['ROUGH', 'LOW', 'NEUTRAL', 'GOOD', 'GREAT'];
const ENERGY_LABELS = ['DRAINED', 'TIRED', 'OKAY', 'CHARGED', 'WIRED'];

const loadEntries = (): MoodEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* corrupted */ }
  return [];
};

const CheckInView: React.FC<CheckInViewProps> = ({ onBack }) => {
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [entries, setEntries] = useState<MoodEntry[]>(loadEntries);
  const [justLogged, setJustLogged] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
  }, [entries]);

  const handleLog = () => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      mood,
      energy,
    };
    setEntries(prev => [entry, ...prev].slice(0, 50)); // keep last 50
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const todayEntries = entries.filter(e => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center gap-n-4 mb-n-6">
        <button onClick={onBack} aria-label="Go back" className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast">
          arrow_back
        </button>
        <h2 className="text-2xl ndot">CHECK IN</h2>
      </div>

      <p className="n-label mb-n-6">How are you right now?</p>

      {/* Mood selector */}
      <div className="mb-n-6">
        <p className="n-label mb-n-3">MOOD</p>
        <div className="flex justify-between items-center">
          {MOOD_ICONS.map((icon, i) => {
            const level = i + 1;
            const isSelected = mood === level;
            return (
              <button
                key={level}
                onClick={() => setMood(level)}
                aria-label={`Mood: ${MOOD_LABELS[i]}`}
                className={`n-press flex flex-col items-center gap-n-1 p-n-2 rounded-n-sm transition-all duration-n-fast ease-n-ease ${
                  isSelected ? 'opacity-100 bg-white/5 n-border' : 'opacity-30 hover:opacity-50'
                }`}
              >
                <span className="material-symbols-outlined text-[28px]">{icon}</span>
                <span className="ndot text-2xs">{MOOD_LABELS[i]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Energy selector */}
      <div className="mb-n-8">
        <p className="n-label mb-n-3">ENERGY</p>
        <div className="flex gap-n-2">
          {ENERGY_LABELS.map((label, i) => {
            const level = i + 1;
            const isSelected = energy === level;
            return (
              <button
                key={level}
                onClick={() => setEnergy(level)}
                aria-label={`Energy: ${label}`}
                className={`n-press flex-1 py-n-3 rounded-n-sm ndot text-2xs transition-all duration-n-fast ease-n-ease ${
                  isSelected
                    ? 'bg-n-white text-n-black'
                    : 'n-border opacity-30 hover:opacity-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log button */}
      <button
        onClick={handleLog}
        className={`n-press w-full rounded-n-sm p-n-4 ndot text-xl transition-all duration-n-med ease-n-ease ${
          justLogged
            ? 'bg-n-red text-n-white'
            : 'bg-n-white text-n-black hover:bg-white/90 active:bg-white/80'
        }`}
      >
        {justLogged ? 'LOGGED' : 'LOG CHECK-IN'}
      </button>

      {/* Today's log */}
      {todayEntries.length > 0 && (
        <div className="mt-n-8">
          <p className="n-label mb-n-3">TODAY ({todayEntries.length})</p>
          <div className="space-y-n-2 overflow-y-auto no-scrollbar max-h-48">
            {todayEntries.map((entry) => (
              <div key={entry.id} className="n-border rounded-n-sm px-n-4 py-n-3 flex items-center justify-between">
                <div className="flex items-center gap-n-3">
                  <span className="material-symbols-outlined text-[18px] opacity-60">{MOOD_ICONS[entry.mood - 1]}</span>
                  <span className="ndot text-xs">{MOOD_LABELS[entry.mood - 1]}</span>
                  <div className="w-[1px] h-3 bg-white/12" />
                  <span className="ndot text-xs opacity-50">{ENERGY_LABELS[entry.energy - 1]}</span>
                </div>
                <span className="n-label">{formatTime(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History summary */}
      {entries.length > todayEntries.length && (
        <div className="mt-n-6">
          <p className="n-label mb-n-3">RECENT</p>
          <div className="flex gap-n-1">
            {entries.slice(0, 14).map((entry, i) => (
              <div
                key={entry.id}
                title={`${MOOD_LABELS[entry.mood - 1]} — ${formatDate(entry.timestamp)}`}
                className="flex-1 h-8 rounded-[2px] transition-all duration-n-fast"
                style={{
                  backgroundColor: `rgba(255, 255, 255, ${0.05 + (entry.mood / 5) * 0.2})`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-n-1">
            <span className="n-label">older</span>
            <span className="n-label">recent</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInView;
