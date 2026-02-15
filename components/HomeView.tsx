
import React from 'react';
import { Screen } from '../types';

interface HomeViewProps {
  onNavigate: (screen: Screen) => void;
}

const tiles = [
  {
    screen: Screen.TIMER,
    icon: 'timer',
    title: 'FOCUS\nNOW',
    label: 'Session_01',
    large: true,
    hasGlyph: true,
  },
  {
    screen: Screen.IGNITE,
    icon: 'bolt',
    title: 'IGNITE',
    label: '5-min sprint',
    large: false,
    hasGlyph: false,
  },
  {
    screen: Screen.FOG_CUTTER,
    icon: 'air',
    title: 'FOG\nCUTTER',
    label: 'Break tasks',
    large: false,
    hasGlyph: false,
  },
  {
    screen: Screen.CHECK_IN,
    icon: 'bar_chart',
    title: 'CHECK IN',
    label: 'Mood & Energy',
    large: false,
    hasGlyph: false,
  },
  {
    screen: Screen.TASKS,
    icon: 'checklist',
    title: 'TASKS',
    label: 'Quick list',
    large: false,
    hasGlyph: false,
  },
  {
    screen: Screen.MINDSET,
    icon: 'psychology',
    title: 'MINDSET',
    label: 'Bio-feedback',
    large: false,
    hasGlyph: false,
  },
];

const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="px-n-4 mt-n-4 h-full flex flex-col">
      <div className="mb-n-6 px-n-2">
        <h2 className="text-2xl ndot">READY TO FOCUS?</h2>
      </div>

      <div className="grid grid-cols-2 gap-n-3 pb-n-8">
        {tiles.map((tile, i) => (
          <button
            key={i}
            onClick={() => onNavigate(tile.screen)}
            aria-label={tile.title.replace('\n', ' ')}
            className="n-border n-border-hover n-press bg-n-black p-n-5 flex flex-col justify-between items-start text-left relative aspect-square rounded-n-sm transition-all duration-n-fast ease-n-ease"
          >
            {/* Top row: icon + optional glyph dot */}
            <div className="flex justify-between w-full items-center">
              <span className="material-symbols-outlined text-[22px] opacity-70">{tile.icon}</span>
              {tile.hasGlyph && <div className="n-dot animate-glyph-pulse"></div>}
            </div>

            {/* Bottom: title + system label */}
            <div>
              <h3
                className={`ndot leading-[0.95] ${tile.large ? 'text-3xl' : 'text-xl'}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {tile.title}
              </h3>
              <p className="n-label mt-n-2">{tile.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeView;
