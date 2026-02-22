
import React from 'react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  streak: number;
  captureBubble?: React.ReactNode;
}

const navItems = [
  { screen: Screen.HOME, icon: 'home', label: 'HOME' },
  { screen: Screen.FOCUS, icon: 'explore', label: 'FOCUS' },
  { screen: Screen.TASKS, icon: 'edit_note', label: 'TASKS' },
  { screen: Screen.PLAN, icon: 'calendar_today', label: 'PLAN' },
];

const Layout: React.FC<LayoutProps> = ({ children, currentScreen, onNavigate, streak, captureBubble }) => {
  const isFullscreen = currentScreen === Screen.TIMER || currentScreen === Screen.IGNITE;

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto relative ios-safe-top overflow-hidden bg-n-black">
      {/* Header */}
      {!isFullscreen && (
        <header className="flex justify-between items-center px-n-6 py-n-4 shrink-0">
          <div className="flex flex-col gap-[2px]">
            <h1 className="text-3xl ndot leading-none tracking-wide">SPARK</h1>
            <p className="n-label mt-n-1">OS 2.5.0 // FOCUS_MODE</p>
          </div>
          <div className="n-border rounded-n-sm px-n-3 py-n-2 flex items-center gap-n-2 bg-n-surface">
            <span className="ndot text-xl leading-none">{streak.toString().padStart(2, '0')}</span>
            <span className="n-label">STREAK</span>
            <div className="n-dot animate-glyph-pulse"></div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative">
        {children}
      </main>

      {/* Capture Bubble overlay */}
      {!isFullscreen && captureBubble}

      {/* Bottom Navigation */}
      {!isFullscreen && (
        <nav className="border-t border-n-stroke ios-safe-bottom bg-n-black shrink-0" aria-label="Main navigation">
          <div className="flex justify-around items-center py-n-4">
            {navItems.map(({ screen, icon, label }) => {
              const isActive = currentScreen === screen;
              return (
                <button
                  key={screen}
                  onClick={() => onNavigate(screen)}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`n-press flex flex-col items-center gap-[4px] transition-opacity duration-n-fast ease-n-ease touch-target ${
                    isActive ? 'opacity-100' : 'opacity-25'
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                  <span className="ndot text-[8px] tracking-widest">{label}</span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-n-white mt-[1px]"></div>}
                </button>
              );
            })}
          </div>
          <div className="flex justify-center pb-n-2">
            <div className="w-32 h-[3px] bg-white/15 rounded-full"></div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
