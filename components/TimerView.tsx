
import React, { useState, useEffect, useRef } from 'react';

interface TimerViewProps {
  onBack: () => void;
  onComplete: () => void;
}

const TimerView: React.FC<TimerViewProps> = ({ onBack, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onCompleteRef.current();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-n-black z-50 flex flex-col items-center justify-between py-n-12 px-n-8 overflow-hidden">
      {/* Radial glow background */}
      <div className="absolute inset-0 n-radial-glow pointer-events-none"></div>

      {/* Top Status Bar Hint */}
      <div className="w-full flex justify-center items-center opacity-30 relative z-10 pt-2">
        <div className="w-12 h-1 bg-white/20 rounded-full"></div>
      </div>

      {/* Main Clock */}
      <div className="flex flex-col items-center relative z-10 justify-center flex-1">
        <div className="relative flex items-center justify-center">
            {/* Ring */}
            <div className="absolute w-64 h-64 rounded-full border border-white/[0.04] pointer-events-none"></div>
            
            <div className="text-timer ndot text-n-red leading-none animate-glyph-pulse z-10" style={{
            textShadow: '0 0 20px rgba(255, 0, 0, 0.25), 0 0 40px rgba(255, 0, 0, 0.1)'
            }}>
            {timeString}
            </div>
        </div>

        <button aria-label="Select task" className="n-border n-border-hover n-press border-n-red/30 px-8 py-3 mt-n-12 flex items-center gap-n-3 text-n-red bg-n-red-dim rounded-full transition-all duration-n-fast ease-n-ease">
          <span className="ndot text-lg tracking-widest">SELECT TASK</span>
          <span className="material-symbols-outlined text-[18px] opacity-50">list</span>
        </button>
      </div>

      {/* Controls */}
      <div className="w-full flex justify-between items-center px-n-8 mb-n-12 relative z-10">
        <button
          onClick={() => setIsActive(!isActive)}
          aria-label={isActive ? 'Pause timer' : 'Resume timer'}
          className="n-border n-press border-n-red/30 w-20 h-20 rounded-full bg-white/[0.03] backdrop-blur-[20px] flex flex-col items-center justify-center gap-n-1 transition-all duration-n-fast ease-n-ease hover:bg-n-red-dim"
        >
          <span className="material-symbols-outlined text-n-red text-2xl">
            {isActive ? 'pause' : 'play_arrow'}
          </span>
          <span className="ndot text-2xs text-n-red tracking-widest">
            {isActive ? 'PAUSE' : 'RESUME'}
          </span>
        </button>

        <button
          onClick={onBack}
          aria-label="End session"
          className="n-border n-press border-n-red/30 w-20 h-20 rounded-full bg-white/[0.03] backdrop-blur-[20px] flex flex-col items-center justify-center gap-n-1 transition-all duration-n-fast ease-n-ease hover:bg-n-red-dim"
        >
          <div className="w-4 h-4 bg-n-red rounded-[2px]"></div>
          <span className="ndot text-2xs text-n-red mt-n-1 tracking-widest">END</span>
        </button>
      </div>
    </div>
  );
};

export default TimerView;
