
import React, { useState, useEffect, useRef } from 'react';

interface IgniteViewProps {
  onBack: () => void;
  onComplete: () => void;
}

const SPRINT_DURATION = 5 * 60; // 5 minutes

const IgniteView: React.FC<IgniteViewProps> = ({ onBack, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(SPRINT_DURATION);
  const [isActive, setIsActive] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isDone) {
      setIsActive(false);
      setIsDone(true);
      onCompleteRef.current();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isDone]);

  const progress = 1 - timeLeft / SPRINT_DURATION;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-n-black z-50 flex flex-col items-center justify-center px-n-8 overflow-hidden">
      {/* Radial glow — intensifies as timer progresses */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-n-slow"
        style={{
          background: `radial-gradient(ellipse at center, rgba(255, 0, 0, ${0.04 + progress * 0.12}) 0%, transparent 70%)`,
        }}
      />

      {/* Done state */}
      {isDone ? (
        <div className="flex flex-col items-center gap-n-6 relative z-10 animate-fade-in-up anim-hidden">
          <span className="material-symbols-outlined text-[64px] text-n-red">local_fire_department</span>
          <h2 className="ndot text-3xl text-n-red">IGNITED</h2>
          <p className="n-label">Sprint complete — momentum captured</p>
          <div className="n-divider max-w-[120px]" />
          <button
            onClick={onBack}
            aria-label="Return home"
            className="n-border n-border-hover n-press rounded-n-sm px-n-8 py-n-4 ndot text-lg mt-n-4 transition-all duration-n-fast ease-n-ease hover:bg-white/5"
          >
            DONE
          </button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5">
            <div
              className="h-full bg-n-red transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          {/* Sprint label */}
          <p className="n-label mb-n-4 relative z-10">5-MIN SPRINT</p>

          {/* Countdown */}
          <div
            className="ndot text-n-red leading-none relative z-10"
            style={{
              fontSize: '96px',
              textShadow: `0 0 ${20 + progress * 30}px rgba(255, 0, 0, ${0.2 + progress * 0.3}), 0 0 60px rgba(255, 0, 0, 0.1)`,
            }}
          >
            {timeString}
          </div>

          {/* Motivational pulse text */}
          <p className="ndot text-xs text-n-red/60 mt-n-6 animate-glyph-breathe relative z-10">
            {timeLeft > 240 ? 'GO GO GO' : timeLeft > 120 ? 'KEEP PUSHING' : timeLeft > 30 ? 'ALMOST THERE' : 'FINAL STRETCH'}
          </p>

          {/* Controls */}
          <div className="flex gap-n-6 mt-n-12 relative z-10">
            <button
              onClick={() => setIsActive(!isActive)}
              aria-label={isActive ? 'Pause sprint' : 'Resume sprint'}
              className="n-border n-press border-n-red/30 w-20 h-20 rounded-n-md flex flex-col items-center justify-center gap-n-1 transition-all duration-n-fast ease-n-ease hover:bg-n-red-dim"
            >
              <span className="material-symbols-outlined text-n-red text-xl">
                {isActive ? 'pause' : 'play_arrow'}
              </span>
              <span className="ndot text-2xs text-n-red tracking-widest">
                {isActive ? 'PAUSE' : 'GO'}
              </span>
            </button>

            <button
              onClick={onBack}
              aria-label="Cancel sprint"
              className="n-border n-press border-white/10 w-20 h-20 rounded-n-md flex flex-col items-center justify-center gap-n-1 transition-all duration-n-fast ease-n-ease hover:bg-white/5"
            >
              <span className="material-symbols-outlined text-xl opacity-40">close</span>
              <span className="ndot text-2xs opacity-40 tracking-widest">QUIT</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default IgniteView;
