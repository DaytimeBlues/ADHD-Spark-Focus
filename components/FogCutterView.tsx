
import React, { useState } from 'react';
import { decomposeTask } from '../services/geminiService';

interface FogCutterViewProps {
  onBack: () => void;
  onAddGeneratedTasks: (tasks: string[]) => void;
}

const FogCutterView: React.FC<FogCutterViewProps> = ({ onBack, onAddGeneratedTasks }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleCut = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const subtasks = await decomposeTask(input);
    setResults(subtasks);
    setLoading(false);
  };

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-20">
      {/* Header */}
      <div className="flex items-center gap-n-4 mb-n-6">
        <button onClick={onBack} aria-label="Go back" className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast">
          arrow_back
        </button>
        <h2 className="text-2xl ndot">FOG CUTTER</h2>
      </div>

      <p className="n-label mb-n-4">Enter a daunting task to slice it into pieces</p>

      {/* Input Area */}
      <div className="space-y-n-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="I need to start my 5000 word thesis..."
          aria-label="Describe a daunting task"
          className="w-full h-32 bg-white/[0.02] n-border rounded-n-md p-n-4 font-body text-sm text-n-white transition-colors duration-n-fast placeholder:opacity-25 placeholder:font-body resize-none"
        />

        <button
          onClick={handleCut}
          disabled={loading || !input.trim()}
          className={`w-full n-border rounded-n-md p-n-4 ndot text-xl transition-all duration-n-med ease-n-ease ${
            loading
              ? 'opacity-40 animate-glyph-pulse'
              : 'n-press n-border-hover bg-white/[0.03] hover:bg-white/5'
          } ${!input.trim() && !loading ? 'opacity-30' : ''}`}
        >
          {loading ? 'SLICING...' : 'CUT THE FOG'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && !loading && (
        <div className="mt-n-10 space-y-n-3">
          <p className="n-label">Generated subtasks</p>
          {results.map((r, i) => (
            <div
              key={i}
              className="n-border rounded-n-md p-n-4 bg-white/[0.03] ndot text-base animate-fade-in-up anim-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {r}
            </div>
          ))}
          <button
            onClick={() => onAddGeneratedTasks(results)}
            className="n-press w-full bg-n-white text-n-black rounded-full p-n-4 ndot text-xl mt-n-4 transition-all duration-n-fast ease-n-ease hover:bg-white/90 active:bg-white/80"
          >
            ADD ALL TO TASKS
          </button>
        </div>
      )}
    </div>
  );
};

export default FogCutterView;
