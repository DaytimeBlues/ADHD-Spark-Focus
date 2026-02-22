
import React, { useState, useEffect } from 'react';
import CaptureService, { CaptureItem, CaptureStatus } from '../services/CaptureService';

interface InboxViewProps {
  onBack: () => void;
  onAddTask: (title: string) => void;
}

type FilterTab = 'all' | CaptureStatus;

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all',        label: 'ALL'        },
  { id: 'unreviewed', label: 'UNREVIEWED' },
  { id: 'promoted',   label: 'PROMOTED'   },
  { id: 'discarded',  label: 'DISCARDED'  },
];

const SOURCE_ICON: Record<string, string> = {
  text:    'edit',
  paste:   'content_paste',
  meeting: 'groups',
  photo:   'photo_camera',
  voice:   'mic',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - ts;
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins}M AGO`;
  if (diffHours < 24) return `${diffHours}H AGO`;
  if (diffDays < 7) return `${diffDays}D AGO`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

const InboxView: React.FC<InboxViewProps> = ({ onBack, onAddTask }) => {
  const [items, setItems] = useState<CaptureItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('unreviewed');

  const refresh = () => {
    const filter = activeTab === 'all' ? undefined : { status: activeTab as CaptureStatus };
    setItems(CaptureService.getAll(filter));
  };

  // Re-fetch when tab changes
  useEffect(() => {
    refresh();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe for live badge-driven refreshes
  useEffect(() => {
    const unsub = CaptureService.subscribe(() => {
      refresh();
    });
    return unsub;
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePromoteTask = (item: CaptureItem) => {
    CaptureService.promote(item.id, 'task');
    onAddTask(item.raw);
  };

  const handlePromoteNote = (item: CaptureItem) => {
    CaptureService.promote(item.id, 'note');
  };

  const handleDiscard = (item: CaptureItem) => {
    CaptureService.discard(item.id);
  };

  const handleDelete = (item: CaptureItem) => {
    CaptureService.delete(item.id);
  };

  const handleClearDiscarded = () => {
    CaptureService.clearDiscarded();
  };

  const unreviewedCount = CaptureService.getUnreviewedCount();

  return (
    <div className="px-n-6 pt-n-4 h-full flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center gap-n-4 mb-n-4">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="n-press touch-target material-symbols-outlined text-[20px] opacity-50 hover:opacity-80 transition-opacity duration-n-fast"
        >
          arrow_back
        </button>
        <div className="flex-1">
          <h2 className="text-2xl ndot">INBOX</h2>
          {unreviewedCount > 0 && (
            <p className="n-label mt-[2px]">{unreviewedCount} UNREVIEWED</p>
          )}
        </div>
        {activeTab === 'discarded' && items.length > 0 && (
          <button
            onClick={handleClearDiscarded}
            aria-label="Clear all discarded items"
            className="n-press n-label opacity-40 hover:opacity-80 transition-opacity"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-n-4 overflow-x-auto no-scrollbar shrink-0" role="tablist">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`n-press shrink-0 n-border rounded-full px-3 py-[6px] ndot text-[8px] tracking-widest transition-all duration-n-fast ${
              activeTab === id ? 'bg-n-white text-n-black border-n-white' : 'opacity-40 hover:opacity-70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-n-3" role="list">
        {items.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className="n-border rounded-n-sm p-n-4 flex flex-col gap-n-3"
          >
            {/* Item meta row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-[15px] opacity-40 shrink-0">
                  {SOURCE_ICON[item.source] ?? 'inbox'}
                </span>
                <p className="font-body text-sm leading-snug break-words min-w-0">
                  {item.source === 'photo' ? (
                    item.attachmentUri ? (
                      <img
                        src={item.attachmentUri}
                        alt={item.raw}
                        className="w-full max-h-40 object-cover rounded-[4px] opacity-80"
                      />
                    ) : (
                      <span className="opacity-50">{item.raw}</span>
                    )
                  ) : (
                    item.raw
                  )}
                </p>
              </div>
              <span className="n-label shrink-0 opacity-30">{formatTime(item.createdAt)}</span>
            </div>

            {/* Status badge */}
            {item.status !== 'unreviewed' && (
              <div className="flex items-center gap-1">
                <span className={`ndot text-[8px] tracking-widest opacity-50 ${
                  item.status === 'promoted' ? '' : 'line-through'
                }`}>
                  {item.status === 'promoted'
                    ? `→ ${(item.promotedTo ?? 'TASK').toUpperCase()}`
                    : 'DISCARDED'}
                </span>
              </div>
            )}

            {/* Sync error */}
            {item.syncError && (
              <p className="n-label text-red-400 opacity-70">⚠ SAVE ERROR: {item.syncError}</p>
            )}

            {/* Triage actions — only for unreviewed */}
            {item.status === 'unreviewed' && (
              <div className="flex gap-2 flex-wrap mt-[2px]">
                <button
                  onClick={() => handlePromoteTask(item)}
                  aria-label="Promote to task"
                  className="n-press n-border rounded-full px-3 py-[5px] ndot text-[8px] tracking-widest hover:bg-white hover:text-n-black transition-all duration-n-fast"
                >
                  → TASK
                </button>
                <button
                  onClick={() => handlePromoteNote(item)}
                  aria-label="Promote to note"
                  className="n-press n-border rounded-full px-3 py-[5px] ndot text-[8px] tracking-widest hover:bg-white hover:text-n-black transition-all duration-n-fast"
                >
                  → NOTE
                </button>
                <button
                  onClick={() => handleDiscard(item)}
                  aria-label="Discard item"
                  className="n-press rounded-full px-3 py-[5px] ndot text-[8px] tracking-widest opacity-30 hover:opacity-60 transition-opacity duration-n-fast"
                >
                  DISCARD
                </button>
              </div>
            )}

            {/* Delete action — for promoted/discarded */}
            {item.status !== 'unreviewed' && (
              <div className="flex justify-end">
                <button
                  onClick={() => handleDelete(item)}
                  aria-label="Delete item"
                  className="n-press material-symbols-outlined text-[16px] opacity-20 hover:opacity-50 transition-opacity duration-n-fast"
                >
                  delete
                </button>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div role="status" className="text-center py-n-12 flex flex-col items-center gap-n-3">
            <span className="material-symbols-outlined text-[40px] opacity-10">inbox</span>
            <span className="ndot text-lg opacity-15">EMPTY</span>
            <p className="n-label opacity-30">
              {activeTab === 'unreviewed' ? 'NO UNREVIEWED ITEMS' : `NO ${activeTab.toUpperCase()} ITEMS`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxView;
