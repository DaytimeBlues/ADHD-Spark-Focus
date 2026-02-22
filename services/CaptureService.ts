/**
 * CaptureService
 *
 * Manages the Capture Inbox — the queue of items captured via the Capture Bubble
 * before they are triaged (promoted to task/note or discarded).
 *
 * All captures are saved immediately (offline-first), badge count is reactive
 * via a simple subscriber pattern.
 *
 * Storage: localStorage (key: 'spark_capture_inbox')
 */

// ============================================================================
// TYPES
// ============================================================================

export type CaptureSource = 'voice' | 'text' | 'photo' | 'paste' | 'meeting';
export type CaptureStatus = 'unreviewed' | 'promoted' | 'discarded';

export interface CaptureItem {
  id: string;
  source: CaptureSource;
  status: CaptureStatus;
  /** Raw user input: transcript text, typed text, pasted content, meeting notes */
  raw: string;
  /** Photo attachment data URL (photo mode only) */
  attachmentUri?: string;
  /** Unix timestamp (ms) of capture */
  createdAt: number;
  /** What this was promoted to, if promoted */
  promotedTo?: 'task' | 'note';
  /** Unix timestamp (ms) of promotion */
  promotedAt?: number;
  /** AI transcript text (voice mode, set after transcription) */
  transcript?: string;
  /** Error message if save failed */
  syncError?: string;
}

export type NewCaptureInput = Omit<CaptureItem, 'id' | 'createdAt' | 'status'>;

// ============================================================================
// STORAGE KEY
// ============================================================================

const CAPTURE_INBOX_KEY = 'spark_capture_inbox';

// ============================================================================
// UUID GENERATION
// ============================================================================

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `cap_${ts}_${rand}`;
}

// ============================================================================
// SUBSCRIBER TYPE
// ============================================================================

type UnreviewedCountSubscriber = (count: number) => void;

// ============================================================================
// STORAGE HELPERS
// ============================================================================

function readFromStorage(): CaptureItem[] {
  try {
    const raw = localStorage.getItem(CAPTURE_INBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as CaptureItem[];
    return [];
  } catch (error) {
    console.error('[CaptureService] readFromStorage error:', error);
    return [];
  }
}

function writeToStorage(items: CaptureItem[]): void {
  try {
    localStorage.setItem(CAPTURE_INBOX_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('[CaptureService] writeToStorage error:', error);
    throw error;
  }
}

// ============================================================================
// SERVICE
// ============================================================================

class CaptureServiceClass {
  private subscribers: Set<UnreviewedCountSubscriber> = new Set();

  // --------------------------------------------------------------------------
  // READS
  // --------------------------------------------------------------------------

  /**
   * Get all capture items. Optionally filter by status.
   */
  getAll(filter?: { status?: CaptureStatus }): CaptureItem[] {
    try {
      const items = readFromStorage();
      if (filter?.status !== undefined) {
        return items.filter((item) => item.status === filter.status);
      }
      return items;
    } catch (error) {
      console.error('[CaptureService] getAll error:', error);
      return [];
    }
  }

  /**
   * Get count of unreviewed items (for badge display).
   */
  getUnreviewedCount(): number {
    try {
      return this.getAll({ status: 'unreviewed' }).length;
    } catch (error) {
      console.error('[CaptureService] getUnreviewedCount error:', error);
      return 0;
    }
  }

  // --------------------------------------------------------------------------
  // WRITES
  // --------------------------------------------------------------------------

  /**
   * Save a new capture item to the inbox.
   * Assigns id, createdAt, status='unreviewed' automatically.
   * Notifies subscribers after save.
   */
  save(input: NewCaptureInput): CaptureItem {
    const item: CaptureItem = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
      status: 'unreviewed',
    };

    try {
      const existing = this.getAll();
      const updated = [item, ...existing]; // newest first
      writeToStorage(updated);
      this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] save error:', error);
      item.syncError = error instanceof Error ? error.message : 'Unknown storage error';
    }

    return item;
  }

  /**
   * Update an existing item (e.g. to add transcript after recording).
   */
  update(id: string, patch: Partial<CaptureItem>): void {
    try {
      const items = this.getAll();
      const idx = items.findIndex((item) => item.id === id);
      if (idx === -1) {
        console.error(`[CaptureService] update: item ${id} not found`);
        return;
      }
      items[idx] = { ...items[idx], ...patch };
      writeToStorage(items);
      this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] update error:', error);
    }
  }

  /**
   * Promote a capture item to a task or note.
   * Sets status='promoted' and records what it was promoted to.
   */
  promote(id: string, to: 'task' | 'note'): void {
    try {
      this.update(id, {
        status: 'promoted',
        promotedTo: to,
        promotedAt: Date.now(),
      });
    } catch (error) {
      console.error('[CaptureService] promote error:', error);
    }
  }

  /**
   * Discard a capture item (soft delete — keeps in storage as 'discarded').
   */
  discard(id: string): void {
    try {
      this.update(id, { status: 'discarded' });
    } catch (error) {
      console.error('[CaptureService] discard error:', error);
    }
  }

  /**
   * Hard-delete a single item. Use sparingly (prefer discard for audit trail).
   */
  delete(id: string): void {
    try {
      const items = this.getAll();
      const updated = items.filter((item) => item.id !== id);
      writeToStorage(updated);
      this.notifySubscribers();
    } catch (error) {
      console.error('[CaptureService] delete error:', error);
    }
  }

  /**
   * Clear all discarded items (housekeeping).
   */
  clearDiscarded(): void {
    try {
      const items = this.getAll();
      const kept = items.filter((item) => item.status !== 'discarded');
      writeToStorage(kept);
    } catch (error) {
      console.error('[CaptureService] clearDiscarded error:', error);
    }
  }

  // --------------------------------------------------------------------------
  // REACTIVITY
  // --------------------------------------------------------------------------

  /**
   * Subscribe to unreviewed count changes.
   * Returns an unsubscribe function.
   *
   * @example
   * const unsub = CaptureService.subscribe(count => setBadge(count));
   * // In cleanup:
   * unsub();
   */
  subscribe(callback: UnreviewedCountSubscriber): () => void {
    this.subscribers.add(callback);
    // Immediately emit current count
    try {
      callback(this.getUnreviewedCount());
    } catch (err) {
      console.error('[CaptureService] subscribe init error:', err);
    }

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    try {
      const count = this.getUnreviewedCount();
      this.subscribers.forEach((cb) => {
        try {
          cb(count);
        } catch (err) {
          console.error('[CaptureService] subscriber callback error:', err);
        }
      });
    } catch (error) {
      console.error('[CaptureService] notifySubscribers error:', error);
    }
  }
}

const CaptureService = new CaptureServiceClass();
export default CaptureService;
