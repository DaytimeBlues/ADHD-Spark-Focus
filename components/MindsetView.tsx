
import React, { useState, useEffect, useRef } from 'react';

interface MindsetViewProps {
  onBack: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_CYCLE: { phase: BreathPhase; duration: number; label: string }[] = [
  { phase: 'inhale', duration: 4000, label: 'BREATHE IN' },
  { phase: 'hold', duration: 4000, label: 'HOLD' },
  { phase: 'exhale', duration: 6000, label: 'BREATHE OUT' },
  { phase: 'rest', duration: 2000, label: 'REST' },
];

const AFFIRMATIONS = [
  'I CAN FOCUS ON ONE THING AT A TIME',
  'MY BRAIN IS WIRED FOR CREATIVITY',
  'PROGRESS OVER PERFECTION',
  'I CHOOSE WHAT DESERVES MY ATTENTION',
  'SMALL STEPS BUILD MOMENTUM',
  'I AM NOT MY DISTRACTIONS',
  'EVERY TASK HAS A FIRST STEP',
  'I TRUST MY ABILITY TO FIGURE THIS OUT',
  'REST IS PART OF THE PROCESS',
  'I SHOW UP AND THAT MATTERS',
];

const MindsetView: React.FC<MindsetViewProps> = ({ onBack }) => {
  const [mode, setMode] = useState<'menu' | 'breathe' | 'affirm'>('menu');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [breathActive, setBreathActive] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [affirmIndex, setAffirmIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBreath = BREATH_CYCLE[cycleIndex];

  useEffect(() => {
    if (!breathActive) return;

    timeoutRef.current = setTimeout(() => {
      const next = (cycleIndex + 1) % BREATH_CYCLE.length;
      setCycleIndex(next);
      if (next === 0) setCyclesCompleted(prev => prev + 1);
    }, currentBreath.duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [breathActive, cycleIndex, currentBreath.duration]);

  const startBreathing = () => {
    setMode('breathe');
    setCycleIndex(0);
    setCyclesCompleted(0);
    setBreathActive(true);
  };

  const stopBreathing = () => {
    setBreathActive(false);
    setMode('menu');
  };

  const nextAffirmation = () => {
    setAffirmIndex(prev => (prev + 1) % AFFIRMATIONS.length);
  };

  // Breathing exercise scale: inhale grows, hold holds, exhale shrinks
  const getScale = (): number => {
    if (currentBreath.phase === 'inhale') return 1.3;
    if (currentBreath.phase === 'hold') return 1.3;
    if (currentBreath.phase === 'exhale') return 0.8;
    return 0.8;
  };

  if (mode === 'breathe') {
    return (
      <div className="fixed inset-0 bg-n-black z-50 flex flex-col items-center justify-center px-n-8 overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02) 0%, transparent 70%)'
        }} />

        <p className="n-label mb-n-8 relative z-10">CYCLE {cyclesCompleted + 1}</p>

        {/* Breathing circle */}
        <div
          className="w-40 h-40 rounded-full n-border flex items-center justify-center relative z-10"
          style={{
            transform: `scale(${getScale()})`,
            transition: `transform ${currentBreath.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            borderColor: currentBreath.phase === 'hold'
              ? 'rgba(255, 255, 255, 0.25)'
              : 'rgba(255, 255, 255, 0.12)',
          }}
        >
          <div
            className="w-2 h-2 rounded-full bg-n-white transition-opacity"
            style={{
              opacity: currentBreath.phase === 'rest' ? 0.2 : 0.8,
              transitionDuration: `${currentBreath.duration}ms`,
            }}
          />
        </div>

        {/* Phase label */}
        <p className="ndot text-xl mt-n-8 relative z-10 animate-glyph-breathe">
          {currentBreath.label}
        </p>

        <p className="n-label mt-n-3 relative z-10">
          {cyclesCompleted} cycle{cyclesCompleted !== 1 ? 's' : ''} completed
        </p>

        {/* Stop */}
        <button
          onClick={stopBreathing}
          aria-label="Stop breathing exercise"
          className="n-border n-press rounded-n-sm px-n-8 py-n-4 ndot text-sm mt-n-12 opacity-40 hover:opacity-70 transition-opacity duration-n-fast relative z-10"
        >
          STOP
        </button>
      </div>
    );
  }

  if (mode === 'affirm') {
    return (
      <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20">
        {/* Header */}
        <div className="flex items-center gap-n-4 mb-n-6">
          <button onClick={() => setMode('menu')} aria-label="Go back" className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast">
            arrow_back
          </button>
          <h2 className="text-2xl ndot">AFFIRMATIONS</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-n-4">
          {/* Card */}
          <div className="n-border rounded-n-md p-n-8 w-full max-w-sm text-center">
            <span className="material-symbols-outlined text-[32px] opacity-20 mb-n-4 block">format_quote</span>
            <p className="ndot text-xl leading-relaxed mb-n-6" style={{ minHeight: '3.6em' }}>
              {AFFIRMATIONS[affirmIndex]}
            </p>
            <div className="n-divider mb-n-4" />
            <p className="n-label">{affirmIndex + 1} / {AFFIRMATIONS.length}</p>
          </div>

          <button
            onClick={nextAffirmation}
            aria-label="Next affirmation"
            className="n-press n-border n-border-hover rounded-n-sm px-n-8 py-n-4 ndot text-lg mt-n-8 transition-all duration-n-fast ease-n-ease hover:bg-white/5"
          >
            NEXT
          </button>
        </div>
      </div>
    );
  }

  // Menu mode
  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center gap-n-4 mb-n-6">
        <button onClick={onBack} aria-label="Go back" className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast">
          arrow_back
        </button>
        <h2 className="text-2xl ndot">MINDSET</h2>
      </div>

      <p className="n-label mb-n-6">Tools to reset and recharge</p>

      <div className="space-y-n-3">
        {/* Breathe tile */}
        <button
          onClick={startBreathing}
          className="n-border n-border-hover n-press rounded-n-sm p-n-5 w-full flex items-center gap-n-5 text-left transition-all duration-n-fast ease-n-ease hover:bg-white/3"
        >
          <div className="w-12 h-12 n-border rounded-n-sm flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px] opacity-70">airwave</span>
          </div>
          <div>
            <h3 className="ndot text-lg">BREATHE</h3>
            <p className="n-label mt-n-1">4-4-6 box breathing exercise</p>
          </div>
          <span className="material-symbols-outlined text-[18px] opacity-20 ml-auto">chevron_right</span>
        </button>

        {/* Affirm tile */}
        <button
          onClick={() => setMode('affirm')}
          className="n-border n-border-hover n-press rounded-n-sm p-n-5 w-full flex items-center gap-n-5 text-left transition-all duration-n-fast ease-n-ease hover:bg-white/3"
        >
          <div className="w-12 h-12 n-border rounded-n-sm flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px] opacity-70">format_quote</span>
          </div>
          <div>
            <h3 className="ndot text-lg">AFFIRM</h3>
            <p className="n-label mt-n-1">ADHD-focused affirmation cards</p>
          </div>
          <span className="material-symbols-outlined text-[18px] opacity-20 ml-auto">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default MindsetView;
