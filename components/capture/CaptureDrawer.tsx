
import React, { useState, useRef } from 'react';
import CaptureService, { CaptureSource } from '../../services/CaptureService';

interface CaptureDrawerProps {
  open: boolean;
  onClose: () => void;
}

type DrawerMode = CaptureSource | null;

const MODES: { id: CaptureSource; icon: string; label: string }[] = [
  { id: 'text',    icon: 'edit',         label: 'TEXT'    },
  { id: 'paste',   icon: 'content_paste', label: 'PASTE'  },
  { id: 'meeting', icon: 'groups',       label: 'MEETING' },
  { id: 'photo',   icon: 'photo_camera', label: 'PHOTO'   },
  { id: 'voice',   icon: 'mic',          label: 'VOICE'   },
];

const CaptureDrawer: React.FC<CaptureDrawerProps> = ({ open, onClose }) => {
  const [mode, setMode] = useState<DrawerMode>(null);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMode(null);
    setText('');
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleModeSelect = async (selected: CaptureSource) => {
    if (selected === 'paste') {
      let pasted = '';
      try {
        pasted = await navigator.clipboard.readText();
      } catch {
        // clipboard blocked — open blank textarea
      }
      setText(pasted);
      setMode('paste');
    } else if (selected === 'photo') {
      setMode('photo');
      // Trigger file input immediately
      setTimeout(() => fileInputRef.current?.click(), 50);
    } else {
      setMode(selected);
      setText('');
    }
  };

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed || !mode) return;

    setSaving(true);
    try {
      CaptureService.save({ source: mode, raw: trimmed });
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 800);
      reset();
    } catch (error) {
      console.error('[CaptureDrawer] save error:', error);
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Warn about large files that may exceed localStorage quota
    const MAX_PHOTO_SIZE_MB = 2;
    if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
      alert(`Photo is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_PHOTO_SIZE_MB}MB recommended to avoid storage issues.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;

      // Additional runtime check for data URL size (base64 inflates ~33%)
      if (dataUrl.length > 3 * 1024 * 1024) {
        alert('Processed photo is too large for storage. Try a smaller image.');
        setSaving(false);
        e.target.value = '';
        return;
      }

      setSaving(true);
      try {
        CaptureService.save({ source: 'photo', raw: file.name, attachmentUri: dataUrl });
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 800);
        reset();
        onClose();
      } catch (error) {
        console.error('[CaptureDrawer] photo save error:', error);
        alert('Failed to save photo. Storage may be full.');
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'text':    return 'TYPE YOUR THOUGHT...';
      case 'paste':   return 'PASTE CONTENT HERE...';
      case 'meeting': return 'MEETING NOTES...\n\nWHO WAS THERE?\nWHAT WAS DISCUSSED?\nACTION ITEMS?';
      case 'voice':   return 'VOICE RECORDING COMING SOON\n\nCLICK SAVE TO LOG THIS PLACEHOLDER';
      default:        return '';
    }
  };

  const isTextMode = mode === 'text' || mode === 'paste' || mode === 'meeting' || mode === 'voice';
  const rows = mode === 'meeting' ? 8 : mode === 'voice' ? 3 : 5;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Capture drawer"
        className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-n-black n-border rounded-t-[20px] transition-transform duration-300 ease-out"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-[3px] rounded-full bg-white/20" />
        </div>

        <div className="px-5 pb-8 pt-2">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              {mode && (
                <button
                  onClick={() => setMode(null)}
                  aria-label="Back to mode selection"
                  className="n-press material-symbols-outlined text-[18px] opacity-50 hover:opacity-80 transition-opacity"
                >
                  arrow_back
                </button>
              )}
              <h2 className="ndot text-lg">
                {mode ? MODES.find(m => m.id === mode)?.label ?? 'CAPTURE' : 'CAPTURE'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close capture drawer"
              className="n-press material-symbols-outlined text-[20px] opacity-40 hover:opacity-80 transition-opacity"
            >
              close
            </button>
          </div>

          {/* Mode selection */}
          {!mode && (
            <div className="grid grid-cols-5 gap-2">
              {MODES.map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => handleModeSelect(id)}
                  aria-label={label}
                  className="n-press n-border rounded-n-sm flex flex-col items-center justify-center gap-2 py-4 transition-all duration-150 hover:bg-white/[0.04]"
                >
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                  <span className="ndot text-[8px] tracking-widest opacity-60">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text / Paste / Meeting / Voice mode */}
          {isTextMode && (
            <div className="flex flex-col gap-3">
              <textarea
                autoFocus={mode !== 'voice'}
                rows={rows}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getPlaceholder()}
                aria-label={`${mode} capture input`}
                readOnly={mode === 'voice'}
                className="w-full bg-white/[0.03] n-border rounded-n-sm p-4 font-body text-sm text-n-white resize-none transition-colors duration-150 placeholder:opacity-20 placeholder:font-body placeholder:text-sm focus:outline-none focus:border-white/30"
              />
              <div className="flex justify-between items-center">
                <span className="n-label">{text.trim().length} CHARS</span>
                <button
                  onClick={handleSave}
                  disabled={saving || text.trim().length === 0}
                  aria-label="Save capture"
                  className={`n-press n-border rounded-full px-5 py-2 ndot text-[10px] tracking-widest transition-all duration-150 ${
                    text.trim().length === 0 || saving
                      ? 'opacity-25 cursor-not-allowed'
                      : 'hover:bg-white hover:text-n-black'
                  } ${savedFlash ? 'bg-white text-n-black' : ''}`}
                >
                  {savedFlash ? 'SAVED ✓' : saving ? 'SAVING...' : 'SAVE'}
                </button>
              </div>
            </div>
          )}

          {/* Photo mode — just shows trigger state */}
          {mode === 'photo' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <span className="material-symbols-outlined text-[48px] opacity-20">photo_camera</span>
              <p className="n-label text-center opacity-50">SELECT A PHOTO TO CAPTURE</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="n-press n-border rounded-full px-6 py-2 ndot text-[10px] tracking-widest hover:bg-white hover:text-n-black transition-all duration-150"
              >
                CHOOSE FILE
              </button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden="true"
          onChange={handlePhotoChange}
        />
      </div>
    </>
  );
};

export default CaptureDrawer;
